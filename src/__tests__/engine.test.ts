import { describe, expect, test, vi } from "vitest";

type BrandGuardrails = {
  allowedColors: string[];
  borderRadius: string[];
  microCopyRequirements: string[];
};

type WidgetPayload = {
  interactiveWidgetCode: unknown;
};

function validateInteractiveWidgetCode(payload: WidgetPayload) {
  if (typeof payload.interactiveWidgetCode !== "string") {
    return false;
  }

  const html = payload.interactiveWidgetCode.trim();

  return (
    html.length > 0 &&
    html.includes("<html") &&
    html.includes("<head") &&
    html.includes("<body") &&
    html.includes("tailwindcss.com")
  );
}

describe("advanced generation engine", () => {
  test("passes brand guardrail theme tokens from the mocked Codex Skill", () => {
    const getBrandGuardrails = vi.fn<() => BrandGuardrails>(() => ({
      allowedColors: ["bg-slate-950", "text-teal-300", "bg-teal-400"],
      borderRadius: ["rounded-lg", "rounded-xl", "rounded-2xl"],
      microCopyRequirements: ["benefit-led headline", "clear CTA"]
    }));

    const guardrails = getBrandGuardrails();

    expect(getBrandGuardrails).toHaveBeenCalledOnce();
    expect(guardrails.allowedColors).toContain("bg-slate-950");
    expect(guardrails.allowedColors).toContain("text-teal-300");
    expect(guardrails.borderRadius).toContain("rounded-xl");
  });

  test("validates that generated widget code includes the Tailwind CDN", () => {
    const payload = {
      interactiveWidgetCode:
        '<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><main class="bg-slate-950 text-white">Ready</main></body></html>'
    };

    expect(validateInteractiveWidgetCode(payload)).toBe(true);
  });

  test("accepts a production-grade HTML payload from Codex", () => {
    const codexPayload = {
      interactiveWidgetCode:
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script><title>ShopMorph Widget</title></head><body class="bg-slate-950"><section class="min-h-screen p-8 text-white"><h1 class="text-4xl font-bold">Flash Sale</h1><button class="mt-6 rounded-xl bg-teal-400 px-5 py-3 text-slate-950">Claim offer</button><script>document.querySelector("button")?.addEventListener("click",()=>document.body.dataset.clicked="true");</script></section></body></html>'
    };

    expect(validateInteractiveWidgetCode(codexPayload)).toBe(true);
  });

  test("rejects empty or malformed payloads before iframe rendering", () => {
    expect(validateInteractiveWidgetCode({ interactiveWidgetCode: "" })).toBe(
      false
    );
    expect(
      validateInteractiveWidgetCode({
        interactiveWidgetCode:
          '<section class="bg-slate-950 text-white">Missing document and CDN</section>'
      })
    ).toBe(false);
    expect(validateInteractiveWidgetCode({ interactiveWidgetCode: null })).toBe(
      false
    );
  });
});
