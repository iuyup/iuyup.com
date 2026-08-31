---
title: From Neural Networks to Transformers
date: 2026-06-02
summary: At heart, AI chat is a relentless next-word prediction machine. Starting with handwritten-digit recognition, this article works up to vectors, attention, and temperature in Transformers.
image: /picture/transformer.png
sourceSlug: 从神经网络到Transformer
tags:
  - Transformer
  - Neural Network
---
# From "Recognizing a Digit" to "Predicting the Next Word": A Plain-English Guide to What AI Is Actually Doing

After studying Transformers today, I genuinely felt that I had to write some notes.

But while organizing them, I ran into a problem: if I jumped straight into Transformers, there would be a pile of terms I could not explain at all—vectors, layers, weights, all floating in midair. So I decided to change the order and start with an especially classic, especially small example: **teaching a machine to recognize which digit is written in an image**. Once that makes sense, we can see that a Transformer is really a scaled-up version of the same idea.

All right, let's begin.

## 1. First, What Is Machine Learning Actually Learning?

Machine learning sounds mysterious, but it comes down to one sentence: **I want to use what I already know to predict what I do not know yet.**

For example, suppose I have ten thousand photos of houses and their sale prices. I want to train something so that when it sees a new photo later, it can tell me roughly how much that house is worth. That is machine learning.

**Deep learning** is one particular school within machine learning—the methods that use "multilayer neural networks" to make those predictions. Do not worry yet about exactly what a multilayer neural network is. Just remember that it is a **prediction tool**. At heart, it belongs to the same family as the simplest linear regression—the middle-school idea of finding the best-fitting line, `y = kx + b`—only it is far more complex and can fit things that are almost absurdly complicated.

How does it learn to predict? Through **training**. Training means repeatedly showing it "questions and answers" and letting it adjust its internal parameters until it can answer new questions correctly too. You can think of training as a student drilling so many exercises that the process becomes muscle memory.

## 2. A Minimal Example: Teaching a Machine to Recognize Handwritten Digits

I think this is the best introductory example in all of deep learning. It is simple enough to run through entirely in your head.

Suppose we want a machine to recognize handwritten digits from 0 to 9. First, we have to turn "an image" into something a machine can consume—a **sequence of numbers**.

How? Take a small 28×28 grid, with 28×28 = 784 cells in total. We write a digit on it. Cells touched by the strokes are light, untouched cells are dark, and the strokes can have different intensities. We represent each cell's brightness with a number between 0 and 1: 0 is pure black, 1 is pure white, and values in between are gray.

An image has now become 784 numbers. Flatten that 28×28 matrix into one line, and we get a **vector of length 784**. Put simply, in the machine's eyes, an image is just a column of 784 numbers.

Next comes the key structure. What output do we want? A "likelihood" for each of the ten digits from 0 to 9. So we place **10 cells** on the far right. The number in each cell means, "I think this image is this digit with this probability." Whichever cell has the largest number becomes the machine's answer.

How do we get from the 784 numbers on the left to the 10 numbers on the right? We insert two "hidden layers" in the middle, each with 16 cells. The number 16 is arbitrary; another size would work too. The whole path becomes:

```
784 (input) → 16 (hidden layer 1) → 16 (hidden layer 2) → 10 (output)
```

For now, it is fine to treat the hidden layers as **black boxes**. Information travels from left to right, layer by layer. Each layer "processes" it once, and eventually it reaches those 10 cells. The largest number is the answer.

That is the full picture of how a neural network makes a decision. It is not quite as frightening as it sounds, is it? Digit recognition is only an appetizer. With the same structure but different inputs and outputs, we can recognize Chinese characters, classify images, and even—as we will see later—process language.

## 3. What Is Inside the Black Box: Weights, Biases, and Activation Functions

Now let us open the black box and take a look.

What calculation does the machine perform from one layer to the next? It needs two parameters and one function.

**The first parameter is the weight.** Every cell in the next layer has to "look at" the values of all cells in the previous layer. But it does not treat them equally—some cells matter more than others. A weight scores every connection: an important connection gets a large weight; an unimportant one gets a small or even negative weight. To exaggerate only slightly, **the weights are the model's brain**. They determine its entire behavioral pattern, and training gradually tunes their values.

**The second parameter is the bias.** After calculating a weighted sum, the model adds a bias value. It is like setting a "trigger threshold" for the cell: I will recognize this only when it is bright enough.

**The function is called an activation function.** The weighted sum plus the bias can produce a number in a messy range. The activation function "squeezes" it back into a sensible range while introducing nonlinearity into the system. Without that nonlinearity, stacking any number of layers would still be equivalent to one layer, and the network could not learn much. Basic tutorials often use Sigmoid, which compresses any number into the range from 0 to 1. In practical engineering, ReLU is more common today because it trains faster and fits better.

So moving from one layer to the next is essentially this: **take the numbers from the previous layer, calculate a weighted sum, add a bias, and pass the result through an activation function.** The whole network simply repeats that operation several times.

By now, one picture should be becoming clear: no matter how complex a neural network is, its core is **a collection of real-number arrays—in other words, tensors—being transformed layer by layer into new real-number arrays**. The input is a real-number array, every hidden layer is a real-number array, and the output is still a real-number array. Keep that image in mind, because a Transformer works the same way.

## 4. Changing the Task: From "Recognizing a Digit" to "Predicting the Next Word"

The foundation is in place. Now we can go upstairs.

