// src/app/api/ai/stream/route.ts
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

type Msg = { role: 'user' | 'assistant'; content: string };
type ReqBody = { message: string; history?: Msg[] };

export async function POST(req: NextRequest) {
  const { message, history = [] } = (await req.json()) as ReqBody;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response('Missing GOOGLE_API_KEY', { status: 500 });
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const contents = [
    { role: 'user', parts: [{ text: 'Bạn là trợ lý tiếng Việt, trả lời ngắn gọn, rõ ràng.' }] },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const result = await model.generateContentStream({ contents });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
