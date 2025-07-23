'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý ảo của Trippio. Tôi có thể giúp gì cho bạn?',
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;

    // Thêm tin nhắn của người dùng
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setMessage('');

    // Giả lập phản hồi từ trợ lý ảo sau 1 giây
    setTimeout(() => {
      let responseText =
        'Xin chào! Tôi có thể giúp bạn tìm kiếm tour du lịch hoặc trả lời các câu hỏi về dịch vụ của Trippio.';

      // Kiểm tra nếu tin nhắn người dùng có chứa từ khóa "Đà Lạt"
      if (message.toLowerCase().includes('đà lạt')) {
        responseText =
          'Hiện tại Trippio đang có ưu đãi Giảm 15% cho tour Đà Lạt trong tuần này, kèm quà tặng voucher ẩm thực trị giá 200.000đ. Bạn muốn tôi hỗ trợ đặt tour không?';
      }

      const agentResponse: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen ? (
        <div
          className="w-80 rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white"
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '0',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          {/* Header */}
          <div
            className="p-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(to right, #319795, #38b2ac)',
            }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2 overflow-hidden shadow-sm">
                <span className="text-xs text-teal-500 font-semibold">T</span>
              </div>
              <div className="text-white text-sm font-medium">Trippio Chat</div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          <div className="p-4 h-96 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-6 h-6 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center mr-2 overflow-hidden self-end mb-1">
                      <span className="text-[8px] text-teal-500 font-semibold">T</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-teal-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center ml-2 overflow-hidden self-end mb-1">
                      <span className="text-[8px] text-white font-semibold">B</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestion Buttons */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                className="text-xs text-teal-600 bg-teal-50 rounded-full px-3 py-1.5 hover:bg-teal-100 transition-colors"
                onClick={() => {
                  setMessage('Tôi muốn đặt tour Đà Lạt');
                }}
              >
                Đặt tour Đà Lạt
              </button>
              <button
                className="text-xs text-teal-600 bg-teal-50 rounded-full px-3 py-1.5 hover:bg-teal-100 transition-colors"
                onClick={() => {
                  setMessage('Khuyến mãi hiện có là gì?');
                }}
              >
                Khuyến mãi hiện có
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex w-full items-center relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-teal-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="rounded-full w-10 h-10 flex items-center justify-center shadow-md bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: 9999,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
