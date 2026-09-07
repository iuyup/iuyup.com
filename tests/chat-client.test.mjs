import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChatRequest, readChatReply } from '../src/lib/chat-client.ts';

test('failed or empty replies never poison the next request', () => {
  const request = buildChatRequest([
    { role: 'assistant', content: '' },
    { role: 'user', content: 'previous question', status: 'interrupted' },
    { role: 'assistant', content: 'partial reply', status: 'interrupted' },
    { role: 'assistant', content: 'complete reply', status: 'complete' },
  ], 'new question', 'en');
  assert.deepEqual(request, { locale: 'en', messages: [
    { role: 'assistant', content: 'complete reply' }, { role: 'user', content: 'new question' },
  ] });
});

test('long multilingual histories respect every Go request limit', () => {
  for (const char of ['中', '😀', '\u0001', 'a']) {
    const request = buildChatRequest(Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: char.repeat(3000) })), '新问题😀', 'zh-CN');
    assert.ok(request.messages.length <= 12);
    assert.ok(request.messages.every(m => Array.from(m.content).length <= 2000));
    assert.ok(request.messages.reduce((n, m) => n + Array.from(m.content).length, 0) <= 12000);
    assert.ok(new TextEncoder().encode(JSON.stringify(request)).length <= 32768);
    assert.equal(request.messages.at(-1).content, '新问题😀');
  }
  assert.throws(() => buildChatRequest([], 'a'.repeat(2001), 'en'), /invalid-input/);
  assert.throws(() => buildChatRequest([], '   ', 'en'), /invalid-input/);
});

test('empty and interrupted streams fail instead of committing an empty assistant', async () => {
  await assert.rejects(readChatReply(new Response(''), new AbortController().signal, () => {}), /empty-reply/);
  let pulls = 0;
  let partial = '';
  const stream = new ReadableStream({ pull(controller) {
    if (pulls++ === 0) controller.enqueue(new TextEncoder().encode('partial'));
    else controller.error(new Error('connection lost'));
  } });
  await assert.rejects(readChatReply(new Response(stream), new AbortController().signal, value => { partial = value; }), /connection lost/);
  assert.equal(partial, 'partial');
});

test('stop cancels a stalled stream and releases its reader', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const controller = new AbortController();
  const reading = readChatReply(new Response(stream), controller.signal, () => {});
  controller.abort();
  await assert.rejects(reading, { name: 'AbortError' });
  assert.equal(cancelled, true);
  assert.equal(stream.locked, false);
});

test('UTF-8 split across network chunks remains intact', async () => {
  const bytes = new TextEncoder().encode('你好😀');
  const stream = new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } });
  assert.equal(await readChatReply(new Response(stream), new AbortController().signal, () => {}), '你好😀');
});
