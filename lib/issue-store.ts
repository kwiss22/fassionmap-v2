import fs from "node:fs";
import path from "node:path";

import { issueDraftSchema } from "@/lib/ai/schema";
import type { EditorialIssue } from "@/lib/editorial";

const ISSUES_DIR = path.join(process.cwd(), "data", "issues");

function issueFilename(vol: string): string {
  const n = Number.parseInt(vol, 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid issue vol: ${vol}`);
  }
  return `vol-${String(n).padStart(3, "0")}.json`;
}

function parseVolFromFilename(filename: string): number {
  const match = /^vol-(\d+)\.json$/.exec(filename);
  return match ? Number.parseInt(match[1]!, 10) : -1;
}

function readIssueFile(filename: string): EditorialIssue {
  const raw = fs.readFileSync(path.join(ISSUES_DIR, filename), "utf8");
  return issueDraftSchema.parse(JSON.parse(raw)) as EditorialIssue;
}

/** 가장 높은 vol 번호의 이슈 JSON을 읽는다. (서버·스크립트 전용) */
export function getCurrentIssue(): EditorialIssue {
  if (!fs.existsSync(ISSUES_DIR)) {
    throw new Error(`Issues directory not found: ${ISSUES_DIR}`);
  }

  const files = fs
    .readdirSync(ISSUES_DIR)
    .filter((name) => name.startsWith("vol-") && name.endsWith(".json"));

  if (files.length === 0) {
    throw new Error("No issue files in data/issues");
  }

  const latest = files.sort(
    (a, b) => parseVolFromFilename(b) - parseVolFromFilename(a)
  )[0]!;

  return readIssueFile(latest);
}

/** 다음 발행 vol (2자리 문자열, 예: "08"). */
export function getNextVol(): string {
  if (!fs.existsSync(ISSUES_DIR)) {
    return "08";
  }

  const vols = fs
    .readdirSync(ISSUES_DIR)
    .map(parseVolFromFilename)
    .filter((n) => n >= 0);

  const max = vols.length > 0 ? Math.max(...vols) : 7;
  return String(max + 1).padStart(2, "0");
}

export function saveIssue(issue: EditorialIssue): string {
  const parsed = issueDraftSchema.parse(issue) as EditorialIssue;
  fs.mkdirSync(ISSUES_DIR, { recursive: true });
  const filename = issueFilename(parsed.vol);
  const filepath = path.join(ISSUES_DIR, filename);
  fs.writeFileSync(filepath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return filepath;
}
