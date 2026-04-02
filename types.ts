
export interface AdMetric {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  installs: number;
  purchases: number;
  messages: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  date: string;
  // Video metrics
  hookRate: number;
  holdRate: number;
  view100Rate: number;
  videoPlays: number;
}

export interface AdDetail {
  adName: string;
  spend: number;
  results: number;
  costPerResult: number;
  impressions: number;
  hookRate: number;
  holdRate: number;
  videoPlays100: number;
  view100Rate: number;
  performanceScore: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  type: 'APP_DOWNLOAD' | 'WHATSAPP_MESSAGE' | 'FORM_SUBMIT';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  results: number;
  costPerResult: number;
  ctr: number;
  hookRate: number;
  holdRate: number;
  videoPlays100: number;
  view100Rate: number;
  performanceScore: number;
  startDate: string;
  roas: number;
  cpa: number;
  ads: AdDetail[];
}

export interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

export enum DashboardTab {
  OVERVIEW = 'overview',
  CREATIVE = 'creative',
  AUDIENCE = 'audience',
  FUNNEL = 'funnel',
  AI_INSIGHTS = 'ai_insights',
  UA_VAULT = 'ua_vault',
  INFLUENCER_CRM = 'influencer_crm',
  SCRIPTING_AGENT = 'scripting_agent',
  SETTINGS = 'settings'
}

export interface BharatCampaign {
  id: string; // UUID
  brand: string;
  campaignName: string;
  angle: string; // "Angle Taken"
  strategicWhy: string;
  zoopActionability: string; // "Yes/No" + reasoning
  culturalPotential: string;
  sourceUrl: string;
  dateFound: string; // ISO Timestamp
}

// Replaces MarketTrend/MarketCampaign
export interface MarketNewsItem {
  id: string; // Unique UUID
  brand: string; // e.g., "Meesho"
  campaignTitle: string; // e.g., "Sahi Sahi Lagaya Hai"
  hookType: string; // e.g., "Money-led", "Peer Trust", "Nostalgia"
  bharatAngle: string; // Analysis of interaction with Tier 2 audience
  sourceUrl: string; // Valid URL to the source
  dateFound: string; // ISO Timestamp
  summary: string; // Brief description
}

export interface AIInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  content: string; // Internal monologue
  hookVibe: string; // standardized: Hook Type
  emotionalAngle: string; // standardized: Primary Emotional Angle
  productionStyle: string; // standardized: Production Vibe
  videoLengthCategory: string; // standardized: Video Length Category
  strategicWhy: string;
  backgroundAnalysis: string;
  recommendation: string;
  date: string;
}

export interface MasterInsight {
  summary: string;
  futureHookDirection: string;
  contentTypeStrategy: string;
  editingEvolution: string;
  experiments: string;
  newPersonas: string;
  date: string;
}

export interface MarketCampaign {
  brand: string;
  campaignName: string;
  description: string;
  relevanceReason: string;
  url?: string;
}

export interface MarketTrend {
  id: string;
  timestamp: string;
  lever: string; // The "Hook" or "Trend" name
  relevanceScore: number;
  summary: string;
  campaigns: MarketCampaign[];
}
