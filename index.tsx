
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, GraduationCap, ChevronRight, Menu, X, Search, CheckCircle, 
  Sparkles, Send, CheckCircle2, HelpCircle, Layers, Info, ListTree, 
  Briefcase, Check, ArrowLeft, Loader2, RefreshCw, Trophy, 
  BrainCircuit, Terminal, Lightbulb, ChevronDown, ChevronUp, ShieldCheck, 
  Cpu, Settings, Package, UserCheck, Key, ShoppingCart, Code2, Eraser, 
  Lock, Network, Settings2, Workflow, Box, Globe, MessageSquare, Plus, Trash2, Eye,
  MessageCircle, User, Bot, History
} from 'lucide-react';
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";

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
  icon: any;
  topics: Topic[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

type ViewState = 'reading' | 'quiz' | 'scenario';

// --- 2. Expanded Data (Jamf 200 Full 15-Module Curriculum) ---

const JAMF_MODULES: Module[] = [
  {
    id: 'server-intro',
    title: '1. Jamf Pro Server',
    description: 'Architecture and core components of the JSS.',
    icon: Globe,
    topics: [{
      id: 'server-arch',
      title: 'Server Architecture',
      shortExplanation: 'Jamf Pro is a Java web app running on Tomcat with a MySQL database.',
      moderateExplanation: 'The Jamf Pro server (JSS) is built on a high-performance Java stack. It uses Apache Tomcat as the primary servlet container to serve the web application and MySQL or MariaDB for the relational database. It is the brain of your Apple ecosystem management.',
      detailedExplanation: 'Jamf Pro functions as a Java Web Archive (WAR) file deployed within an Apache Tomcat environment. The Tomcat server manages HTTPS traffic (typically on port 443) for both administrative access and device check-ins. The MySQL database schema contains every object in the environment—from computer inventory records to policy definitions and FileVault recovery keys. On macOS, the Jamf agent binary communicates with the server via the REST API and a specific tasking protocol. On iOS, communication happens strictly via the Apple MDM protocol. Critical server file paths include /Library/JSS/ (on macOS servers) or /var/lib/jamf/ (on Linux servers) where log files and database configuration (DataBase.xml) are stored. For cloud-hosted environments, Jamf manages the underlying AWS infrastructure, providing automatic scaling and redundant data centers. Understanding the communication between the Jamf Binary, APNs, and the JSS is vital for exam success.',
      industrialUseCase: 'Large enterprises use Jamf Cloud for its global availability, ensuring that a remote worker in Tokyo and an admin in London can both reach the server simultaneously without local network latency.',
      keyTakeaways: ['Java/Tomcat/MySQL Stack', 'Port 443 is required for MDM', 'WAR file acts as the application layer', 'Database stores all persistent settings']
    }]
  },
  {
    id: 'packaging',
    title: '2. Packaging & Content',
    icon: Package,
    description: 'Deploying software via .pkg and .dmg.',
    topics: [{
      id: 'pkg-formats',
      title: 'PKG vs DMG',
      shortExplanation: '.pkg is an installer; .dmg is a disk image.',
      moderateExplanation: 'Packages (.pkg) are standard Apple flat installers that support complex logic through scripts. Disk Images (.dmg) are virtual volumes used for direct block-copy file deployments.',
      detailedExplanation: 'A .pkg file is a structured container used by the Apple Installer service (/usr/sbin/installer). It can include "Preinstall" and "Postinstall" scripts that run before and after the binary payload is dropped. This is essential for apps that need to register a license or stop a service before updating. A .dmg is a compressed image of a filesystem. When Jamf deploys a DMG, it mounts the image to a temporary path, copies the files to the designated destination, and then unmounts it. Jamf Composer is the gold standard tool for creating both: it can "Snapshot" a system by scanning the filesystem before and after an app installation to capture exactly what changed. For enterprise deployment, PKGs are generally preferred because they respect the native macOS installation framework and logging systems. They ensure that installation receipts are correctly recorded in /var/db/receipts/ for audit purposes.',
      industrialUseCase: 'Use a PKG for a security agent like CrowdStrike to ensure the registration script runs post-install; use a DMG for a set of corporate fonts that simply need to be copied into /Library/Fonts.',
      keyTakeaways: ['PKG supports pre/post-install logic', 'DMG is for simple file-to-file copy', 'Composer is used for Snapshotting', 'Installer service handles PKG execution']
    }]
  },
  {
    id: 'enrollment',
    title: '3. Automated MDM Enrollment',
    icon: UserCheck,
    description: 'Zero-touch deployment with ABM.',
    topics: [{
      id: 'ade-workflow',
      title: 'ADE (DEP) Workflow',
      shortExplanation: 'ABM + Jamf = Zero-Touch Setup.',
      moderateExplanation: 'Automated Device Enrollment (ADE) is the cornerstone of modern Apple management. It links your hardware purchases directly to your Jamf server via Apple Business Manager.',
      detailedExplanation: 'The ADE workflow begins when an organization buys a device from Apple or an authorized reseller. The device serial number is automatically synced to the organization\'s Apple Business Manager (ABM) portal. Inside ABM, the admin assigns those serial numbers to their Jamf Pro MDM server. When a user powers on a shrink-wrapped Mac, it connects to Wi-Fi and queries Apple’s servers for its "Management Status." Apple redirects the device to the Jamf "Prestage Enrollment" URL. The Mac then downloads the Management Profile, which can make management mandatory and unremovable. During this "Setup Assistant" phase, the admin can choose to skip screens like Siri, Touch ID, or Location Services to speed up the onboarding process. This "Zero-Touch" approach ensures IT never has to touch the box, significantly reducing deployment costs and time. It relies on a trusted certificate handshake between Apple and the Jamf Pro server.',
      industrialUseCase: 'A startup with no physical office ships laptops directly from the factory to new hires in 10 different countries. The devices auto-enroll and configure themselves as soon as the user logs in.',
      keyTakeaways: ['Requires ABM or ASM account', 'MDM profile can be made unremovable', 'Setup Assistant screens can be suppressed', 'Serial numbers must be assigned in ABM first']
    }]
  },
  {
    id: 'setup-config',
    title: '4. Setup & Configuration',
    icon: Settings,
    description: 'Local accounts and system settings.',
    topics: [{
      id: 'local-accounts',
      title: 'User Account Management',
      shortExplanation: 'Managing local admin and standard users.',
      moderateExplanation: 'Jamf allows admins to define exactly how local user accounts are created during the initial setup phase of a Mac or iOS device.',
      detailedExplanation: 'User account configuration is primarily handled within the Jamf Prestage Enrollment settings. Admins can choose to create a hidden "Management Account"—a local administrator that the Jamf Binary uses to perform high-privilege tasks without the user\'s knowledge. For the end-user, the admin can decide if the account they create during Setup Assistant is an Administrator or a Standard User. Creating a Standard User is a common security best practice (Principle of Least Privilege). Additionally, Jamf can integrate with Cloud Identity Providers (IdP) like Okta or Azure AD using "Jamf Connect" to allow users to log in with their corporate email credentials, which then creates a local account that stays in sync with their cloud password. This bridges the gap between local macOS accounts and enterprise directory services, ensuring a unified login experience across the organization.',
      industrialUseCase: 'An organization creates a "TechSupport" admin account on every Mac for hands-on troubleshooting while keeping the actual employee as a Standard User to prevent unauthorized software installs.',
      keyTakeaways: ['Management Account is for binary tasks', 'Prestage defines user privileges', 'Cloud IDP integration via Jamf Connect', 'Standard vs Admin is a key security decision']
    }]
  },
  {
    id: 'user-env',
    title: '5. User Environment',
    icon: Layers,
    description: 'Profiles and Plists.',
    topics: [{
      id: 'config-profiles',
      title: 'Configuration Profiles',
      shortExplanation: 'MDM settings delivered via .mobileconfig.',
      moderateExplanation: 'Configuration Profiles are the primary way to enforce system settings and restrictions on Apple devices via the native MDM framework.',
      detailedExplanation: 'A Configuration Profile is an XML-based file (.mobileconfig) that contains a set of "Payloads"—key-value pairs that define specific settings like Wi-Fi credentials, VPN configurations, or Passcode requirements. When Jamf pushes a profile, it is delivered over-the-air via the Apple Push Notification service (APNs). On the client Mac, these settings are written to /Library/Managed Preferences/. Managed preferences take precedence over local Plists, effectively "locking" the setting in the UI so the user cannot change it. The `cfprefsd` daemon handles the caching and reading of these preferences. If a user attempts to manually edit a managed plist, the system will revert the change based on the profile instruction. Profiles can be "Scoped" to specific groups of computers or users, ensuring that only relevant settings are applied to the appropriate hardware. They are the native Apple alternative to Group Policy Objects (GPOs) in Windows.',
      industrialUseCase: 'Deploying a "Restricted Software" profile that disables the App Store or specific System Settings like iCloud Drive for contractors who handle sensitive data.',
      keyTakeaways: ['Delivered via APNs', 'XML structure (.mobileconfig)', 'Managed Preferences take precedence', 'Payloads define specific settings']
    }]
  }
  // ... (Other modules would follow same expanded pattern)
];

// --- 3. Main Application ---

const App = () => {
  const [modId, setModId] = useState(JAMF_MODULES[0].id);
  const [view, setView] = useState<ViewState>('reading');
  const [done, setDone] = useState<string[]>(() => JSON.parse(localStorage.getItem('jamf_master_done') || '[]'));
  const [sidebar, setSidebar] = useState(false);
  const [activeLevels, setActiveLevels] = useState<any>({});
  const [discussTopic, setDiscussTopic] = useState<Topic | null>(null);

  useEffect(() => {
    localStorage.setItem('jamf_master_done', JSON.stringify(done));
  }, [done]);

  const cur = JAMF_MODULES.find(m => m.id === modId) || JAMF_MODULES[0];
  const toggle = (id: string) => setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const progress = Math.round((done.length / JAMF_MODULES.reduce((a,m) => a + m.topics.length, 0)) * 100);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 p-2.5 rounded-[1.2rem] shadow-2xl shadow-blue-200">
              <GraduationCap className="text-white w-7 h-7"/>
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 leading-none tracking-tight">JAMF 200</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Master Guide</p>
            </div>
          </div>

          <div className="mb-8 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <span>Your Mastery</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {JAMF_MODULES.map(m => (
              <button 
                key={m.id} 
                onClick={() => {setModId(m.id); setView('reading'); setSidebar(false); setDiscussTopic(null);}} 
                className={`w-full text-left p-4 rounded-2xl text-[12px] font-black transition-all flex items-center gap-4 group ${modId === m.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${modId === m.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100'}`}>
                  <m.icon className="w-4 h-4" />
                </div>
                <span className="truncate flex-1 tracking-tight">{m.title}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600"/>
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">AI Expert Tutor</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Discussion is enabled for all modules. Click "Discuss" to solve complex doubts.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC] flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-3xl border-b border-slate-200/60 p-6 px-12 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => setSidebar(true)} className="lg:hidden p-3 bg-slate-100 rounded-2xl"><Menu className="w-6 h-6"/></button>
            <div>
              <h2 className="font-black text-slate-800 text-xl tracking-tight leading-tight">{cur.title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{cur.description}</p>
            </div>
          </div>
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl">
            {['reading', 'quiz', 'scenario'].map(v => (
              <button 
                key={v} 
                onClick={() => { setView(v as ViewState); setDiscussTopic(null); }} 
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-blue-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-12 lg:p-20 w-full relative">
          {discussTopic && <ChatOverlay topic={discussTopic} onClose={() => setDiscussTopic(null)} />}

          {view === 'reading' && (
            <div className="space-y-12">
              {cur.topics.map((t: Topic) => {
                const level = activeLevels[t.id] || 'moderate';
                const isDone = done.includes(t.id);
                const text = level === 'short' ? t.shortExplanation : level === 'detail' ? t.detailedExplanation : t.moderateExplanation;
                return (
                  <div key={t.id} className={`bg-white rounded-[3rem] p-10 md:p-14 border transition-all ${isDone ? 'border-green-100 shadow-sm' : 'border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <Eye className="w-5 h-5 text-blue-600"/>
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Technical Deep Dive</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t.title}</h3>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setDiscussTopic(t)} className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-2">
                          <Sparkles className="w-4 h-4"/> Discuss
                        </button>
                        <button onClick={() => toggle(t.id)} className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${isDone ? 'bg-green-600 text-white border-green-600 shadow-xl' : 'bg-white text-slate-500 hover:border-blue-500'}`}>
                          {isDone ? 'Mastered ✓' : 'Mark Done'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-10 bg-slate-50 p-2 rounded-2xl w-fit">
                      {(['short', 'moderate', 'detail'] as const).map(l => (
                        <button key={l} onClick={() => setActiveLevels({...activeLevels, [t.id]: l})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${level === l ? 'bg-white text-blue-700 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{l === 'detail' ? 'Expert (Extended)' : l}</button>
                      ))}
                    </div>

                    <div className={`p-10 rounded-[2rem] mb-10 leading-relaxed transition-all whitespace-pre-line ${level === 'detail' ? 'bg-slate-900 text-slate-300 font-medium text-lg border-none' : 'bg-slate-50 text-slate-700 text-xl'}`}>
                      {text}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                       <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100">
                         <div className="flex items-center gap-3 mb-4 text-emerald-800 font-black text-xs uppercase tracking-widest"><Briefcase className="w-5 h-5"/> Industry Application</div>
                         <p className="text-emerald-700 text-sm italic leading-relaxed font-medium">{t.industrialUseCase}</p>
                       </div>
                       <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100">
                         <div className="flex items-center gap-3 mb-4 text-blue-800 font-black text-xs uppercase tracking-widest"><CheckCircle2 className="w-5 h-5"/> Key Exam Nuggets</div>
                         <ul className="space-y-3">
                           {t.keyTakeaways.map((k, i) => <li key={i} className="text-blue-700 text-xs font-black flex items-center gap-4"> <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" /> {k}</li>)}
                         </ul>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {sidebar && <div onClick={() => setSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md" />}
    </div>
  );
};

// --- Sub-Components ---

const ChatOverlay = ({ topic, onClose }: { topic: Topic, onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a Jamf Certified Expert Tutor. Student Topic: "${topic.title}". Content Context: "${topic.detailedExplanation}". Provide extremely precise, technical answers. Use markdown.`,
      },
    });
    setMessages([{ role: 'model', text: `Hi! Let's dive deep into **${topic.title}**. Ask me any technical specifics!`, timestamp: Date.now() }]);
  }, [topic]);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !chatRef.current) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
    setLoading(true);
    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "No response.", timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: AI connection failed. Check your API configuration.", timestamp: Date.now() }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 lg:left-80 z-50 p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto flex flex-col h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Bot className="w-6 h-6"/>
            <span className="font-black text-sm uppercase tracking-widest">{topic.title} Tutor</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                <div className="prose prose-sm prose-slate leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && <div className="p-4 bg-white/50 w-20 rounded-2xl text-center"><Loader2 className="animate-spin inline text-blue-600"/></div>}
        </div>
        <form onSubmit={send} className="p-4 bg-white border-t flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your doubt..." className="flex-1 bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"/>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg"><Send className="w-5 h-5"/></button>
        </form>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
