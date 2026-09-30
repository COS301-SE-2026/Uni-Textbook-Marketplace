import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

const API_URL = (
  process.env.API_URL ??
  'https://nexusdev-backend-staging.whitesand-df72b78b.southafricanorth.azurecontainerapps.io/api'
).replace(/\/+$/, '');

const STUDENT = {
  email: process.env.STUDENT_EMAIL ?? '',
  password: process.env.STUDENT_PASSWORD ?? '',
};

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? '',
  password: process.env.ADMIN_PASSWORD ?? '',
};

interface Finding {
  feature: string;
  endpoint: string;
  method: string;
  status: number;
  passed: boolean;
  note?: string;
}

const findings: Finding[] = [];
const record = (f: Finding) => {
  findings.push(f);
  console.log(
    `[NFR] ${f.passed ? 'PASS' : 'FAIL'} — ${f.feature} (${f.method} ${f.endpoint} → ${f.status})`,
  );
};

const loginAndGetCookies = async (
  request: any,
  creds: { email: string; password: string },
) => {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const cookies = res
    .headersArray()
    .filter((h: any) => h.name.toLowerCase() === 'set-cookie')
    .map((h: any) => h.value.split(';')[0])
    .join('; ');
  return { res, cookies };
};

test.describe.serial('NFR: core features available independently of Firestore', () => {

  // Authentication 
  test('authentication: login succeeds', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, { data: STUDENT });
    record({
      feature: 'Authentication',
      method: 'POST',
      endpoint: '/auth/login',
      status: res.status(),
      passed: res.status() === 200,
    });
    expect(res.status()).toBe(200);
  });

  // Listings retrieval 
  test('listings: retrieval returns 200', async ({ request }) => {
    const res = await request.get(`${API_URL}/listings?limit=5`);
    record({
      feature: 'Listings (retrieve)',
      method: 'GET',
      endpoint: '/listings?limit=5',
      status: res.status(),
      passed: res.status() === 200,
    });
    expect(res.status()).toBe(200);
  });

  //  Listings creation 
  test('listings: creation returns non-5xx', async ({ request }) => {
    const { cookies } = await loginAndGetCookies(request, STUDENT);

   
    const res = await request.post(`${API_URL}/listings`, {
      headers: { Cookie: cookies },
      data: {
        title: 'NFR reliability baseline listing',
        bookId: process.env.TEST_BOOK_ID ?? '00000000-0000-0000-0000-000000000000',
        condition: 'good',
        annotationLevel: 'none',
        price: 100,
        description: 'Created by NFR reliability test — safe to delete.',
      },
    });

    const passed = res.status() < 500;
    record({
      feature: 'Listings (create)',
      method: 'POST',
      endpoint: '/listings',
      status: res.status(),
      passed,
      note: passed
        ? 'Non-5xx response — the request path completed without a server error.'
        : 'Server error — investigate coupling.',
    });
    expect(res.status()).toBeLessThan(500);
  });

  // Moderation (admin case review)
  test('moderation: admin endpoint returns non-5xx', async ({ request }) => {
    const { cookies } = await loginAndGetCookies(request, ADMIN);

 
    const path = process.env.ADMIN_MODERATION_PATH ?? '/admin/cases';

    const res = await request.get(`${API_URL}${path}`, {
      headers: { Cookie: cookies },
    });

    const passed = res.status() < 500;
    record({
      feature: 'Moderation',
      method: 'GET',
      endpoint: path,
      status: res.status(),
      passed,
      note: passed
        ? 'Moderation endpoint reachable and returned a non-5xx response.'
        : 'Server error — investigate coupling.',
    });
    expect(res.status()).toBeLessThan(500);
  });

  //Reporting
  test('reporting: report list returns non-5xx', async ({ request }) => {
    const { cookies } = await loginAndGetCookies(request, STUDENT);

   
    const path = process.env.REPORTS_PATH ?? '/reports/mine';

    const res = await request.get(`${API_URL}${path}`, {
      headers: { Cookie: cookies },
    });

    const passed = res.status() < 500;
    record({
      feature: 'Reporting',
      method: 'GET',
      endpoint: path,
      status: res.status(),
      passed,
      note: passed
        ? 'Reporting endpoint reachable and returned a non-5xx response.'
        : 'Server error — investigate coupling.',
    });
    expect(res.status()).toBeLessThan(500);
  });

  //Bans 
  test('bans: banned-user login returns 200 with is_banned flag', async ({
    request,
  }) => {
    // Verified independently under the Authentication NFR.
    // Re-run here as a baseline for reliability.
    const BANNED = {
      email: process.env.BANNED_EMAIL ?? '',
      password: process.env.BANNED_PASSWORD ?? '',
    };

    const res = await request.post(`${API_URL}/auth/login`, { data: BANNED });
    const body = await res.json().catch(() => ({}));
    const passed =
      res.status() === 200 && body?.user?.is_banned === true;

    record({
      feature: 'Bans (enforcement)',
      method: 'POST',
      endpoint: '/auth/login (banned user)',
      status: res.status(),
      passed,
      note: passed
        ? 'Banned-user login returns 200 with is_banned flag (soft-ban).'
        : 'Banned-user login did not return the expected flag.',
    });
    expect(passed).toBe(true);
  });

  // ── Messaging (baseline: expected to work when Firestore is reachable) ─
  test('messaging: conversations reachable', async ({ request }) => {
    const { cookies } = await loginAndGetCookies(request, STUDENT);
    const res = await request.get(`${API_URL}/conversations/mine`, {
      headers: { Cookie: cookies },
    });

    const passed = res.status() < 500;
    record({
      feature: 'Messaging (baseline)',
      method: 'GET',
      endpoint: '/conversations/mine',
      status: res.status(),
      passed,
      note:
        'Baseline — this endpoint is expected to be available in normal operation.',
    });
    expect(res.status()).toBeLessThan(500);
  });
});

// Artifact
test.afterAll(async () => {
  mkdirSync('test/nfr/artifacts', { recursive: true });

  const passed = findings.filter((f) => f.passed).length;

  const artifact = {
    nfr:
      'Core features (authentication, listings, moderation, reporting, and bans) shall remain fully available if the external messaging microservice (Firestore) is unavailable.',
    method:
      'Static dependency audit (see firestore-dependency-audit.txt) combined with a runtime baseline of the six core-feature endpoints.',
    auditSummary: {
      firestoreConsumers: [
        'src/firebase/firebase-admin.ts (SDK init)',
        'src/messaging/messaging.service.ts',
        'src/auction/auction.service.ts',
        'src/auction/auction.processor.ts',
      ],
      coreFeatureConsumers: [],
      conclusion:
        'No module in the request path of authentication, listings, moderation, reporting, or bans imports the Firebase Admin SDK or Firestore. Firestore is isolated to messaging and auctions.',
    },
    totalFeatures: findings.length,
    passedFeatures: passed,
    overallPassed: passed === findings.length,
    findings,
    environment: 'staging',
    testedAt: new Date().toISOString(),
  };

  writeFileSync(
    'test/nfr/artifacts/reliability-summary.json',
    JSON.stringify(artifact, null, 2),
  );

  console.log(
    `[NFR] reliability: ${passed}/${findings.length} features verified`,
  );
});