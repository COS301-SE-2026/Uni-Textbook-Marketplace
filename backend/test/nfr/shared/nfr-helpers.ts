import { writeFileSync, mkdirSync } from 'fs';

export const API_URL = (
  process.env.API_URL ??
  'https://nexusdev-backend-staging.whitesand-df72b78b.southafricanorth.azurecontainerapps.io/api'
).replace(/\/+$/, '');


export interface Finding {
  clause: string;
  passed: boolean | 'skipped';
  evidence: unknown;
  note?: string;
}

export interface FindingsCollector {
  findings: Finding[];
  record: (f: Finding) => void;
}

export function createCollector(): FindingsCollector {
  const findings: Finding[] = [];
  const record = (f: Finding) => {
    findings.push(f);
    const status =
      f.passed === 'skipped' ? 'SKIP' : f.passed ? 'PASS' : 'FAIL';
    console.log(`[NFR] ${status} — ${f.clause}`);
  };
  return { findings, record };
}

export async function loginAs(
  request: any,
  creds: { email: string; password: string },
): Promise<{ res: any; cookies: string }> {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const cookies = res
    .headersArray()
    .filter((h: any) => h.name.toLowerCase() === 'set-cookie')
    .map((h: any) => h.value.split(';')[0])
    .join('; ');
  return { res, cookies };
}

export function writeArtifact(
  fileName: string,
  payload: Record<string, unknown>,
): void {
  const dir = 'test/nfr/artifacts';
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${fileName}`, JSON.stringify(payload, null, 2));
}