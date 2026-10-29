import React, { useState, useRef, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Globe, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export default function HRChatbotWidget({ onOpenRegularizeModal }) {
  const { currentUser, attendanceData, authUser } = useAttendance();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('EN'); // 'EN' | 'HI'
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      textEN: `Hello ${currentUser?.name || 'there'}! I am your ApexPulse HR & Attendance Assistant. How can I help you today?`,
      textHI: `नमस्ते ${currentUser?.name || ''}! मैं आपका ApexPulse HR और उपस्थिति सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?`,
      time: 'Just now'
    }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Quick reply chips
  const quickChips = [
    {
      id: 'check_offs',
      labelEN: '📊 My Offs Balance',
      labelHI: '📊 मेरी बची हुई छुट्टियां / Offs',
      action: 'check_offs'
    },
    {
      id: 'why_absent',
      labelEN: '❓ Why Day 14 Absent?',
      labelHI: '❓ Day 14 Absent क्यों है?',
      action: 'why_absent'
    },
    {
      id: 'roster_policy',
      labelEN: '📜 Roster Rules',
      labelHI: '📜 रोस्टर और संडे नियम',
      action: 'roster_policy'
    },
    {
      id: 'regularize_help',
      labelEN: '⚡ Request Regularize',
      labelHI: '⚡ उपस्थिति नियमित करें',
      action: 'regularize_help'
    }
  ];

  const handleChipClick = (chip) => {
    const userText = language === 'EN' ? chip.labelEN : chip.labelHI;
    handleSendMessage(userText, chip.action);
  };

  const handleSendMessage = (textToSend = null, actionKey = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      textEN: text,
      textHI: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Generate response based on real context
    setTimeout(() => {
      let botEN = '';
      let botHI = '';
      let actionBtn = null;

      const offsUsed = currentUser?.offsUsed || 0;
      const offsRemaining = currentUser?.offsRemaining || 0;

      if (actionKey === 'check_offs' || text.toLowerCase().includes('off') || text.toLowerCase().includes('balance')) {
        botEN = `You have used ${offsUsed} out of 4 allowed monthly offs this month. You have ${offsRemaining} offs remaining. Remember, taking more than 4 offs is flagged for Admin review.`;
        botHI = `इस महीने आपने अनुमत 4 में से ${offsUsed} Offs का उपयोग किया है। आपके पास ${offsRemaining} Offs शेष हैं। 4 से अधिक Offs लेने पर Admin समीक्षा लागू होगी।`;
      } else if (actionKey === 'why_absent' || text.toLowerCase().includes('absent') || text.toLowerCase().includes('day 14')) {
        botEN = `On Day 14, no biometric punch-in or punch-out was recorded on the Mohali biometric scanner. If you were working or on official duty, please click below to submit a regularization to Admin.`;
        botHI = `Day 14 को बायोमेट्रिक स्कैनर पर कोई पंच दर्ज नहीं हुआ था। यदि आप उपस्थित थे, तो कृपया नीचे क्लिक करके Admin को नियमितीकरण अनुरोध भेजें।`;
        actionBtn = {
          label: language === 'EN' ? 'Regularize Day 14' : 'Day 14 नियमित करें',
          day: 14
        };
      } else if (actionKey === 'roster_policy' || text.toLowerCase().includes('rule') || text.toLowerCase().includes('policy') || text.toLowerCase().includes('sunday')) {
        botEN = `ApexPulse Workforce Roster Rules: 1) Every month's 1st Date is an automatic Week Off (WO). 2) All Sundays are Week Offs (WO), EXCEPT the Last Sunday of the month which is a mandatory working day (6-day telecalling schedule). 3) 4 monthly offs quota.`;
        botHI = `ApexPulse नियम: 1) महीने की 1 तारीख को हमेशा Week Off (WO) होता है। 2) सभी रविवार Week Off हैं, लेकिन महीने का अंतिम रविवार वर्किंग डे होता है। 3) हर कर्मचारी के पास 4 मासिक Offs की सीमा है।`;
      } else if (actionKey === 'regularize_help' || text.toLowerCase().includes('regularize')) {
        botEN = `You can regularize any missed punches or unrecorded presence directly. Would you like to open the regularization assistant right now?`;
        botHI = `आप छूटे हुए पंच या अनुपस्थिति को सीधे नियमित कर सकते हैं। क्या आप अभी नियमितीकरण फॉर्म खोलना चाहते हैं?`;
        actionBtn = {
          label: language === 'EN' ? 'Open Regularization Form' : 'नियमितीकरण फॉर्म खोलें',
          day: null
        };
      } else {
        botEN = `I understand your query regarding "${text}". As per HR attendance policy, all punch discrepancies must be regularized within 48 hours for Admin approval. You can also view your full 30-day card above.`;
        botHI = `मैं आपकी बात समझ गया। HR नीति के अनुसार सभी पंच विसंगतियों को 48 घंटे के भीतर Admin स्वीकृति हेतु भेजना आवश्यक है।`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          textEN: botEN,
          textHI: botHI,
          actionBtn,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 transition-all hover:scale-105 group"
          title="Open HR Helpdesk Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {language === 'EN' ? 'HR Assistant' : 'HR सहायक'}
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/20 rounded-md">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs text-white">ApexPulse HR Desk</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-400 text-emerald-950 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-indigo-100/80">Biometric & Policy AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Hindi / English Toggle Switch */}
              <button
                type="button"
                onClick={() => setLanguage(l => l === 'EN' ? 'HI' : 'EN')}
                className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-bold text-white transition-colors"
                title="Switch English / Hindi"
              >
                <Globe className="w-3 h-3 text-indigo-200" />
                <span>{language === 'EN' ? 'हिंदी' : 'English'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 text-xs">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p>{language === 'EN' ? m.textEN : m.textHI}</p>

                  {/* Action Button inside bot message */}
                  {m.actionBtn && (
                    <button
                      onClick={() => {
                        if (onOpenRegularizeModal) {
                          onOpenRegularizeModal(currentUser, m.actionBtn.day);
                          setIsOpen(false);
                        }
                      }}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-xl transition-colors text-[11px]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{m.actionBtn.label}</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick-Reply Chips */}
          <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickChips.map(c => (
              <button
                key={c.id}
                onClick={() => handleChipClick(c)}
                className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-full border border-slate-200/80 transition-colors whitespace-nowrap"
              >
                {language === 'EN' ? c.labelEN : c.labelHI}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={language === 'EN' ? "Ask HR Assistant..." : "HR सहायक से पूछें..."}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
