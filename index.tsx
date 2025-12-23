
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, GraduationCap, ChevronRight, Menu, X, Search, CheckCircle, 
  Sparkles, Send, CheckCircle2, HelpCircle, Layers, Info, ListTree, 
  Briefcase, Check, ArrowLeft, Loader2, RefreshCw, Trophy, 
  BrainCircuit, Terminal, Lightbulb, ChevronDown, ChevronUp, ShieldCheck, 
  Cpu, Settings, Package, UserCheck, Key, ShoppingCart, Code2, Eraser, 
  Lock, Network, Settings2, Workflow, Box, Globe
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
  icon: any;
  topics: Topic[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type ViewState = 'reading' | 'quiz' | 'scenario' | 'ai-search';

// --- 2. Data (Jamf 200 Full 15-Module Curriculum) ---

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
      moderateExplanation: 'The Jamf Pro server (JSS) is built on a Java stack. It uses Apache Tomcat as the web server and MySQL/MariaDB for the database. Admins interact with the Web UI primarily on port 443.',
      detailedExplanation: 'Technically, Jamf Pro is a WAR file deployed to a Tomcat servlet container. The database stores all settings, inventory, and encryption keys. Clients communicate via the MDM protocol and the Jamf Binary. Key ports: 443 (HTTPS/MDM), 80 (HTTP/Redirects), 3306 (MySQL Internal). For cloud environments, this is managed in AWS.',
      industrialUseCase: 'Enterprise setups use Jamf Cloud for automatic scaling and high availability, ensuring the MDM remains reachable globally.',
      keyTakeaways: ['Java/Tomcat/MySQL Stack', 'Port 443 is primary', 'WAR file deployment']
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
      moderateExplanation: 'Packages (.pkg) are standard Apple installers that support pre/post-install scripts. Disk Images (.dmg) are file containers that Jamf mounts to copy files directly.',
      detailedExplanation: 'Jamf Composer creates both. Snapshots capture filesystem changes into a DMG. PKGs are preferred for complex apps needing install logic. The jamf binary uses `installer -pkg` for packages and `hdiutil` for images.',
      industrialUseCase: 'Use PKG for Microsoft Office to run post-install registration; use DMG for a set of fonts or desktop wallpapers.',
      keyTakeaways: ['PKG = Scripts + Logic', 'DMG = Simple File Copy', 'Composer is the primary tool']
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
      moderateExplanation: 'Automated Device Enrollment (ADE) makes MDM mandatory and unremovable. Devices are assigned to Jamf in Apple Business Manager (ABM).',
      detailedExplanation: 'When a new device starts, it contacts Apple. Apple directs it to Jamf’s Prestage Enrollment. The device receives its management profile during the Setup Assistant, skipping user screens as configured.',
      industrialUseCase: 'Global companies ship sealed laptops to remote staff; users log in to Wi-Fi and the device auto-configures.',
      keyTakeaways: ['Requires ABM account', 'Unremovable MDM profile', 'Configured via Prestage']
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
      moderateExplanation: 'Jamf can create a local administrator account during enrollment and define whether the primary user is an admin or standard user.',
      detailedExplanation: 'The Jamf management account is a hidden admin used for binary operations. User accounts created via Prestage can be managed or standard. FileVault enablement depends on these account types.',
      industrialUseCase: 'Creating a "TechSupport" admin account on every Mac for hands-on troubleshooting.',
      keyTakeaways: ['Management Account is hidden', 'Prestage defines user types', 'Local accounts can be restricted']
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
      moderateExplanation: 'Configuration Profiles use the Apple MDM framework to enforce settings like Wi-Fi, VPN, and Passcode policies.',
      detailedExplanation: 'Profiles are XML files signed by Jamf. They are pushed to `/Library/Managed Preferences`. They override local user settings, ensuring compliance.',
      industrialUseCase: 'Pushing a Wi-Fi profile so employees automatically connect to the office network.',
      keyTakeaways: ['Uses MDM framework', 'Enforces settings', 'XML based (.mobileconfig)']
    }]
  },
  {
    id: 'security-privacy',
    title: '6. Security & Privacy',
    icon: ShieldCheck,
    description: 'FileVault, Gatekeeper, and PPPC.',
    topics: [{
      id: 'filevault-prk',
      title: 'FileVault & PRK',
      shortExplanation: 'Disk encryption with key escrow.',
      moderateExplanation: 'Jamf enforces FileVault and stores the Personal Recovery Key (PRK) in the inventory.',
      detailedExplanation: 'Encryption is triggered via MDM. The PRK is captured by the binary and sent to the JSS. IT can retrieve this key if a user is locked out.',
      industrialUseCase: 'Ensuring 100% encryption for healthcare devices to meet HIPAA compliance.',
      keyTakeaways: ['PRK is escrowed', 'Enforced by Profile', 'Prevents data theft']
    }]
  },
  {
    id: 'apps-vpp',
    title: '7. App Store & VPP',
    icon: ShoppingCart,
    description: 'Bulk app distribution via ABM.',
    topics: [{
      id: 'vpp-licensing',
      title: 'Volume Purchasing',
      shortExplanation: 'Buying apps in bulk from Apple Business Manager.',
      moderateExplanation: 'Organizations buy licenses in ABM and sync them to Jamf using a VPP Token. Apps can be assigned to devices without an Apple ID.',
      detailedExplanation: 'Device-based assignment allows silent installation. App licenses can be reclaimed and redistributed when a device is retired.',
      industrialUseCase: 'Deploying Microsoft Outlook to 500 iPads simultaneously without user interaction.',
      keyTakeaways: ['ABM Integration', 'Device-based assignment', 'No Apple ID needed']
    }]
  },
  {
    id: 'scripting-intro',
    title: '8. Scripting Overview',
    icon: Code2,
    description: 'Automation with Bash and Zsh.',
    topics: [{
      id: 'jamf-binary-scripts',
      title: 'The Jamf Binary',
      shortExplanation: 'Scripts extend Jamf capabilities using shell commands.',
      moderateExplanation: 'Jamf runs scripts as the "root" user. Scripts can use the `jamf` binary to trigger actions like inventory updates (`jamf recon`).',
      detailedExplanation: 'Shebang lines like `#!/bin/zsh` specify the interpreter. Parameters 4-11 in Jamf are used to pass custom variables to scripts.',
      industrialUseCase: 'Running a script to check battery health and reporting it as an Extension Attribute.',
      keyTakeaways: ['Runs as root', 'Zsh is default', 'Custom parameters 4-11']
    }]
  },
  {
    id: 'refresh-reimage',
    title: '9. Initial Setup & Refreshing',
    icon: Eraser,
    description: 'Wiping and repurposing devices.',
    topics: [{
      id: 'remote-wipe',
      title: 'Erase All Content & Settings',
      shortExplanation: 'Rapidly resetting a device for a new user.',
      moderateExplanation: 'On modern Macs (T2/Silicon), Jamf can trigger EACAS to instantly wipe user data while keeping the OS intact.',
      detailedExplanation: 'Traditional imaging is dead. We use MDM commands to wipe devices. For older Macs, we use the `startosinstall` binary with `--eraseinstall`.',
      industrialUseCase: 'Quickly resetting lab computers at the end of a semester.',
      keyTakeaways: ['EACAS is fast', 'MDM remote wipe', 'No more imaging']
    }]
  },
  {
    id: 'permissions',
    title: '10. Ownership & Permissions',
    icon: Lock,
    description: 'POSIX and ACLs on macOS.',
    topics: [{
      id: 'posix-permissions',
      title: 'POSIX & ACLs',
      shortExplanation: 'Rules for file access: Read, Write, Execute.',
      moderateExplanation: 'macOS uses POSIX (Owner, Group, Everyone) and Access Control Lists (ACLs) for granular permission management.',
      detailedExplanation: 'Permissions are checked by the kernel. Commands like `chmod` and `chown` are used in scripts to ensure the Jamf binary has access to files.',
      industrialUseCase: 'Fixing permissions on a shared folder so multiple users can collaborate.',
      keyTakeaways: ['Read/Write/Execute', 'Root is 0', 'ACLs are more granular']
    }]
  },
  {
    id: 'client-env',
    title: '11. Client Env Management',
    icon: Network,
    description: 'Multi-tenant and Intune coexistence.',
    topics: [{
      id: 'multi-tenant',
      title: 'Multi-Tenant Infrastructure',
      shortExplanation: 'Managing multiple Jamf and Intune instances.',
      moderateExplanation: 'Admins often manage Jamf Cloud alongside Microsoft Intune for cross-platform compliance and multi-client support.',
      detailedExplanation: 'Managing separate "Sites" in Jamf or separate tenants in Azure. Standardizing baselines across these environments is key to scalability.',
      industrialUseCase: 'A global agency managing 20 different client Jamf servers from one central team.',
      keyTakeaways: ['Tenant Isolation', 'Intune Integration', 'Baseline Standardization']
    }]
  },
  {
    id: 'mdm-admin',
    title: '12. MDM Platform Administration',
    icon: Settings2,
    description: 'Designing workflows and troubleshooting.',
    topics: [{
      id: 'workflow-design',
      title: 'MDM Workflow Design',
      shortExplanation: 'Building enrollment and patching cycles.',
      moderateExplanation: 'Designing the "Lifecycle" of a device: from Enrollment (ADE) to Patching (Policies) to Retirement (Wipe).',
      detailedExplanation: 'Integrating ABM for serial assignment. Troubleshooting MDM command failures by checking the APNs connection and local logs.',
      industrialUseCase: 'Creating a "Day 1" policy that installs all essential apps immediately after enrollment.',
      keyTakeaways: ['Lifecycle management', 'APNs is critical', 'ABM Integration']
    }]
  },
  {
    id: 'app-automation',
    title: '13. App Packaging & Automation',
    icon: Workflow,
    description: 'AutoPkg, Munki, and CI/CD.',
    topics: [{
      id: 'autopkg-cicd',
      title: 'CI/CD Packaging',
      shortExplanation: 'Automating the download and packaging of apps.',
      moderateExplanation: 'Using AutoPkg to automatically fetch the latest versions of apps and GitHub Actions to deploy them to Jamf.',
      detailedExplanation: 'Building a "Packaging Pipeline" where a script checks for updates, builds a PKG with Composer/AutoPkg, and uploads it to Jamf via API.',
      industrialUseCase: 'Keeping Chrome and Zoom updated across 10,000 Macs without manual intervention.',
      keyTakeaways: ['AutoPkg saves time', 'GitHub Actions automation', 'API based uploads']
    }]
  },
  {
    id: 'scripting-tooling',
    title: '14. Scripting & Tooling',
    icon: Cpu,
    description: 'Python and API integrations.',
    topics: [{
      id: 'api-automation',
      title: 'Jamf Pro API',
      shortExplanation: 'Using code to talk to the Jamf Server.',
      moderateExplanation: 'The Jamf Pro API (Classic XML or Modern JSON) allows for massive automation tasks like updating thousands of records.',
      detailedExplanation: 'Writing Python scripts to parse JSS data. Leveraging the Intune Graph API for cross-platform reporting.',
      industrialUseCase: 'Building a custom dashboard that shows real-time patch compliance for every client.',
      keyTakeaways: ['JSON/XML API', 'Python for logic', 'Custom Reporting']
    }]
  },
  {
    id: 'security-compliance',
    title: '15. Security & Compliance',
    icon: ShieldCheck,
    description: 'Baselines and audit readiness.',
    topics: [{
      id: 'security-baselines',
      title: 'Security Compliance',
      shortExplanation: 'Enforcing NIST/CIS security benchmarks.',
      moderateExplanation: 'Using Jamf to enforce a "Security Baseline" like disabling Bluetooth or enforcing 8-character passwords.',
      detailedExplanation: 'Implementing the macOS Security Compliance Project (mSCP). Coordinating with audit teams to provide proof of encryption and patching.',
      industrialUseCase: 'Passing a security audit by showing a report of all encrypted devices.',
      keyTakeaways: ['Audit Readiness', 'NIST/CIS Benchmarks', 'Compliance reporting']
    }]
  }
];

