
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

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type ViewState = 'reading' | 'quiz' | 'scenario' | 'ai-chat';

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
      moderateExplanation: 'The Jamf Pro server (JSS) is built on a high-performance Java stack. It uses Apache Tomcat as the primary servlet container to serve the web application and MySQL or MariaDB for the relational database. It is the brain of your Apple ecosystem management.',
      detailedExplanation: 'Jamf Pro functions as a Java Web Archive (WAR) file deployed within an Apache Tomcat environment. The Tomcat server manages HTTPS traffic (typically on port 443) for both administrative access and device check-ins. The MySQL database schema contains every object in the environment—from computer inventory records to policy definitions and FileVault recovery keys. On macOS, the Jamf agent binary communicates with the server via the REST API and a specific tasking protocol. On iOS, communication happens strictly via the Apple MDM protocol. Critical server file paths include /Library/JSS/ (on macOS servers) or /var/lib/jamf/ (on Linux servers) where log files and database configuration (DataBase.xml) are stored. For cloud-hosted environments, Jamf manages the underlying AWS infrastructure, providing automatic scaling and redundant data centers.',
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
      detailedExplanation: 'A .pkg file is a structured container used by the Apple Installer service (/usr/sbin/installer). It can include "Preinstall" and "Postinstall" scripts that run before and after the binary payload is dropped. This is essential for apps that need to register a license or stop a service before updating. A .dmg is a compressed image of a filesystem. When Jamf deploys a DMG, it mounts the image to a temporary path, copies the files to the designated destination, and then unmounts it. Jamf Composer is the gold standard tool for creating both: it can "Snapshot" a system by scanning the filesystem before and after an app installation to capture exactly what changed. For enterprise deployment, PKGs are generally preferred because they respect the native macOS installation framework and logging systems.',
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
      detailedExplanation: 'The ADE workflow begins when an organization buys a device from Apple or an authorized reseller. The device serial number is automatically synced to the organization\'s Apple Business Manager (ABM) portal. Inside ABM, the admin assigns those serial numbers to their Jamf Pro MDM server. When a user powers on a shrink-wrapped Mac, it connects to Wi-Fi and queries Apple’s servers for its "Management Status." Apple redirects the device to the Jamf "Prestage Enrollment" URL. The Mac then downloads the Management Profile, which can make management mandatory and unremovable. During this "Setup Assistant" phase, the admin can choose to skip screens like Siri, Touch ID, or Location Services to speed up the onboarding process. This "Zero-Touch" approach ensures IT never has to touch the box, significantly reducing deployment costs and time.',
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
      detailedExplanation: 'User account configuration is primarily handled within the Jamf Prestage Enrollment settings. Admins can choose to create a hidden "Management Account"—a local administrator that the Jamf Binary uses to perform high-privilege tasks without the user\'s knowledge. For the end-user, the admin can decide if the account they create during Setup Assistant is an Administrator or a Standard User. Creating a Standard User is a common security best practice (Principle of Least Privilege). Additionally, Jamf can integrate with Cloud Identity Providers (IdP) like Okta or Azure AD using "Jamf Connect" to allow users to log in with their corporate email credentials, which then creates a local account that stays in sync with their cloud password. This bridges the gap between local macOS accounts and enterprise directory services.',
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
      detailedExplanation: 'A Configuration Profile is an XML-based file (.mobileconfig) that contains a set of "Payloads"—key-value pairs that define specific settings like Wi-Fi credentials, VPN configurations, or Passcode requirements. When Jamf pushes a profile, it is delivered over-the-air via the Apple Push Notification service (APNs). On the client Mac, these settings are written to /Library/Managed Preferences/. Managed preferences take precedence over local Plists, effectively "locking" the setting in the UI so the user cannot change it. The `cfprefsd` daemon handles the caching and reading of these preferences. If a user attempts to manually edit a managed plist, the system will revert the change based on the profile instruction. Profiles can be "Scoped" to specific groups of computers or users, ensuring that only relevant settings are applied to the appropriate hardware.',
      industrialUseCase: 'Deploying a "Restricted Software" profile that disables the App Store or specific System Settings like iCloud Drive for contractors who handle sensitive data.',
      keyTakeaways: ['Delivered via APNs', 'XML structure (.mobileconfig)', 'Managed Preferences take precedence', 'Payloads define specific settings']
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
      moderateExplanation: 'Jamf manages the native FileVault 2 encryption engine, ensuring all corporate data is protected at rest with secure key storage.',
      detailedExplanation: 'Full Disk Encryption on macOS is performed by FileVault 2. Jamf triggers this through a Configuration Profile payload. During the encryption process, a Personal Recovery Key (PRK) is generated. A critical feature of Jamf is "Key Escrow": the Jamf Binary captures this PRK and sends it securely to the Jamf Pro database. If a user forgets their password, an IT admin can log into the Jamf Pro console, retrieve the PRK, and use it to unlock the disk. Modern Macs with Apple Silicon or T2 chips use hardware-accelerated encryption, making the process nearly instantaneous. Admins can also use "Institutional Recovery Keys" (IRKs), which is a master key for the whole fleet, though PRKs are generally preferred for higher security as they are unique to each individual device.',
      industrialUseCase: 'A lawyer loses their laptop at an airport. Because FileVault was enforced and the PRK was stored in Jamf, the firm can prove the data was encrypted, avoiding a mandatory data breach notification.',
      keyTakeaways: ['PRK is unique and escrowed', 'Enforced by MDM Profile', 'Essential for compliance (HIPAA/GDPR)', 'Hardware-backed on modern Macs']
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
      moderateExplanation: 'The Volume Purchase Program (VPP) allows organizations to buy, distribute, and reclaim App Store licenses centrally through Jamf.',
      detailedExplanation: 'Organizations purchase app licenses through Apple Business Manager (ABM). These licenses are linked to Jamf Pro using a VPP Token (.vpptoken), which must be renewed every 365 days. Jamf allows for two types of assignment: "User-based" (requires an Apple ID) and "Device-based" (the modern standard). Device-based assignment allows Jamf to push the app directly to the device serial number without requiring the user to sign into the App Store or even have an Apple ID. This is critical for shared iPads or corporate-owned Macs. If a device is retired or the user leaves the company, the license can be "Revoked" in the Jamf console and returned to the license pool, allowing it to be assigned to a new device. This ensures the organization retains ownership of all software purchases.',
      industrialUseCase: 'A hospital deploys a custom medical chart app to 1,000 iPads. Using Device-based VPP, the app installs silently overnight, and no doctor needs to manage an individual Apple ID.',
      keyTakeaways: ['ABM/ASM Integration', 'Device-based assignment skips Apple ID', 'Licenses are organization-owned', 'VPP Tokens require annual renewal']
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
      moderateExplanation: 'Scripting is the "Swiss Army Knife" of Jamf management, allowing admins to automate almost any task that can be performed via the command line.',
      detailedExplanation: 'Jamf policies can execute shell scripts written in Zsh (current default) or Bash. Scripts run with "Root" privileges, meaning they have full access to the system. A key feature is the use of "Parameters": Jamf reserves parameters 1 (mount point), 2 (computer name), and 3 (username), while allowing admins to pass custom data in parameters 4 through 11. This allows a single script to be reused across different policies by just changing the parameter values in the UI. Common commands inside scripts include `jamf recon` (to update inventory), `jamf policy` (to trigger check-ins), and `systemsetup`. Admins should always include a "Shebang" line (e.g., #!/bin/zsh) at the very top of the script to ensure the correct interpreter is used. Scripting is vital for "Extension Attributes"—custom pieces of inventory data that Jamf doesn\'t collect by default, such as battery health or specific app versions.',
      industrialUseCase: 'Writing a script that checks if a specific security software is running. If it isn\'t, the script starts the service and then runs `jamf recon` to notify the server that the device is back in compliance.',
      keyTakeaways: ['Runs as root user', 'Zsh is the default interpreter', 'Parameters 4-11 are custom', 'Extension Attributes use script output']
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
      moderateExplanation: 'Modern macOS "Imaging" has been replaced by rapid reset workflows that use native hardware encryption to wipe data in seconds.',
      detailedExplanation: 'Traditional imaging—wiping a drive and dropping a block-copy OS—is deprecated. Modern Macs use a "System Volume" that is cryptographically signed and read-only. To reset a Mac, we use "Erase All Content and Settings" (EACAS). On Macs with Apple Silicon or a T2 chip, Jamf can trigger this via a simple MDM command. The system securely destroys the encryption keys for the "Data Volume," making the data unrecoverable instantly, and then resets the OS to its "Out of Box" state. For older Macs, admins use the `startosinstall` binary with the `--eraseinstall` flag, which downloads a fresh OS installer and wipes the drive before installing. This lifecycle management ensures that when an employee leaves, their device can be prepared for the next user in minutes rather than hours.',
      industrialUseCase: 'A university IT department needs to reset 200 lab computers at the end of the day. They send a single "Remote Wipe" command from the Jamf console, and all 200 Macs are ready for the next class by the time the lab opens.',
      keyTakeaways: ['EACAS is the modern standard', 'Traditional imaging is dead', 'Remote Wipe uses MDM commands', 'Hardware encryption enables instant wipes']
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
      moderateExplanation: 'macOS uses a combination of traditional POSIX permissions and granular Access Control Lists (ACLs) to manage security and access.',
      detailedExplanation: 'POSIX permissions are the foundation: every file has an Owner, a Group, and "Everyone" else. Access is defined by Read (4), Write (2), and Execute (1). For example, "755" means the owner can do everything, while others can only read and execute. Beyond POSIX, macOS uses Access Control Lists (ACLs), which allow you to grant specific permissions to multiple users or groups on a single file—something POSIX cannot do. In Terminal, `ls -la` shows POSIX, while `ls -le` shows ACLs. Ownership is changed via `chown` and permissions via `chmod`. Jamf admins must understand these when packaging software; if a package has incorrect permissions, the app may fail to launch or users may be able to delete critical system files. macOS also utilizes "Permissions Repair" and "System Integrity Protection" (SIP) to prevent even root users from modifying core system folders.',
      industrialUseCase: 'A video production house sets an ACL on their "Final Renders" folder so that the "Editors" group can write files, but the "Marketing" group can only read them, preventing accidental edits to finished work.',
      keyTakeaways: ['Owner, Group, Everyone model', 'Read/Write/Execute bits', 'ls -le displays ACLs', 'chmod and chown are core tools']
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
      moderateExplanation: 'Managing a diverse fleet often involves juggling multiple management platforms and tenant environments to maintain security and isolation.',
      detailedExplanation: 'In an enterprise or MSP environment, admins often manage "Multi-Tenant" setups. In Jamf Pro, this can be done via "Sites"—virtual partitions within one server—or separate Jamf Cloud instances for complete isolation. Increasingly, macOS admins must also manage "Coexistence" with Microsoft Intune. This is often handled via "Jamf Cloud Connector" or "Device Compliance," where Jamf manages the Mac (because it has superior Apple features), but Intune provides the "Conditional Access" check. If Jamf reports a Mac is compliant (encrypted, patched), Intune allows that Mac to access Office 365 data. This ensures that only managed, secure devices can touch company resources. Standardizing these configurations across multiple clients or departments requires strict version control and clear naming conventions for policies and groups.',
      industrialUseCase: 'An MSP manages 50 small business clients. They use one Jamf Pro server with 50 different "Sites" to ensure Client A cannot see Client B\'s devices, but the MSP can manage all of them from one dashboard.',
      keyTakeaways: ['Sites provide logical separation', 'Intune integration via Cloud Connector', 'Conditional Access enforces compliance', 'Standardization enables scalability']
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
      moderateExplanation: 'Effective MDM administration is about designing automated lifecycles that keep devices secure and up-to-date with minimal manual work.',
      detailedExplanation: 'Administration begins with designing the "Enrollment" workflow (Prestage). Once enrolled, devices enter a "Maintenance" phase where "Smart Groups" act as the logic engine. A Smart Group might monitor if a Mac is missing a specific security patch; as soon as it is, the Mac "falls into" the group, which triggers a "Patch Policy" to install the update. Troubleshooting these workflows requires an understanding of the communication chain: Device <-> APNs <-> Jamf. If a command isn\'t working, admins check the APNs status (on port 5223) and the local `mdmclient` logs using the `log show` command. Regularly "Cleaning" the environment—deleting old policies, retiring unused packages, and auditing API accounts—is essential for maintaining a fast, reliable management platform.',
      industrialUseCase: 'A Jamf admin designs a "Self-Healing" workflow: an Extension Attribute checks if the antivirus is running. If it stops, the Mac enters a Smart Group that triggers a policy to re-install the AV software automatically.',
      keyTakeaways: ['Smart Groups provide automation logic', 'APNs is the critical heartbeat', 'mdmclient logs are for troubleshooting', 'Regular maintenance prevents bloat']
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
      moderateExplanation: 'Modern packaging utilizes automated tools to fetch, wrap, and deploy applications, removing the need for manual "Download and Upload" cycles.',
      detailedExplanation: 'Admins use "AutoPkg"—an open-source framework—to automate the task of checking for new software versions. AutoPkg uses "Recipes" (XML plists) that tell it where to find the download (e.g., GitHub or a vendor URL), how to verify it, and how to turn it into a Jamf-compatible PKG. These recipes can be integrated into CI/CD pipelines using GitHub Actions or Azure DevOps. When a vendor releases a new version of Chrome, the pipeline automatically detects it, builds the package, uploads it to a "Testing" category in Jamf, and notifies the admin. This "Shift-Left" approach ensures software is patched faster and with fewer human errors. Munki is another common tool used alongside Jamf for its superior "Self-Service" catalog and dependency management, allowing apps to be installed only when certain conditions are met.',
      industrialUseCase: 'An IT team uses AutoPkg to manage 50 common apps (Zoom, Slack, Chrome). Instead of manually updating them every week, the apps are updated automatically by a server, saving the team 10+ hours of manual work every month.',
      keyTakeaways: ['AutoPkg uses Recipes for automation', 'CI/CD pipelines reduce human error', 'Patch management becomes "Hands-Off"', 'Munki manages complex dependencies']
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
      moderateExplanation: 'The Jamf Pro API allows developers and admins to interact with server data programmatically, enabling massive scale and custom integrations.',
      detailedExplanation: 'Jamf Pro offers two APIs: the "Classic API" (which uses XML) and the modern "Jamf Pro API" (which uses JSON and Bearer Token authentication). The API allows you to perform "CRUD" operations: Create, Read, Update, and Delete records. For example, you can write a Python script that pulls a list of all iPads with low storage and sends a customized notification to those users. Authentication is a key security factor: admins should use "API Roles and Clients" to grant specific, limited permissions (e.g., Read-only access to inventory) rather than using a full admin account. Tooling like "Jamf Pro PowerToys" or custom Swift apps can leverage these APIs to build dashboards or custom inventory portals that aren\'t available in the standard Web UI.',
      industrialUseCase: 'A company integrates Jamf with their HR system (Workday). When an employee is marked as "Terminated" in Workday, a script automatically calls the Jamf API to lock their Mac and trigger a Remote Wipe.',
      keyTakeaways: ['Classic (XML) vs Pro (JSON) APIs', 'Bearer Token authentication is standard', 'API Roles enforce least privilege', 'Enables integration with HR and Security tools']
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
      moderateExplanation: 'Ensuring your Apple fleet meets global security standards like CIS or NIST through automated enforcement and reporting.',
      detailedExplanation: 'Security compliance is more than just settings; it\'s about "Attestation." Admins use the "macOS Security Compliance Project" (mSCP) to generate tailored security baselines based on frameworks like NIST 800-53 or the CIS Benchmark. These baselines are converted into Configuration Profiles and Scripts that Jamf enforces. Key checks include disabling guest accounts, enforcing a minimum password length, and ensuring "System Integrity Protection" (SIP) is active. To prove compliance for an audit, admins use "Extension Attributes" to collect real-time status of these settings. If a device fails a check, it is flagged in a "Non-Compliant" Smart Group, which can trigger an automated remediation or block access to corporate resources. This creates a "Continuous Compliance" model that is much stronger than once-a-year audits.',
      industrialUseCase: 'A financial services firm must pass a SOC2 audit. They provide a Jamf report showing that 100% of their 5,000 Macs have had a specific security patch applied within 48 hours of release.',
      keyTakeaways: ['Enforce CIS/NIST benchmarks', 'mSCP automates baseline creation', 'Continuous Compliance via Smart Groups', 'Audit readiness requires accurate inventory data']
    }]
  }
];

