
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
    ]
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
    ]
  },
  {
    id: 'automated-enrollment',
    title: '3. Automated MDM Enrollment',
    description: 'Enrolling macOS and iOS devices using ADE.',
    topics: [
      {
        id: 'ade-workflow',
        title: 'Zero-Touch Deployment (ADE)',
        shortExplanation: 'Automated Device Enrollment (ADE) connects Apple Business Manager to Jamf Pro for zero-touch setup.',
        moderateExplanation: 'ADE (formerly DEP) allows corporate-owned devices to be automatically managed the moment they are powered on and connected to Wi-Fi. It makes management mandatory and prevents users from removing the MDM profile.',
        detailedExplanation: 'The workflow starts in ABM/ASM where devices are assigned to the Jamf MDM server. When the device reaches the "Setup Assistant," it check-ins with Apple, which redirects it to Jamf. Jamf then pushes a "Prestage Enrollment" profile containing user settings, account types, and skip-logic for setup screens.',
        industrialUseCase: 'Global logistics companies ship thousands of sealed MacBooks directly to employees\' homes. Employees sign in to Wi-Fi, and the device is fully configured with VPN, Mail, and Slack without IT ever touching the box.',
        keyTakeaways: [
          'Requires Apple Business Manager (ABM)',
          'Supervision is automatic and unremovable',
          'Zero-touch requires a Prestage Enrollment'
        ]
      }
    ]
  },
  {
    id: 'setup-config',
    title: '4. Setup & Configuration',
    description: 'Initial device setup and user accounts.',
    topics: [
      {
        id: 'initial-setup',
        title: 'Post-Enrollment Setup',
        shortExplanation: 'Configuration of device names, time zones, and user accounts after enrollment.',
        moderateExplanation: 'Post-enrollment tasks ensure the device is ready for the user. This includes setting the local admin account, standard user accounts, and initial system settings like regional defaults.',
        detailedExplanation: 'Through Jamf Prestage, admins can specify if the first user created is an admin or standard user. Admins also utilize scripts triggered by "Enrollment Complete" to set the computer name based on serial numbers or user attributes via the jamf binary: jamf setComputerName -name [NAME].',
        industrialUseCase: 'Educational institutions set all student iPads to "Shared iPad" mode during enrollment to allow multiple students to log in with their Managed Apple IDs safely.',
        keyTakeaways: [
          'Prestage manages Setup Assistant screens',
          'Scripts can automate naming conventions',
          'Local accounts are defined during enrollment'
        ]
      }
    ]
  },
  {
    id: 'user-environment',
    title: '5. User Environment (.plist)',
    description: 'Configuring settings and preferences.',
    topics: [
      {
        id: 'profiles-plist',
        title: 'Profiles & Managed Preferences',
        shortExplanation: 'Configuration Profiles use MDM to enforce settings like Wi-Fi and passcodes via .plist files.',
        moderateExplanation: 'Preferences on macOS are stored in Property List (.plist) files. Configuration Profiles (.mobileconfig) allow admins to manage these settings centrally. The system daemon "cfprefsd" manages the reading and writing of these preferences.',
        detailedExplanation: 'Configuration profiles are XML files delivered over the air. They are stored in /Library/Managed Preferences on the client. Profiles can be scoped to users or computers. Admins can also manually deploy .plists via DMG packages to /Library/Preferences if an MDM payload is not available.',
        industrialUseCase: 'Banking organizations enforce a 15-minute screen lock timeout and complex passcode requirements on all managed iPhones to comply with financial security regulations.',
        keyTakeaways: [
          'Mobileconfig files deliver MDM settings',
          'Plists are standard macOS preference files',
          'CFPrefsD handles preference caching'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: '6. Security & Privacy',
    description: 'Protecting devices and data.',
    topics: [
      {
        id: 'security-frameworks',
        title: 'FileVault & Gatekeeper',
        shortExplanation: 'Encryption and security frameworks that protect the OS from unauthorized access and malware.',
        moderateExplanation: 'Jamf manages native Apple security tools. FileVault encrypts the entire disk. Gatekeeper ensures only trusted apps run. PPPC (Privacy Preferences Policy Control) manages app permissions for cameras and microphones.',
        detailedExplanation: 'For FileVault, Jamf captures the "Personal Recovery Key" (PRK) and stores it in the Jamf Pro inventory. Admins use MDM payloads to pre-approve system extensions (Kexts) and system permissions to prevent users from seeing "Security Blocked" popups.',
        industrialUseCase: 'Healthcare providers use Jamf to enforce FileVault on all laptops to ensure patient data (HIPAA) is protected if a laptop is lost or stolen.',
        keyTakeaways: [
          'Recovery Keys are securely escrowed in Jamf',
          'Gatekeeper blocks unsigned applications',
          'PPPC profiles automate privacy approvals'
        ]
      }
    ]
  },
  {
    id: 'app-distribution',
    title: '7. Apps & Volume Purchasing',
    description: 'Deploying App Store content.',
    topics: [
      {
        id: 'vpp-abm',
        title: 'Volume Purchasing (VPP)',
        shortExplanation: 'Buying and distributing apps in bulk via Apple Business Manager.',
        moderateExplanation: 'Organizations buy "licenses" for apps in ABM. These licenses are then synced to Jamf. Using "Device-based assignment," Jamf can install these apps on devices without requiring the user to sign in with an Apple ID.',
        detailedExplanation: 'Syncing is handled via a VPP Token (.vpptoken). Admins can scope apps to Smart Groups. If an app is removed from a device, the license is returned to the "pool" in Jamf Pro to be reused by another user.',
        industrialUseCase: 'A retail store deploys 500 "Point of Sale" apps across iPads in multiple locations. The apps are pushed automatically overnight using VPP, ensuring zero downtime for sales staff.',
        keyTakeaways: [
          'Licenses are owned by the organization',
          'Device-based assignment skips Apple ID login',
          'Tokens must be renewed annually'
        ]
      }
    ]
  },
  {
    id: 'scripting',
    title: '8. Scripting Overview',
    description: 'Automating tasks with Bash and Zsh.',
    topics: [
      {
        id: 'bash-basics',
        title: 'Shell Scripting (Zsh/Bash)',
        shortExplanation: 'Using the command line to automate complex tasks on macOS.',
        moderateExplanation: 'Scripts allow admins to extend Jamf’s capabilities. Common tasks include changing settings, running maintenance, or calling the Jamf binary. While Bash was legacy, Zsh is the modern default for macOS.',
        detailedExplanation: 'Jamf policies run scripts as the "root" user. Scripts utilize "Shebang" lines (e.g., #!/bin/zsh). Admins can pass up to 11 parameters from Jamf to the script. The jamf binary is a common command used within scripts (e.g., jamf recon to update inventory).',
        industrialUseCase: 'IT teams use scripts to check the battery health of remote employee laptops. If health is below 80%, the script triggers an automated ticket in Zendesk for a battery replacement.',
        keyTakeaways: [
          'Root access for all Jamf-run scripts',
          'Zsh is the default since macOS Catalina',
          'Parameters 4-11 are custom for Jamf'
        ]
      }
    ]
  },
  {
    id: 'refresh-reimage',
    title: '9. Initial Setup & Refreshing',
    description: 'Lifecycle management and reimaging.',
    topics: [
      {
        id: 'refresh-workflows',
        title: 'Erase All Content & Settings',
        shortExplanation: 'Quickly resetting a device to factory settings for the next user.',
        moderateExplanation: 'On modern Macs (Apple Silicon or T2), admins can trigger "Erase All Content and Settings" (EACAS) remotely. This instantly destroys the encryption key, making the data unrecoverable and the OS clean.',
        detailedExplanation: 'EACAS is much faster than traditional "reimaging" (which is now deprecated by Apple). For older Macs, admins use the startosinstall binary with the --eraseinstall flag. For iOS, "Remote Wipe" performs a similar reset.',
        industrialUseCase: 'At the end of a semester, a university IT department triggers a remote wipe on all lab computers, ensuring they are fresh and clean for the next cohort in minutes.',
        keyTakeaways: [
          'EACAS is the modern standard for resets',
          'Traditional imaging is no longer supported',
          'Remote Wipe is triggered via MDM commands'
        ]
      }
    ]
  },
  {
    id: 'permissions',
    title: '10. Ownership & Permissions',
    description: 'Understanding macOS file access.',
    topics: [
      {
        id: 'posix-acl',
        title: 'POSIX & ACL Permissions',
        shortExplanation: 'Rules that determine who can read, write, or execute files on a Mac.',
        moderateExplanation: 'POSIX permissions define Owner, Group, and Everyone access using numeric (755) or symbolic (rwxr-xr-x) codes. ACLs (Access Control Lists) provide even more granular control for specific users or groups.',
        detailedExplanation: 'Use the command ls -le to see both POSIX and ACLs. Use chmod to change permissions and chown to change ownership. Ownership is critical for the Jamf binary to run correctly, as most system files must be owned by "root" or "admin".',
        industrialUseCase: 'Creative studios set specific ACLs on shared project folders, allowing "Designers" to read/write but "Clients" to only read, preventing accidental deletions.',
        keyTakeaways: [
          'Read=4, Write=2, Execute=1',
          'ls -la shows hidden files and permissions',
          'chown root:admin changes ownership'
        ]
      }
    ]
  },
  {
    id: 'client-env-management',
    title: '11. Client Env Management',
    description: 'Managing multi-tenant Jamf and Intune environments.',
    topics: [
      {
        id: 'multi-tenant-ops',
        title: 'Multi-Tenant Infrastructure (Jamf & Intune)',
        shortExplanation: 'Managing Jamf Pro (on-prem/cloud) and Microsoft Intune across multiple client environments.',
        moderateExplanation: 'Admins often handle multiple "tenants" or instances of Jamf Pro and Microsoft Intune. This involves balancing on-premise infrastructure requirements with cloud-native convenience while ensuring each client has a isolated but well-managed ecosystem.',
        detailedExplanation: 'In an MSP or enterprise context, you use "Instances" or "Site" designations in Jamf Pro to separate client data. Intune requires a separate Azure AD tenant. You manage these via separate browser profiles or centralized management consoles to maintain clear boundaries while applying consistent logic.',
        industrialUseCase: 'A global consultancy manages 15 separate Jamf Pro Cloud instances, each tailored to a different region\'s regulatory requirements, while maintaining a single "Master" Intune tenant for mobile devices.',
        keyTakeaways: [
          'Support both on-prem and cloud architectures',
          'Manage Jamf and Intune concurrently',
          'Maintain clear tenant isolation'
        ]
      },
      {
        id: 'onboarding-ops',
        title: 'Client Onboarding & Policy Deployment',
        shortExplanation: 'Handling the lifecycle of client onboarding and configuration deployment.',
        moderateExplanation: 'Onboarding a new client involves configuring their unique management policies and profiles from scratch or using a template. This ensures that as soon as a client device is enrolled, it receives the necessary tools.',
        detailedExplanation: 'The workflow starts with defining the "Onboarding Profile." Admins deploy "Prestage Enrollments" in Jamf or "Enrollment Profiles" in Intune. Policies include VPN, Wi-Fi, Security certificates, and the installation of initial management agents like the Jamf binary or Intune Management Extension.',
        industrialUseCase: 'When a new department joins a large university, the Jamf admin creates a new "Site" and "Category," then clones existing standard policies to ensure the 50 new Macs are ready by Monday morning.',
        keyTakeaways: [
          'Automate initial configuration on enrollment',
          'Deploy consistent policy sets via cloning/templates',
          'Define onboarding milestones for new clients'
        ]
      },
      {
        id: 'baseline-standardization',
        title: 'Baseline Standardization',
        shortExplanation: 'Maintaining consistent macOS baseline configurations across all client environments.',
        moderateExplanation: 'To ensure stability and ease of support, admins standardized macOS baselines. This includes OS version limits, system setting defaults, and security benchmarks that apply to all devices regardless of the specific client.',
        detailedExplanation: 'Baselines are enforced via "Managed Preferences" (.mobileconfig) and scripts. Admins use the "macOS Security Compliance Project" (mSCP) to generate standardized baselines based on NIST or CIS benchmarks, then deploy them as unified Configuration Profiles.',
        industrialUseCase: 'An enterprise enforces a "macOS Sonoma 14.x" baseline. Any device running an older version is automatically put in a Smart Group that triggers a nag-screen and restricts access to Slack until they update.',
        keyTakeaways: [
          'Use NIST/CIS security benchmarks for baselines',
          'Standardize system settings for easier support',
          'Enforce baseline versioning across environments'
        ]
      }
    ]
  },
  {
    id: 'mdm-admin-adv',
    title: '12. MDM Platform Administration',
    description: 'Advanced administration of Jamf, Intune, and ABM.',
    topics: [
      {
        id: 'provisioning-workflows',
        title: 'MDM Workflow Design (Provisioning/Patching)',
        shortExplanation: 'Implementing automated workflows for device provisioning, compliance, and patching.',
        moderateExplanation: 'Designing robust MDM workflows ensures that devices are provisioned correctly and remain patched throughout their lifecycle. This involves linking enrollment, inventory, and automated policy triggers.',
        detailedExplanation: 'Provisioning uses ADE (DEP) to reach the Prestage Enrollment. Compliance is handled by Smart Groups that monitor OS version or app presence. Patching workflows utilize "Jamf App Installers" or custom scripts that use the `jamf` binary to check-in and install pending updates.',
        industrialUseCase: 'A tech company uses a "Daily Health Check" policy. If a device hasn\'t patched a critical vulnerability in 3 days, it triggers an "Immediate Action" policy that force-reboots the Mac after a 10-minute warning.',
        keyTakeaways: [
          'Design lifecycle-aware workflows',
          'Automate patching via Jamf App Installers',
          'Link compliance to inventory data'
        ]
      },
      {
        id: 'abm-integration-adv',
        title: 'ABM Integration (DEP/VPP)',
        shortExplanation: 'Connecting MDM platforms with Apple Business Manager for DEP and VPP.',
        moderateExplanation: 'Apple Business Manager (ABM) is the glue between Apple and your MDM. It handles serial number assignment (DEP) and volume license distribution (VPP), enabling zero-touch deployment.',
        detailedExplanation: 'Tokens (APNs, VPP, DEP) must be renewed annually. Admins must manage "Location" tokens in VPP to separate budgets. Serial numbers are moved from "Unassigned" to the specific MDM server within ABM to ensure they hit the correct Prestage Enrollment during activation.',
        industrialUseCase: 'A global retailer buys 1,000 iPads. They assign them in ABM to their "In-Store" Jamf server. The iPads are shipped directly to stores, and when unboxed, they immediately lock to the store management profile.',
        keyTakeaways: [
          'Renew APNs and VPP tokens annually',
          'Assign serials in ABM before unboxing',
          'Device-based VPP assignment skips Apple IDs'
        ]
      },
      {
        id: 'mdm-troubleshooting',
        title: 'MDM Troubleshooting & Communication',
        shortExplanation: 'Diagnosing MDM command failures, profile issues, and device communication problems.',
        moderateExplanation: 'When management fails, it\'s usually a break in communication between the device, APNs, and the MDM server. Troubleshooting requires looking at log files and verifying network connectivity.',
        detailedExplanation: 'Key tools include `sudo jamf log` and the "Console.app" on macOS. Admins check if the device can reach `17.0.0.0/8` (APNs). Common issues include "Management Deadlock" where multiple profiles conflict, or "Token Mismatch" which requires a re-enrollment.',
        industrialUseCase: 'A device stops receiving profiles. The admin runs `jamf mdm` on the client and sees a "Signature Invalid" error, identifying that the MDM certificate was replaced and the client needs a binary refresh.',
        keyTakeaways: [
          'Verify APNs connectivity (Port 5223)',
          'Check local logs for MDM command errors',
          'Use Console.app to trace MDM daemon (mdmclient)'
        ]
      }
    ]
  },
  {
    id: 'app-packaging-automation',
    title: '13. Application Packaging & Automation',
    description: 'Advanced software deployment pipelines.',
    topics: [
      {
        id: 'pkg-development',
        title: 'Advanced Packaging (Munki/AutoPkg/Composer)',
        shortExplanation: 'Developing and maintaining macOS application packages (.pkg, .dmg, .app).',
        moderateExplanation: 'Packaging involves wrapping applications in a format that the OS can install silently. While Composer is great for snapshots, Munki and AutoPkg are used for automating the "fetch and wrap" of common web apps.',
        detailedExplanation: 'Admins create "Recipes" in AutoPkg to automate the download, package creation, and upload to Jamf. Munki serves as an alternative self-service portal. Jamf Composer is used for "Diffing" (before/after snapshots) to capture complex config changes into a DMG.',
        industrialUseCase: 'A creative agency uses AutoPkg to update the entire Adobe Creative Cloud suite. The recipe runs every Saturday night, ensuring designers always have the latest bug fixes on Monday.',
        keyTakeaways: [
          'Use Composer for complex config snapshots',
          'AutoPkg automates the repetitive fetch-cycle',
          'Standardize package naming for clean inventory'
        ]
      },
      {
        id: 'cicd-pipelines',
        title: 'CI/CD Deployment Pipelines (GitHub/Azure)',
        shortExplanation: 'Automating packaging and testing pipelines via GitHub Actions or Azure DevOps.',
        moderateExplanation: 'Modern Mac management uses DevOps principles. Code-based configurations are stored in Git, and pipelines automate the building, testing, and deployment of packages to the MDM.',
        detailedExplanation: 'A GitHub Action is triggered on a "Push". The action runs a `munki-import` or `jamf-upload` tool. This ensures that no package reaches production without passing through a "Testing" Jamf category first.',
        industrialUseCase: 'A fintech firm keeps all their Jamf scripts in a GitHub repo. When a script is edited and merged, an Azure DevOps pipeline automatically updates the script body inside Jamf Pro via the API.',
        keyTakeaways: [
          'Version control all scripts and manifests',
          'Automate testing before production rollout',
          'Use runners (GitHub/Azure) for remote builds'
        ]
      },
      {
        id: 'remediation-scripts',
        title: 'Post-Install & Remediation Scripting',
        shortExplanation: 'Building scripts to enhance deployment reliability and fix issues automatically.',
        moderateExplanation: 'Installation is only half the battle. Post-install scripts handle licensing and configuration, while remediation scripts monitor for failures and attempt a "self-heal".',
        detailedExplanation: 'Post-install scripts run as part of the PKG or as a "Policy Script". Remediation scripts use "Extension Attributes" in Jamf to flag issues, and a policy then runs the fix script (e.g., re-installing a missing security agent).',
        industrialUseCase: 'A security tool fails to start. A remediation script checks the process every hour. If it\'s not running, it executes `launchctl load` and sends a notification to the IT helpdesk.',
        keyTakeaways: [
          'Use post-install for license registration',
          'Remediation scripts should be idempotent',
          'Link fix-actions to inventory health triggers'
        ]
      }
    ]
  },
  {
    id: 'scripting-tooling-adv',
    title: '14. Scripting & Tooling',
    description: 'Custom automation with Python, Zsh, and APIs.',
    topics: [
      {
        id: 'polyglot-automation',
        title: 'Cross-Platform Automation (Bash/Zsh/Python)',
        shortExplanation: 'Creating scripts to automate configuration, deployment, and compliance checks.',
        moderateExplanation: 'Zsh is the default, but Python is more powerful for data handling and API interactions. Admins use these to automate repetitive tasks that the MDM UI cannot handle natively.',
        detailedExplanation: 'Bash/Zsh are used for quick system tasks (filesystem, permissions). Python is used for "Heavy Lifting"—parsing JSON from APIs, multi-threaded tasks, or complex logic. Scripts are deployed via Jamf Policies and run as the root user.',
        industrialUseCase: 'An admin writes a Python script that compares the local hardware list against a procurement CSV, identifying "Ghost Devices" that are in the MDM but were never officially purchased.',
        keyTakeaways: [
          'Zsh is the standard for macOS system tasks',
          'Python is ideal for complex API and data logic',
          'Maintain script portability and documentation'
        ]
      },
      {
        id: 'api-workflows-adv',
        title: 'API Integration (Jamf/Intune/Munki)',
        shortExplanation: 'Leveraging APIs to develop custom automation and reporting workflows.',
        moderateExplanation: 'The API allows you to programmatically control the MDM. You can pull massive inventory reports, update thousands of devices at once, or integrate Jamf with other tools like Slack or ServiceNow.',
        detailedExplanation: 'Jamf Pro uses the "Classic API" (XML) and "Pro API" (JSON). Intune uses the "Microsoft Graph API". Admins write "Middlewares" (often in AWS Lambda or Python) to bridge these tools, ensuring data consistency.',
        industrialUseCase: 'When a new employee is hired in Workday, a custom script calls the Jamf API to create a "Static Group" with their name and assigns a specific "Welcome Package" policy to it.',
        keyTakeaways: [
          'Use Jamf Pro API for JSON-based modern logic',
          'Graph API handles Microsoft Intune automation',
          'Secure all API credentials using Secrets/Keys'
        ]
      }
    ]
  },
  {
    id: 'security-compliance-adv',
    title: '15. Security & Compliance',
    description: 'Enforcing baselines and attestation.',
    topics: [
      {
        id: 'security-enforcement',
        title: 'Security Baseline Enforcement',
        shortExplanation: 'Enforcing client-specific security baselines, FileVault, and compliance policies.',
        moderateExplanation: 'Security is enforced through configuration profiles and monitoring. This ensures every device has disk encryption enabled, a complex password, and all system security features (SIP, Gatekeeper) active.',
        detailedExplanation: 'FileVault is enforced via an MDM payload that escrows the Recovery Key. Password policies are delivered via the "Passcode" payload. Compliance is monitored using "Extension Attributes"—if a device fails a check, it is moved to a "Non-Compliant" Smart Group.',
        industrialUseCase: 'A law firm requires all Macs to have a 5-minute screen lock. The admin deploys a profile. If a user tries to change it via System Settings, the MDM instantly overrides and reapplies the 5-minute limit.',
        keyTakeaways: [
          'Escrow FileVault Recovery Keys securely',
          'Enforce password complexity via MDM',
          'Monitor SIP and Gatekeeper status'
        ]
      },
      {
        id: 'attestation-reporting',
        title: 'Device Attestation & Compliance Reporting',
        shortExplanation: 'Implementing device attestation, inventory accuracy, and real-time compliance reporting.',
        moderateExplanation: 'Attestation proves the device is what it says it is. Compliance reporting provides the "audit trail" that security teams need to verify that all devices are protected.',
        detailedExplanation: 'Device Attestation uses Apple\'s secure hardware (T2/Apple Silicon) to provide a cryptographic proof of identity. Jamf "Inventory Reports" are scheduled to go to the Security Team every week, highlighting any devices with missing security tools.',
        industrialUseCase: 'During a SOC2 audit, the admin provides a dashboard showing that 100% of the fleet has "Gatekeeper" enabled, with a timestamped log for every device as proof.',
        keyTakeaways: [
          'Use hardware-based attestation where possible',
          'Schedule automated compliance reports',
          'Ensure inventory accuracy for audits'
        ]
      },
      {
        id: 'remediation-audits',
        title: 'Vulnerability Remediation & Audits',
        shortExplanation: 'Supporting vulnerability remediation and coordinating with security teams for compliance audits.',
        moderateExplanation: 'IT and Security must work together. When a vulnerability is found (e.g., a Zero-Day in Safari), IT uses the MDM to rapidly patch the fleet and provides reports back to the security team.',
        detailedExplanation: 'Admins use "Vulnerability Management" integrations (like Jamf Protect or Tenable). Remediation involves "Urgent Policies" that bypass standard schedules. Audit support involves providing "Snapshot Reports" of the fleet at a specific point in time.',
        industrialUseCase: 'A critical macOS bug is released. The security team identifies 400 vulnerable Macs. The Jamf admin triggers a "Force Update" policy and, 4 hours later, provides a report showing only 5 devices are left offline.',
        keyTakeaways: [
          'Coordinate patch cycles with Security Teams',
          'Rapidly deploy "Zero-Day" remediation',
          'Maintain historical logs for compliance audits'
        ]
      }
    ]
  }
];