A Transformer takes on a different task: **given a piece of text, predict which word is most likely to come next.** The chat AIs you use every day essentially repeat this process—predict one word, append it, predict the next one, append that, and so on, producing the answer one piece at a time. Strictly speaking, this next-word-prediction setup describes autoregressive models such as GPT. The Transformer architecture itself can do other jobs, including translation, but this article will focus on predicting the next word.

The whole process can be broken into several steps, and you will notice that every one of them echoes the digit-recognition example above.

**Step one: turn text into numbers.** Just as an image had to become 784 numbers, text must become numbers too. First, split a passage into **tokens**, which you can roughly understand as words or pieces of words. Then represent each token with a vector. This method of turning words into vectors is called an **embedding**.

When I learned this part, I honestly thought it was brilliant. It forces written language into the world of mathematics. Once words become vectors, relationships between words can be measured geometrically: **words with similar meanings also point in similar vector directions**. Want to find a synonym? Look for a vector pointing in a similar direction.

How do we measure whether two vectors point in similar directions? With a **dot product**. A positive dot product means the directions are broadly aligned; zero means they are perpendicular and unrelated; a negative value means they point in opposite directions. The dot product can therefore act like a ruler for measuring whether two words "line up." We are about to use that ruler immediately.

## 5. The Transformer's Two Core Operations: Attention and the Feed-Forward Layer

Once tokens have become vectors, the real processing begins. A Transformer mainly alternates between two modules.

**The first is the Attention module.** Its job is to **update each word's vector according to the context so that its meaning becomes precise**.

Take the Chinese word "苹果," for example. In isolation, its embedding is static and fixed. But inside a sentence, it changes: in "苹果发布了新手机," it refers to the company Apple; in "我买了几斤苹果," it refers to the fruit. Attention lets the vector for "苹果" **look around at the surrounding words** and absorb contextual information. It turns a dead vector that represents only the word itself into a living vector that encodes its context.

How does it look around? Let us expand this part slightly. You can skip it on a first read, but it is satisfying once it clicks. Each word vector takes on three roles:

- **Query (what am I looking for?)**
- **Key (what can I provide?)**
- **Value (what information do I actually hand over if selected?)**

A word takes its Query and computes a dot product with every other word's Key. Remember that the dot product is our ruler for whether things line up; this is where it comes in. Those scores tell the word whom to pay attention to and by how much. It then takes everyone's Values and combines them with those attention scores as weights. After that combination, the word's new vector contains contextual information. That is the truth behind "updating a word's meaning through relevance."

**The second is the feed-forward layer, also called a multilayer perceptron or MLP.** After attention lets words "exchange information," the feed-forward layer separately transforms **each word's vector**. Notice that the words do not communicate during this step. Each one works on its own, but all of them use the same transformation rules. You can think of attention as "sharing information" and the feed-forward layer as "digesting it individually."

Then what? **Repeat.** Attention plus a feed-forward layer makes one round, and many such rounds are stacked. With every round, each token's vector is refined into something that understands the context a little better. Layer by layer, a vector changes from "this word by itself" into "what this word actually means in this entire passage."

Finally, **the model uses the last token's vector to predict the next word**. After passing through so many layers, that vector has compressed all the earlier information, making it the right thing to use for the next prediction.

As you can see, this follows the same mold as digit recognition: the input is a real-number array, layers transform it step by step, and the output is a set of "likelihoods."

## 6. The Final Step: Softmax and the Dial Called "Temperature"

At the end, the model produces a large, disorderly collection of scores for different words. To turn them into usable probabilities, they pass through **softmax**. Softmax normalizes the scores into a probability distribution that sums to 1, allowing the model to "choose" the next word.

There is an especially interesting dial at this final softmax step called **temperature**, written as T:

- **Large T**: the probability distribution becomes flatter, giving different words more even chances. The output becomes more random, imaginative, and creative, but it is also more likely to wander off course.
- **Small T**: the distribution becomes sharper. High-scoring words are more likely to be selected, so the output becomes more deterministic and conservative.
- **T approaches 0**: the model always commits to the word with the highest probability, with no randomness at all.

When you adjust an AI's "creativity," you are really adjusting this T.

One final phenomenon you have almost certainly encountered is the **context-length limit**. When a Transformer predicts the next word, there is a limit to how much earlier text it can look at. That is why some models seem to "forget" after a long conversation and lose track of things said earlier. It is not because the model is stupid. Its viewing window is only so large, and once earlier content slides out of that window, the model can no longer see it.

## Final Thoughts

Let us connect everything from today:

Machine learning means "using the known to predict the unknown." A neural network turns an input into a sequence of numbers, transforms those numbers layer by layer through "weighted sum + bias + activation function," and finally outputs a set of likelihoods. A Transformer applies the same idea to language: it first turns words into vectors, then uses attention so words can absorb one another's context and feed-forward layers so each word can process that information on its own. After stacking many layers, it uses the final token to predict the next word.

You may have noticed that this whole article has been about **how a machine makes a decision**, which is forward propagation. But we have not touched the more serious question: the machine does not know the right weights at the beginning, so **how does it gradually learn them?**

That is what the next article will cover: **backpropagation**. A short preview of the idea is this: "make a prediction, see how far wrong it was, trace that error backward, and tell each weight which direction to move by a small amount." I will write about it once I understand it clearly.

All right, that is it for today.

*Author: T | Optoelectronic Information Science and Engineering, Shantou University | AI Agent Focus*\
*[GitHub: github.com/iuyup](https://github.com/iuyup)*
