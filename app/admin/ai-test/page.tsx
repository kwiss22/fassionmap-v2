import { cookies } from "next/headers";

import type { IssueDraft } from "@/lib/ai/types";

import { generateIssueDraftAction } from "./actions";

const ADMIN_AI_TEST_RESULT_COOKIE = "fassionmap_admin_ai_test_v1";

type ActionResult =
  | { ok: true; data: IssueDraft }
  | { ok: false; error: string };

function parseResultCookie(raw: string | undefined): ActionResult | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "ok" in parsed &&
      typeof (parsed as { ok: unknown }).ok === "boolean"
    ) {
      return parsed as ActionResult;
    }
    return null;
  } catch {
    return null;
  }
}

function SourceDetail({ source }: { source: IssueDraft["sections"][0]["source"] }) {
  if (source.type === "brand") {
    return (
      <span className="text-on-surface-variant">
        brandSlug: <code className="font-mono text-[12px]">{source.brandSlug}</code>
        {source.category !== undefined ? (
          <>
            {" "}
            · category:{" "}
            <code className="font-mono text-[12px]">{source.category}</code>
          </>
        ) : null}
      </span>
    );
  }
  if (source.type === "theme") {
    return (
      <span className="text-on-surface-variant">
        query: <code className="font-mono text-[12px]">{source.query}</code>
        {source.size !== undefined ? (
          <>
            {" "}
            · size:{" "}
            <code className="font-mono text-[12px]">{source.size}</code>
          </>
        ) : null}
      </span>
    );
  }
  return <span className="text-on-surface-variant">(saved-ai)</span>;
}

export default async function AdminAiTestPage() {
  const store = await cookies();
  const result = parseResultCookie(
    store.get(ADMIN_AI_TEST_RESULT_COOKIE)?.value
  );

  return (
    <main className="min-h-[100dvh] bg-surface px-5 py-10 text-on-surface">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-outline-variant/70 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-2xl tracking-tight text-primary">
              AI Curator Test
            </h1>
            <span className="rounded-sm bg-ai-surface px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-ai">
              Provider: mock
            </span>
          </div>
          <p className="mt-2 text-[13px] text-on-surface-variant">
            Generate mock curator output on the server for debugging. (Learning admin only)
          </p>
        </header>

        <section className="mt-8 rounded-sm border border-outline-variant/70 bg-surface-container-low p-5">
          <p className="eyebrow text-on-surface-variant">INPUT</p>
          <form action={generateIssueDraftAction} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[13px]">
                <span className="text-on-surface-variant">City</span>
                <select
                  name="city"
                  className="mt-1 w-full border border-outline-variant bg-surface-bright px-3 py-2 text-[13px] text-on-surface outline-none focus:border-outline"
                  defaultValue="SEOUL"
                >
                  <option value="SEOUL">SEOUL</option>
                  <option value="TOKYO">TOKYO</option>
                  <option value="MILANO">MILANO</option>
                </select>
              </label>
              <label className="block text-[13px]">
                <span className="text-on-surface-variant">Season</span>
                <select
                  name="season"
                  className="mt-1 w-full border border-outline-variant bg-surface-bright px-3 py-2 text-[13px] text-on-surface outline-none focus:border-outline"
                  defaultValue="FW26"
                >
                  <option value="FW26">FW26</option>
                  <option value="SS27">SS27</option>
                </select>
              </label>
            </div>
            <label className="block text-[13px]">
              <span className="text-on-surface-variant">
                Trend signals (comma-separated)
              </span>
              <input
                type="text"
                name="trendSignals"
                placeholder="cashmere, minimal, neutral tones"
                defaultValue="cashmere, minimal, neutral tones"
                className="mt-1 w-full border border-outline-variant bg-surface-bright px-3 py-2 text-[13px] text-on-surface outline-none focus:border-outline"
              />
            </label>
            <button
              type="submit"
              className="rounded-sm bg-primary px-4 py-2 text-[13px] font-medium text-on-primary"
            >
              Generate
            </button>
          </form>
        </section>

        <section className="mt-10">
          <p className="eyebrow text-on-surface-variant">OUTPUT</p>

          {!result ? (
            <p className="mt-3 text-[13px] text-on-surface-variant">
              No result yet — submit the form above.
            </p>
          ) : result.ok === false ? (
            <div
              className="mt-3 rounded-sm border border-error/40 bg-error-container px-4 py-3 text-[13px] text-on-error-container"
              role="alert"
            >
              {result.error}
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              <div className="rounded-sm border border-outline-variant/70 bg-surface-container-low p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                  Meta
                </p>
                <dl className="mt-2 grid gap-2 text-[13px] sm:grid-cols-2">
                  <div>
                    <dt className="text-on-surface-variant">vol</dt>
                    <dd>{result.data.vol}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">season</dt>
                    <dd>{result.data.season}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-on-surface-variant">title</dt>
                    <dd>{result.data.title}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-on-surface-variant">dek</dt>
                    <dd className="text-on-surface-variant">{result.data.dek}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">city</dt>
                    <dd>{result.data.city}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">date</dt>
                    <dd>{result.data.date}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                  Sections
                </p>
                <ul className="mt-2 space-y-3">
                  {result.data.sections.map((sec) => (
                    <li
                      key={sec.id}
                      className="rounded-sm border border-outline-variant/70 bg-surface-bright px-4 py-3 text-[13px]"
                    >
                      <div className="font-medium text-on-surface">
                        <span className="text-on-surface-variant">{sec.id}</span>
                        {" · "}
                        {sec.eyebrow}
                      </div>
                      <div className="mt-1">{sec.title}</div>
                      <div className="mt-2 text-[12px]">
                        <span className="text-on-surface-variant">source.type:</span>{" "}
                        <code className="font-mono">{sec.source.type}</code>
                      </div>
                      <div className="mt-1">
                        <SourceDetail source={sec.source} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <details className="rounded-sm border border-outline-variant/70 bg-surface-container-low">
                <summary className="cursor-pointer px-4 py-3 text-[13px] font-medium text-on-surface">
                  Raw JSON
                </summary>
                <pre className="max-h-[480px] overflow-auto border-t border-outline-variant/70 bg-inverse-surface px-4 py-3 text-[11px] leading-relaxed text-inverse-on-surface">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
