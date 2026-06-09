"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  Clipboard,
  Code2,
  Loader2,
  LogOut,
  Megaphone,
  Sparkles
} from "lucide-react";
import { logoutAction } from "./actions";

type GeneratedComponent = {
  id?: number;
  generatedHtml?: string;
  interactiveWidgetCode: string;
  rawHtml?: string;
  testLogs?: string[];
};

type SavedCampaign = {
  id: number;
  ctaText?: string;
  generatedHtml?: string;
  headline?: string;
  interactiveWidgetCode?: string;
  prompt: string;
  rawHtml?: string;
  createdAt: string;
};

type OutputTab = "live" | "source";

const starterCode =
  '<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-950 text-white"><main class="min-h-screen p-8"><section class="relative overflow-hidden rounded-xl border border-teal-400/20 bg-slate-950 p-8 shadow-2xl"><div class="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"></div><div class="relative"><p class="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">ShopMorph Campaign</p><h2 class="mt-4 max-w-2xl text-4xl font-semibold leading-tight">Interactive conversion widget preview</h2><p class="mt-4 max-w-xl text-sm leading-6 text-slate-300">Generate a campaign to see a full Tailwind-powered micro-experience run in this sandbox.</p><button class="mt-6 rounded-md bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300">Launch offer</button></div></section></main></body></html>';

const starterComponent: GeneratedComponent = {
  generatedHtml: starterCode,
  interactiveWidgetCode: starterCode
};

function isGeneratedComponent(data: unknown): data is GeneratedComponent {
  return (
    data !== null &&
    typeof data === "object" &&
    (typeof (data as GeneratedComponent).interactiveWidgetCode === "string" ||
      typeof (data as GeneratedComponent).generatedHtml === "string" ||
      typeof (data as GeneratedComponent).rawHtml === "string")
  );
}

