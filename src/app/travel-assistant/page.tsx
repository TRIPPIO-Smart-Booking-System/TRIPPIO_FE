'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Send, Upload, Loader, X, ArrowUp } from 'lucide-react';
import { getAuth } from '@/lib/auth';
import {
  getHotels,
  getRooms,
  getShows,
  getTransports,
  getTransportTrips,
  buildTravelRecommendations,
  type Hotel,
  type Room,
  type Show,
  type Transport,
  type TransportTrip,
} from '@/lib/ai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

// This will be built dynamically with real data
let SYSTEM_PROMPT = `Bạn là Trợ lý ảo Trippio - một chuyên gia du lịch thông minh giúp khách hàng lên kế hoạch chuyến đi hoàn hảo.

## Thông tin về dịch vụ Trippio:

### Available APIs:
1. **Hotels API** - GET /api/Hotel → Danh sách tất cả khách sạn
2. **Rooms API** - GET /api/Room → Danh sách tất cả phòng khách sạn
3. **Shows/Entertainment API** - GET /api/Show → Danh sách các điểm vui chơi, sự kiện
4. **Transport API** - GET /api/Transport → Danh sách phương tiện vận chuyển
5. **Transport Trips API** - GET /api/TransportTrip/available → Danh sách chuyến đi khả dụng

### Dữ liệu thực từ Trippio:
[DATA_WILL_BE_INJECTED_HERE]

## Hướng dẫn tương tác:

### Khi khách hỏi chung chung:
- Chủ động hỏi thêm: 
  - 📍 Địa điểm muốn đi (thành phố/vùng)
  - 📅 Thời gian du lịch (ngày, tháng, bao nhiêu đêm)
  - 👥 Số lượng người đi
  - 💰 Ngân sách dự tính
  - ❤️ Sở thích (biển, núi, thành phố, ẩm thực, vui chơi, nghỉ dưỡng...)
  - 🎯 Loại hình du lịch (nhóm bạn, gia đình, cặp đôi, độc hành...)

### Khi phân tích và gợi ý:
- 🏨 **Khách sạn & Phòng**: Gợi ý từ dữ liệu thực, dựa trên:
  - Vị trí, số sao, đánh giá
  - Ngân sách (loại phòng, giá/đêm)
  - Tiện ích phù hợp
  
- ✈️ **Phương tiện & Chuyến đi**: Tư vấn dựa trên:
  - Loại phương tiện (xe bus, máy bay, tàu...)
  - Khoảng cách & thời gian hành trình
  - Giá vé
  - Thời gian xuất phát phù hợp
  
- 🎭 **Điểm vui chơi & Sự kiện**: Đề xuất từ dữ liệu thực
  - Địa điểm, ngày hoạt động
  - Giá vé
  - Phù hợp với sở thích
  
- 📸 **Phân tích ảnh**: Khi khách gửi ảnh du lịch:
  - Nhận dạng địa điểm, phong cảnh
  - Gợi ý những nơi tương tự trong dữ liệu Trippio
  - Tư vấn hành trình tối ưu

### Tính tiền & So sánh:
- Tính toán chi phí chi tiết (khách sạn + phương tiện + vui chơi)
- So sánh các lựa chọn theo mức giá (bình dân, trung bình, cao cấp)
- Tối ưu hóa ngân sách

## Tính cách:
- Thân thiện, nhiệt tình, chuyên nghiệp
- Luôn sẵn sàng nghe và hiểu nhu cầu của khách
- Gợi ý cụ thể, chi tiết, có lý do rõ ràng
- Khi có thắc mắc → Hỏi lại để hiểu rõ hơn
- Luôn đề xuất các lựa chọn khác nhau theo mức giá từ dữ liệu Trippio
`;

type Msg = { role: 'user' | 'assistant'; content: string; image?: string };

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/* Markdown renderers */
type CodeRendererProps = React.HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode;
};
type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  children?: React.ReactNode;
};
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
};
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
};

