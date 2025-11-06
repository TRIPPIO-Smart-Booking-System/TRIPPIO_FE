import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/genai';

export const runtime = 'edge'; // nhanh, rẻ

export async function POST(req: NextRequest) {
  const { message } = (await req.json()) as { message: string };

  const client = new GoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
    systemPrompt:
      'bạn là trợ lý AI chuyên nghiệp cho web app du lịch có tên là trippio và bạn sẽ hỗ trợ user trong việc lên kế hoạch du lịch tối ưu hóa thời gian và nguồn tiền cho người dùng có thể đi du lịch 1 cách tiết kiệm nhất',
  });
  // flash = nhanh/rẻ; pro = thông minh hơn
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(message);
  return new Response(result.response.text(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