function normalizeComponentData(data: {
  generatedHtml?: string;
  interactiveWidgetCode?: string;
  rawHtml?: string;
  id?: number;
}): GeneratedComponent {
  const widgetCode =
    data.interactiveWidgetCode ??
    data.generatedHtml ??
    data.rawHtml ??
    starterCode;

  return {
    id: data.id,
    generatedHtml: widgetCode,
    interactiveWidgetCode: widgetCode,
    rawHtml: data.rawHtml
  };
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState(
    "Generate a nice campaign to sell printer with 15% discount"
  );
  const [componentData, setComponentData] =
    useState<GeneratedComponent>(starterComponent);
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<OutputTab>("live");
  const [loading, setLoading] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveTestLogs, setLiveTestLogs] = useState<string[]>([]);

  async function loadSavedCampaigns() {
    setIsLoadingSaved(true);

    try {
      const response = await fetch("/api/campaigns", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Unable to load saved campaigns.");
      }

      const data = (await response.json()) as {
        campaigns?: SavedCampaign[];
      };
      setSavedCampaigns(data.campaigns ?? []);
    } catch {
      setSavedCampaigns([]);
    } finally {
      setIsLoadingSaved(false);
    }
  }

  useEffect(() => {
    loadSavedCampaigns();
  }, []);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = (await response.json()) as
        | GeneratedComponent
        | { detail?: string; error?: string };

      if (!response.ok || !isGeneratedComponent(data)) {
        throw new Error(
          "detail" in data && data.detail
            ? data.detail
            : "error" in data && data.error
              ? data.error
              : "Widget generation failed."
        );
      }

      setComponentData(normalizeComponentData(data));
      setLiveTestLogs(Array.isArray(data.testLogs) ? data.testLogs : []);
      setActiveTab("live");
      await loadSavedCampaigns();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Widget generation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyProductionCode() {
    await navigator.clipboard.writeText(componentData.interactiveWidgetCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              ShopMorph
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Merchant Campaign Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-teal-400/30 bg-teal-400/10 px-3 text-sm font-medium text-teal-100">
              <BadgeCheck aria-hidden="true" className="h-4 w-4 text-teal-300" />
              Logged in
            </div>
            <form action={logoutAction}>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-teal-400/20"
                type="submit"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-[minmax(260px,1fr)_minmax(0,3fr)] lg:gap-10 lg:px-8 lg:py-10">
        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-soft backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-400/10 text-teal-300">
                <Megaphone aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Campaign Prompt
                </h2>
                <p className="text-sm text-slate-400">
                  Generate a conversion-ready widget.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleGenerate}>
              <label
                className="block text-sm font-medium text-slate-300"
                htmlFor="prompt"
              >
                Marketing prompt
              </label>
              <textarea
                className="min-h-[240px] w-full resize-y rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
                id="prompt"
                name="prompt"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Generate a nice campaign to sell printer with 15% discount"
                value={prompt}
              />
              {error ? (
                <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}
              <button
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/25 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                )}
                {loading ? "Generating" : "Generate Campaign Component"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-soft backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Active Campaign History
                </h2>
                <p className="text-sm text-slate-400">Recent SQLite saves.</p>
              </div>
              {isLoadingSaved ? (
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin text-teal-300"
                />
              ) : null}
            </div>

            {savedCampaigns.length ? (
              <div className="space-y-3">
                {savedCampaigns.map((savedCampaign) => (
                  <button
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:border-teal-400/50 hover:bg-slate-900"
                    key={savedCampaign.id}
                    onClick={() => {
                      setComponentData(normalizeComponentData(savedCampaign));
                      setActiveTab("live");
                    }}
                    type="button"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-white">
                      {savedCampaign.headline ?? "Interactive Widget"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs italic text-slate-400">
                      {savedCampaign.prompt}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{savedCampaign.ctaText ?? "Interactive code"}</span>
                      <span className="text-teal-300">Ready</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/70 px-4 py-8 text-center text-sm text-slate-400">
                No saved campaigns yet.
              </div>
            )}
          </section>
        </aside>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-soft backdrop-blur-md lg:p-6">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">
                  Workstation Output Canvas
                </h2>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
                  Codex Connected (getBrandGuardrails active)
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Preview the generated experience or inspect the production code.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950/80 p-1">
              <button
                className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === "live"
                    ? "bg-teal-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setActiveTab("live")}
                type="button"
              >
                ✨ Live Experience
              </button>
              <button
                className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
                  activeTab === "source"
                    ? "bg-teal-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setActiveTab("source")}
                type="button"
              >
                💻 Source Code
              </button>
            </div>

            {activeTab === "source" ? (
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-400/20"
                onClick={handleCopyProductionCode}
                type="button"
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Clipboard aria-hidden="true" className="h-4 w-4" />
                )}
                {copied ? "Code copied" : "Copy Production Code"}
              </button>
            ) : null}
          </div>

          <section className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-950/10 p-4 shadow-[0_0_34px_rgba(16,185,129,0.08)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-mono text-sm font-semibold text-emerald-300">
                ⚡ Live Test Automation Runner
              </h3>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-200">
                Runtime QA
              </span>
            </div>
            <div className="rounded-lg border border-emerald-400/10 bg-slate-950/80 p-3 font-mono text-xs leading-6">
              {loading ? (
                <p className="animate-pulse text-emerald-400">
                  Running automated pipelines... █
                </p>
              ) : liveTestLogs.length ? (
                <div className="space-y-1">
                  {liveTestLogs.map((logLine) => (
                    <p
                      className="rounded bg-emerald-950/20 px-2 py-1 text-emerald-400"
                      key={logLine}
                    >
                      {logLine}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">
                  Awaiting next generation run.
                </p>
              )}
            </div>
          </section>

          {activeTab === "live" ? (
            <iframe
              srcDoc={componentData.interactiveWidgetCode}
              className="h-[700px] w-full rounded-xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/60"
              sandbox="allow-scripts"
              title="Live interactive widget preview"
            />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                <Code2 aria-hidden="true" className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Source Terminal
                </h3>
              </div>
              <pre className="max-h-[720px] overflow-auto p-5 text-xs leading-5">
                <code className="text-emerald-400">
                  {componentData.interactiveWidgetCode}
                </code>
              </pre>
            </div>
          )}

          <div
            className={`pointer-events-none fixed right-6 top-24 rounded-md border border-teal-300/30 bg-teal-300/10 px-4 py-3 text-sm font-semibold text-teal-100 shadow-soft backdrop-blur-md transition duration-300 ${
              copied ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            Production code copied
          </div>
        </section>
      </div>
    </main>
  );
}
