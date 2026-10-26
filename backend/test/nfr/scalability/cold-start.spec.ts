import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

const API_URL = (
  process.env.API_URL ??
  'https://nexusdev-backend-staging.whitesand-df72b78b.southafricanorth.azurecontainerapps.io/api'
).replace(/\/+$/, '');

// documented cold-start budget is ~20s but I'll budget 25s to allow for network delay on top of container boot time

const COLD_START_BUDGET_MS = Number(process.env.COLD_START_BUDGET_MS ?? 25_000);


const COLD_START_FLOOR_MS = Number(process.env.COLD_START_FLOOR_MS ?? 5000);

test('NFR: staging cold-start completes within documented budget', async ({
  request,
}) => {
  const t0 = Date.now();
  const res = await request.get(`${API_URL}/auth/universities`);
  const elapsed = Date.now() - t0;

  if (res.status() !== 200) {
    console.error(
      `Cold-start request failed: ${res.status()} — ${await res.text()}`,
    );
  }
  expect(res.status()).toBe(200);

  const wasActuallyCold = elapsed >= COLD_START_FLOOR_MS;

  mkdirSync('test/nfr/artifacts', { recursive: true });
  const artifact = {
    nfr: 'Staging scales to zero when idle (min-replicas: 0), accepting a cold-start delay of approximately 20 seconds on the first request after an idle period, as a documented cost/availability trade-off rather than a defect',
    coldStartBudgetMs: COLD_START_BUDGET_MS,
    coldStartFloorMs: COLD_START_FLOOR_MS,
    measuredMs: elapsed,
    passed: elapsed < COLD_START_BUDGET_MS,
    wasActuallyCold,
    testedAt: new Date().toISOString(),
    note: wasActuallyCold
      ? 'Cold start measured after idle period.'
      : 'WARNING: response was fast — staging may not have been cold. Ensure the app is idle for 10+ minutes and re-run.',
  };
  writeFileSync(
    'test/nfr/artifacts/cold-start-summary.json',
    JSON.stringify(artifact, null, 2),
  );

  console.log(
    `[NFR] cold-start measured at ${elapsed} ms ` +
      `(budget ${COLD_START_BUDGET_MS} ms; ${wasActuallyCold ? 'cold' : 'WARM — rerun after idle'})`,
  );

  expect(elapsed).toBeLessThan(COLD_START_BUDGET_MS);
});