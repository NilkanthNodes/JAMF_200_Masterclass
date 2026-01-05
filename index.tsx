
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GraduationCap, Menu, X, CheckCircle, Sparkles, Send, CheckCircle2, 
  Layers, Info, ListTree, Briefcase, Check, Loader2, ShieldCheck, 
  Cpu, Settings, Package, UserCheck, Network, Settings2, Workflow, Globe, Eye, Bot
} from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

// --- Types & Interfaces ---

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

// --- Sequential 8-Module Curriculum Data ---

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
      moderateExplanation: 'The Jamf Pro server (JSS) is built on a high-performance Java stack using Apache Tomcat and MySQL/MariaDB.',
      detailedExplanation: 'Jamf Pro functions as a Java Web Archive (WAR) file deployed within an Apache Tomcat environment. The Tomcat server manages HTTPS traffic (typically on port 443) for both administrative access and device check-ins. The MySQL database schema contains every object in the environment—from computer inventory records to policy definitions and FileVault recovery keys. On macOS, the Jamf agent binary communicates with the server via the REST API and a specific tasking protocol. On iOS, communication happens strictly via the Apple MDM protocol. Critical server file paths include /Library/JSS/ (on macOS servers) or /var/lib/jamf/ (on Linux servers) where log files and database configuration (DataBase.xml) are stored.',
      industrialUseCase: 'Large enterprises use Jamf Cloud for global availability, ensuring that a remote worker in Tokyo and an admin in London can both reach the server simultaneously without latency.',
      keyTakeaways: ['Java/Tomcat/MySQL Stack', 'Port 443 required for MDM', 'WAR file acts as application layer', 'Database stores all persistent settings']
    }]
  },
  {
    id: 'packaging-core',
    title: '2. Packaging Fundamentals',
    icon: Package,
    description: 'Deploying software via .pkg and .dmg.',
    topics: [{
      id: 'pkg-formats',
      title: 'PKG vs DMG',
      shortExplanation: '.pkg is an installer; .dmg is a disk image.',
      moderateExplanation: 'Packages (.pkg) are standard Apple flat installers supporting complex logic. Disk Images (.dmg) are virtual volumes for direct file deployments.',
      detailedExplanation: 'A .pkg file is a structured container used by the Apple Installer service (/usr/sbin/installer). It can include "Preinstall" and "Postinstall" scripts that run before and after the binary payload is dropped. A .dmg is a compressed image of a filesystem. When Jamf deploys a DMG, it mounts the image to a temporary path, copies the files to the destination, and then unmounts it. Jamf Composer is the gold standard tool for creating both, using "Snapshots" to capture exact filesystem changes.',
      industrialUseCase: 'Use a PKG for a security agent to ensure a registration script runs post-install; use a DMG for corporate fonts that simply need to be copied into /Library/Fonts.',
      keyTakeaways: ['PKG supports pre/post-install logic', 'DMG is for simple file-to-file copy', 'Composer is used for Snapshotting', 'Installer service handles PKG execution']
    }]
  },
  {
    id: 'enrollment-ade',
    title: '3. Automated Enrollment',
    icon: UserCheck,
    description: 'Zero-touch deployment with ABM.',
    topics: [{
      id: 'ade-workflow',
      title: 'ADE (DEP) Workflow',
      shortExplanation: 'ABM + Jamf = Zero-Touch Setup.',
      moderateExplanation: 'Automated Device Enrollment (ADE) links hardware purchases directly to Jamf via Apple Business Manager.',
      detailedExplanation: 'The workflow starts in Apple Business Manager (ABM) where serial numbers are assigned to the Jamf Pro MDM server. When a user powers on a new Mac, it connects to Wi-Fi and queries Apple’s servers, which redirect it to the Jamf Prestage Enrollment URL. The device downloads the Management Profile, making management mandatory and unremovable. During this setup, admins can choose to skip screens like Siri or Touch ID to speed up onboarding.',
      industrialUseCase: 'A startup ships laptops directly from the factory to new hires globally. The devices auto-enroll and configure themselves as soon as the user logs in.',
      keyTakeaways: ['Requires ABM or ASM account', 'MDM profile can be made unremovable', 'Setup Assistant screens can be suppressed', 'Serial numbers assigned in ABM first']
    }]
  },
  {
    id: 'client-env-mgt',
    title: '4. Client Env Management',
    icon: Network,
    description: 'Multi-tenant and Intune coexistence.',
    topics: [{
      id: 'multi-tenant-strategy',
      title: 'Multi-Tenant & Baseline Strategy',
      shortExplanation: 'Managing Jamf Pro and Intune across multiple client tenants.',
      moderateExplanation: 'Admins handle multi-tenant Jamf Pro (on-prem/cloud) and Microsoft Intune for diverse client bases.',
      detailedExplanation: 'Client environment management involves handling onboarding, configuration, and deployment of macOS management policies across distinct tenants. Admins must standardize and maintain macOS baseline configurations to ensure consistent policy enforcement, device compliance, and endpoint security per client SLAs. This requires deep understanding of Site-based management in Jamf and cross-platform synchronization with Intune.',
      industrialUseCase: 'An MSP manages 50 clients from one Jamf instance using Sites, enforcing a strict security baseline while allowing custom app catalogs for each client.',
      keyTakeaways: ['Manage multi-tenant Jamf and Intune', 'Standardize macOS baseline configs', 'Enforce compliance per client SLAs', 'Handle structured client onboarding']
    }]
  },
  {
    id: 'mdm-platform-admin',
    title: '5. MDM Platform Administration',
    icon: Settings2,
    description: 'Lifecycle management and troubleshooting.',
    topics: [{
      id: 'mdm-admin-workflows',
      title: 'Workflows & ABM Integration',
      shortExplanation: 'Provisioning, compliance, and patching cycles.',
      moderateExplanation: 'Designing automated MDM workflows ensures devices are provisioned correctly and remain patched.',
      detailedExplanation: 'MDM Administration focuses on implementing workflows for provisioning, compliance, and patching. This requires integration with ABM for DEP and VPP. Admins manage certificates (APNs, SCEP), configuration profiles, and device identity integrations across client environments. Troubleshooting involves diagnosing MDM command failures and profile deployment issues using console logs and APNs status checks.',
      industrialUseCase: 'An admin designs a "Self-Healing" workflow where missing security profiles are automatically re-pushed during the next device check-in.',
      keyTakeaways: ['ABM Integration for DEP/VPP', 'Manage certs and device identity', 'Troubleshoot MDM command failures', 'Maintain automated patching workflows']
    }]
  },
  {
    id: 'app-pkg-automation',
    title: '6. App Packaging & Automation',
    icon: Workflow,
    description: 'CI/CD and modern deployment pipelines.',
    topics: [{
      id: 'modern-packaging-cicd',
      title: 'Advanced Packaging & CI/CD',
      shortExplanation: 'Automated packaging with Munki, AutoPkg, and GitHub Actions.',
      moderateExplanation: 'Modern packaging uses automated pipelines to fetch, wrap, and deploy applications without manual labor.',
      detailedExplanation: 'Admins develop and maintain macOS application packages (.pkg, .dmg) using Munki, AutoPkg, or Jamf Composer. The modern standard is to automate these pipelines via GitHub Actions or Azure DevOps. This involves maintaining version-controlled software repositories and building post-install/remediation scripts to enhance deployment reliability.',
      industrialUseCase: 'An AutoPkg recipe automatically downloads the latest Zoom update, wraps it in a signed PKG, and uploads it to Jamf for testing every Saturday.',
      keyTakeaways: ['Use Munki, AutoPkg, and Composer', 'Automate via GitHub Actions/Azure DevOps', 'Version-control software repositories', 'Build remediation scripts']
    }]
  },
  {
    id: 'scripting-tooling-cur',
    title: '7. Scripting & Tooling',
    icon: Cpu,
    description: 'Bash, Zsh, Python, and API automation.',
    topics: [{
      id: 'scripting-api-automation',
      title: 'Custom Tools & APIs',
      shortExplanation: 'Automating configuration with Zsh, Python, and Jamf API.',
      moderateExplanation: 'Scripting extends Jamf capabilities, allowing for custom logic and advanced reporting.',
      detailedExplanation: 'Admins create Bash, Zsh, and Python scripts to automate configuration and compliance checks. They build custom tools leveraging APIs from Jamf, Intune, and Munki for reporting and health monitoring. Implementing CI/CD processes for these scripts ensures updates are promoted between environments (Dev to Prod) safely and with full version history.',
      industrialUseCase: 'A Python script calls the Jamf API daily to find devices with low disk space and triggers a Slack notification to the assigned user.',
      keyTakeaways: ['Bash, Zsh, and Python scripting', 'Build custom reporting tools', 'Leverage Jamf/Intune/Munki APIs', 'Implement CI/CD for script updates']
    }]
  },
  {
    id: 'security-compliance-fin',
    title: '8. Security & Compliance',
    icon: ShieldCheck,
    description: 'Enforcing baselines and audit readiness.',
    topics: [{
      id: 'security-audits-compliance',
      title: 'Baselines & Device Attestation',
      shortExplanation: 'Enforcing CIS benchmarks and attestation.',
      moderateExplanation: 'Security involves enforcement and the ability to prove compliance through attestation and reporting.',
      detailedExplanation: 'Admins enforce client-specific security baselines, FileVault encryption, and compliance policies. They implement device attestation, inventory accuracy monitoring, and compliance reporting for audits. This includes supporting vulnerability remediation and coordinating with security teams for SOC2 or HIPAA compliance audits.',
      industrialUseCase: 'During a security audit, the Jamf admin provides a report showing 100% encryption status with escrowed recovery keys as cryptographic proof.',
      keyTakeaways: ['Enforce FileVault and Passcode policies', 'Maintain device attestation', 'Support vulnerability remediation', 'Coordinate compliance audits']
    }]
  }
];

