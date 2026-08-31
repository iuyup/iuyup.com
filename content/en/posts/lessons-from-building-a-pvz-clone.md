---
title: Lessons from Building a PvZ Clone During My Internship
date: 2026-07-17
summary: A look at several small but easy-to-miss issues in a Pygame PvZ clone—opening timing, cone and bucket armor, pea targeting, and zombie blocking checks.
image: /picture/pvz.png
sourceSlug: 实习开发pvz小游戏遇到的一些问题
tags:
  - Pygame
  - Game Development
  - Debug
---

# Lessons from Building a PvZ Clone During My Internship

> This project is a small PvZ game written with Python and Pygame. I spent most of the time adding plants, adjusting assets, and changing animations, but the things that actually made me stop and inspect the code were several problems that did not look especially important at first.

This is not really a tutorial. I mainly want to record how I found and handled these problems at the time. If something similar happens later in the project, at least I will know where I tripped before.

---

## The Countdown Is Over, So Why Has the First Zombie Not Arrived?

I made a simple countdown for the start of the game: `3 → 2 → 1 → Ready`. Visually, nothing seemed wrong, and the message disappeared when the countdown finished.

But when I actually played, the lawn stayed empty for a long time. The first time, I thought I was simply nervous at the start and too focused on planting sunflowers to notice. After a few more rounds, it started to feel wrong: the game had already said "Ready," so why was nothing happening?

Instead of immediately changing the interval between waves, I first stepped through the opening sequence second by second. Here was the result:

```text
t=4   Countdown ends
t=17  "Wave 1 is approaching" appears
t=20  Wave 1 enters the active state
t=28  The first zombie is actually spawned
```

The problem was not that the zombie walked too slowly. It had not been spawned at all. There were a full 24 seconds between the end of the countdown and the appearance of the first zombie.

Following the state transitions made the cause straightforward. `start_countdown_timer` controlled only the countdown shown on screen. Wave 1 still went through the normal cooldown between waves, and after the wave began, it waited through another spawn interval. Neither process was wrong on its own. The problem appeared when they were connected: what the player saw as the "start" and what the game internally considered the real start were not the same event.

In the end, I did not shorten every wave. I added a separate startup path for the first wave: when the countdown ends, wave 1 starts and the first zombie is spawned at the same time. The remaining zombies still use the original spawn interval, and the warnings for later waves remain. The only difference is that the game no longer waits through another empty interval after a warning ends.

After the change, the first zombie appears as soon as the countdown reaches zero. It was a small change, but the opening now feels much smoother.

---

## Coneheads and Bucketheads Did Not End Up as Two Separate Zombie Types

Conehead and Buckethead Zombies were some of the earlier additions to the project. The first idea was direct: a regular zombie would be one type, the Conehead another, and the Buckethead a third, each using a complete zombie sprite.

Once I added them to the game, the image dimensions became a problem. The zombie height, foot position, and health-bar position in the program were all based on the regular zombie, but the complete Conehead and Buckethead images did not match it exactly. Scaling them directly made the headgear look wrong. Adjusting their positions instead led to misaligned feet and inconsistent body sizes.

I tried repeatedly tuning the sprite sizes and offsets, but it was always difficult to make all three zombies look like part of the same set on the lawn. Eventually, I changed the approach completely: instead of treating the cone and bucket as parts of complete zombies, I cut them out of the images as separate assets.

The current visual structure is "regular zombie body + cone or bucket accessory." The regular zombie's dimensions and animations do not have to change, while each accessory is layered over its head with a separate offset. The relevant data lives in `ACCESSORY_REGISTRY`, which stores not only the image and position but also a separate amount of health.

That makes the cone and bucket more than a visual difference. When a pea hits an armored zombie, it damages the accessory first. Once the armor is destroyed, the zombie keeps walking, only without the object on its head. The state is much clearer than simply swapping in "a zombie image with more health."

