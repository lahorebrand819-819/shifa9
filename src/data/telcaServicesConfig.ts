import { PricingPackage, ServiceItem } from '../types';

export interface TelcaServiceDefinition {
  id: string;
  name: string;
  tabLabel: string;
  shortExplanation: string;
  category: 'ads' | 'social' | 'creative' | 'dev' | 'ai';
  icon: string;
  deliverableTime: string;
  highlightBadge?: string;
  starter: {
    name: string;
    priceUSD: number;
    billingType: 'month' | 'project';
    shortDescription: string;
    features: string[];
    ctaText: string;
  };
  medium: {
    name: string;
    priceUSD: number;
    billingType: 'month' | 'project';
    shortDescription: string;
    features: string[];
    ctaText: string;
    isPopular: boolean;
    badgeText: string;
  };
  growth: {
    name: string;
    priceUSD: number;
    billingType: 'month' | 'project';
    shortDescription: string;
    features: string[];
    ctaText: string;
  };
  custom: {
    title: string;
    description: string;
    ctaText: string;
  };
}

export const TELCA_SERVICES: TelcaServiceDefinition[] = [
  // 1. META ADS
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    tabLabel: 'Meta Ads',
    shortExplanation: 'Targeted Facebook & Instagram advertising engineered for direct-response sales, lead generation, and ROAS scaling.',
    category: 'ads',
    icon: 'Megaphone',
    deliverableTime: '3-5 Days setup',
    highlightBadge: 'High ROAS',
    starter: {
      name: 'Starter',
      priceUSD: 179,
      billingType: 'month',
      shortDescription: 'Targeted ad setup with custom audience research, conversion tracking, and bi-weekly campaign optimization.',
      features: [
        'Meta Pixel & CAPI Conversion Setup',
        'Target Audience & Lookalike Mapping',
        '2 Ad Sets & 6 Creative Variations',
        'A/B Copy & Headline Testing',
        'Bi-Weekly Budget & Bid Adjustments',
        'Bi-Weekly Performance Report'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 299,
      billingType: 'month',
      shortDescription: 'Full-funnel Meta advertising across Feed, Stories, and Reels with advanced retargeting and creative iteration.',
      features: [
        'Full Top-to-Bottom Conversion Funnel',
        'Dynamic Product Ads (Catalog Integration)',
        'Custom Creative Hook & Video Testing',
        'Weekly ROAS & CPA Scaling Audits',
        'Automated Exclusion & Retargeting Rules',
        'Weekly Strategy & Analytics Review'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 449,
      billingType: 'month',
      shortDescription: 'Aggressive multi-campaign scaling for brands aiming to maximize daily return on ad spend with high-volume creative testing.',
      features: [
        'Unlimited Ad Sets & Scaling Budgets',
        'Advanced Advantage+ Shopping Campaigns',
        'Rapid-Fire Creative Refresh Cycles',
        'Omni-Angle Hook Iterations & Angles',
        'Dedicated Media Buyer on Slack / WhatsApp',
        'Real-Time Live Dashboard Access'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan tailored to your exact ad spend targets and conversion architecture.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 2. GOOGLE ADS
  {
    id: 'google-ads',
    name: 'Google Ads',
    tabLabel: 'Google Ads',
    shortExplanation: 'High-intent Google Search, Shopping, and Performance Max campaigns capturing active buyers ready to purchase.',
    category: 'ads',
    icon: 'Target',
    deliverableTime: '3-5 Days setup',
    highlightBadge: 'High Intent',
    starter: {
      name: 'Starter',
      priceUSD: 249,
      billingType: 'month',
      shortDescription: 'High-intent Google Search advertising targeting users actively looking for your exact services and products.',
      features: [
        'High-Intent Keyword Research & Selection',
        'Negative Keyword Shielding List',
        'Ad Extensions & Sitelinks Setup',
        'Google Tag Manager Conversion Tracking',
        'Bi-Weekly Search Term Optimization',
        'Monthly Search Performance Report'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 349,
      billingType: 'month',
      shortDescription: 'Combined Search and Google Performance Max campaigns covering YouTube, Gmail, Maps, and Display networks.',
      features: [
        'Performance Max (PMax) Architecture',
        'Search + Display Remarketing Setup',
        'Conversion Value / ROAS Bidding Strategy',
        'Ad Copy Testing & Responsive Ad Assets',
        'Weekly Search Query Harvesting',
        'Weekly Performance Review'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 549,
      billingType: 'month',
      shortDescription: 'Comprehensive multi-tier search, Shopping, YouTube in-stream, and Display network takeover with competitive conquesting.',
      features: [
        'Multi-Tier Search & Shopping Campaigns',
        'Competitor Brand Keyword Conquesting',
        'YouTube Video Action & Discovery Ads',
        'Advanced Offline / CRM Conversion Sync',
        'Dedicated Google Partner Media Buyer',
        'Weekly Executive Strategy Sessions'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan tailored for multi-region Google Ads or large product catalogs.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 3. EMAIL MARKETING
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    tabLabel: 'Email Marketing',
    shortExplanation: 'Automated revenue retention funnels, abandoned cart recovery, and high-converting segmented promotional newsletters.',
    category: 'ads',
    icon: 'Mail',
    deliverableTime: '5-7 Days setup',
    highlightBadge: 'Top Retention',
    starter: {
      name: 'Starter',
      priceUSD: 149,
      billingType: 'month',
      shortDescription: 'Essential automated flows to recover lost visitors, welcome new subscribers, and build dependable repeat sales.',
      features: [
        'Welcome Series Automated Flow',
        'Abandoned Cart Recovery Sequence',
        '2 Monthly Broadcast Campaigns',
        'Custom Responsive HTML Email Design',
        'List Hygiene & Bounce Management',
        'Monthly Deliverability & Open Audit'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 199,
      billingType: 'month',
      shortDescription: 'Full automated email lifecycle system with post-purchase sequences, customer win-backs, and weekly promotional newsletters.',
      features: [
        'Customer Win-back & Lapsed Sequences',
        'VIP Post-Purchase Upsell Flows',
        '4 Monthly High-Converting Broadcasts',
        'Dynamic Segmentation by Buyer Behavior',
        'A/B Subject Line & Preview Testing',
        'Klaviyo / Mailchimp / Brevo Setup'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 249,
      billingType: 'month',
      shortDescription: 'Advanced behavioral segmentation, VIP loyalty journeys, SMS integration, and revenue-maximizing cohort optimization.',
      features: [
        '8 Monthly Custom Designed Broadcasts',
        'Predictive Churn & Replenishment Flows',
        'SMS Automated Trigger Integration',
        'Deliverability Domain Warming (DKIM/DMARC)',
        'Dedicated Copywriter & Email Designer',
        'Bi-Weekly Revenue Cohort Reporting'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for enterprise subscriber lists, custom CRM integrations, or multi-brand email ops.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 4. AI CREATIVE & ADS
  {
    id: 'ai-creative',
    name: 'AI Creative & Ads',
    tabLabel: 'AI Creative & Ads',
    shortExplanation: 'High-impact AI-enhanced image creatives, direct-response copy variations, and thumb-stopping motion assets.',
    category: 'creative',
    icon: 'Sparkles',
    deliverableTime: '3-5 Days',
    highlightBadge: 'High Engagement',
    starter: {
      name: 'Starter',
      priceUSD: 149,
      billingType: 'month',
      shortDescription: 'High-impact AI-enhanced image creatives and compelling ad copy variations tailored to break scroll fatigue.',
      features: [
        '8 AI-Rendered Static Ad Creatives/mo',
        '3 Compelling Hook Variations per Asset',
        'Visual Product Mockup Staging',
        'Square, Vertical & Story Formats',
        'Copy Iterations (Short & Long Form)',
        'Monthly Creative Performance Review'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 269,
      billingType: 'month',
      shortDescription: 'Combination of AI motion graphics, talking-head avatar hooks, and dynamic multi-format ad creative packs.',
      features: [
        '16 High-Res AI Creative Assets/mo',
        '4 AI Motion & Video Hook Variations',
        'Trend-Jacking Meme & Organic Formats',
        'UGC Script Frameworks & Voiceovers',
        'Direct-Response CTA Testing',
        'Bi-Weekly Creative Refresh Pack'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 349,
      billingType: 'month',
      shortDescription: 'High-volume creative production engine testing hundreds of visual hooks, angles, and sensory cues every month.',
      features: [
        '30+ Custom AI Ad Assets & Videos/mo',
        'Multi-Language Creative Localization',
        '3D Product Staging & Hyper-Realistic Models',
        'Custom Brand Typography & Style Training',
        'Rapid Turnaround Testing Sprints',
        'Full Commercial IP & Source Assets'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for high-velocity creative testing at enterprise ad-spend scale.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 5. SOCIAL MEDIA MARKETING
  {
    id: 'social-media',
    name: 'Social Media Marketing',
    tabLabel: 'Social Media',
    shortExplanation: 'Consistent brand storytelling, vertical video reels, graphic carousels, and community engagement across all platforms.',
    category: 'social',
    icon: 'Share2',
    deliverableTime: 'Ongoing monthly',
    highlightBadge: 'Brand Presence',
    starter: {
      name: 'Starter',
      priceUSD: 129,
      billingType: 'month',
      shortDescription: 'Clean, professional social presence with curated graphics, strategic caption writing, and active hashtag research.',
      features: [
        '12 Branded Posts per Month',
        'Custom Graphic Design & Templates',
        'Engaging Captions & Strategic Hashtags',
        'Content Scheduling on 2 Channels',
        'Profile Bio & Link-in-Bio Optimization',
        'Monthly Audience Growth Report'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 189,
      billingType: 'month',
      shortDescription: 'Dynamic storytelling with short-form vertical video reels, carousel breakdowns, and targeted community engagement.',
      features: [
        '20 Branded Posts + 6 Reels per Month',
        'Cross-Posting across 3 Platforms',
        'Story Posts & Interactive Polls',
        'Active Community DM & Comment Engagement',
        'Competitor Benchmarking & Trend Alerts',
        'Bi-Weekly Content Calendar Review'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 299,
      billingType: 'month',
      shortDescription: 'Daily multi-platform content distribution, viral video hooks, influencer partnerships, and aggressive audience expansion.',
      features: [
        'Daily High-Res Posts & 12 Viral Reels/mo',
        'Full Coverage: IG, FB, TikTok & LinkedIn',
        'Influencer Collab Outreach & Sourcing',
        'Dedicated Social Media Manager',
        'Reputation Management & Crisis Response',
        'Weekly Growth & Engagement Sync'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan with on-site shoots, celebrity influencers, or multi-market social teams.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 6. AI AUTOMATION
  {
    id: 'ai-automation',
    name: 'AI Automation',
    tabLabel: 'AI Automation',
    shortExplanation: 'Intelligent lead routing, WhatsApp & CRM integrations, automated booking systems, and 24/7 qualification chatbots.',
    category: 'ai',
    icon: 'Cpu',
    deliverableTime: '7-14 Days setup',
    highlightBadge: 'Efficiency Engine',
    starter: {
      name: 'Starter',
      priceUSD: 299,
      billingType: 'project',
      shortDescription: 'Connect your website, ads, and lead forms directly to WhatsApp, email, and Google Sheets with instant auto-replies.',
      features: [
        'Instant Lead Alert Flow (WhatsApp/Email/Slack)',
        'Google Sheets / CRM Data Synchronization',
        'Smart Auto-Reply Email Sequence',
        'Make.com / Zapier / n8n Workflow Build',
        '30-Day Post-Launch Bug Warranty',
        'Video Walkthrough & Handover'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 399,
      billingType: 'project',
      shortDescription: 'Intelligent AI chatbot trained on your company data to qualify inbound leads 24/7 and book appointments automatically.',
      features: [
        'Custom Trained AI Support & Sales Agent',
        'Automated Calendly / Booking Integration',
        'Lead Scoring & Qualification Routing',
        'Multi-Step CRM Pipeline Automation',
        'Website & WhatsApp Integration',
        '60-Day Optimization & Maintenance'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 699,
      billingType: 'project',
      shortDescription: 'Bespoke multi-system AI automation: inventory alerts, proposal generation, automated onboarding, and financial reconciliation.',
      features: [
        'Complete Client Onboarding Automated Pipeline',
        'AI Proposal & Contract Generation Tool',
        'Custom Webhook & API Bridge Development',
        'Database Sync & Error Recovery Shield',
        'Staff Training & Documentation Manual',
        '90-Day VIP Priority Technical Support'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for proprietary LLM agents, ERP integrations, or full business operating system automation.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 7. AI WEB DEVELOPMENT
  {
    id: 'ai-web-dev',
    name: 'AI Web Development',
    tabLabel: 'AI Web Development',
    shortExplanation: 'Ultra-fast responsive websites and high-converting landing pages built with modern React, Tailwind, and full SEO optimization.',
    category: 'dev',
    icon: 'Globe',
    deliverableTime: '10-20 Days',
    highlightBadge: 'Fast & Modern',
    starter: {
      name: 'Starter',
      priceUSD: 249,
      billingType: 'project',
      shortDescription: 'Clean, modern, responsive landing page engineered for fast loading speeds and direct lead conversions.',
      features: [
        'Bespoke Responsive Landing Page',
        'Mobile-First Layout & Fast Loading',
        'Direct Lead Inquiry / WhatsApp Integration',
        'Basic On-Page SEO & Meta Tags',
        'Domain & Hosting Setup Support',
        '14-Day Post-Launch Revisions'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 399,
      billingType: 'project',
      shortDescription: 'Complete corporate website with modern animations, services showcase, case study catalog, and CMS integration.',
      features: [
        'Up to 5 Custom Tailored Web Pages',
        'Modern Interactive UI & Motion Effects',
        'Content Management System (CMS)',
        'Google Analytics & Pixel Tracking Setup',
        '100/100 Core Web Vitals Optimization',
        '30-Day Support & Maintenance'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 679,
      billingType: 'project',
      shortDescription: 'High-performance e-commerce store or custom web platform with multi-currency checkout, dynamic filtering, and custom API integrations.',
      features: [
        'Full E-Commerce / Custom Web App',
        'Multi-Currency Payment Gateway Integration',
        'Advanced Product Catalog & Filtering',
        'AI Search & Personalized Recommendations',
        'Custom Admin Management Dashboard',
        '60-Day Technical Maintenance & Backups'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for enterprise web applications, complex SaaS portals, or custom headless stores.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 8. CONTENT WRITING
  {
    id: 'content-writing',
    name: 'Content Writing',
    tabLabel: 'Content Writing',
    shortExplanation: 'Authoritative SEO blog articles, high-converting sales letters, landing page copy, and persuasive customer nurture sequences.',
    category: 'creative',
    icon: 'PenTool',
    deliverableTime: '3-7 Days',
    highlightBadge: 'SEO & Copy',
    starter: {
      name: 'Starter',
      priceUSD: 49,
      billingType: 'project',
      shortDescription: 'Well-researched, engaging 1,200-word SEO article optimized with targeted keywords to drive organic search traffic.',
      features: [
        '1 In-Depth SEO Article (up to 1,200 words)',
        'Primary & Secondary Keyword Integration',
        'Catchy Titles & Optimized Meta Description',
        'Internal & External Link Recommendations',
        'Grammar & Plagiarism Clean Guarantee',
        '2 Revisions Included'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 79,
      billingType: 'project',
      shortDescription: '3 comprehensive SEO blog posts or complete website copy overhaul for up to 4 core landing pages.',
      features: [
        '3 High-Intent Blog Posts OR 4 Page Web Copy',
        'Competitor Content Gap Research',
        'High-Converting Benefit-Driven Headlines',
        'Featured Snippet & FAQ Schema Optimization',
        'Social Media Teaser Snippets Included',
        'Unlimited Minor Polish Revisions'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 129,
      billingType: 'project',
      shortDescription: 'High-converting sales page copy, persuasive email sequence, or comprehensive industry eBook lead magnet designed to generate qualified leads.',
      features: [
        'Full Long-Form Sales Letter OR 15-Page eBook',
        '5-Part Nurture Email Autoresponder Copy',
        'Customer Psychology & Objection Inversion',
        'Irresistible Offer Framing & Guarantees',
        'Direct-Response Conversion Specialist Written',
        'Dedicated Polish & Hook Iterations'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for full programmatic SEO article clusters, brand whitepapers, or omni-channel copy suites.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 9. TIKTOK ADS
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    tabLabel: 'TikTok Ads',
    shortExplanation: 'High-velocity TikTok Spark Ads, UGC creator hook testing, sound & trend amplification, and TikTok Shop conversion scaling.',
    category: 'social',
    icon: 'Video',
    deliverableTime: '3-5 Days setup',
    highlightBadge: 'Viral Growth',
    starter: {
      name: 'Starter',
      priceUSD: 129,
      billingType: 'month',
      shortDescription: 'TikTok Ads Manager account configuration, pixel setup, interest targeting, and campaign launch for young demographic acquisition.',
      features: [
        'TikTok Pixel & Events API Setup',
        'Target Audience & Hashtag Clustering',
        '2 Active Campaigns with 4 Creative Hooks',
        'Spark Ads Integration with Organic Videos',
        'Bi-Weekly Bid & Budget Optimization',
        'Monthly TikTok Ads Performance Report'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 199,
      billingType: 'month',
      shortDescription: 'UGC creative briefing, Spark Ads scaling, custom audience retargeting, and continuous creative testing on TikTok.',
      features: [
        'UGC Script Writing & Creator Guidelines',
        'Spark Ads Organic Amplification',
        'Retargeting & Lookalike Audience Engine',
        'Fast Sound & Trend Integration',
        'Weekly CPA / ROAS Scaling Audits',
        'Bi-Weekly Creative Strategy Calls'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 249,
      billingType: 'month',
      shortDescription: 'High-budget TikTok scaling, rapid hook variations, influencer spark campaigns, and e-commerce shopping ad integration.',
      features: [
        'TikTok Shop & Catalog Ads Integration',
        'High-Volume Hook & Audio Testing',
        'Daily Bid Adjustments & Pacing Control',
        'Competitor TikTok Creative Surveillance',
        'Dedicated TikTok Specialist Support',
        'Real-Time Performance Dashboard'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for celebrity TikTok creator campaigns, TikTok Shop live stream support, or international market expansion.',
      ctaText: 'Request Custom Plan'
    }
  },

  // 10. LINKEDIN ADS
  {
    id: 'linkedin-ads',
    name: 'LinkedIn Ads',
    tabLabel: 'LinkedIn Ads',
    shortExplanation: 'Precision B2B decision-maker targeting by job seniority and company size, Account-Based Marketing (ABM), and pipeline generation.',
    category: 'ads',
    icon: 'Briefcase',
    deliverableTime: '3-5 Days setup',
    highlightBadge: 'B2B Authority',
    starter: {
      name: 'Starter',
      priceUSD: 199,
      billingType: 'month',
      shortDescription: 'Precision B2B targeting by job title, company size, and industry with native LinkedIn Lead Gen Forms.',
      features: [
        'LinkedIn Insight Tag & Conversion Tracking',
        'Job Title, Seniority & Company Size Mapping',
        'Single Image & Document Carousel Ads',
        'Native Lead Gen Form Integration',
        'Bi-Weekly Audience Bid Management',
        'Monthly B2B Pipeline Review'
      ],
      ctaText: 'Get Started'
    },
    medium: {
      name: 'Medium',
      priceUSD: 399,
      billingType: 'month',
      shortDescription: 'Targeted Account-Based Marketing campaigns focusing on decision-makers at specific target enterprise accounts.',
      features: [
        'Matched Audience & Target Account (ABM) Upload',
        'Thought Leader Ad Format Amplification',
        'Message / InMail Sponsored Campaigns',
        'Website Retargeting & Engagement Audiences',
        'Weekly Cost-per-Qualified-Lead Optimization',
        'Bi-Weekly Executive Strategy Sync'
      ],
      ctaText: 'Get Started',
      isPopular: true,
      badgeText: 'Most Popular'
    },
    growth: {
      name: 'Growth',
      priceUSD: 599,
      billingType: 'month',
      shortDescription: 'Comprehensive high-stakes enterprise ABM campaigns targeting C-Suite executives with whitepapers, webinars, and personalized pitches.',
      features: [
        'C-Suite Enterprise Conquest Campaigns',
        'Webinar & Whitepaper Lead Funnel Setup',
        'Direct CRM Sync (HubSpot / Salesforce / Sheets)',
        'Multi-Format Thought Leadership Funnel',
        'Dedicated Senior B2B Strategist',
        'Weekly Deal-Flow & Pipeline Attribution'
      ],
      ctaText: 'Choose Growth'
    },
    custom: {
      title: 'Need something more specific?',
      description: 'Tell us what your business needs and we\'ll create a custom plan for Fortune 500 ABM pursuit, dedicated SDR alignment, or high-touch executive deal pipelines.',
      ctaText: 'Request Custom Plan'
    }
  }
];

// Helper to convert to ServiceItem list
export const TELCA_SERVICE_ITEMS: ServiceItem[] = TELCA_SERVICES.map((s, idx) => ({
  id: s.id,
  title: s.name,
  category: s.category,
  description: s.shortExplanation,
  icon: s.icon,
  image: getServiceImage(s.id),
  startingPriceUSD: s.starter.priceUSD,
  startingPricePKR: s.starter.priceUSD * 280,
  startingPriceGBP: Math.round(s.starter.priceUSD * 0.79),
  enabled: true,
  displayOrder: idx + 1,
  deliverableTime: s.deliverableTime,
  highlightBadge: s.highlightBadge,
  features: s.starter.features.slice(0, 4)
}));

function getServiceImage(id: string): string {
  switch (id) {
    case 'meta-ads':
      return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80';
    case 'google-ads':
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
    case 'email-marketing':
      return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
    case 'ai-creative':
      return 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80';
    case 'social-media':
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80';
    case 'ai-automation':
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    case 'ai-web-dev':
      return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
    case 'content-writing':
      return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';
    case 'tiktok-ads':
      return 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&auto=format&fit=crop&q=80';
    case 'linkedin-ads':
      return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
  }
}
