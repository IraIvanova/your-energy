import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

const QUOTE = { author: 'Paul Bryant', quote: 'Prepare to win.' };
const NEXT_QUOTE = { author: 'Tom Brady', quote: 'Keep moving.' };
let server;
let DailyQuoteService;
let entries;
let requests;

before(async () => {
  server = await createServer({
    logLevel: 'silent',
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  ({ DailyQuoteService } = await server.ssrLoadModule(
    '/services/daily-quote.ts'
  ));
});
after(async () => server?.close());
beforeEach(t => {
  entries = new Map();
  requests = [];
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 10, 4, 12) });
  const previousStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage'
  );
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
    },
  });
  t.after(() => {
    if (previousStorage)
      Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return Response.json(QUOTE);
  });
});

test('first visit saves the quote and a new instance reuses the same-day cache', async () => {
  assert.deepEqual(await new DailyQuoteService().getQuote(), QUOTE);
  assert.equal(requests[0].url, 'https://your-energy.b.goit.study/api/quote');
  assert.deepEqual(JSON.parse(entries.get('daily-quote')), {
    ...QUOTE,
    date: '2026-11-04',
  });
  assert.deepEqual(await new DailyQuoteService().getQuote(), QUOTE);
  assert.equal(requests.length, 1);
});

test('concurrent consumers share one request', async t => {
  let respond;
  t.mock.method(globalThis, 'fetch', () => {
    requests.push('request');
    return new Promise(resolve => {
      respond = resolve;
    });
  });
  const service = new DailyQuoteService();
  const first = service.getQuote();
  const second = service.getQuote();
  respond(Response.json(QUOTE));
  assert.deepEqual(await Promise.all([first, second]), [QUOTE, QUOTE]);
  assert.equal(requests.length, 1);
});

test('the next local calendar day fetches and saves a new quote', async t => {
  const service = new DailyQuoteService();
  await service.getQuote();
  t.mock.timers.setTime(new Date(2026, 10, 5, 0, 1).getTime());
  t.mock.method(globalThis, 'fetch', async () => Response.json(NEXT_QUOTE));
  assert.deepEqual(await service.getQuote(), NEXT_QUOTE);
  assert.equal(JSON.parse(entries.get('daily-quote')).date, '2026-11-05');
});

for (const [label, value] of [
  ['broken JSON', '{'],
  ['empty quote', JSON.stringify({ ...QUOTE, quote: ' ', date: '2026-11-04' })],
  ['missing author', JSON.stringify({ quote: 'Move.', date: '2026-11-04' })],
  ['old date', JSON.stringify({ ...QUOTE, date: '2026-11-03' })],
  ['future date', JSON.stringify({ ...QUOTE, date: '2026-11-05' })],
]) {
  test(`${label} in storage cannot replace the current API quote`, async () => {
    entries.set('daily-quote', value);
    assert.deepEqual(await new DailyQuoteService().getQuote(), QUOTE);
    assert.equal(requests.length, 1);
  });
}

test('blocked storage still allows a quote and same-day memory reuse', async t => {
  t.mock.method(localStorage, 'getItem', () => {
    throw new Error('Storage blocked');
  });
  t.mock.method(localStorage, 'setItem', () => {
    throw new Error('Storage blocked');
  });
  const service = new DailyQuoteService();
  assert.deepEqual(await service.getQuote(), QUOTE);
  assert.deepEqual(await service.getQuote(), QUOTE);
  assert.equal(requests.length, 1);
});

test('a failed request can be retried without saving an error as a quote', async t => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(null, { status: 503 })
  );
  const service = new DailyQuoteService();
  await assert.rejects(service.getQuote(), /503/);
  assert.equal(entries.size, 0);
  t.mock.method(globalThis, 'fetch', async () => Response.json(QUOTE));
  assert.deepEqual(await service.getQuote(), QUOTE);
});

test('invalid API data is rejected and can be retried', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ author: '', quote: 42 })
  );
  const service = new DailyQuoteService();
  await assert.rejects(service.getQuote(), /Invalid quote/);
  assert.equal(entries.size, 0);
  t.mock.method(globalThis, 'fetch', async () => Response.json(QUOTE));
  assert.deepEqual(await service.getQuote(), QUOTE);
});

test('a response crossing midnight is replaced with the new day before it is shown', async t => {
  let respond;
  t.mock.method(
    globalThis,
    'fetch',
    () =>
      new Promise(resolve => {
        respond = resolve;
      })
  );
  const service = new DailyQuoteService();
  const pending = service.getQuote();
  t.mock.timers.setTime(new Date(2026, 10, 5, 0, 1).getTime());
  t.mock.method(globalThis, 'fetch', async () => Response.json(NEXT_QUOTE));
  respond(Response.json(QUOTE));
  assert.deepEqual(await pending, NEXT_QUOTE);
  assert.deepEqual(JSON.parse(entries.get('daily-quote')), {
    ...NEXT_QUOTE,
    date: '2026-11-05',
  });
});
