
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
    id: 'client-env-management',
    title: '11. Client Environment Management',
    description: 'Advanced multi-tenant operations for MSPs and Global Enterprises.',
    topics: [
      {
        id: 'multi-tenant-ops',
        title: 'Multi-Tenant Jamf & Intune Management',
        shortExplanation: 'Managing Jamf Pro (on-prem/cloud) and Microsoft Intune environments for multiple distinct clients.',
        moderateExplanation: 'Admins in MSP or Global Enterprise roles must juggle multiple "tenants" or "instances". This involves maintaining separate Jamf Pro servers (either cloud-hosted or on-prem) alongside Microsoft Intune for mobile or cross-platform management.',
        detailedExplanation: 'Management requires switching between different Jamf Pro URL contexts. In Intune, this involves Azure AD tenant switching. Key challenges include maintaining data isolation while applying similar logic across environments. On-prem instances require manual patching of Tomcat/MySQL, while Cloud instances are managed by Jamf/Microsoft.',
        industrialUseCase: 'An MSP manages 20 clients. They use a central dashboard to monitor the "Health" of all 20 Jamf Pro instances, ensuring that no client environment falls out of sync with security requirements.',
        keyTakeaways: [
          'Support for both On-Prem and Cloud Jamf architecture',
          'Co-management with Microsoft Intune for hybrid fleets',
          'Strict tenant isolation for data privacy'
        ]
      },
      {
        id: 'onboarding-policies',
        title: 'Client Onboarding & Deployment',
        shortExplanation: 'Handling the initial configuration and deployment of management policies for new clients.',
        moderateExplanation: 'Onboarding a new client involves setting up the technical foundation: creating management accounts, configuring Prestage Enrollments, and deploying the initial set of macOS policies and configuration profiles.',
        detailedExplanation: 'Deployment involves scoping profiles (Wi-Fi, VPN, Certificates) to the "All Managed Clients" group or client-specific sites. Policies are triggered on "Enrollment Complete" to install the initial software stack (Office, Slack, Security Tools) via the jamf binary.',
        industrialUseCase: 'When a new company is acquired, the IT team uses an "Onboarding Blueprint" in Jamf to instantly deploy 15 mandatory security profiles to the new fleet of 500 Macs.',
        keyTakeaways: [
          'Use Prestage Enrollments for zero-touch onboarding',
          'Deploy initial profiles (VPN, Wi-Fi) immediately',
          'Standardize deployment triggers (Enrollment Complete)'
        ]
      },
      {
        id: 'baseline-standardization',
        title: 'macOS Baseline Standardization',
        shortExplanation: 'Standardizing and maintaining consistent macOS configurations across all client environments.',
        moderateExplanation: 'To ensure a manageable support environment, admins maintain a "Baseline"—a set of configurations (OS version, system settings, security defaults) that are identical for every client.',
        detailedExplanation: 'Baselines are enforced using the "macOS Security Compliance Project" (mSCP). This involves deploying specific Plists and Mobileconfigs that lock down system preferences. This ensures that no matter which client a device belongs to, it meets a minimum functional and security standard.',
        industrialUseCase: 'A global firm enforces a "Sonoma 14.5" baseline. Any device that drifts from this version is automatically identified by a Smart Group and targeted for an OS update policy.',
        keyTakeaways: [
          'Standardize configurations for easier support',
          'Use mSCP for security-aligned baselines',
          'Monitor baseline drift via Smart Groups'
        ]
      },
      {
        id: 'sla-enforcement',
        title: 'SLA & Policy Enforcement',
        shortExplanation: 'Ensuring consistent policy enforcement, device compliance, and security per client SLAs.',
        moderateExplanation: 'Service Level Agreements (SLAs) define the required uptime and compliance state. Admins use Jamf to enforce these rules, ensuring devices stay compliant with the specific security needs of each client.',
        detailedExplanation: 'Compliance is measured via Extension Attributes. If a device fails a check (e.g., Antivirus disabled), Jamf triggers a remediation policy. This ensures that the IT team meets the "99% compliance" SLA promised to the client.',
        industrialUseCase: 'A law firm client has an SLA requiring 100% encryption. If a Mac user disables FileVault, Jamf detects it within 15 minutes and force-enables it, meeting the compliance SLA.',
        keyTakeaways: [
          'Link Smart Groups to SLA requirements',
          'Automate remediation for non-compliant devices',
          'Provide real-time compliance reporting to clients'
        ]
      }
    ]
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
        moderateExplanation: 'Workflows are the automated steps a device takes from the box to the user. This includes automated setup (Provisioning), daily health checks (Compliance), and keeping software current (Patching).',
        detailedExplanation: 'Provisioning uses ADE to skip setup screens. Patching is handled via Jamf "App Installers" or the `softwareupdate` command in scripts. Compliance workflows monitor the device state and use "Conditional Access" to block resources if the device is unpatched.',
        industrialUseCase: 'A tech startup uses a "Self-Service" provisioning workflow where users choose their own department-specific apps during the first 10 minutes of setup.',
        keyTakeaways: [
          'Design automated provisioning via ADE',
          'Implement automated OS and App patching',
          'Link compliance state to corporate access'
        ]
      },
      {
        id: 'abm-integration',
        title: 'ABM Integration (DEP & VPP)',
        shortExplanation: 'Integrating MDM with Apple Business Manager for automated enrollment and app distribution.',
        moderateExplanation: 'ABM is the portal where you manage hardware (DEP) and software (VPP). Integrating it with Jamf allows you to assign devices to your server and distribute app licenses without Apple IDs.',
        detailedExplanation: 'The integration uses "Server Tokens" (.p7m for DEP, .vpptoken for VPP). Admins assign serial numbers in ABM to the Jamf Pro MDM server. This ensures that when the device is first turned on, it "phones home" to Apple and is redirected to your Jamf instance.',
        industrialUseCase: 'A hospital buys 200 iPads. They buy the licenses for a "Patient Charting" app in VPP and assign the serials in DEP. The iPads arrive at the hospital and are managed before they even touch the Wi-Fi.',
        keyTakeaways: [
          'DEP enables mandatory, unremovable MDM',
          'VPP allows for device-based app licensing',
          'Tokens must be renewed every 365 days'
        ]
      },
      {
        id: 'cert-identity',
        title: 'Certificates & Identity Integration',
        shortExplanation: 'Managing certificates, profiles, and device identity across client environments.',
        moderateExplanation: 'Certificates are the "ID Cards" of the management world. They secure communication and identify devices. Integrating with Identity Providers (IdPs) like Okta or Azure AD ensures only the right people get managed devices.',
        detailedExplanation: 'Admins manage SCEP (Simple Certificate Enrollment Protocol) for automated cert delivery. Identity integration (Jamf Connect) allows users to sign in to their Mac using their cloud credentials (SAML/OIDC), syncing the local password with the enterprise identity.',
        industrialUseCase: 'A bank uses certificates to identify "Corporate Managed" devices. If a device doesn\'t have the specific client certificate, it is blocked from the corporate Wi-Fi network.',
        keyTakeaways: [
          'Use SCEP for automated certificate deployment',
          'Integrate with Okta/Azure for Modern Auth',
          'Profiles carry the certificates to the client'
        ]
      },
      {
        id: 'mdm-troubleshooting',
        title: 'MDM Troubleshooting & Command Failures',
        shortExplanation: 'Diagnosing MDM command failures, profile deployment issues, and communication problems.',
        moderateExplanation: 'When a profile doesn\'t land or a command gets "stuck", you need to investigate the communication path between Jamf, Apple (APNs), and the device.',
        detailedExplanation: 'Troubleshooting starts with the command `sudo jamf mdm` and checking `/var/log/jamf.log`. Admins check the "Management" tab in Jamf Pro for "Pending" or "Failed" commands. Common causes include expired APNs certs, closed ports (5223), or local database corruption on the client.',
        industrialUseCase: 'An admin notices 50 Macs aren\'t receiving a new Wi-Fi profile. They check the APNs logs and see a "Token Expired" error, identifying that the user had manually removed a system keychain item.',
        keyTakeaways: [
          'Verify APNs port 5223 is open',
          'Check jamf.log for MDM binary errors',
          'Flush failed commands to re-trigger deployment'
        ]
      }
    ]
  },
  {
    id: 'packaging-automation',
    title: '13. Application Packaging & Automation',
    description: 'Advanced software deployment and repository management.',
    topics: [
      {
        id: 'pkg-dev',
        title: 'Advanced Packaging (Munki/AutoPkg/Composer)',
        shortExplanation: 'Developing and maintaining macOS packages (.pkg, .dmg, .app) using specialized tools.',
        moderateExplanation: 'Manual installation is inefficient. Packaging tools allow you to "wrap" apps for silent, automated deployment. Composer is great for custom snapshots, while AutoPkg automates the downloading of the latest versions.',
        detailedExplanation: 'Admins use Jamf Composer to capture "Diffs"—the files created during a manual install—into a PKG. Munki is often used alongside Jamf for a more robust Self-Service app repository. AutoPkg uses "Recipes" (XML files) to check for updates and build packages automatically.',
        industrialUseCase: 'An admin uses AutoPkg to update Chrome across 2,000 Macs. The recipe runs daily, downloads the latest PKG, and uploads it to Jamf without the admin lifting a finger.',
        keyTakeaways: [
          'Composer captures custom configuration changes',
          'AutoPkg automates the fetch-and-build cycle',
          'Munki provides advanced repository features'
        ]
      },
      {
        id: 'cicd-pipelines',
        title: 'Packaging & Deployment Pipelines',
        shortExplanation: 'Automating deployment pipelines via GitHub Actions or Azure DevOps.',
        moderateExplanation: 'Modern IT uses DevOps. Instead of manually uploading files, packages and scripts are stored in Git. Pipelines then automatically test and deploy these files to the production Jamf server.',
        detailedExplanation: 'A GitHub Action is triggered when a script is pushed to the "Main" branch. The action uses the Jamf Pro API to upload the script. This ensures that every change is version-controlled, reviewed, and tested before it reaches a user\'s Mac.',
        industrialUseCase: 'A global company uses Azure DevOps. When a new version of their internal app is ready, the pipeline builds the PKG, runs a "Sanity Check" on a test Mac, and then promotes it to the global Jamf repository.',
        keyTakeaways: [
          'Version-control all management code (Git)',
          'Automate testing with CI/CD runners',
          'Reduce human error in the deployment cycle'
        ]
      },
      {
        id: 'repo-management',
        title: 'Software Repository Management',
        shortExplanation: 'Maintaining and version-controlling client-specific software repositories.',
        moderateExplanation: 'Organizations need to know exactly which version of software is deployed. Maintaining a clean repository involves organizing apps by version, client, and testing status.',
        detailedExplanation: 'Admins use "Cloud Distribution Points" (CDP) or "Jamf Cloud Distribution Service" (JCDS). Version control in the repo ensures that if a new version breaks things, the admin can instantly roll back to a known-good previous version stored in the manifest.',
        industrialUseCase: 'During a software audit, the admin pulls a report from their version-controlled repository to show exactly when each version of Zoom was approved and deployed over the last year.',
        keyTakeaways: [
          'Keep a historical record of all packages',
          'Use Cloud Distribution for global reach',
          'Implement a clear naming and versioning convention'
        ]
      }
    ]
  },
  {
    id: 'scripting-tooling',
    title: '14. Scripting & Tooling',
    description: 'Custom automation with Python, Zsh, and APIs.',
    topics: [
      {
        id: 'automation-scripts',
        title: 'Bash, Zsh & Python Automation',
        shortExplanation: 'Creating scripts to automate configuration, deployment, and compliance checks.',
        moderateExplanation: 'Scripts are the "Swiss Army Knife" of Mac management. While Zsh is the macOS default, Python is used for more complex logic like data parsing and API communication.',
        detailedExplanation: 'Scripts run as "root" on the client. Admins use Bash/Zsh for system tasks (modifying Plists, setting permissions). Python is preferred for interacting with APIs (using the `requests` library) or handling complex JSON data from inventory reports.',
        industrialUseCase: 'An admin writes a Zsh script that checks the "Battery Health" of a laptop. If health is below 80%, the script triggers an automated ticket in ServiceNow for a replacement.',
        keyTakeaways: [
          'Zsh is the default macOS shell',
          'Python is ideal for complex data/API logic',
          'Test all scripts in a "User Context" vs "Root Context"'
        ]
      },
      {
        id: 'api-workflows',
        title: 'API Automation (Jamf, Intune, Munki)',
        shortExplanation: 'Leveraging APIs to develop custom automation and reporting workflows.',
        moderateExplanation: 'The API allows different management tools to talk to each other. You can use the Jamf API to pull data into a custom dashboard or to trigger actions in Intune based on Jamf inventory.',
        detailedExplanation: 'Jamf Pro uses the Classic API (XML) and the Pro API (JSON). Admins use `curl` or Python to GET device info or POST configuration changes. This enables "Cross-Platform" automation where a change in one system triggers an update in another.',
        industrialUseCase: 'A company uses the Jamf API to automatically move Macs into a "Legal Hold" group when an employee is terminated in the HR system (Workday).',
        keyTakeaways: [
          'Use Jamf Pro API for modern JSON logic',
          'Bridge different tools via API middleware',
          'Secure API credentials with least-privilege'
        ]
      },
      {
        id: 'cicd-promotion',
        title: 'CI/CD & Environment Promotion',
        shortExplanation: 'Promoting changes between client environments (Dev -> Prod) using automation.',
        moderateExplanation: 'You should never test a new policy on a CEO\'s laptop. Environment promotion involves moving a configuration from a "Dev" (Testing) instance to a "Prod" (Production) instance only after it passes checks.',
        detailedExplanation: 'Admins use "Environment Sync" scripts. A policy is created in "Jamf Dev". Once tested, a CI/CD pipeline clones that policy (using the API) to the "Jamf Production" environment, ensuring the settings are identical and human error is removed.',
        industrialUseCase: 'A Mac admin updates a Wi-Fi profile. They push it to the "Dev" Jamf. After 24 hours with no errors, they click "Promote" in their pipeline, and the API copies the profile to the global production server.',
        keyTakeaways: [
          'Maintain separate Dev and Prod instances',
          'Automate policy cloning via API',
          'Ensure testing happens before global rollout'
        ]
      }
    ]
  },
  {
    id: 'security-compliance-adv',
    title: '15. Security & Compliance',
    description: 'Enforcing client-specific security and audit readiness.',
    topics: [
      {
        id: 'security-baselines',
        title: 'Security Baselines & Encryption',
        shortExplanation: 'Enforcing FileVault, password policies, and security baselines.',
        moderateExplanation: 'Security baselines are the "Laws" of the device. Admins use Jamf to enforce disk encryption (FileVault) and ensure that every user has a strong, unique password that complies with corporate policy.',
        detailedExplanation: 'FileVault is enforced via a "Security & Privacy" configuration profile. Jamf escrows the "Personal Recovery Key" (PRK) so IT can unlock the disk if the user forgets their password. Password complexity is enforced via a "Passcode" payload that dictates length, age, and character types.',
        industrialUseCase: 'A financial firm requires a 15-character password. Jamf enforces this. If a user tries to set "password123", the OS blocks them and points them to the security requirements.',
        keyTakeaways: [
          'Always escrow FileVault Recovery Keys',
          'Enforce password age and complexity',
          'Use Config Profiles for unremovable security'
        ]
      },
      {
        id: 'attestation-inventory',
        title: 'Attestation & Inventory Accuracy',
        shortExplanation: 'Implementing device attestation and maintaining accurate inventory for reporting.',
        moderateExplanation: 'How do you know a Mac is actually a corporate Mac? Attestation uses secure hardware to prove the device\'s identity. Accuracy ensures that your compliance reports are truthful.',
        detailedExplanation: 'Device Attestation uses the Secure Enclave to sign a challenge from the MDM. Inventory accuracy is maintained by running "Recon" (inventory updates) daily. This ensures that when an auditor asks for a list of encrypted devices, the data is current.',
        industrialUseCase: 'During a security audit, the admin provides a "Cryptographic Proof" that all 500 laptops are genuine corporate assets and haven\'t been tampered with at the hardware level.',
        keyTakeaways: [
          'Use "Recon" to keep inventory fresh',
          'Hardware-backed attestation is the gold standard',
          'Audit inventory for "Ghost Devices" (stale records)'
        ]
      },
      {
        id: 'vulnerability-remediation',
        title: 'Vulnerability Remediation & Audits',
        shortExplanation: 'Coordinating with security teams to fix vulnerabilities and pass compliance audits.',
        moderateExplanation: 'Security teams find the bugs; IT teams fix them. Remediation involves using Jamf to rapidly deploy patches for "Zero-Day" vulnerabilities and providing proof of the fix for audits.',
        detailedExplanation: 'Remediation is handled by "Urgent Policies" that bypass standard maintenance windows. For audits (like SOC2 or HIPAA), admins generate reports showing the time between a vulnerability being discovered and its successful remediation on the fleet.',
        industrialUseCase: 'A critical "Webkit" vulnerability is found. The security team notifies the Mac Admin. Within 2 hours, a Jamf policy targets all vulnerable Macs with a force-update and provides a progress dashboard to the CSO.',
        keyTakeaways: [
          'Prioritize Zero-Day patching',
          'Maintain a clear "Audit Trail" of all fixes',
          'Coordinate closely with Security/SOC teams'
        ]
      }
    ]
  }
];
