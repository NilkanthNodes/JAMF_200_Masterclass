
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, GraduationCap, ChevronRight, Menu, X, Search, CheckCircle, 
  Sparkles, Send, CheckCircle2, HelpCircle, Layers, Info, ListTree, 
  Briefcase, Check, ArrowLeft, Loader2, RefreshCw, Trophy, 
  BrainCircuit, Terminal, Lightbulb, ChevronDown, ChevronUp 
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- 1. Types & Interfaces ---

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

// --- 2. Data (Jamf 200 Curriculum) ---

const JAMF_MODULES: Module[] = [
  {
    id: 'server-intro',
    title: '1. Jamf Pro Server',
    description: 'Architecture and core components.',
    topics: [{
      id: 'server-arch',
      title: 'Server Architecture',
      shortExplanation: 'Jamf Pro is a Java web app running on Tomcat with a MySQL database.',
      moderateExplanation: 'The Jamf Pro server is built on a Java stack. It uses Apache Tomcat as the web server and MySQL/MariaDB for the database. Admins interact with the Web UI on port 443.',
      detailedExplanation: 'Technically, Jamf Pro is a WAR file deployed to Tomcat. The database stores all settings, inventory, and encryption keys. Clients communicate via the MDM protocol and the Jamf Binary. Key ports: 443 (HTTPS/MDM), 80 (HTTP/Redirects), 3306 (MySQL Internal).',
      industrialUseCase: 'Enterprise setups often use Jamf Cloud, which manages the scaling of these components automatically via AWS.',
      keyTakeaways: ['Java/Tomcat/MySQL Stack', 'Port 443 is primary', 'API allows automation']
    }]
  },
  {
    id: 'packaging',
    title: '2. Packaging & Content',
    description: 'Deploying software and files.',
    topics: [{
      id: 'pkg-formats',
      title: 'PKG vs DMG',
      shortExplanation: '.pkg is an installer; .dmg is a disk image.',
      moderateExplanation: 'Packages (.pkg) are standard Apple installers that support pre/post-install scripts. Disk Images (.dmg) are file containers that Jamf mounts to copy files directly.',
      detailedExplanation: 'Jamf Composer creates both. Snapshots capture filesystem changes into a DMG. PKGs are preferred for complex apps needing install logic. The jamf binary uses `installer -pkg` for packages and `hdiutil` for images.',
      industrialUseCase: 'Use PKG for Microsoft Office to run post-install registration; use DMG for a set of fonts or desktop wallpapers.',
      keyTakeaways: ['PKG = Scripts + Logic', 'DMG = Simple File Copy', 'Composer is the primary tool']
    }]
  },
  {
    id: 'enrollment',
    title: '3. Automated Enrollment',
    description: 'Zero-touch deployment with ABM.',
    topics: [{
      id: 'ade-workflow',
      title: 'ADE (DEP) Workflow',
      shortExplanation: 'ABM + Jamf = Zero-Touch Setup.',
      moderateExplanation: 'Automated Device Enrollment (ADE) makes MDM mandatory and unremovable. Devices are assigned to Jamf in Apple Business Manager (ABM).',
      detailedExplanation: 'When a new device starts, it contacts Apple. Apple directs it to Jamf’s Prestage Enrollment. The device receives its management profile during the Setup Assistant, skipping user screens as configured.',
      industrialUseCase: 'Global companies ship sealed laptops to remote staff; users log in to Wi-Fi and the device auto-configures.',
      keyTakeaways: ['Requires ABM account', 'Unremovable MDM profile', 'Configured via Prestage']
    }]
  },
  {
    id: 'security',
    title: '4. Security & Privacy',
    description: 'Encryption and permissions.',
    topics: [{
      id: 'filevault',
      title: 'FileVault & PRK',
      shortExplanation: 'Disk encryption with key escrow in Jamf.',
      moderateExplanation: 'Jamf enforces FileVault encryption and securely stores the Personal Recovery Key (PRK) in the device inventory.',
      detailedExplanation: 'MDM Configuration Profiles trigger encryption. The PRK is captured by the Jamf Binary and sent to the server. If a user loses their password, IT retrieves the PRK from Jamf Pro to unlock the disk.',
      industrialUseCase: 'Meeting HIPAA or SOC2 compliance by ensuring 100% of the fleet is encrypted.',
      keyTakeaways: ['PRK stored in Jamf', 'Enforced via MDM Profile', 'Essential for data security']
    }]
  }
];