// --- 3. AI & Helper Services ---

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = 'gemini-3-flash-preview';

// --- 4. Sub-Components ---

const ChatDiscussion = ({ topic, onClose }: { topic: Topic, onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial setup for the chat session
    const setupChat = async () => {
      chatRef.current = aiClient.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: `You are a Jamf Certified Expert Tutor. Your goal is to help students understand the Jamf 200 curriculum. 
          The student is currently studying: "${topic.title}".
          Context: ${topic.detailedExplanation}. 
          Provide technical, professional, yet accessible explanations. Use markdown for code blocks and lists. Keep answers conversational but precise.`,
        },
      });
      
      // Welcome message
      setMessages([{
        role: 'model',
        text: `Hi there! I'm your Jamf Expert Tutor. Let's discuss **${topic.title}**. What part of this topic can I clarify for you?`,
        timestamp: Date.now()
      }]);
    };

    setupChat();
  }, [topic]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !chatRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
    setLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "I'm sorry, I couldn't generate a response.", timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Failed to communicate with AI. Please try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-xl"><MessageCircle className="w-5 h-5"/></div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Expert Discussion</h4>
            <p className="text-[10px] text-blue-100 font-bold opacity-80">{topic.title}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
              <div className="shrink-0 pt-1">
                {msg.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4 text-blue-600"/>}
              </div>
              <div className="prose prose-sm prose-slate max-w-none text-inherit leading-relaxed">
                {msg.text.split('\n').map((line, li) => <p key={li}>{line}</p>)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-3 rounded-tl-none">
              <Bot className="w-4 h-4 text-blue-600 shrink-0 mt-1"/>
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"/>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"/>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"/>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={send} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about architecture, ports, paths..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 transition-all font-medium"
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100">
          <Send className="w-5 h-5"/>
        </button>
      </form>
    </div>
  );
};

