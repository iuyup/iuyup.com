import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeLocalPublications, readFromContentSource } from '../src/lib/content-source.ts';

test('unpublished and deleted CMS entries never return a local copy', async () => {
  const local = () => { throw new Error('local content must not be consulted'); };
  assert.deepEqual(await readFromContentSource(undefined, async () => [], local), []);
  assert.equal(await readFromContentSource('sanity', async () => null, local), null);
});

test('CMS outage propagates rather than silently republishing archived content', async () => {
  await assert.rejects(readFromContentSource('sanity', async () => { throw new Error('offline'); }, () => ['deleted post']), /offline/);
});

test('local content requires an explicit source selection', async () => {
  assert.deepEqual(await readFromContentSource('local', async () => { throw new Error('should not fetch'); }, () => ['local post']), ['local post']);
  await assert.rejects(readFromContentSource('typo', async () => [], () => []), /CONTENT_SOURCE/);
});

test('only explicitly local publications survive an absent CMS entry', () => {
  const local = [{ slug: 'unmigrated', title: 'Local article' }, { slug: 'removed', title: 'Deleted CMS article' }];
  assert.deepEqual(mergeLocalPublications([], local, ['unmigrated']), [local[0]]);
  const remote = [{ slug: 'unmigrated', title: 'CMS edit' }];
  assert.deepEqual(mergeLocalPublications(remote, local, ['unmigrated']), remote);
});
