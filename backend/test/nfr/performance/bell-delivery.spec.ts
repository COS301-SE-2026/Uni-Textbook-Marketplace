import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

const API_URL = (
  process.env.API_URL ??
  'https://nexusdev-backend-staging.whitesand-df72b78b.southafricanorth.azurecontainerapps.io/api'
).replace(/\/+$/, '');

const RECEIVER = {
  email: process.env.RECEIVER_EMAIL ?? '',
  password: process.env.RECEIVER_PASSWORD ?? '',
};
const TRIGGER = {
  email: process.env.TRIGGER_EMAIL ?? '',
  password: process.env.TRIGGER_PASSWORD ?? '',
};

const THRESHOLD_MS = Number(process.env.BELL_THRESHOLD_MS ?? 2000);

test('NFR: notification delivered via SSE within threshold', async ({ request }) => {
 
  const receiverLogin = await request.post(`${API_URL}/auth/login`, {
    data: { email: RECEIVER.email, password: RECEIVER.password },
  });
  if (receiverLogin.status() !== 200) {
    console.error(
      `Receiver login failed: ${receiverLogin.status()} — ${await receiverLogin.text()}`,
    );
  }
  expect(receiverLogin.status()).toBe(200);

  const cookies = receiverLogin
    .headersArray()
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value.split(';')[0])
    .join('; ');

  expect(cookies).toContain('access_token');

  let eventArrivedAt = 0;
  let rawChunk = '';

  const streamPromise = new Promise<void>((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      reject(
        new Error(
          `Timed out waiting for notification event. Received: ${rawChunk.slice(0, 300)}`,
        ),
      );
    }, THRESHOLD_MS + 8000);

    fetch(`${API_URL}/notifications/stream`, {
      headers: { Accept: 'text/event-stream', Cookie: cookies },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`SSE stream returned ${res.status}`);
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No readable stream');

        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          rawChunk += chunk;

          if (chunk.includes('notification.created')) {
            eventArrivedAt = Date.now();
            clearTimeout(timeout);
            controller.abort();
            resolve();
            return;
          }
        }
      })
      .catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
  });


  await new Promise((r) => setTimeout(r, 1500));

  const triggerLogin = await request.post(`${API_URL}/auth/login`, {
    data: { email: TRIGGER.email, password: TRIGGER.password },
  });
  if (triggerLogin.status() !== 200) {
    console.error(
      `Trigger login failed: ${triggerLogin.status()} — ${await triggerLogin.text()}`,
    );
  }
  expect(triggerLogin.status()).toBe(200);

 
  const listings = await request.get(`${API_URL}/listings?limit=50&offset=0`);
  const listingsBody = await listings.json();
  const listingArray = listingsBody.listings ?? listingsBody;

  const receiverListing = listingArray.find(
    (l: { seller: { email: string } }) => l.seller?.email === RECEIVER.email,
  );

  if (!receiverListing) {
    const sellers = [...new Set(listingArray.map((l: any) => l.seller?.email))];
    throw new Error(
      `No APPROVED listing owned by ${RECEIVER.email}. Sellers found: ${sellers.join(', ')}`,
    );
  }

 
  const t0 = Date.now();
  const conv = await request.post(`${API_URL}/conversations`, {
    data: { listingId: receiverListing.id },
  });
  if (conv.status() >= 300) {
    console.error(
      `Conversation create failed: ${conv.status()} — ${await conv.text()}`,
    );
  }
  expect(conv.status()).toBeLessThan(300);

 
  await streamPromise;

  const elapsed = eventArrivedAt - t0;


  mkdirSync('test/nfr/artifacts', { recursive: true });
  const artifact = {
    nfr: 'New-notification delivery via the bell icon shall reflect a triggering event within one polling interval (currently fixed at 15 seconds)',
    mechanism: 'SSE (GET /notifications/stream)',
    thresholdMs: THRESHOLD_MS,
    measuredMs: elapsed,
    passed: elapsed < THRESHOLD_MS,
    receiver: RECEIVER.email,
    trigger: TRIGGER.email,
    listingId: receiverListing.id,
    testedAt: new Date().toISOString(),
    rawEventSample: rawChunk.slice(0, 500),
  };
  writeFileSync(
    'test/nfr/artifacts/bell-delivery-summary.json',
    JSON.stringify(artifact, null, 2),
  );

  console.log(
    `[NFR] notification delivered in ${elapsed} ms (threshold ${THRESHOLD_MS} ms)`,
  );

  
  expect(elapsed).toBeLessThan(THRESHOLD_MS);
});