More unexpectedly, making accessories independent made later gameplay much easier to build. Armored zombies now have a chance to drop their cone or bucket when defeated. The player can click it to add it to the inventory at the top of the screen, then equip it on a regular plant. The plant gains a separate layer of armor health, and zombies have to chew through that armor before damaging the plant itself.

What began as an attempt to make sprite dimensions line up eventually created a small loop: break a zombie's armor, then put it on a plant. The change took longer than I expected, but it also made cones and buckets more than two different images.

---

## A Pea Should Not Choose Its Target by Hoping the List Is in the Right Order

The pea-targeting problem was unusual. It was not a bug that a player encountered and reported. I found it as a latent problem while walking through the collision logic.

The code at the time looked through the zombie list and selected the first target that collided with the pea. Under the default rules, that usually worked: zombies in the same wave moved at the same speed, so their spawn order and their front-to-back order on screen were generally consistent. During normal play, the bug might never appear.

The problem is that "usually" is not a rule. As soon as the game adds different movement speeds, special spawning behavior, or two zombies that happen to overlap, list order no longer necessarily represents their positions on the lawn.

To verify this, I manually placed two overlapping zombies in the same row and reversed their order in the list. The old logic hit the first zombie in the list, even when that zombie happened to be standing behind the other one.

The new handling makes the rule explicit: first find the zombies that truly overlap with the pea, then choose the one with the smaller `x`. Zombies move from right to left, so a smaller `x` means the zombie is closer to the house and is the target the pea should hit first.

```python
target = min(colliding_zombies, key=lambda zombie: zombie.x, default=None)
```

There is no special trick in this line. It simply removes the old assumption that the list happens to be ordered correctly. If I later add zombies with different speeds, I will not need to come back and patch this point again.

---

## Why Was a Zombie Eating a Wall-nut Behind It?

This problem was much more obvious. A zombie stood between two plants. It had not reached the plant on the right, but that Wall-nut started losing health anyway. It looked as though the zombie had taken a bite through empty air.

At first, I suspected the traversal direction. The code searched plants from right to left, so perhaps it was simply selecting the rightmost plant in the row. I then tested a fixed scene: the zombie's horizontal range was `400..446`, with one Wall-nut in column 3 and another in column 7. It stood between them, so in theory it should have kept walking left without attacking either one.

Instead, the Wall-nut on the right, in column 7, lost health.

Looking further into the condition showed that traversal direction was not the main cause. The old check only asked whether the zombie's left edge had passed the plant's right edge. It never confirmed whether the zombie's right edge had reached the plant's left edge. In other words, as long as a plant was somewhere to the zombie's right, it could be treated as a "blocking plant."

The fix included the zombie's actual width in the condition and required the zombie and the plant cell to truly overlap horizontally:

```python
zombie_right = x + width
is_blocking = zombie_right >= plant_left and x <= plant_right - 8
```

The right-to-left scan remains. Because the zombie moves left, the plant on the right really is the first one it reaches once contact occurs. What needed fixing was whether contact had happened at all, not the scan direction.

This kind of problem is easy to test only halfway. After fixing it, I checked three additional cases: a zombie between two plants keeps walking; after reaching the plant on the right, it bites only that one; and when there is no plant ahead, it still crosses the left boundary normally and triggers the loss condition. At least the fix for "biting through empty air" would not break the original failure flow.

---

## I Kept These Scenarios as Tests

After these changes, the project kept corresponding tests: wave 1 has spawned when the countdown ends; when list order and positional order disagree, a pea still hits the frontmost zombie; and a zombie enters the attacking state only after making contact with a plant.

They run with dummy SDL, so I do not have to open the game window and arrange each scene manually every time. The project still does not have many tests, but these cases are useful to me. Before changing the wave or collision logic, I can run them and immediately find out whether I have stepped into an old trap for a second time.

When making a small game like this, I still enjoy opening it and checking how it feels. But for logic problems, repeatedly playing and tweaking can quickly make the code more confusing. Fixing the positions, timing, and state first, then changing one small corresponding piece of code, and finally keeping that scenario as a test makes the whole process feel much more reliable.

---

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agent Focus*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