// --- 3. AI Services ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = 'gemini-3-flash-preview';

async function askAssistant(query: string, context: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are a Jamf Certified Expert. Context: ${context}. Question: ${query}. Provide a concise, professional answer with Markdown formatting.`,
  });
  return response.text || "No response received.";
}

async function fetchQuiz(title: string, content: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Based on this content: ${content}, generate 3 Jamf 200 exam style multiple choice questions in JSON.`,
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

async function fetchScenario(title: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a realistic technical troubleshooting scenario for a Jamf admin related to "${title}". Structure it with "Scenario Overview", "The Problem", and then "Recommended Solution" at the end.`,
  });
  return response.text || "Failed to generate scenario.";
}

// --- 4. UI Components ---

const ModuleContent = ({ topics, completedIds, onToggle }: any) => {
  const [activeLevels, setActiveLevels] = useState<any>({});
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {topics.map((t: Topic) => {
        const level = activeLevels[t.id] || 'moderate';
        const isDone = completedIds.includes(t.id);
        const text = level === 'short' ? t.shortExplanation : level === 'detail' ? t.detailedExplanation : t.moderateExplanation;
        return (
          <div key={t.id} className={`bg-white rounded-3xl p-8 border transition-all ${isDone ? 'border-green-100 shadow-sm' : 'border-slate-200 shadow-lg hover:shadow-xl'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{t.title}</h3>
                <div className={`h-1 w-12 rounded-full mt-2 ${isDone ? 'bg-green-500' : 'bg-blue-600'}`} />
              </div>
              <button onClick={() => onToggle(t.id)} className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${isDone ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 hover:border-blue-500'}`}>
                {isDone ? 'Mastered ✓' : 'Mark Done'}
              </button>
            </div>
            <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
              {['short', 'moderate', 'detail'].map(l => (
                <button key={l} onClick={() => setActiveLevels({...activeLevels, [t.id]: l})} className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${level === l ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
              ))}
            </div>
            <div className={`p-6 rounded-2xl mb-6 transition-all ${level === 'detail' ? 'bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed border-none shadow-inner' : 'bg-slate-50 text-slate-700 text-lg leading-relaxed'}`}>
              {text}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold"><Briefcase className="w-4 h-4"/> Business Context</div>
                <p className="text-emerald-700 text-sm italic leading-relaxed">{t.industrialUseCase}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold"><CheckCircle2 className="w-4 h-4"/> Exam Focal Points</div>
                <ul className="space-y-1">
                  {t.keyTakeaways.map((k, i) => <li key={i} className="text-blue-700 text-xs flex items-center gap-2"> <div className="w-1 h-1 bg-blue-400 rounded-full" /> {k}</li>)}
                </ul>
              </div>
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
    setLoading(true); setQs([]); setShow(false); setAnswers({});
    fetchQuiz(title, content).then(setQs).finally(() => setLoading(false));
  }, [title]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border">
      <BrainCircuit className="w-16 h-16 text-blue-600 animate-pulse mb-4"/>
      <h3 className="text-xl font-bold text-slate-800">Generating Study Quiz...</h3>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-white p-8 rounded-3xl border shadow-sm">
          <p className="font-bold text-xl mb-6 flex gap-4 text-slate-900">
            <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-sm">{idx + 1}</span>
            {q.question}
          </p>
          <div className="space-y-3">
            {q.options.map((o, oi) => (
              <button 
                key={oi} 
                onClick={() => !show && setAnswers({...answers, [idx]: oi})} 
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium ${
                  answers[idx] === oi ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-100'
                } ${show && q.correctAnswer === oi ? 'bg-green-100 border-green-500 text-green-900' : ''} ${show && answers[idx] === oi && q.correctAnswer !== oi ? 'bg-red-50 border-red-500 text-red-900' : ''}`}
              >
                {o}
              </button>
            ))}
          </div>
          {show && <div className="mt-6 p-4 bg-slate-900 text-slate-300 rounded-xl text-sm border-l-4 border-blue-500 italic">{q.explanation}</div>}
        </div>
      ))}
      <button onClick={() => setShow(true)} className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95">Check Answers</button>
    </div>
  );
};

const ScenarioView = ({ title }: any) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setText('');
    fetchScenario(title).then(setText).finally(() => setLoading(false));
  }, [title]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600"/></div>;

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-5 bg-slate-800 flex items-center gap-3 border-b border-slate-700">
        <Terminal className="w-5 h-5 text-green-400"/>
        <span className="text-slate-400 font-mono text-xs font-bold uppercase tracking-widest">Lab Simulation</span>
      </div>
      <div className="p-10 md:p-14 prose prose-invert max-w-none prose-headings:text-blue-400 prose-p:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
};

// --- 5. Main Application ---

const App = () => {
  const [modId, setModId] = useState(JAMF_MODULES[0].id);
  const [view, setView] = useState<ViewState>('reading');
  const [done, setDone] = useState<string[]>(() => JSON.parse(localStorage.getItem('jamf_master_done') || '[]'));
  const [aiText, setAiText] = useState('');
  const [aiIn, setAiIn] = useState('');
  const [sidebar, setSidebar] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('jamf_master_done', JSON.stringify(done));
  }, [done]);

  const cur = JAMF_MODULES.find(m => m.id === modId)!;
  const toggle = (id: string) => setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const ask = async (e: any) => {
    e.preventDefault(); if (!aiIn || aiLoading) return;
    setView('ai-search'); setAiLoading(true); setAiText('Analyzing Jamf documentation and crafting answer...');
    try {
      const res = await askAssistant(aiIn, cur.title);
      setAiText(res);
    } catch (e) { setAiText('Error: Failed to connect to AI assistant.'); }
    finally { setAiLoading(false); setAiIn(''); }
  };

  const progress = Math.round((done.length / JAMF_MODULES.reduce((a,m) => a + m.topics.length, 0)) * 100);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
              <GraduationCap className="text-white w-6 h-6"/>
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-900 leading-none">JAMF 200</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Master Class</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              <span>Overall Progress</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {JAMF_MODULES.map(m => (
              <button 
                key={m.id} 
                onClick={() => {setModId(m.id); setView('reading'); setSidebar(false);}} 
                className={`w-full text-left p-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${modId === m.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="truncate pr-2">{m.title}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${modId === m.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}/>
              </button>
            ))}
          </nav>

          <form onSubmit={ask} className="mt-6 relative">
             <input 
               value={aiIn} 
               onChange={e => setAiIn(e.target.value)} 
               placeholder="Need help? Ask AI..." 
               className="w-full p-4 pr-12 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
             />
             <button type="submit" disabled={aiLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-xl shadow-sm text-blue-600 disabled:opacity-50">
               {aiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
             </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 p-5 px-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebar(true)} className="lg:hidden p-2.5 bg-slate-100 rounded-xl"><Menu className="w-5 h-5"/></button>
            <h2 className="font-black text-slate-800 text-lg">{cur.title}</h2>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {['reading', 'quiz', 'scenario'].map(v => (
              <button 
                key={v} 
                onClick={() => setView(v as ViewState)} 
                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-10 lg:p-16 w-full">
          {view === 'ai-search' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-100/50 animate-in zoom-in-95 duration-500">
               <button onClick={() => setView('reading')} className="text-blue-600 flex items-center gap-2 mb-8 font-bold text-sm hover:underline group">
                 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> 
                 Return to Course
               </button>
               <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white"><Sparkles className="w-6 h-6"/></div>
                 <h2 className="text-3xl font-black text-slate-900">AI Tutor Analysis</h2>
               </div>
               {aiLoading ? (
                 <div className="py-20 flex flex-col items-center">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-blue-200 border-b-transparent rounded-full animate-spin-slow"></div>
                    </div>
                    <p className="mt-8 text-slate-500 font-bold animate-pulse">Sourcing expert knowledge...</p>
                 </div>
               ) : (
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 text-lg leading-relaxed font-medium">
                   {aiText}
                 </div>
               )}
            </div>
          )}
          {view === 'reading' && <ModuleContent topics={cur.topics} completedIds={done} onToggle={toggle}/>}
          {view === 'quiz' && <QuizView title={cur.title} content={JSON.stringify(cur.topics)}/>}
          {view === 'scenario' && <ScenarioView title={cur.title} />}
        </div>
      </main>

      {sidebar && <div onClick={() => setSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" />}
    </div>
  );
};

// --- Initialization ---

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
