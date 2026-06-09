import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const campaigns = db
    .prepare(
      `
      SELECT
        id,
        prompt,
        headline,
        cta_text AS ctaText,
        tailwind_classes AS tailwindClasses,
        has_countdown_timer AS hasCountdownTimer,
        layout_type AS layoutType,
        image_keyword AS imageKeyword,
        image_url AS imageUrl,
        inline_svg AS inlineSvgCode,
        social_caption AS socialCaption,
        raw_html AS rawHtml,
        interactive_code AS interactiveWidgetCode,
        created_at AS createdAt
      FROM campaigns
      WHERE is_active = 1
      ORDER BY datetime(created_at) DESC
      LIMIT 12
    `
    )
    .all();

  return NextResponse.json({ campaigns });
}
