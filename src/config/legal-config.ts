export interface LegalSection {
  id: string;
  title: string;
  content: string; // HTML
}

export interface LegalDocument {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export interface LegalCategory {
  slug: string;
  title: string;
  icon: string;
  documents: LegalDocument[];
}

export const legalCategories: LegalCategory[] = [
  {
    slug: 'terms',
    title: 'Terms of Service',
    icon: 'fileText',
    documents: [
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        description:
          'The complete terms governing your use of the SWEO platform.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'introduction',
            title: 'Introduction',
            content:
              '<p>These SWEO Terms of Service (the "<strong>Agreement</strong>") are entered into by and between the SWEO entity set forth below ("<strong>SWEO</strong>") and the entity or person placing an order for, or accessing, any Services ("<strong>Customer</strong>" or "<strong>you</strong>"). If you are accessing or using the Services on behalf of your company, you represent that you are authorized to accept this Agreement on behalf of your company, and all references to "you" or "Customer" reference your company.</p><p>This Agreement permits Customer to purchase subscriptions to online software-as-a-service products and other services from SWEO pursuant to Order Form(s) (defined below) and sets forth the terms and conditions under which those products and services will be provided. This Agreement includes the <a href="/legal/terms/additional-product-terms">Additional Product Terms</a>, incorporated by reference herein.</p>'
          },
          {
            id: 'effective-date',
            title: 'Effective Date',
            content:
              '<p>The "<strong>Effective Date</strong>" of this Agreement is the date that is the earlier of: (a) Customer\'s initial access to any Services (as defined below) through any online provisioning, registration or order process or (b) the effective date of the first Order Form referencing this Agreement.</p><p>As used in this Agreement, "SWEO" means SWEO AI AB, a Swedish company with offices in Stockholm, Sweden.</p>'
          },
          {
            id: 'modifications',
            title: 'Modifications to this Agreement',
            content:
              '<p><strong>Modifications to this Agreement:</strong> From time to time, SWEO may modify this Agreement. Unless otherwise specified by SWEO, changes become effective for Customer upon renewal of Customer\'s current Subscription Term (as defined below), or entry into a new Order Form. SWEO will use reasonable efforts to notify Customer of the changes through communications via Customer\'s account, email or other means. Customer may be required to click to accept or otherwise agree to the updated Agreement before renewing a Subscription Term or entering into a new Order Form, but in any event continued use of the Services after the updated version of this Agreement goes into effect will constitute Customer\'s acceptance of such updated version.</p>'
          }
        ]
      },
      {
        slug: 'definitions',
        title: 'Definitions',
        description:
          'Key terms and definitions used throughout our legal agreements.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'overview',
            title: 'Overview',
            content:
              '<p>This section defines the key terms used throughout the SWEO Terms of Service and related legal documents. Understanding these definitions is essential for interpreting the agreements correctly.</p>'
          },
          {
            id: 'key-terms',
            title: 'Key Terms',
            content:
              '<p><strong>"Agreement"</strong> means these Terms of Service, including all schedules, exhibits, and addenda attached hereto or incorporated by reference.</p><p><strong>"Customer"</strong> means the entity or individual that has entered into this Agreement with SWEO.</p><p><strong>"Customer Data"</strong> means all data submitted, stored, or processed through the SWEO Services by or on behalf of the Customer.</p><p><strong>"Services"</strong> means the SWEO AI platform and related services made available by SWEO, including any updates and enhancements.</p><p><strong>"Subscription Term"</strong> means the period during which the Customer is authorized to use the Services.</p><p><strong>"User"</strong> means any individual authorized by the Customer to use the Services.</p><p><strong>"Confidential Information"</strong> means all non-public information disclosed by either party to the other that is designated as confidential or should reasonably be considered confidential.</p>'
          }
        ]
      },
      {
        slug: 'sweo-services',
        title: 'SWEO Services',
        description:
          'Description of the services provided by SWEO, including platform features.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'platform',
            title: 'Platform Services',
            content:
              '<p>SWEO provides an AI-powered customer support platform that includes automated conversation handling, knowledge base management, multi-channel deployment, analytics, and workflow automation.</p>'
          },
          {
            id: 'availability',
            title: 'Service Availability',
            content:
              '<p>SWEO strives to provide 99.9% uptime for all production services. Scheduled maintenance windows will be communicated in advance. Emergency maintenance may be performed without prior notice when necessary to protect the integrity of the platform.</p>'
          },
          {
            id: 'modifications',
            title: 'Service Modifications',
            content:
              '<p>SWEO reserves the right to modify, update, or discontinue any part of the Services with reasonable notice. Material changes that negatively impact Customer\'s use will be communicated at least 30 days in advance.</p>'
          }
        ]
      },
      {
        slug: 'customer-data-obligations',
        title: 'Customer Data and Customer Obligations',
        description:
          'Your responsibilities regarding data submitted to the SWEO platform.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'data-ownership',
            title: 'Data Ownership',
            content:
              '<p>Customer retains all rights, title, and interest in and to Customer Data. SWEO does not claim ownership of any Customer Data.</p>'
          },
          {
            id: 'customer-responsibilities',
            title: 'Customer Responsibilities',
            content:
              '<p>Customer is responsible for: (a) the accuracy and quality of Customer Data; (b) ensuring Customer Data does not violate any applicable laws or third-party rights; (c) maintaining appropriate security measures for account credentials; (d) compliance with all applicable data protection regulations.</p>'
          },
          {
            id: 'prohibited-use',
            title: 'Prohibited Use',
            content:
              '<p>Customer shall not use the Services to: (a) transmit unlawful, harmful, or offensive content; (b) engage in activities that violate any applicable law; (c) interfere with or disrupt the Services; (d) reverse engineer or attempt to derive source code from the Services.</p>'
          }
        ]
      },
      {
        slug: 'security',
        title: 'Security',
        description:
          'Security measures and practices for protecting your data on SWEO.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'security-measures',
            title: 'Security Measures',
            content:
              '<p>SWEO implements industry-standard security measures including: encryption in transit (TLS 1.2+) and at rest (AES-256), regular security audits, intrusion detection systems, and access controls based on the principle of least privilege.</p>'
          },
          {
            id: 'incident-response',
            title: 'Incident Response',
            content:
              '<p>In the event of a security breach affecting Customer Data, SWEO will notify the affected Customer within 72 hours of becoming aware of the breach. SWEO maintains a documented incident response plan and will cooperate with Customer in investigating and remediating any security incidents.</p>'
          }
        ]
      },
      {
        slug: 'third-party-platforms',
        title: 'Third-Party Platforms and Third Party Messaging Apps',
        description:
          'Terms regarding integrations with third-party services and messaging platforms.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'integrations',
            title: 'Third-Party Integrations',
            content:
              '<p>The Services may integrate with third-party platforms including but not limited to WhatsApp, Facebook Messenger, Instagram, Slack, Shopify, and Stripe. Use of these integrations is subject to the respective third-party\'s terms of service.</p>'
          },
          {
            id: 'messaging-apps',
            title: 'Messaging Applications',
            content:
              '<p>When using SWEO through third-party messaging applications, Customer acknowledges that messages may be processed and stored by the third-party platform in accordance with their privacy policies. SWEO is not responsible for data handling practices of third-party messaging platforms.</p>'
          },
          {
            id: 'disclaimer',
            title: 'Third-Party Disclaimer',
            content:
              '<p>SWEO does not warrant or guarantee the availability, accuracy, or reliability of any third-party platform. Customer assumes all risk associated with the use of third-party integrations.</p>'
          }
        ]
      },
      {
        slug: 'ownership',
        title: 'Ownership',
        description:
          'Intellectual property rights and ownership of the SWEO platform.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'sweo-ip',
            title: 'SWEO Intellectual Property',
            content:
              '<p>SWEO retains all intellectual property rights in the Services, including all software, algorithms, models, documentation, and other materials. The Agreement does not grant Customer any rights to SWEO\'s intellectual property except the limited license to use the Services.</p>'
          },
          {
            id: 'feedback',
            title: 'Feedback',
            content:
              '<p>If Customer provides feedback or suggestions regarding the Services, SWEO may use such feedback without restriction or obligation to Customer. Customer hereby assigns all rights in such feedback to SWEO.</p>'
          }
        ]
      },
      {
        slug: 'subscription-fees-payment',
        title: 'Subscription Term, Fees & Payment',
        description:
          'Billing, subscription terms, and payment obligations.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'subscription',
            title: 'Subscription Term',
            content:
              '<p>The initial Subscription Term begins on the effective date of the Agreement and continues for the period specified in the applicable order. Unless either party provides written notice of non-renewal at least 30 days prior to the end of the current term, the Subscription will automatically renew for successive periods of the same length.</p>'
          },
          {
            id: 'fees',
            title: 'Fees',
            content:
              '<p>Customer shall pay all fees specified in the applicable order form. Fees are based on the plan selected and are non-refundable except as expressly stated in this Agreement. SWEO may increase fees upon renewal with at least 30 days\' prior written notice.</p>'
          },
          {
            id: 'payment',
            title: 'Payment Terms',
            content:
              '<p>All fees are due within 30 days of invoice date unless otherwise specified. Late payments accrue interest at 1.5% per month or the maximum rate permitted by law. Customer is responsible for all applicable taxes.</p>'
          }
        ]
      },
      {
        slug: 'term-termination',
        title: 'Term and Termination',
        description:
          'Conditions under which the agreement may be terminated.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'termination-for-cause',
            title: 'Termination for Cause',
            content:
              '<p>Either party may terminate this Agreement if the other party: (a) materially breaches the Agreement and fails to cure within 30 days of written notice; or (b) becomes insolvent, makes an assignment for the benefit of creditors, or becomes subject to bankruptcy proceedings.</p>'
          },
          {
            id: 'effect-of-termination',
            title: 'Effect of Termination',
            content:
              '<p>Upon termination: (a) Customer\'s access to the Services will be discontinued; (b) SWEO will make Customer Data available for export for 30 days following termination; (c) after the 30-day period, SWEO may delete Customer Data; (d) all accrued payment obligations survive termination.</p>'
          }
        ]
      },
      {
        slug: 'limited-warranty',
        title: 'Limited Warranty',
        description: 'Warranties and disclaimers for the SWEO Services.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'warranty',
            title: 'Warranty',
            content:
              '<p>SWEO warrants that the Services will perform materially in accordance with the applicable documentation during the Subscription Term. This warranty does not apply to: (a) features identified as beta or preview; (b) issues caused by Customer\'s misuse; (c) third-party integrations.</p>'
          },
          {
            id: 'disclaimer',
            title: 'Disclaimer',
            content:
              '<p>EXCEPT FOR THE EXPRESS WARRANTY ABOVE, THE SERVICES ARE PROVIDED "AS IS." SWEO DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>'
          }
        ]
      },
      {
        slug: 'availability',
        title: 'Availability',
        description: 'Service availability commitments and SLA overview.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'uptime',
            title: 'Uptime Commitment',
            content:
              '<p>SWEO targets 99.9% monthly uptime for production services. Uptime is calculated as total minutes in the month minus downtime minutes, divided by total minutes in the month.</p>'
          },
          {
            id: 'exclusions',
            title: 'Exclusions',
            content:
              '<p>The following are excluded from uptime calculations: (a) scheduled maintenance; (b) force majeure events; (c) issues caused by Customer\'s systems; (d) third-party platform outages.</p>'
          }
        ]
      },
      {
        slug: 'support',
        title: 'Support',
        description: 'Support services included with your subscription.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'support-tiers',
            title: 'Support Tiers',
            content:
              '<p>SWEO offers the following support tiers:</p><ul><li><strong>Standard Support:</strong> Email support with 24-hour response time during business hours.</li><li><strong>Priority Support:</strong> Email and chat support with 4-hour response time, 24/5.</li><li><strong>Enterprise Support:</strong> Dedicated support manager, 1-hour response time for critical issues, 24/7.</li></ul>'
          },
          {
            id: 'scope',
            title: 'Support Scope',
            content:
              '<p>Support covers: platform configuration, troubleshooting, bug reports, and general usage questions. Support does not cover: custom development, third-party integration debugging, or training beyond standard documentation.</p>'
          }
        ]
      },
      {
        slug: 'limitation-of-remedies',
        title: 'Limitation of Remedies and Damages',
        description:
          'Caps and limitations on liability under the agreement.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'limitation',
            title: 'Limitation of Liability',
            content:
              '<p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. SWEO\'S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE AMOUNTS PAID BY CUSTOMER IN THE 12 MONTHS PRECEDING THE CLAIM.</p>'
          }
        ]
      },
      {
        slug: 'indemnification',
        title: 'Indemnification',
        description: 'Mutual indemnification obligations.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'sweo-indemnification',
            title: 'SWEO Indemnification',
            content:
              '<p>SWEO will defend Customer against third-party claims alleging that the Services infringe a valid patent, copyright, or trademark, and will indemnify Customer against any resulting damages awarded.</p>'
          },
          {
            id: 'customer-indemnification',
            title: 'Customer Indemnification',
            content:
              '<p>Customer will defend SWEO against third-party claims arising from: (a) Customer Data; (b) Customer\'s violation of applicable law; or (c) Customer\'s use of the Services in violation of this Agreement.</p>'
          }
        ]
      },
      {
        slug: 'confidential-information',
        title: 'Confidential Information',
        description:
          'Obligations regarding confidential information exchanged between parties.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'obligations',
            title: 'Confidentiality Obligations',
            content:
              '<p>Each party agrees to: (a) protect the other party\'s Confidential Information using at least the same degree of care it uses for its own confidential information; (b) not disclose Confidential Information to third parties except as permitted; (c) use Confidential Information only for purposes of this Agreement.</p>'
          },
          {
            id: 'exclusions',
            title: 'Exclusions',
            content:
              '<p>Confidential Information does not include information that: (a) is or becomes publicly available without breach; (b) was known to the receiving party before disclosure; (c) is independently developed; (d) is disclosed pursuant to legal requirement.</p>'
          }
        ]
      },
      {
        slug: 'publicity',
        title: 'Publicity',
        description: 'Terms regarding public references and case studies.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'publicity',
            title: 'Publicity Rights',
            content:
              '<p>Neither party may use the other party\'s name, logo, or trademarks in marketing materials without prior written consent. SWEO may include Customer\'s name and logo in its customer list unless Customer opts out in writing.</p>'
          }
        ]
      },
      {
        slug: 'general-terms',
        title: 'General Terms',
        description:
          'General legal provisions including governing law and dispute resolution.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'governing-law',
            title: 'Governing Law',
            content:
              '<p>This Agreement is governed by the laws of Sweden, without regard to conflict of law principles. Any disputes arising under this Agreement shall be resolved in the courts of Stockholm, Sweden.</p>'
          },
          {
            id: 'assignment',
            title: 'Assignment',
            content:
              '<p>Neither party may assign this Agreement without the other party\'s prior written consent, except in connection with a merger, acquisition, or sale of substantially all assets.</p>'
          },
          {
            id: 'entire-agreement',
            title: 'Entire Agreement',
            content:
              '<p>This Agreement, together with all referenced documents, constitutes the entire agreement between the parties and supersedes all prior agreements regarding the subject matter hereof.</p>'
          },
          {
            id: 'severability',
            title: 'Severability',
            content:
              '<p>If any provision of this Agreement is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>'
          }
        ]
      },
      {
        slug: 'additional-product-terms',
        title: 'SWEO Additional Product Terms',
        description:
          'Additional terms applicable to specific SWEO products and features.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'ai-features',
            title: 'AI Features',
            content:
              '<p>SWEO\'s AI features use machine learning models to generate responses. Customer acknowledges that AI-generated content may not always be accurate and should be reviewed. SWEO does not guarantee specific resolution rates or accuracy levels for AI features.</p>'
          },
          {
            id: 'fin-ai-agent',
            title: 'Fin AI Agent',
            content:
              '<p>The Fin AI Agent is subject to usage limits based on the Customer\'s subscription plan. Conversations processed by Fin are counted based on unique customer interactions within a 24-hour period.</p>'
          }
        ]
      }
    ]
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    icon: 'shield',
    documents: [
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        description: 'How SWEO collects, uses, and protects your personal data.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'collection',
            title: 'Data Collection',
            content:
              '<p>SWEO collects information you provide directly, including account registration data, communication preferences, and content you submit through the platform. We also collect usage data, device information, and cookies automatically.</p>'
          },
          {
            id: 'use',
            title: 'Use of Data',
            content:
              '<p>We use collected data to: provide and maintain the Services; improve and personalize your experience; communicate with you about your account; comply with legal obligations; and protect against fraud, abuse, and security threats.</p>'
          },
          {
            id: 'sharing',
            title: 'Data Sharing',
            content:
              '<p>We do not sell your personal data. We may share data with: service providers who assist in operating the platform; law enforcement when legally required; and in connection with a merger or acquisition.</p>'
          },
          {
            id: 'rights',
            title: 'Your Rights',
            content:
              '<p>You have the right to: access your personal data; request correction or deletion; object to processing; data portability; and withdraw consent. Contact privacy@sweo.ai to exercise these rights.</p>'
          }
        ]
      },
      {
        slug: 'data-processing-addendum',
        title: 'Data Processing Addendum',
        description:
          'Terms governing SWEO\'s processing of personal data on behalf of customers.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'scope',
            title: 'Scope of Processing',
            content:
              '<p>This Data Processing Addendum (DPA) applies when SWEO processes personal data on behalf of the Customer as a data processor. SWEO will process personal data only in accordance with the Customer\'s documented instructions.</p>'
          },
          {
            id: 'security-measures',
            title: 'Security Measures',
            content:
              '<p>SWEO implements appropriate technical and organizational measures to protect personal data, including encryption, access controls, regular testing, and staff training on data protection.</p>'
          },
          {
            id: 'sub-processors',
            title: 'Sub-processors',
            content:
              '<p>SWEO may engage sub-processors to assist in providing the Services. SWEO will notify Customer of any changes to sub-processors and will ensure sub-processors are bound by data protection obligations no less protective than those in this DPA.</p>'
          },
          {
            id: 'data-transfers',
            title: 'International Data Transfers',
            content:
              '<p>When personal data is transferred outside the EEA, SWEO ensures adequate safeguards are in place, including Standard Contractual Clauses (SCCs) or other approved transfer mechanisms.</p>'
          }
        ]
      },
      {
        slug: 'product-privacy-notice',
        title: 'Product Privacy Notice',
        description:
          'Privacy practices specific to the SWEO product and AI features.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'ai-data',
            title: 'AI and Data Usage',
            content:
              '<p>SWEO\'s AI features process conversation data to generate responses. Customer Data is not used to train SWEO\'s general AI models unless the Customer explicitly opts in. Each tenant\'s data is isolated and processed separately.</p>'
          },
          {
            id: 'retention',
            title: 'Data Retention',
            content:
              '<p>Conversation data is retained for the duration of the Subscription Term plus 30 days. Customers may request earlier deletion. Analytics data is aggregated and anonymized after 90 days.</p>'
          }
        ]
      },
      {
        slug: 'regional-data-hosting',
        title: 'Regional Data Hosting Addendum',
        description:
          'Terms related to data residency and regional hosting options.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'regions',
            title: 'Available Regions',
            content:
              '<p>SWEO offers data hosting in the following regions: European Union (Frankfurt), United States (Virginia), and Australia (Sydney). Enterprise customers may request additional hosting regions.</p>'
          },
          {
            id: 'data-residency',
            title: 'Data Residency',
            content:
              '<p>When a Customer selects a hosting region, all primary Customer Data will be stored and processed within that region. Some metadata may be processed in other regions for platform operations.</p>'
          }
        ]
      },
      {
        slug: 'cookie-policy',
        title: 'Cookie Policy',
        description:
          'Information about cookies and tracking technologies used by SWEO.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'what-cookies',
            title: 'What Are Cookies',
            content:
              '<p>Cookies are small text files placed on your device when you visit our website or use our Services. They help us provide a better experience, remember your preferences, and understand how you use our platform.</p>'
          },
          {
            id: 'types',
            title: 'Types of Cookies We Use',
            content:
              '<ul><li><strong>Essential Cookies:</strong> Required for the platform to function. Cannot be disabled.</li><li><strong>Analytics Cookies:</strong> Help us understand usage patterns and improve the Services.</li><li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li><li><strong>Marketing Cookies:</strong> Used for targeted advertising (only on marketing pages).</li></ul>'
          },
          {
            id: 'manage',
            title: 'Managing Cookies',
            content:
              '<p>You can manage cookie preferences through your browser settings or our cookie consent banner. Disabling certain cookies may affect platform functionality.</p>'
          }
        ]
      },
      {
        slug: 'subprocessors-list',
        title: 'Subprocessors List',
        description:
          'List of third-party subprocessors used by SWEO.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'subprocessors',
            title: 'Current Subprocessors',
            content:
              '<table><thead><tr><th>Subprocessor</th><th>Purpose</th><th>Location</th></tr></thead><tbody><tr><td>Vercel</td><td>Application hosting</td><td>Global (US primary)</td></tr><tr><td>Appwrite</td><td>Database & authentication</td><td>EU (Frankfurt)</td></tr><tr><td>OpenAI</td><td>AI/ML processing</td><td>US</td></tr><tr><td>Pinecone</td><td>Vector database</td><td>US / EU</td></tr><tr><td>Twilio</td><td>Messaging (SMS, WhatsApp, Voice)</td><td>Global</td></tr><tr><td>Sentry</td><td>Error monitoring</td><td>US</td></tr><tr><td>Stripe</td><td>Payment processing</td><td>US / EU</td></tr></tbody></table>'
          }
        ]
      },
      {
        slug: 'data-privacy-framework',
        title: 'Data Privacy Framework Notice',
        description:
          'SWEO\'s participation in the EU-US Data Privacy Framework.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'framework',
            title: 'Framework Participation',
            content:
              '<p>SWEO complies with the EU-US Data Privacy Framework as set forth by the European Commission regarding the transfer of personal data from the EU to the US. SWEO has certified that it adheres to the Data Privacy Framework Principles.</p>'
          }
        ]
      }
    ]
  },
  {
    slug: 'policies',
    title: 'Policies',
    icon: 'clipboard',
    documents: [
      {
        slug: 'support-policy',
        title: 'Support Policy',
        description:
          'Detailed support policy including response times and escalation procedures.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'overview',
            title: 'Overview',
            content:
              '<p>This Support Policy outlines the support services available to SWEO customers. Support is provided based on the Customer\'s subscription plan and selected support tier.</p>'
          },
          {
            id: 'response-times',
            title: 'Response Times',
            content:
              '<table><thead><tr><th>Priority</th><th>Standard</th><th>Priority</th><th>Enterprise</th></tr></thead><tbody><tr><td>Critical (P1)</td><td>4 hours</td><td>1 hour</td><td>30 minutes</td></tr><tr><td>High (P2)</td><td>8 hours</td><td>4 hours</td><td>2 hours</td></tr><tr><td>Medium (P3)</td><td>24 hours</td><td>8 hours</td><td>4 hours</td></tr><tr><td>Low (P4)</td><td>48 hours</td><td>24 hours</td><td>8 hours</td></tr></tbody></table>'
          }
        ]
      },
      {
        slug: 'professional-services',
        title: 'Professional Services Terms',
        description:
          'Terms for consulting, implementation, and training services.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'scope',
            title: 'Scope of Services',
            content:
              '<p>Professional Services include implementation assistance, custom integration development, training, and strategic consulting. All Professional Services are described in a separate Statement of Work (SOW).</p>'
          },
          {
            id: 'fees',
            title: 'Fees',
            content:
              '<p>Professional Services fees are billed at the rates specified in the applicable SOW. Travel expenses, if required, are billed separately at actual cost.</p>'
          }
        ]
      },
      {
        slug: 'website-terms-of-use',
        title: 'SWEO Website Terms of Use',
        description: 'Terms governing the use of the SWEO website.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'use',
            title: 'Permitted Use',
            content:
              '<p>You may access and use the SWEO website for lawful purposes. You agree not to: interfere with the website\'s operation; attempt to gain unauthorized access; scrape or harvest data; or use the website for any unlawful purpose.</p>'
          },
          {
            id: 'content',
            title: 'Website Content',
            content:
              '<p>All content on the SWEO website, including text, graphics, logos, and software, is the property of SWEO and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission.</p>'
          }
        ]
      },
      {
        slug: 'academy-terms',
        title: 'Academy Terms',
        description: 'Terms for using the SWEO Academy learning platform.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'access',
            title: 'Access',
            content:
              '<p>SWEO Academy is available to registered users. Course content is provided for educational purposes and may not be redistributed without permission.</p>'
          },
          {
            id: 'certifications',
            title: 'Certifications',
            content:
              '<p>Certifications earned through SWEO Academy are valid for 12 months. Recertification may be required as the platform evolves.</p>'
          }
        ]
      },
      {
        slug: 'sla',
        title: 'Service Level Agreement',
        description: 'Detailed SLA with uptime commitments and credits.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'uptime',
            title: 'Uptime SLA',
            content:
              '<p>SWEO guarantees 99.9% monthly uptime for production services. If uptime falls below this threshold, Customer may request service credits as described below.</p>'
          },
          {
            id: 'credits',
            title: 'Service Credits',
            content:
              '<table><thead><tr><th>Monthly Uptime</th><th>Service Credit</th></tr></thead><tbody><tr><td>99.0% – 99.9%</td><td>10% of monthly fees</td></tr><tr><td>95.0% – 99.0%</td><td>25% of monthly fees</td></tr><tr><td>Below 95.0%</td><td>50% of monthly fees</td></tr></tbody></table>'
          }
        ]
      },
      {
        slug: 'acceptable-use-policy',
        title: 'Acceptable Use Policy',
        description:
          'Rules for acceptable use of the SWEO platform.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'acceptable-use',
            title: 'Acceptable Use',
            content:
              '<p>Customers must use the SWEO platform in compliance with all applicable laws and regulations. The following activities are prohibited:</p><ul><li>Transmitting malware or harmful code</li><li>Attempting to bypass security measures</li><li>Using the platform for spam or unsolicited communications</li><li>Infringing on third-party intellectual property rights</li><li>Processing data in violation of applicable data protection laws</li></ul>'
          },
          {
            id: 'enforcement',
            title: 'Enforcement',
            content:
              '<p>SWEO reserves the right to suspend or terminate access for violations of this policy. SWEO will provide notice and an opportunity to cure when practicable.</p>'
          }
        ]
      },
      {
        slug: 'code-of-conduct',
        title: 'Code of Conduct',
        description:
          'Expected behavior and standards for the SWEO community.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'standards',
            title: 'Community Standards',
            content:
              '<p>All members of the SWEO community are expected to: treat others with respect; communicate constructively; report violations; and contribute to an inclusive environment. Harassment, discrimination, and abusive behavior are strictly prohibited.</p>'
          }
        ]
      },
      {
        slug: 'trademark-usage',
        title: 'Trademark Usage',
        description: 'Guidelines for using SWEO trademarks and branding.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'guidelines',
            title: 'Trademark Guidelines',
            content:
              '<p>SWEO\'s trademarks, logos, and brand assets may only be used with prior written permission. When permission is granted, you must: use the marks exactly as provided; not modify colors, proportions, or design; include appropriate trademark notices; and not use the marks in a way that implies endorsement without authorization.</p>'
          }
        ]
      },
      {
        slug: 'anti-corruption',
        title: 'SWEO Global Anti-Corruption Statement',
        description:
          'SWEO\'s commitment to anti-corruption and ethical business practices.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'statement',
            title: 'Anti-Corruption Commitment',
            content:
              '<p>SWEO is committed to conducting business ethically and in compliance with all applicable anti-corruption laws. SWEO prohibits bribery, kickbacks, and any form of corrupt practices. All employees and partners are expected to comply with this commitment.</p>'
          }
        ]
      },
      {
        slug: 'partner-code-of-conduct',
        title: 'SWEO Partner Code of Conduct',
        description:
          'Standards and expectations for SWEO\'s business partners.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'expectations',
            title: 'Partner Expectations',
            content:
              '<p>SWEO partners are expected to: comply with all applicable laws; maintain ethical business practices; protect SWEO\'s confidential information; respect intellectual property rights; and promptly report any violations or concerns.</p>'
          }
        ]
      },
      {
        slug: 'dmca-policy',
        title: 'SWEO DMCA Policy',
        description:
          'Policy for reporting copyright infringement claims.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'reporting',
            title: 'Reporting Infringement',
            content:
              '<p>If you believe content on SWEO infringes your copyright, please send a DMCA notice to legal@sweo.ai including: identification of the copyrighted work; identification of the infringing material; your contact information; a statement of good faith belief; and a statement under penalty of perjury that the information is accurate.</p>'
          },
          {
            id: 'counter-notice',
            title: 'Counter-Notice',
            content:
              '<p>If you believe your content was removed in error, you may submit a counter-notice containing: identification of the removed material; a statement under penalty of perjury; your contact information; and consent to jurisdiction.</p>'
          }
        ]
      },
      {
        slug: 'law-enforcement',
        title: 'Law Enforcement Guidelines',
        description:
          'Guidelines for law enforcement requests for user data.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'requests',
            title: 'Law Enforcement Requests',
            content:
              '<p>SWEO responds to valid legal process from law enforcement agencies. Requests must be submitted through official channels. SWEO will notify affected customers unless prohibited by law. Emergency requests may be expedited when there is imminent danger.</p>'
          }
        ]
      },
      {
        slug: 'eu-digital-services-act',
        title: 'European Digital Services Act Notice',
        description:
          'SWEO\'s compliance with the EU Digital Services Act.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'compliance',
            title: 'DSA Compliance',
            content:
              '<p>In compliance with the European Digital Services Act (DSA), SWEO provides transparent information about content moderation practices, designates a point of contact for authorities, and maintains mechanisms for reporting illegal content.</p>'
          }
        ]
      },
      {
        slug: 'fin-guarantee',
        title: 'Fin Guarantee',
        description:
          'SWEO\'s quality guarantee for the Fin AI Agent.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'guarantee',
            title: 'Fin Quality Guarantee',
            content:
              '<p>SWEO stands behind the quality of the Fin AI Agent. If Fin does not meet the agreed-upon resolution rate targets within the first 90 days, SWEO will provide additional onboarding support at no extra cost. This guarantee applies to customers on Professional and Enterprise plans.</p>'
          }
        ]
      },
      {
        slug: 'referral-program',
        title: 'Referral Program',
        description:
          'Terms and conditions for the SWEO referral program.',
        lastUpdated: '2026-01-15',
        sections: [
          {
            id: 'program-details',
            title: 'Program Details',
            content:
              '<p>SWEO\'s referral program allows existing customers to refer new customers and earn credits. Referral credits are applied to the referring customer\'s account once the referred customer completes their first paid month. Credits cannot be exchanged for cash and expire after 12 months.</p>'
          },
          {
            id: 'eligibility',
            title: 'Eligibility',
            content:
              '<p>The referral program is available to customers in good standing on paid plans. Self-referrals are not permitted. SWEO reserves the right to modify or terminate the referral program at any time.</p>'
          }
        ]
      }
    ]
  }
];

// Helper functions (mirror docs-config pattern)
export function findLegalDocument(categorySlug: string, documentSlug: string) {
  const cat = legalCategories.find((c) => c.slug === categorySlug);
  if (!cat) return null;
  const doc = cat.documents.find((d) => d.slug === documentSlug);
  if (!doc) return null;
  return { category: cat, document: doc };
}

export function getAllLegalPaths() {
  return legalCategories.flatMap((cat) =>
    cat.documents.map((d) => ({ category: cat.slug, slug: d.slug }))
  );
}

export function getAdjacentLegalDocuments(
  categorySlug: string,
  documentSlug: string
) {
  const all = legalCategories.flatMap((cat) =>
    cat.documents.map((d) => ({ category: cat, document: d }))
  );
  const idx = all.findIndex(
    (x) =>
      x.category.slug === categorySlug && x.document.slug === documentSlug
  );
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null
  };
}
