// src/app/api/ai/stream/route.ts
import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';

type Msg = { role: 'user' | 'assistant'; content: string };
type ReqBody = { message: string; history?: Msg[] };

export async function POST(req: NextRequest) {
  const { message, history = [] } = (await req.json()) as ReqBody;

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
  const model = 'gemini-2.0-flash';

  // map history -> contents
  const contents = [
    { role: 'user', parts: [{ text: 'Bạn là trợ lý tiếng Việt, trả lời ngắn gọn, rõ ràng.' }] },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  // ⬇️ result là AsyncGenerator<GenerateContentResponse>
  const result = await ai.models.generateContentStream({ model, contents });

  const encoder = new TextEncoder();
  const rs = new ReadableStream({
    async start(controller) {
      try {
        // 🔁 lặp trực tiếp trên generator (không dùng .stream)
        for await (const chunk of result) {
          // mỗi chunk là GenerateContentResponse
          const text =
            chunk?.candidates?.[0]?.content?.parts
              ?.map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
              ?.join('') ?? '';

          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(rs, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
