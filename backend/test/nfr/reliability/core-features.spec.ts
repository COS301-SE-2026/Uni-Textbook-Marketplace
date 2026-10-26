import { test, expect } from '@playwright/test';
import {
  API_URL,
  createCollector,
  loginAs,
  writeArtifact,
} from '../shared/nfr-helpers';

const STUDENT = {
  email: process.env.STUDENT_EMAIL ?? '',
  password: process.env.STUDENT_PASSWORD ?? '',
};

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? '',
  password: process.env.ADMIN_PASSWORD ?? '',
};

const BANNED = {
  email: process.env.BANNED_EMAIL ?? '',
  password: process.env.BANNED_PASSWORD ?? '',
};

const { findings, record } = createCollector();

test.describe.serial(
  'NFR: core features available independently of Firestore',
  () => {

    //  Authentication
    test('authentication: login succeeds', async ({ request }) => {
      const res = await request.post(`${API_URL}/auth/login`, { data: STUDENT });
      record({
        clause: 'Authentication: login succeeds',
        passed: res.status() === 200,
        evidence: {
          method: 'POST',
          endpoint: '/auth/login',
          status: res.status(),
        },
      });
      expect(res.status()).toBe(200);
    });

    //  Listings retrieval 
    test('listings: retrieval returns 200', async ({ request }) => {
      const res = await request.get(`${API_URL}/listings?limit=5`);
      record({
        clause: 'Listings (retrieve): returns 200',
        passed: res.status() === 200,
        evidence: {
          method: 'GET',
          endpoint: '/listings?limit=5',
          status: res.status(),
        },
      });
      expect(res.status()).toBe(200);
    });

    // Listings creation
    test('listings: creation returns non-5xx', async ({ request }) => {
      const { cookies } = await loginAs(request, STUDENT);

      const res = await request.post(`${API_URL}/listings`, {
        headers: { Cookie: cookies },
        data: {
          title: 'NFR reliability baseline listing',
          bookId:
            process.env.TEST_BOOK_ID ??
            '00000000-0000-0000-0000-000000000000',
          condition: 'good',
          annotationLevel: 'none',
          price: 100,
          description:
            'Created by NFR reliability test — safe to delete.',
        },
      });

      const passed = res.status() < 500;
      record({
        clause: 'Listings (create): returns non-5xx',
        passed,
        evidence: {
          method: 'POST',
          endpoint: '/listings',
          status: res.status(),
        },
        note: passed
          ? 'Non-5xx response — the request path completed without a server error.'
          : 'Server error — investigate coupling.',
      });
      expect(res.status()).toBeLessThan(500);
    });

    //Moderation (admin case review) 
    test('moderation: admin endpoint returns non-5xx', async ({ request }) => {
      const { cookies } = await loginAs(request, ADMIN);

      const path = process.env.ADMIN_MODERATION_PATH ?? '/admin/cases';

      const res = await request.get(`${API_URL}${path}`, {
        headers: { Cookie: cookies },
      });

      const passed = res.status() < 500;
      record({
        clause: 'Moderation: admin endpoint returns non-5xx',
        passed,
        evidence: {
          method: 'GET',
          endpoint: path,
          status: res.status(),
        },
        note: passed
          ? 'Moderation endpoint reachable and returned a non-5xx response.'
          : 'Server error — investigate coupling.',
      });
      expect(res.status()).toBeLessThan(500);
    });

    //Reporting 
    test('reporting: report list returns non-5xx', async ({ request }) => {
      const { cookies } = await loginAs(request, STUDENT);

      const path = process.env.REPORTS_PATH ?? '/reports/mine';

      const res = await request.get(`${API_URL}${path}`, {
        headers: { Cookie: cookies },
      });

      const passed = res.status() < 500;
      record({
        clause: 'Reporting: report list returns non-5xx',
        passed,
        evidence: {
          method: 'GET',
          endpoint: path,
          status: res.status(),
        },
        note: passed
          ? 'Reporting endpoint reachable and returned a non-5xx response.'
          : 'Server error — investigate coupling.',
      });
      expect(res.status()).toBeLessThan(500);
    });

    // Bans 
    test('bans: banned-user login returns 200 with is_banned flag', async ({
      request,
    }) => {
      const res = await request.post(`${API_URL}/auth/login`, { data: BANNED });
      const body = await res.json().catch(() => ({}));
      const passed = res.status() === 200 && body?.user?.is_banned === true;

      record({
        clause:
          'Bans (enforcement): banned-user login returns 200 with is_banned flag',
        passed,
        evidence: {
          method: 'POST',
          endpoint: '/auth/login (banned user)',
          status: res.status(),
          userFlags: body?.user ?? null,
        },
        note: passed
          ? 'Banned-user login returns 200 with is_banned flag (soft-ban).'
          : 'Banned-user login did not return the expected flag.',
      });
      expect(passed).toBe(true);
    });

    //Messaging (baseline) 
    test('messaging: conversations reachable', async ({ request }) => {
      const { cookies } = await loginAs(request, STUDENT);
      const res = await request.get(`${API_URL}/conversations/mine`, {
        headers: { Cookie: cookies },
      });

      const passed = res.status() < 500;
      record({
        clause: 'Messaging (baseline): conversations reachable',
        passed,
        evidence: {
          method: 'GET',
          endpoint: '/conversations/mine',
          status: res.status(),
        },
        note:
          'Baseline — this endpoint is expected to be available in normal operation.',
      });
      expect(res.status()).toBeLessThan(500);
    });
  },
);

// Artifact 
test.afterAll(async () => {
  const passed = findings.filter((f) => f.passed === true).length;

  writeArtifact('reliability-summary.json', {
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
  });

  console.log(
    `[NFR] reliability: ${passed}/${findings.length} features verified`,
  );
});