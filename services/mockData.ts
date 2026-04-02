
import { Campaign, AdMetric, FunnelStage } from '../types';

export const generateCampaigns = (accountType: 'zoop-india' | 'zoop-global' | 'zoop-beta'): Campaign[] => {
  // zoop-india mostly WHATSAPP_MESSAGE
  // zoop-global mostly APP_DOWNLOAD
  
  const baseCampaigns: Campaign[] = [
    {
      id: 'c1',
      name: 'Seller Onboarding | Delhi NCR | WhatsApp',
      status: 'ACTIVE',
      type: 'WHATSAPP_MESSAGE',
      budget: 25000,
      spend: 18450.50,
      impressions: 42000,
      clicks: 1240,
      results: 450, // Messages
      costPerResult: 41.00,
      ctr: 0.0295,
      hookRate: 0.28,
      holdRate: 0.12,
      // Added missing metrics for Campaign type
      videoPlays100: 1500,
      performanceScore: 420, // 1500 * 0.28
      // Fix: Replace avgViewTime with required view100Rate
      view100Rate: 0.0357,
      startDate: '2026-02-10',
      roas: 2.8,
      cpa: 41.00,
      // Fix: Added missing ads property
      ads: []
    },
    {
      id: 'c2',
      name: 'Buyer App Install | Pan India | Tier 1',
      status: 'ACTIVE',
      type: 'APP_DOWNLOAD',
      budget: 75000,
      spend: 42100.20,
      impressions: 185000,
      clicks: 4200,
      results: 1850, // Downloads
      costPerResult: 22.75,
      ctr: 0.0227,
      hookRate: 0.35,
      holdRate: 0.18,
      // Added missing metrics for Campaign type
      videoPlays100: 5200,
      performanceScore: 1820, // 5200 * 0.35
      // Fix: Replace avgViewTime with required view100Rate
      view100Rate: 0.0281,
      startDate: '2026-02-05',
      roas: 4.1,
      cpa: 22.75,
      // Fix: Added missing ads property
      ads: []
    },
    {
      id: 'c3',
      name: 'Seller Reactivation | Mumbai | WhatsApp',
      status: 'ACTIVE',
      type: 'WHATSAPP_MESSAGE',
      budget: 10000,
      spend: 4500,
      impressions: 12000,
      clicks: 450,
      results: 98,
      costPerResult: 45.91,
      ctr: 0.0375,
      hookRate: 0.22,
      holdRate: 0.08,
      // Added missing metrics for Campaign type
      videoPlays100: 450,
      performanceScore: 99, // 450 * 0.22
      // Fix: Replace avgViewTime with required view100Rate
      view100Rate: 0.0375,
      startDate: '2026-02-12',
      roas: 1.5,
      cpa: 45.91,
      // Fix: Added missing ads property
      ads: []
    }
  ];

  if (accountType === 'zoop-global') {
    return baseCampaigns.map(c => ({
      ...c,
      type: 'APP_DOWNLOAD',
      name: c.name.replace('WhatsApp', 'App Install'),
      costPerResult: c.costPerResult / 2, // Simulating global variation
      cpa: c.cpa / 2,
    }));
  }

  return baseCampaigns;
};

export const generateTimeSeries = (): AdMetric[] => {
  const dates = ['Feb 8', 'Feb 9', 'Feb 10', 'Feb 11', 'Feb 12', 'Feb 13', 'Feb 14'];
  return dates.map((date, i) => ({
    id: `m${i}`,
    name: 'Total Performance',
    spend: 2000 + Math.random() * 5000,
    impressions: 10000 + Math.random() * 50000,
    clicks: 300 + Math.random() * 1000,
    conversions: 10 + Math.random() * 40,
    installs: 50 + Math.random() * 200,
    messages: 30 + Math.random() * 150,
    purchases: 5 + Math.random() * 10,
    ctr: 0.02 + Math.random() * 0.03,
    cpc: 20 + Math.random() * 20,
    cpa: 40 + Math.random() * 30,
    roas: 2 + Math.random() * 4,
    date,
    hookRate: 0.25 + Math.random() * 0.15,
    holdRate: 0.10 + Math.random() * 0.10,
    // Fix: Replace avgViewTime with required view100Rate
    view100Rate: 0.04 + Math.random() * 0.06,
    videoPlays: 5000 + Math.random() * 10000,
  }));
};

export const generateFunnelData = (): FunnelStage[] => [
  { label: 'Impressions', value: 1200000, color: '#0066FF' },
  { label: 'Video Plays', value: 850000, color: '#3385FF' },
  { label: 'Clicks / Hooked', value: 45000, color: '#66A3FF' },
  { label: 'App Installs / Messages', value: 12000, color: '#99C2FF' },
  { label: 'Buyer Activation', value: 3500, color: '#CCE0FF' },
];