const CodeRenderer = ({ inline, className, children, ...props }: CodeRendererProps) => {
  if (inline) {
    return (
      <code
        className="rounded bg-teal-100 px-1.5 py-0.5 text-[0.9em] text-teal-700 font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-xl border border-teal-200 bg-gray-50 p-4 text-[0.9em] leading-relaxed font-mono">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
};

const ARenderer = ({ children, ...props }: AnchorProps) => (
  <a
    className="text-teal-600 underline decoration-teal-400 underline-offset-2 hover:text-teal-700"
    target="_blank"
    rel="noreferrer"
    {...props}
  >
    {children}
  </a>
);

const TableRenderer = ({ children, ...props }: TableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse text-sm" {...props}>
      {children}
    </table>
  </div>
);

const ThRenderer = ({ children, ...props }: ThProps) => (
  <th
    className="border-b border-teal-200 bg-teal-50 px-3 py-2 text-left font-semibold text-teal-900"
    {...props}
  >
    {children}
  </th>
);

const TdRenderer = ({ children, ...props }: TdProps) => (
  <td className="border-b border-teal-100 px-3 py-2 align-top text-gray-700" {...props}>
    {children}
  </td>
);

const MD_COMPONENTS = {
  code: CodeRenderer,
  a: ARenderer,
  table: TableRenderer,
  th: ThRenderer,
  td: TdRenderer,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* no-op */
        }
      }}
      title="Copy"
      className="rounded px-2 py-1 text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 active:scale-95 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={classNames(
        'flex w-full gap-3 items-end',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
          🤖
        </div>
      )}
      <div
        className={classNames(
          'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        )}
      >
        {/* Show image if exists */}
        {msg.image && (
          <img
            src={msg.image}
            alt="message-image"
            className="mb-2 max-w-full rounded-lg max-h-48 object-cover"
          />
        )}
        <div className={classNames('prose prose-sm max-w-none', isUser ? 'prose-invert' : '')}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {msg.content}
          </ReactMarkdown>
        </div>
        <div
          className={classNames(
            'mt-2 flex items-center gap-2 text-xs',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <CopyButton text={msg.content} />
        </div>
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
}

export default function TravelAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        '🤖 Xin chào! Tôi là **Trợ lý ảo Trippio** — chuyên gia gợi ý du lịch thông minh của bạn!\n\n📍 Tôi có thể giúp bạn:\n- 🏨 Tìm kiếm khách sạn, phòng phù hợp\n- ✈️ Gợi ý chuyến bay và phương tiện\n- 🎭 Khám phá các điểm vui chơi, sự kiện\n- 📸 Phân tích hình ảnh du lịch bạn gửi\n- 🗺️ Gợi ý địa điểm du lịch hấp dẫn\n\nHãy nhập tin nhắn hoặc tải lên hình ảnh để bắt đầu!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [tripioData, setTripioData] = useState<{
    hotels: Hotel[];
    rooms: Room[];
    shows: Show[];
    transports: Transport[];
    trips: TransportTrip[];
  } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load Trippio data on component mount
  useEffect(() => {
    const loadTripioData = async () => {
      try {
        const [hotels, rooms, shows, transports, trips] = await Promise.all([
          getHotels(),
          getRooms(),
          getShows(),
          getTransports(),
          getTransportTrips(),
        ]);

        setTripioData({ hotels, rooms, shows, transports, trips });

        // Build system prompt with real data
        let dataInfo = '### 📊 Dữ liệu Khả Dụng Trên Trippio:\n\n';
        dataInfo += `- **${hotels.length} Khách sạn** ở các thành phố: ${[...new Set(hotels.map((h) => h.city))].join(', ')}\n`;
        dataInfo += `- **${rooms.length} Phòng** với giá từ ${Math.min(...rooms.map((r) => r.pricePerNight)).toLocaleString('vi-VN')} - ${Math.max(...rooms.map((r) => r.pricePerNight)).toLocaleString('vi-VN')} VND/đêm\n`;
        dataInfo += `- **${shows.length} Điểm vui chơi & Sự kiện** ở các thành phố: ${[...new Set(shows.map((s) => s.city))].join(', ')}\n`;
        dataInfo += `- **${transports.length} Loại phương tiện** vận chuyển: ${transports.map((t) => t.name).join(', ')}\n`;
        dataInfo += `- **${trips.length} Chuyến đi khả dụng** giữa các thành phố\n`;

        SYSTEM_PROMPT = SYSTEM_PROMPT.replace('[DATA_WILL_BE_INJECTED_HERE]', dataInfo);
      } catch (e) {
        console.error('Failed to load Trippio data:', e);
      }
    };

    loadTripioData();
  }, []);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      console.log('❌ messagesContainerRef not available');
      return;
    }
    console.log('✅ messagesContainerRef found:', {
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
    });

    const handleScroll = () => {
      const isScrolled = container.scrollTop > 100;
      console.log(`📍 Scroll event - scrollTop: ${container.scrollTop}, showButton: ${isScrolled}`);
      setShowScrollTop(isScrolled);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [input, resize]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;

    let userMsg = text;
    if (uploadedFile) {
      userMsg = text || '📸 Tôi vừa gửi một hình ảnh!';
    }

    // Create message object with image if exists
    const userMessageObj: Msg = {
      role: 'user',
      content: userMsg,
      ...(uploadedImage && { image: uploadedImage }),
    };

    setMessages((s) => [...s, userMessageObj, { role: 'assistant', content: '' }]);
    setInput('');
    setUploadedImage(null);
    setUploadedFile(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key không được cấu hình');
      }

      // Prepare Gemini request body
      const contents: any[] = [];
      // Add system message as first user message with system role instruction
      contents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }],
      });

      // Add model response to acknowledge system prompt
      contents.push({
        role: 'model',
        parts: [
          {
            text: 'Tôi đã hiểu. Tôi sẽ là trợ lý du lịch Trippio thông minh, hỏi thêm thông tin khi cần thiết, phân tích nhu cầu và gợi ý thông minh dựa trên các dịch vụ khách sạn, phòng, vui chơi, và phương tiện vận chuyển của Trippio. Tôi sẽ phân tích thời tiết, khoảng cách, giá cả và tối ưu hóa cho khách hàng.',
          },
        ],
      });

      // Build conversation history
      for (const msg of messages) {
        if (msg.role === 'user') {
          const parts: any[] = [{ text: msg.content }];
          if (msg.image) {
            const base64 = msg.image.split(',')[1];
            const mimeType = msg.image.split(';')[0].split(':')[1];
            parts.unshift({
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64,
              },
            });
          }
          contents.push({
            role: 'user',
            parts,
          });
        } else if (msg.content) {
          contents.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      // Add context with Trippio data if available
      let contextText = '';
      if (tripioData) {
        contextText += '\n\n### 📋 Dữ liệu Trippio Hiện Có:\n';
        contextText += `**Khách sạn:** ${tripioData.hotels.map((h) => `${h.name} (${h.city}, ${h.stars}⭐)`).join('; ')}\n`;
        contextText += `**Điểm vui chơi:** ${tripioData.shows.map((s) => `${s.name} (${s.city})`).join('; ')}\n`;
        contextText += `**Phương tiện:** ${tripioData.transports.map((t) => t.name).join(', ')}\n`;
        contextText += `**Phòng giá từ ${Math.min(...tripioData.rooms.map((r) => r.pricePerNight)).toLocaleString('vi-VN')} - ${Math.max(...tripioData.rooms.map((r) => r.pricePerNight)).toLocaleString('vi-VN')} VND/đêm**\n`;
      }

      // Add current message
      const currentParts: any[] = [{ text: text + contextText }];
      if (uploadedFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(uploadedFile);
        });
        const mimeType = uploadedFile.type;
        currentParts.unshift({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: base64,
          },
        });
      }

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 64,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Xin lỗi, tôi không thể xử lý yêu cầu này.';

      setMessages((s) => {
        const next = [...s];
        const last = next[next.length - 1];
        if (last?.role === 'assistant') {
          next[next.length - 1] = { ...last, content: reply };
        }
        return next;
      });
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Travel chat error:', e);
        setMessages((s) => {
          const next = [...s];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            next[next.length - 1] = {
              ...last,
              content:
                'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Hãy thử lại hoặc nhập câu hỏi đơn giản hơn nhé! 😊',
            };
          }
          return next;
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, messages, uploadedFile, uploadedImage]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6FBFA]">
      {/* Header */}
      <div className="bg-white border-b border-teal-100 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/homepage"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-teal-50 transition-colors text-teal-600 hover:text-teal-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🤖 Trợ lý ảo Trippio</h1>
              <p className="text-sm text-gray-500">Chuyên gia gợi ý du lịch thông minh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container - Full Height Layout */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6 h-full">
        {/* Chat Messages Area - Scrollable */}
        <div
          ref={messagesContainerRef}
          className="flex-1 flex flex-col gap-4 mb-6 overflow-y-auto px-2 relative min-h-0"
        >
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}
          <div ref={endRef} />
        </div>

        {/* Chat Input Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-6 space-y-4 flex-shrink-0">
          {/* Image Preview */}
          {uploadedImage && (
            <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <img
                src={uploadedImage}
                alt="preview"
                className="h-20 w-20 rounded-lg object-cover border border-teal-300"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium truncate">{uploadedFile?.name}</p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile?.size ?? 0) / 1024 / 1024 > 0
                    ? `${((uploadedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB`
                    : '0 MB'}
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setUploadedFile(null);
                }}
                className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Nhập câu hỏi của bạn tại đây..."
              rows={3}
              className="min-h-20 max-h-32 flex-1 resize-none rounded-xl bg-gray-50 border border-teal-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Upload Image Button */}
              <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer font-medium">
                <Upload className="h-4 w-4" />
                <span>Tải ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              <div className="flex-1" />

              {/* Send/Cancel Button */}
              {loading ? (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold"
                >
                  <X className="h-4 w-4" />
                  Dừng
                </button>
              ) : (
                <button
                  onClick={send}
                  disabled={!input.trim() && !uploadedFile}
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white transition-all font-semibold shadow-md"
                >
                  <Send className="h-4 w-4" />
                  Gửi
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">Nhấn Shift + Enter để xuống dòng</p>
        </div>

        {/* Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg transition-all hover:scale-110 active:scale-95"
            title="Trở lên đầu"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
