import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/analysis-prompt";
import { AnalysisResult } from "@/types/analysis";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { inputs, collectedData } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not set" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build the user prompt with all collected data
    const userPrompt = buildUserPrompt(inputs, collectedData);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    // Extract text content from response
    let jsonText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        jsonText += block.text;
      }
    }

    // Clean up JSON - remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    // Try to find JSON object in the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", jsonText.substring(0, 500));
      return NextResponse.json(
        { error: "Failed to parse analysis result" },
        { status: 500 }
      );
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    const id = crypto.randomUUID();
    const result: AnalysisResult = {
      id,
      createdAt: new Date().toISOString(),
      productName: inputs.product.substring(0, 100),
      inputs,
      data: analysisData,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

function buildUserPrompt(
  inputs: {
    product: string;
    priceSegment: string;
    existingClients: string;
    excludedClients: string;
    niche: string;
    reviews: string;
  },
  collectedData: {
    youtube: Array<{
      title: string;
      url: string;
      viewCount: number;
      likeCount: number;
      commentCount: number;
      description: string;
    }>;
    tiktok: Array<{
      desc: string;
      playCount: number;
      diggCount: number;
      url: string;
    }>;
    instagram: Array<{
      caption: string;
      likeCount: number;
      url: string;
    }>;
    transcripts: string[];
    comments: string[];
  }
): string {
  let prompt = `## ВВОДНЫЕ ДАННЫЕ О ПРОДУКТЕ

**Продукт/услуга:** ${inputs.product}
**Ценовой сегмент:** ${inputs.priceSegment}
**Существующие клиенты:** ${inputs.existingClients}
**Кого НЕ хотим в клиентах:** ${inputs.excludedClients}
**Ниша/рынок:** ${inputs.niche}
**Отзывы и переписки:** ${inputs.reviews}

---

## СОБРАННЫЕ РЕАЛЬНЫЕ ДАННЫЕ

`;

  if (collectedData.youtube?.length > 0) {
    prompt += `### YouTube — Топ видео по теме\n\n`;
    for (const v of collectedData.youtube.slice(0, 8)) {
      prompt += `- "${v.title}" (${v.viewCount?.toLocaleString()} просмотров, ${v.likeCount?.toLocaleString()} лайков, ${v.commentCount?.toLocaleString()} комментариев) ${v.url}\n`;
      if (v.description) {
        prompt += `  Описание: ${v.description.substring(0, 200)}\n`;
      }
    }
    prompt += "\n";
  }

  if (collectedData.tiktok?.length > 0) {
    prompt += `### TikTok — Топ видео\n\n`;
    for (const v of collectedData.tiktok.slice(0, 10)) {
      prompt += `- "${v.desc?.substring(0, 150)}" (${v.playCount?.toLocaleString()} просмотров, ${v.diggCount?.toLocaleString()} лайков) ${v.url}\n`;
    }
    prompt += "\n";
  }

  if (collectedData.instagram?.length > 0) {
    prompt += `### Instagram — Посты по хэштегу\n\n`;
    for (const p of collectedData.instagram.slice(0, 10)) {
      prompt += `- "${p.caption?.substring(0, 150)}" (${p.likeCount?.toLocaleString()} лайков) ${p.url}\n`;
    }
    prompt += "\n";
  }

  if (collectedData.transcripts?.length > 0) {
    prompt += `### Транскрипты топ-видео\n\n`;
    for (let i = 0; i < collectedData.transcripts.length; i++) {
      const t = collectedData.transcripts[i];
      if (t) {
        prompt += `**Транскрипт ${i + 1}:**\n${t.substring(0, 3000)}\n\n`;
      }
    }
  }

  if (collectedData.comments?.length > 0) {
    prompt += `### Комментарии аудитории (${collectedData.comments.length} шт.)\n\n`;
    for (const c of collectedData.comments.slice(0, 80)) {
      prompt += `- ${c}\n`;
    }
    prompt += "\n";
  }

  prompt += `---

Используй web_search чтобы найти дополнительные обсуждения на Reddit, форумах и Quora по теме "${inputs.niche}" и "${inputs.product}".

Проведи глубокий анализ и верни JSON в точности по структуре из системного промпта. ТОЛЬКО JSON, без markdown-обёртки.`;

  return prompt;
}