const CommentSection = ({ topicId }: { topicId: string }) => {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`jamf_comm_${topicId}`);
    if (saved) setComments(JSON.parse(saved));
  }, [topicId]);

  const add = () => {
    if (!newComment.trim()) return;
    const next = [...comments, newComment];
    setComments(next);
    localStorage.setItem(`jamf_comm_${topicId}`, JSON.stringify(next));
    setNewComment('');
  };

  const remove = (idx: number) => {
    const next = comments.filter((_, i) => i !== idx);
    setComments(next);
    localStorage.setItem(`jamf_comm_${topicId}`, JSON.stringify(next));
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-8">
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-600"/> My Study Notes
      </h4>
      <div className="space-y-3 mb-4">
        {comments.map((c, i) => (
          <div key={i} className="group bg-slate-50 p-4 rounded-xl text-sm text-slate-600 flex justify-between items-start animate-in fade-in slide-in-from-left-2">
            <p className="flex-1 pr-4">{c}</p>
            <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a point or memory trick..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button onClick={add} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"><Plus className="w-5 h-5"/></button>
      </div>
    </div>
  );
};

// --- 5. Main Application ---

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

  const cur = JAMF_MODULES.find(m => m.id === modId)!;
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
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">AI Study Help</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Click "Discuss with AI" inside any topic to start a conversation about specific technical concepts.</p>
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
          
          {/* AI Chat Overlay */}
          {discussTopic && (
            <div className="fixed inset-x-0 bottom-0 lg:left-80 z-50 p-6 pointer-events-none">
              <div className="max-w-2xl mx-auto pointer-events-auto">
                <ChatDiscussion topic={discussTopic} onClose={() => setDiscussTopic(null)}/>
              </div>
            </div>
          )}

          {view === 'reading' && (
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
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Topic Deep Dive</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tight">{t.title}</h3>
                        <div className={`h-2 w-16 rounded-full mt-6 ${isDone ? 'bg-green-500' : 'bg-blue-600 shadow-lg shadow-blue-100'}`} />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setDiscussTopic(t)} 
                          className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4"/> Discuss with AI
                        </button>
                        <button onClick={() => toggle(t.id)} className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${isDone ? 'bg-green-600 text-white border-green-600 shadow-xl shadow-green-100' : 'bg-white text-slate-500 hover:border-blue-500'}`}>
                          {isDone ? 'Mastered ✓' : 'Mark Done'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-10 bg-slate-50 p-2 rounded-2xl w-fit">
                      {(['short', 'moderate', 'detail'] as const).map(l => (
                        <button key={l} onClick={() => setActiveLevels({...activeLevels, [t.id]: l})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${level === l ? 'bg-white text-blue-700 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{l === 'detail' ? 'Expert (Full)' : l}</button>
                      ))}
                    </div>

                    <div className={`p-10 rounded-[2rem] mb-10 leading-relaxed transition-all ${level === 'detail' ? 'bg-slate-900 text-slate-300 font-medium text-lg border-none shadow-2xl' : 'bg-slate-50 text-slate-700 text-xl'}`}>
                      {text}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                       <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100">
                         <div className="flex items-center gap-3 mb-4 text-emerald-800 font-black text-xs uppercase tracking-widest"><Briefcase className="w-5 h-5"/> Industrial Logic</div>
                         <p className="text-emerald-700 text-sm italic leading-relaxed font-medium">{t.industrialUseCase}</p>
                       </div>
                       <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100">
                         <div className="flex items-center gap-3 mb-4 text-blue-800 font-black text-xs uppercase tracking-widest"><CheckCircle2 className="w-5 h-5"/> Quick Recaps</div>
                         <ul className="space-y-3">
                           {t.keyTakeaways.map((k, i) => <li key={i} className="text-blue-700 text-xs font-black flex items-center gap-4"> <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" /> {k}</li>)}
                         </ul>
                       </div>
                    </div>

                    <CommentSection topicId={t.id}/>
                  </div>
                );
              })}
            </div>
          )}
          
          {view === 'quiz' && <div className="p-20 text-center font-black text-slate-300">Practice quizzes for {cur.title} are under development. Use "Discuss with AI" to test your knowledge!</div>}
          {view === 'scenario' && <div className="p-20 text-center font-black text-slate-300">Lab scenarios for {cur.title} are being generated. Ask AI to describe a scenario!</div>}
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
