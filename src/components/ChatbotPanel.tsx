import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { NASA93Input, ChatMessage } from '../types';
import { sendChatMessage, extractProjectParameters } from '../services/api';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  form: NASA93Input;
  setForm: React.Dispatch<React.SetStateAction<NASA93Input>>;
  lang: 'en' | 'ar';
}

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: isAr
        ? 'مرحباً بك! أنا مساعد SEE Pro الذكي المدعوم بـ Groq LLaMA 3.3 70B و Gemini. يمكنك سؤالي عن معايير NASA93 أو لصق وصف مشروعك لاستخراج المعاملات تلقائياً.'
        : 'Welcome! I am your SEE Pro AI assistant powered by Groq & Gemini. Ask me about NASA93 drivers or paste your project description to auto-extract parameters.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [nlpText, setNlpText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, role: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setLoading(true);

    try {
      const reply = await sendChatMessage(userText, form);
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: 'bot', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'system', text: isAr ? 'تعذر الاتصال بخدمة الذكاء الاصطناعي.' : 'AI Service unreachable.', timestamp: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!nlpText.trim() || extracting) return;
    setExtracting(true);
    try {
      const extracted = await extractProjectParameters(nlpText);
      setMessages((prev) => [
        ...prev,
        {
          id: `nlp-${Date.now()}`,
          role: 'bot',
          text: isAr
            ? `تم استخراج المعطيات: الحجم ${extracted.equivphyskloc || form.equivphyskloc} KLOC، الفئة ${extracted.cat2 || form.cat2}. انقر زر التطبيق بالأسفل.`
            : `Extracted parameters: Size ${extracted.equivphyskloc || form.equivphyskloc} KLOC, Category ${extracted.cat2 || form.cat2}. Click Apply below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          extractedData: extracted,
        },
      ]);
    } catch {
      // ignore
    } finally {
      setExtracting(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 w-full sm:w-96 bg-white border-l rtl:border-l-0 rtl:border-r border-slate-200 shadow-xl z-50 flex flex-col animate-slide-in">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-slate-200" />
          <div>
            <h3 className="font-bold text-sm leading-tight">SEE AI Copilot</h3>
            <span className="text-[10px] text-slate-400 font-mono">Groq LLaMA 3.3 70B & Gemini</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* NLP Extraction Box */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <label className="text-[11px] font-bold text-slate-700 block">
          {isAr ? 'استخراج المعطيات نصياً (NLP Extraction):' : 'Auto-Extract from Description:'}
        </label>
        <textarea
          rows={2}
          value={nlpText}
          onChange={(e) => setNlpText(e.target.value)}
          placeholder={isAr ? 'مثال: مشروع طيران بحجم 45 KLOC ونمط مدمج...' : 'e.g. Flight avionics project, 45 KLOC, embedded mode...'}
          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 outline-hidden resize-none"
        />
        <button
          type="button"
          onClick={handleExtract}
          disabled={!nlpText.trim() || extracting}
          className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
        >
          {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{extracting ? (isAr ? 'جارٍ الاستخراج...' : 'Extracting...') : (isAr ? 'استخراج المعطيات' : 'Extract Parameters')}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-xl ${
                isUser ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800 border border-slate-200'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.extractedData && (
                  <button
                    onClick={() => { setForm((p) => ({ ...p, ...m.extractedData })); }}
                    className="mt-2 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{isAr ? 'تطبيق القيم على النموذج' : 'Apply Values'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {loading && <p className="text-xs text-slate-400 font-mono">{isAr ? 'المساعد يحلل...' : 'Analyzing...'}</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAr ? 'اسأل المساعد الذكي عن NASA93...' : 'Ask about NASA93 parameters...'}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-hidden text-slate-900"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </aside>
  );
};
