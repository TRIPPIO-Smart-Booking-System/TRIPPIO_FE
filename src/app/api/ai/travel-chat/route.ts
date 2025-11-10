// src/app/api/ai/travel-chat/route.ts
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

export const runtime = 'nodejs';

const TRIPPIO_SYSTEM_PROMPT = `Bạn là Trợ lý ảo Trippio — một chuyên gia gợi ý du lịch thông minh trong nền tảng Trippio, ứng dụng đặt vé máy bay, khách sạn và vé khu vui chơi giải trí.

🎯 Nhiệm vụ của bạn:
- Giúp người dùng tìm kiếm, khám phá hoặc gợi ý địa điểm du lịch, khách sạn, và phương tiện di chuyển phù hợp.
- Khi người dùng tải lên hình ảnh, hãy phân tích ảnh đó xem có liên quan tới phong cảnh, địa danh, du lịch, bãi biển, khu vui chơi, khách sạn, v.v. hay không.
- Nếu ảnh **không liên quan tới du lịch**, hãy phản hồi lịch sự: "Ảnh bạn gửi không giống một địa điểm du lịch. Hãy thử gửi hình phong cảnh, bãi biển, khu vui chơi hoặc nơi bạn muốn khám phá nhé!"
- Nếu ảnh **có liên quan**, hãy gợi ý dựa trên nội dung hình ảnh.

🧠 Khi trả lời:
- Luôn **giới hạn chủ đề** trong lĩnh vực du lịch, đặt vé, khám phá địa điểm.
- Viết ngắn gọn, thân thiện, tự nhiên, đôi khi thêm emoji du lịch cho sinh động ✈️🏝️🏔️
- Không trả lời các câu hỏi ngoài phạm vi du lịch.
- Nếu người dùng chỉ gửi ảnh mà không nhập tin nhắn → tự động mô tả và gợi ý theo ảnh.

Bạn là **Trợ lý ảo Trippio**, luôn giữ phong cách lịch sự, chuyên nghiệp và truyền cảm hứng du lịch!`;

type Msg = { role: 'user' | 'assistant'; content: string };
type ReqBody = {
  message: string;
  history?: Msg[];
  image?: string; // base64 image data
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReqBody;
    const { message = '', history = [], image } = body;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response('Missing GOOGLE_API_KEY', { status: 500 });
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build content parts
    const parts: Part[] = [];

    // Add image if provided
    if (image) {
      const base64Data = image.split(',')[1] || image;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
    }

    // Add text message
    if (message) {
      parts.push({ text: message });
    } else if (image) {
      parts.push({
        text: 'Hãy phân tích hình ảnh này. Nó có liên quan tới du lịch không? Nếu có, hãy gợi ý các địa điểm hoặc khách sạn tương tự.',
      });
    }

    // Build conversation history
    const contents = [
      {
        role: 'user',
        parts: [{ text: TRIPPIO_SYSTEM_PROMPT }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Tôi đã hiểu. Tôi là Trợ lý ảo Trippio, luôn sẵn sàng giúp bạn khám phá và đặt các dịch vụ du lịch!',
          },
        ],
      },
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      {
        role: 'user',
        parts,
      },
    ];

    // Use streamGenerateContent for streaming response
    const stream = await model.generateContentStream({ contents });

    // Create a readable stream for the response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            if (chunk.candidates?.[0]?.content?.parts?.[0]) {
              const text = (chunk.candidates[0].content.parts[0] as any).text;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e) {
    console.error('Travel chat error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Error: ${message}`, { status: 500 });
  }
}