// --- 3. AI Services ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = 'gemini-3-flash-preview';

async function askAssistant(query: string, context: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are a Jamf Certified Expert Tutor. Context: ${context}. Question: ${query}. Provide a concise, professional answer with Markdown formatting.`,
  });
  return response.text || "No response received.";
}

async function fetchQuiz(title: string, content: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Based on this content: ${content}, generate 3 Jamf 200 exam style multiple choice questions in JSON. Do not include Markdown blocks.`,
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
    contents: `Generate a technical troubleshooting scenario for a Jamf admin related to "${title}". Structure: "Scenario", "The Problem", "Solution".`,
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
          <div key={t.id} className={`bg-white rounded-[2rem] p-8 border transition-all ${isDone ? 'border-green-100 shadow-sm' : 'border-slate-200 shadow-xl'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{t.title}</h3>
                <div className={`h-1.5 w-12 rounded-full mt-3 ${isDone ? 'bg-green-500' : 'bg-blue-600'}`} />
              </div>
              <button onClick={() => onToggle(t.id)} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${isDone ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 hover:border-blue-500'}`}>
                {isDone ? 'Mastered ✓' : 'Mark Done'}
              </button>
            </div>
            <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
              {['short', 'moderate', 'detail'].map(l => (
                <button key={l} onClick={() => setActiveLevels({...activeLevels, [t.id]: l})} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${level === l ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
              ))}
            </div>
            <div className={`p-8 rounded-3xl mb-8 transition-all ${level === 'detail' ? 'bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed border-none' : 'bg-slate-50 text-slate-700 text-lg leading-relaxed'}`}>
              {text}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100">
                <div className="flex items-center gap-3 mb-3 text-emerald-800 font-black text-xs uppercase tracking-widest"><Briefcase className="w-4 h-4"/> Industry Insight</div>
                <p className="text-emerald-700 text-sm italic leading-relaxed">{t.industrialUseCase}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100">
                <div className="flex items-center gap-3 mb-3 text-blue-800 font-black text-xs uppercase tracking-widest"><CheckCircle2 className="w-4 h-4"/> Exam Focus</div>
                <ul className="space-y-2">
                  {t.keyTakeaways.map((k, i) => <li key={i} className="text-blue-700 text-xs font-bold flex items-center gap-3"> <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" /> {k}</li>)}
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
    <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[2.5rem] border border-slate-200">
      <BrainCircuit className="w-20 h-20 text-blue-600 animate-pulse mb-6"/>
      <h3 className="text-2xl font-black text-slate-800">Compiling Expert Quiz...</h3>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
          <p className="font-black text-2xl mb-8 flex gap-5 text-slate-900 leading-tight">
            <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 text-base">{idx + 1}</span>
            {q.question}
          </p>
          <div className="space-y-3">
            {q.options.map((o, oi) => (
              <button 
                key={oi} 
                onClick={() => !show && setAnswers({...answers, [idx]: oi})} 
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-bold ${
                  answers[idx] === oi ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-100'
                } ${show && q.correctAnswer === oi ? 'bg-green-100 border-green-500 text-green-900' : ''} ${show && answers[idx] === oi && q.correctAnswer !== oi ? 'bg-red-50 border-red-500 text-red-900' : ''}`}
              >
                {o}
              </button>
            ))}
          </div>
          {show && <div className="mt-8 p-6 bg-slate-900 text-slate-300 rounded-[1.5rem] text-sm leading-relaxed italic border-l-8 border-blue-500">{q.explanation}</div>}
        </div>
      ))}
      <button onClick={() => setShow(true)} className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-3xl shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.98]">Reveal Correct Answers</button>
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[2.5rem] border border-slate-200">
      <Loader2 className="w-20 h-20 text-blue-600 animate-spin mb-6"/>
      <h3 className="text-2xl font-black text-slate-800">Drafting Lab Simulation...</h3>
    </div>
  );

  return (
    <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-6 bg-slate-800 flex items-center gap-4 border-b border-slate-700">
        <Terminal className="w-6 h-6 text-green-400"/>
        <span className="text-slate-400 font-mono text-xs font-black uppercase tracking-widest">Administrator Lab Simulation</span>
      </div>
      <div className="p-12 md:p-16 prose prose-invert max-w-none prose-headings:text-blue-400 prose-p:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
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
    setView('ai-search'); setAiLoading(true); setAiText('Analyzing curriculum and crafting your expert answer...');
    try {
      const res = await askAssistant(aiIn, cur.title);
      setAiText(res);
    } catch (e) { setAiText('Error: Failed to connect to AI assistant.'); }
    finally { setAiLoading(false); setAiIn(''); }
  };

  const progress = Math.round((done.length / JAMF_MODULES.reduce((a,m) => a + m.topics.length, 0)) * 100);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 p-2.5 rounded-[1.2rem] shadow-2xl shadow-blue-200">
              <GraduationCap className="text-white w-7 h-7"/>
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 leading-none tracking-tight">JAMF 200</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Study Guide</p>
            </div>
          </div>

          <div className="mb-10 bg-slate-50 p-6 rounded-[1.5rem]">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <span>Course Progress</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-1000 shadow-lg" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-3 custom-scrollbar">
            {JAMF_MODULES.map(m => (
              <button 
                key={m.id} 
                onClick={() => {setModId(m.id); setView('reading'); setSidebar(false);}} 
                className={`w-full text-left p-4 rounded-2xl text-[13px] font-black transition-all flex items-center gap-4 group ${modId === m.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded-lg transition-colors ${modId === m.id ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100'}`}>
                  <m.icon className="w-4 h-4" />
                </div>
                <span className="truncate flex-1">{m.title}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${modId === m.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}/>
              </button>
            ))}
          </nav>

          <form onSubmit={ask} className="mt-8 relative">
             <input 
               value={aiIn} 
               onChange={e => setAiIn(e.target.value)} 
               placeholder="Need help? Ask AI Tutor..." 
               className="w-full p-5 pr-14 bg-slate-100 border-none rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
             />
             <button type="submit" disabled={aiLoading} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-lg text-blue-600 disabled:opacity-50 hover:scale-110 transition-transform">
               {aiLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
             </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC] flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 p-6 px-12 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => setSidebar(true)} className="lg:hidden p-3 bg-slate-100 rounded-2xl"><Menu className="w-6 h-6"/></button>
            <div>
              <h2 className="font-black text-slate-800 text-xl tracking-tight">{cur.title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cur.description}</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem]">
            {['reading', 'quiz', 'scenario'].map(v => (
              <button 
                key={v} 
                onClick={() => setView(v as ViewState)} 
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-blue-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-12 lg:p-20 w-full">
          {view === 'ai-search' && (
            <div className="bg-white p-14 rounded-[3rem] border border-blue-100 shadow-[0_32px_64px_-16px_rgba(37,99,235,0.1)] animate-in zoom-in-95 duration-700">
               <button onClick={() => setView('reading')} className="text-blue-600 flex items-center gap-3 mb-10 font-black text-sm hover:underline group">
                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform"/> 
                 Return to Course Modules
               </button>
               <div className="flex items-center gap-6 mb-10">
                 <div className="p-4 bg-blue-600 rounded-[1.5rem] text-white shadow-xl shadow-blue-200"><Sparkles className="w-8 h-8"/></div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">AI Tutor Insight</h2>
               </div>
               {aiLoading ? (
                 <div className="py-24 flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-3 border-4 border-blue-200 border-b-transparent rounded-full animate-spin-slow"></div>
                    </div>
                    <p className="mt-10 text-slate-500 font-black tracking-widest text-xs uppercase animate-pulse">Sourcing expert knowledge...</p>
                 </div>
               ) : (
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 text-xl leading-relaxed font-medium">
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

      {sidebar && <div onClick={() => setSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md" />}
    </div>
  );
};

// --- Initialization ---

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
