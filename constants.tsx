
import { Module } from './types';

export const JAMF_MODULES: Module[] = [
  {
    id: 'server-intro',
    title: '1. Jamf Pro Server',
    description: 'Introduction to the Jamf Pro server architecture and interface.',
    topics: [
      {
        id: 'server-architecture',
        title: 'Server Architecture & Components',
        shortExplanation: 'Jamf Pro is a Java-based web application running on Apache Tomcat with a MySQL/MariaDB database.',
        moderateExplanation: 'The Jamf Pro server serves as the central administrative hub. It consists of three main components: the web application (Tomcat), the database (MySQL), and the underlying operating system (Linux, Windows, or macOS). Communication is primarily handled over port 443.',
        detailedExplanation: 'Technically, Jamf Pro utilizes a Java stack. The Tomcat server handles incoming requests from admins (Web UI) and managed devices (API/Binary). The database stores all inventory and configuration data. The "Jamf Pro Binary" on macOS clients check-ins to this server via the jamf agent. Key paths include /Library/JSS on macOS or /var/lib/jamf on Linux for server files.',
        industrialUseCase: 'Enterprise organizations often use Jamf Cloud, which manages the scaling and maintenance of these components automatically, allowing IT teams to focus on management rather than server patching.',
        keyTakeaways: [
          'Java, Tomcat, and MySQL are required',
          'Primary port for management is 443',
          'API allows for automation and integration'
        ]
      }
    ],
    staticQuizzes: [
      {
        question: "Which three components are required for a Jamf Pro server installation?",
        options: ["Apache, PHP, MySQL", "Java, Tomcat, MySQL/MariaDB", "Python, Nginx, PostgreSQL", "Node.js, Express, MongoDB"],
        correctAnswer: 1,
        explanation: "Jamf Pro is built on a Java stack using Apache Tomcat as the web server and MySQL or MariaDB as the database backend."
      },
      {
        question: "What is the primary port used for communication between Jamf Pro and managed clients?",
        options: ["80", "22", "443", "8443"],
        correctAnswer: 2,
        explanation: "While 8443 was common for legacy on-prem installs, port 443 is the standard for HTTPS traffic and is used by Jamf Cloud."
      }
    ],
    staticScenario: "### The Disconnected Dashboard\n\n**Problem:** You have just installed Jamf Pro on-premise, but when you navigate to the URL, you get a '500 Internal Server Error'.\n\n**Guiding Questions:**\n1. How would you check if the Tomcat service is running?\n2. Where would you look for the database connection configuration?\n\n**Resolution:**\nFirst, check the Tomcat logs (typically in `/Library/JSS/Tomcat/logs`). Most '500' errors in a new install are caused by incorrect database credentials in the `DataBase.xml` file or the MySQL service not being started."
  },
  {
    id: 'packaging',
    title: '2. Packaging & Content',
    description: 'Building and managing content for deployment.',
    topics: [
      {
        id: 'packaging-types',
        title: 'Package Formats (.pkg, .dmg)',
        shortExplanation: 'Apple uses .pkg for installers and .dmg for disk images to deploy software.',
        moderateExplanation: 'Packages (.pkg) are standard installer files that can run pre/post-installation scripts. Disk Images (.dmg) are containers for files. In Jamf, .pkg is preferred for apps with installers, while .dmg is used for drag-and-drop apps or file deployments.',
        detailedExplanation: 'The Jamf Composer tool allows admins to create both formats. Snapshot packaging (DMG) captures filesystem changes, while "Package Manifests" (PKG) are cleaner. PKGs use the system installer (/usr/sbin/installer), whereas Jamf mounts and copies DMGs to their destination using the jamf binary.',
        industrialUseCase: 'IT teams package custom security agents (like CrowdStrike) as PKGs to ensure they run initialization scripts and register the device immediately upon installation.',
        keyTakeaways: [
          'Jamf Composer creates both formats',
          'PKG supports pre/post-install scripts',
          'DMG is a direct file-to-file copy'
        ]
      }
    ],
    staticQuizzes: [
      {
        question: "When using Jamf Composer, what type of package creation method 'captures' changes made to the file system?",
        options: ["Snapshot", "Drag and Drop", "Pre-built Manifest", "Post-install trigger"],
        correctAnswer: 0,
        explanation: "The Snapshot method allows Composer to record every file added, deleted, or modified between two points in time."
      }
    ],
    staticScenario: "### The Scripted Setup\n\n**Problem:** You need to deploy an app that requires a license key to be entered into a specific Plist file after installation.\n\n**Guiding Questions:**\n1. Should you use a .dmg or a .pkg for this task?\n2. Where would you place the license-injection logic?\n\n**Resolution:**\nA .pkg is the better choice because it supports 'Post-installation' scripts. You would package the app, and then add a bash script to the PKG that uses the `defaults write` command to update the Plist with the license key."
  },
  {
    id: 'mdm-admin-mastery',
    title: '12. MDM Platform Administration',
    description: 'Advanced administration of workflows, integrations, and troubleshooting.',
    topics: [
      {
        id: 'mdm-workflows',
        title: 'MDM Workflows (Provisioning & Patching)',
        shortExplanation: 'Designing and maintaining workflows for device provisioning, compliance, and OS patching.',
        moderateExplanation: 'Workflows are the automated steps a device takes from the box to the user.',
        detailedExplanation: 'Provisioning uses ADE to skip setup screens. Patching is handled via Jamf "App Installers" or the softwareupdate command.',
        industrialUseCase: 'A tech startup uses a "Self-Service" provisioning workflow.',
        keyTakeaways: ['Design automated provisioning via ADE', 'Implement automated OS and App patching', 'Link compliance state to corporate access']
      }
    ],
    staticQuizzes: [
      {
        question: "Which Apple service is required to enable Automated Device Enrollment (ADE)?",
        options: ["Apple School Manager", "Apple Configurator", "Apple Business Manager", "Apple Support"],
        correctAnswer: 2,
        explanation: "ABM (or ASM for education) is the portal where serial numbers are linked to the MDM server for zero-touch enrollment."
      }
    ]
  }
];
