
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, GraduationCap, ChevronRight, Menu, X, Search, CheckCircle, 
  Sparkles, Send, CheckCircle2, HelpCircle, Layers, Info, ListTree, 
  Briefcase, Check, ArrowLeft, Loader2, RefreshCw, Trophy, 
  BrainCircuit, Terminal, Lightbulb, ChevronDown, ChevronUp 
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- 1. Types ---

interface Topic {
  id: string;
  title: string;
  shortExplanation: string;
  moderateExplanation: string;
  detailedExplanation: string;
  industrialUseCase: string;
  keyTakeaways: string[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type ViewState = 'reading' | 'quiz' | 'scenario' | 'ai-search';

// --- 2. Constants (Jamf 200 Curriculum) ---

const JAMF_MODULES: Module[] = [
  {
    id: 'server-intro',
    title: '1. Jamf Pro Server',
    description: 'Introduction to server architecture.',
    topics: [{
      id: 'server-arch',
      title: 'Server Architecture',
      shortExplanation: 'Jamf Pro runs on Apache Tomcat and MySQL.',
      moderateExplanation: 'The Jamf Pro server is a Java-based web application. It requires Tomcat for the web app and MySQL for the database. Ports 80 and 443 are standard, with 443 being the primary for management.',
      detailedExplanation: 'Under the hood, Jamf Pro uses the Java Spring framework. Tomcat handles HTTP/HTTPS requests. The database schema stores everything from inventory to policies. On macOS clients, the jamf binary communicates with the server via the API and tasking check-ins.',
      industrialUseCase: 'Most enterprises use Jamf Cloud, which manages the server hosting (AWS-backed) so IT teams don\'t have to patch Tomcat manually.',
      keyTakeaways: ['Java/Tomcat/MySQL Stack', 'Port 443 for MDM', 'Database stores all settings']
    }]
  },
  {
    id: 'packaging',
    title: '2. Packaging',
    description: 'Building content for deployment.',
    topics: [{
      id: 'pkg-formats',
      title: 'PKG vs DMG',
      shortExplanation: '.pkg is an installer; .dmg is a disk image.',
      moderateExplanation: 'Packages (.pkg) are standard Apple installers that support pre/post-install scripts. Disk Images (.dmg) are file containers that Jamf mounts to copy files.',
      detailedExplanation: 'Jamf Composer is used to create both. Snapshot packaging captures filesystem changes into a DMG. PKGs use the native system installer service.',
      industrialUseCase: 'Use PKG for complex apps like Microsoft Office to ensure scripts run; use DMG for simple font or wallpaper deployments.',
      keyTakeaways: ['PKG = Scripts + Install', 'DMG = File Copy', 'Composer is the tool']
    }]
  },
  {
    id: 'ade',
    title: '3. Automated Device Enrollment',
    description: 'Zero-touch deployment.',
    topics: [{
      id: 'ade-zero-touch',
      title: 'ADE (DEP) Workflow',
      shortExplanation: 'Connect ABM to Jamf for zero-touch setup.',
      moderateExplanation: 'Automated Device Enrollment (ADE) makes MDM mandatory and unremovable. It uses Apple Business Manager to assign devices to Jamf.',
      detailedExplanation: 'When a new Mac turns on, it checks with Apple servers. If assigned in ABM, it is redirected to the Jamf Prestage Enrollment URL to receive its management profile immediately.',
      industrialUseCase: 'Shipping a laptop shrink-wrapped to an employee\'s house; they log in and IT is done.',
      keyTakeaways: ['Requires ABM/ASM', 'Mandatory management', 'Zero-touch deployment']
    }]
  },
  {
      id: 'security',
      title: '4. Security & Compliance',
      description: 'Protecting Apple devices.',
      topics: [{
        id: 'filevault',
        title: 'FileVault & PRK',
        shortExplanation: 'Encryption with recovery key escrow.',
        moderateExplanation: 'Jamf manages FileVault encryption and securely escrows the Personal Recovery Key (PRK) in the inventory record.',
        detailedExplanation: 'Using a Configuration Profile, Jamf triggers encryption. The PRK is captured and encrypted in the JSS database for later retrieval by IT support.',
        industrialUseCase: 'Meeting HIPAA requirements by ensuring 100% of laptops are encrypted.',
        keyTakeaways: ['PRK is stored in Jamf', 'Enforced by Profiles', 'Prevents data theft']
      }]
  }
];

// --- 3. AI Services ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = 'gemini-3-flash-preview';

async function askAssistant(query: string, context: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are a Jamf Certified Expert. Context: ${context}. Question: ${query}`,
  });
  return response.text || "No response";
}

async function fetchQuiz(title: string, content: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Based on: ${content}, generate 3 Jamf 200 exam questions in JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
}

// --- 4. Sub-Components ---

const ModuleContent = ({ topics, completedIds, onToggle }: any) => {
  const [activeLevels, setActiveLevels] = useState<any>({});
  return (
    <div className="space-y-8">
      {topics.map((t: Topic) => {
        const level = activeLevels[t.id] || 'moderate';
        const isDone = completedIds.includes(t.id);
        const text = level === 'short' ? t.shortExplanation : level === 'detail' ? t.detailedExplanation : t.moderateExplanation;
        return (
          <div key={t.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{t.title}</h3>
              <button onClick={() => onToggle(t.id)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${isDone ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 hover:border-blue-500'}`}>
                {isDone ? 'Mastered' : 'Mark Done'}
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              {['short', 'moderate', 'detail'].map(l => (
                <button key={l} onClick={() => setActiveLevels({...activeLevels, [t.id]: l})} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${level === l ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
              ))}
            </div>
            <div className={`p-6 rounded-2xl mb-6 ${level === 'detail' ? 'bg-slate-900 text-slate-300 font-mono text-sm' : 'bg-slate-50 text-slate-700 text-lg leading-relaxed'}`}>
              {text}
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
               <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold"><Briefcase className="w-4 h-4"/> Industry Case</div>
               <p className="text-emerald-700 text-sm italic">{t.industrialUseCase}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const QuizView = ({ title, content }: any) => {
  const [questions, setQs] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchQuiz(title, content).then(setQs).finally(() => setLoading(false));
  }, [title]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600"/></div>;

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-white p-8 rounded-3xl border">
          <p className="font-bold text-lg mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((o, oi) => (
              <button key={oi} onClick={() => !show && setAnswers({...answers, [idx]: oi})} className={`w-full text-left p-4 rounded-xl border ${answers[idx] === oi ? 'border-blue-600 bg-blue-50' : 'border-slate-100'} ${show && q.correctAnswer === oi ? 'bg-green-100 border-green-500' : ''}`}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl">Check Answers</button>
    </div>
  );
};

// --- 5. Main App ---

const App = () => {
  const [modId, setModId] = useState(JAMF_MODULES[0].id);
  const [view, setView] = useState<ViewState>('reading');
  const [done, setDone] = useState<string[]>([]);
  const [aiText, setAiText] = useState('');
  const [aiIn, setAiIn] = useState('');
  const [sidebar, setSidebar] = useState(false);

  const cur = JAMF_MODULES.find(m => m.id === modId)!;

  const toggle = (id: string) => setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const ask = async (e: any) => {
    e.preventDefault(); if (!aiIn) return;
    setView('ai-search'); setAiText('Thinking...');
    const res = await askAssistant(aiIn, cur.title);
    setAiText(res); setAiIn('');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r transition-transform ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl"><GraduationCap className="text-white w-6 h-6"/></div>
            <div><h1 className="font-black text-slate-900">JAMF 200</h1><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Master Guide</p></div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {JAMF_MODULES.map(m => (
              <button key={m.id} onClick={() => {setModId(m.id); setView('reading'); setSidebar(false);}} className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-all ${modId === m.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>{m.title}</button>
            ))}
          </nav>
          <form onSubmit={ask} className="mt-4 relative">
             <input value={aiIn} onChange={e => setAiIn(e.target.value)} placeholder="Ask AI..." className="w-full p-3 pr-10 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500"/>
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2"><Send className="w-4 h-4 text-blue-600"/></button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b p-4 px-8 flex justify-between items-center">
          <button onClick={() => setSidebar(true)} className="lg:hidden p-2"><Menu/></button>
          <h2 className="font-bold text-slate-800">{cur.title}</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['reading', 'quiz', 'scenario'].map(v => (
              <button key={v} onClick={() => setView(v as ViewState)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === v ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'}`}>{v}</button>
            ))}
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-8 lg:p-12">
          {view === 'ai-search' && (
            <div className="bg-white p-10 rounded-3xl border border-blue-100 shadow-xl">
               <button onClick={() => setView('reading')} className="text-blue-600 flex items-center gap-2 mb-6 font-bold"><ArrowLeft className="w-4 h-4"/> Back to Lesson</button>
               <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">{aiText}</div>
            </div>
          )}
          {view === 'reading' && <ModuleContent topics={cur.topics} completedIds={done} onToggle={toggle}/>}
          {view === 'quiz' && <QuizView title={cur.title} content={JSON.stringify(cur.topics)}/>}
          {view === 'scenario' && <div className="p-20 text-center text-slate-400 font-medium">Scenario labs coming soon in version 2.0. Check back tomorrow!</div>}
        </div>
      </main>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