// --- Main App ---

const App = () => {
  const [modId, setModId] = useState(JAMF_MODULES[0].id);
  const [done, setDone] = useState<string[]>(() => {
    const saved = localStorage.getItem('jamf_master_done');
    return saved ? JSON.parse(saved) : [];
  });
  const [sidebar, setSidebar] = useState(false);
  const [activeLevels, setActiveLevels] = useState<Record<string, 'short' | 'moderate' | 'detail'>>({});
  const [discussTopic, setDiscussTopic] = useState<Topic | null>(null);

  useEffect(() => {
    localStorage.setItem('jamf_master_done', JSON.stringify(done));
  }, [done]);

  const cur = JAMF_MODULES.find(m => m.id === modId) || JAMF_MODULES[0];
  const toggle = (id: string) => setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const progress = Math.round((done.length / JAMF_MODULES.reduce((a,m) => a + m.topics.length, 0)) * 100);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 p-2.5 rounded-[1.2rem] shadow-2xl shadow-blue-200">
              <GraduationCap className="text-white w-7 h-7"/>
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 leading-none tracking-tight">JAMF 200</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Study Expert</p>
            </div>
          </div>

          <div className="mb-8 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <span>Overall Mastery</span>
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
                onClick={() => {setModId(m.id); setSidebar(false); setDiscussTopic(null);}} 
                className={`w-full text-left p-4 rounded-2xl text-[12px] font-black transition-all flex items-center gap-4 group ${modId === m.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${modId === m.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100'}`}>
                  <m.icon className="w-4 h-4" />
                </div>
                <span className="truncate flex-1 tracking-tight">{m.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC] flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-3xl border-b border-slate-200/60 p-6 px-12 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => setSidebar(true)} className="lg:hidden p-3 bg-slate-100 rounded-2xl"><Menu className="w-6 h-6"/></button>
            <div>
              <h2 className="font-black text-slate-800 text-xl tracking-tight leading-tight">{cur.title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{cur.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
             <CheckCircle className="w-4 h-4 text-green-500" />
             Active Guide
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-12 lg:p-20 w-full relative">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
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
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Master Topic</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tight">{t.title}</h3>
                      <div className={`h-2 w-16 rounded-full mt-6 ${isDone ? 'bg-green-500' : 'bg-blue-600 shadow-lg shadow-blue-100'}`} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setDiscussTopic(t)} className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-2">
                        <Sparkles className="w-4 h-4"/> Discuss
                      </button>
                      <button onClick={() => toggle(t.id)} className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${isDone ? 'bg-green-600 text-white border-green-600 shadow-xl shadow-green-100' : 'bg-white text-slate-500 hover:border-blue-500'}`}>
                        {isDone ? 'Mastered ✓' : 'Mark Done'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10 bg-slate-50 p-2 rounded-2xl w-fit">
                    {(['short', 'moderate', 'detail'] as const).map(l => (
                      <button key={l} onClick={() => setActiveLevels({...activeLevels, [t.id]: l})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${level === l ? 'bg-white text-blue-700 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                        {l === 'detail' ? 'Full Expert Concept' : l}
                      </button>
                    ))}
                  </div>

                  <div className={`p-10 rounded-[2rem] mb-10 leading-relaxed transition-all whitespace-pre-line ${level === 'detail' ? 'bg-slate-900 text-slate-300 font-medium text-lg border-none shadow-2xl' : 'bg-slate-50 text-slate-700 text-xl'}`}>
                    {text}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-10">
                     <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100">
                       <div className="flex items-center gap-3 mb-4 text-emerald-800 font-black text-xs uppercase tracking-widest"><Briefcase className="w-5 h-5"/> Practical Logic</div>
                       <p className="text-emerald-700 text-sm italic leading-relaxed font-medium">{t.industrialUseCase}</p>
                     </div>
                     <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100">
                       <div className="flex items-center gap-3 mb-4 text-blue-800 font-black text-xs uppercase tracking-widest"><CheckCircle2 className="w-5 h-5"/> Key Takeaways</div>
                       <ul className="space-y-3">
                         {t.keyTakeaways.map((k, i) => <li key={i} className="text-blue-700 text-xs font-black flex items-center gap-4"> <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" /> {k}</li>)}
                       </ul>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* AI Chat Overlay */}
      {discussTopic && <ChatOverlay topic={discussTopic} onClose={() => setDiscussTopic(null)} />}
      
      {sidebar && <div onClick={() => setSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md" />}
    </div>
  );
};

// --- AI Chat Component ---

const ChatOverlay = ({ topic, onClose }: { topic: Topic, onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are a Jamf Certified Expert Tutor. 
            Topic: "${topic.title}". 
            Context: "${topic.detailedExplanation}". 
            Explain complex Jamf concepts clearly for technical certification prep. Use markdown.`,
          },
        });
        setMessages([{ role: 'model', text: `Hi! Let's dive deep into **${topic.title}**. What technical detail can I clarify?`, timestamp: Date.now() }]);
      } catch (e) {
        setMessages([{ role: 'model', text: "AI Tutor connection error. Please try again later.", timestamp: Date.now() }]);
      }
    };
    initChat();
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
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please try again.", timestamp: Date.now() }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 lg:left-80 z-50 p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto flex flex-col h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <Bot className="w-6 h-6"/>
            <span className="font-bold text-sm">Expert Session: {topic.title}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-5 h-5"/></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'}`}>
                <div className="prose prose-sm prose-slate leading-relaxed whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={send} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a technical question..." className="flex-1 bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Render ---

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
