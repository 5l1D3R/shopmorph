import {
  Codex,
  type RunResult,
  type Thread,
  type ThreadEvent,
  type TurnOptions
} from "@openai/codex-sdk";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type InteractiveWidgetResult = {
  interactiveWidgetCode: string;
};

type ProgrammaticTool = {
  name: string;
  description: string;
  parameters: {
    additionalProperties: false;
    properties: Record<string, never>;
    type: "object";
  };
};

type ExtendedTurnOptions = TurnOptions & {
  tools?: ProgrammaticTool[];
};

class LiveUnitTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveUnitTestError";
  }
}

declare global {
  var shopmorphCodexSdkClient: Codex | undefined;
}

const uiSchema = {
  type: "object",
  additionalProperties: false,
  required: ["interactiveWidgetCode"],
  properties: {
    interactiveWidgetCode: {
      type: "string",
      description:
        "A complete self-contained HTML page string with Tailwind CDN and inline JavaScript."
    }
  }
} as const;

function getBrandGuardrails(guardrailsManifest: string) {
  return JSON.stringify({
    manifest: guardrailsManifest,
    borderRadius: "rounded-xl",
    source: "shopmorph-guardrails-manifest.md"
  });
}

function runLiveUnitTests(htmlCode: string, skillData: any) {
  const testSuiteLogs: string[] = [];

  const logPass = (message: string) => {
    console.log(message);
    testSuiteLogs.push(message);
  };

  if (!htmlCode.includes("tailwindcss.com")) {
    throw new LiveUnitTestError(
      "Live runtime test failed: Tailwind CSS CDN wrapper is missing."
    );
  }
  logPass("🧪 [LIVE RUNTIME TEST] ✓ Pass: Tailwind CSS CDN wrapper verified.");

  if (!htmlCode.includes(skillData.borderRadius)) {
    throw new LiveUnitTestError(
      `Live runtime test failed: Required border radius token '${skillData.borderRadius}' is missing.`
    );
  }
  logPass("🧪 [LIVE RUNTIME TEST] ✓ Pass: Codex design token guardrails verified.");

  if (!htmlCode.includes("<script>")) {
    throw new LiveUnitTestError(
      "Live runtime test failed: Inline interactive script tag is missing."
    );
  }
  logPass("🧪 [LIVE RUNTIME TEST] ✓ Pass: Interactive script tag verified.");

  return testSuiteLogs;
}

const brandGuardrailsTool: ProgrammaticTool = {
  name: "getBrandGuardrails",
  description:
    "Fetches the current application design token constraints and brand-approved Tailwind utility classes.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {}
  }
};

function getCodexClient() {
  if (!globalThis.shopmorphCodexSdkClient) {
    globalThis.shopmorphCodexSdkClient = new Codex();
  }

  return globalThis.shopmorphCodexSdkClient;
}

function parseCodexResponse(turn: RunResult) {
  if (!turn.finalResponse) {
    throw new Error("Codex did not return a final response.");
  }

  return JSON.parse(turn.finalResponse) as unknown;
}

function isBrandGuardrailsToolCall(event: ThreadEvent) {
  return (
    (event.type === "item.started" ||
      event.type === "item.updated" ||
      event.type === "item.completed") &&
    event.item.type === "mcp_tool_call" &&
    event.item.tool === "getBrandGuardrails"
  );
}

async function runWithBrandGuardrailsTool(
  thread: Thread,
  prompt: string,
  options: ExtendedTurnOptions,
  guardrailsManifest: string
) {
  const streamedTurn = await thread.runStreamed(prompt, options);
  let finalResponse = "";
  let toolWasRequested = false;

  for await (const event of streamedTurn.events) {
    if (isBrandGuardrailsToolCall(event)) {
      toolWasRequested = true;
    }

    if (
      event.type === "item.completed" &&
      event.item.type === "agent_message"
    ) {
      finalResponse = event.item.text;
    }

    if (event.type === "turn.failed") {
      throw new Error(event.error.message);
    }
  }

  if (!toolWasRequested) {
    return { finalResponse, items: [], usage: null } satisfies RunResult;
  }

  return thread.run(
    [
      "Tool result for getBrandGuardrails:",
      getBrandGuardrails(guardrailsManifest),
      "Continue using this tool result as a hard constraint. Return only the final JSON object containing interactiveWidgetCode."
    ].join("\n"),
    options
  );
}

function isInteractiveWidgetResult(
  value: unknown
): value is InteractiveWidgetResult {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as InteractiveWidgetResult).interactiveWidgetCode ===
      "string" &&
    (value as InteractiveWidgetResult).interactiveWidgetCode
      .trim()
      .startsWith("<")
  );
}

function saveInteractiveWidget(prompt: string, interactiveWidgetCode: string) {
  const result = db
    .prepare(
      `
      INSERT INTO campaigns (
        prompt,
        headline,
        cta_text,
        tailwind_classes,
        has_countdown_timer,
        raw_html,
        interactive_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(
      prompt,
      "Interactive Widget",
      "Launch",
      "rounded-lg border border-white/10 bg-slate-950 p-6 text-white",
      0,
      interactiveWidgetCode,
      interactiveWidgetCode
    );

  return Number(result.lastInsertRowid);
}

async function generateWithCodex(prompt: string, guardrailsManifest: string) {
  const codex = getCodexClient();
  const thread = codex.startThread({
    workingDirectory: process.cwd(),
    skipGitRepoCheck: true,
    sandboxMode: "read-only",
    approvalPolicy: "never"
  });

  const turn = await runWithBrandGuardrailsTool(
    thread,
    [
      "You are an expert Frontend Engineer. Analyze the user's e-commerce widget request. You must build a beautiful, fully functional HTML component.",
      "",
      "CRITICAL SYSTEM CONSTRAINTS: You must strictly conform to the design syntax, brand tokens, layout restrictions, and architectural boundaries defined in the markdown manifest below. Do not deviate from these colors, utility classes, or behavioral scripts:",
      "",
      guardrailsManifest,
      "",
      "Return your response strictly as a JSON object containing the `interactiveWidgetCode` key.",
      `User marketing widget request: ${prompt}`
    ].join("\n"),
    {
      outputSchema: uiSchema,
      tools: [brandGuardrailsTool]
    },
    guardrailsManifest
  );
  const parsed = parseCodexResponse(turn);

  if (!isInteractiveWidgetResult(parsed)) {
    throw new Error("Codex returned an invalid interactiveWidgetCode payload.");
  }

  return parsed;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      prompt?: unknown;
    } | null;
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "A prompt is required." },
        { status: 400 }
      );
    }

    const manifestPath = path.join(
      process.cwd(),
      "shopmorph-guardrails-manifest.md"
    );
    const guardrailsManifest = fs.readFileSync(manifestPath, "utf-8");

    const result = await generateWithCodex(prompt, guardrailsManifest);
    const skillData = JSON.parse(getBrandGuardrails(guardrailsManifest));
    const testLogs = runLiveUnitTests(
      result.interactiveWidgetCode,
      skillData
    );
    const id = saveInteractiveWidget(prompt, result.interactiveWidgetCode);

    return NextResponse.json({
      id,
      interactiveWidgetCode: result.interactiveWidgetCode,
      generatedHtml: result.interactiveWidgetCode,
      testLogs
    });
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Unable to generate interactive widget.";

    console.error("/api/generate-ui Codex SDK error", error);

    if (error instanceof LiveUnitTestError) {
      return NextResponse.json(
        {
          error: "Generated widget failed live runtime validation.",
          detail
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to generate interactive widget with Codex SDK.",
        detail
      },
      { status: 500 }
    );
  }
}
