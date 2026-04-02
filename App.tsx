
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import MainTable from './components/MainTable';
import CreativePreview from './components/CreativePreview';
import UAVault from './components/UAVault';
import InfluencerCRM from './components/InfluencerCRM';
import ScriptingAgent from './components/ScriptingAgent';

import { DashboardTab, Campaign, AdDetail, FunnelStage, AIInsight, MasterInsight } from './types';
import { generateFunnelData } from './services/mockData';
import { getAdInsight, getMasterInsight } from './services/geminiService';
import { exportToAntigravity, getCampaignsFromCSV, getWoWChartData, getCampaignSpendData } from './services/metaService';
import { getAdVideoUrl } from './services/creativeService';
import { Icons, COLORS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.OVERVIEW);
  const [activeAccount, setActiveAccount] = useState('zoop-india');
  const [activePlatform, setActivePlatform] = useState<'Meta Ads' | 'Google Ads'>('Meta Ads');
  const [timeframe, setTimeframe] = useState<'7D' | '30D'>('30D');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [wowData, setWowData] = useState<{ week: string; cpr: number }[]>([]);
  const [spendData, setSpendData] = useState<{ name: string; spend: number; type: string }[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);

  // Rate limit state
  const [rateLimitTimer, setRateLimitTimer] = useState<number>(0);
  const [rateLimitActive, setRateLimitActive] = useState<boolean>(false);

  // Per-ad loading state
  const [analyzingAds, setAnalyzingAds] = useState<Record<string, boolean>>({});
  const [isGeneratingMaster, setIsGeneratingMaster] = useState(false);
  const [expandedAd, setExpandedAd] = useState<string | null>(null);

  // Stored insights keyed by adName
  const [adInsights, setAdInsights] = useState<Record<string, AIInsight>>(() => {
    const saved = localStorage.getItem('vantage_ad_insights_map');
    return saved ? JSON.parse(saved) : {};
  });

  const [masterInsight, setMasterInsight] = useState<MasterInsight | null>(() => {
    const saved = localStorage.getItem('vantage_master_insight');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const campaignsData = await getCampaignsFromCSV(timeframe);
    const weekOverWeek = getWoWChartData();
    const campaignSpend = getCampaignSpendData(campaignsData);
    const funnelData = generateFunnelData();

    setCampaigns(campaignsData);
    setWowData(weekOverWeek);
    setSpendData(campaignSpend);
    setFunnel(funnelData);
    setLoading(false);
  }, [timeframe]);

  useEffect(() => {
    fetchData();
  }, [activeAccount, timeframe]);

  // Load cache on mount
  useEffect(() => {
    const loadCache = async () => {
      try {
        const response = await fetch('/ai_cache.json');
        if (response.ok) {
          const cacheData = await response.json();
          setAdInsights(prev => {
            const merged = { ...cacheData, ...prev };
            localStorage.setItem('vantage_ad_insights_map', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn("Fetching ai_cache.json failed", err);
      }
    };
    loadCache();
  }, []);

  // Rate limit countdown effect
  useEffect(() => {
    let interval: any;
    if (rateLimitActive && rateLimitTimer > 0) {
      interval = setInterval(() => {
        setRateLimitTimer((prev) => prev - 1);
      }, 1000);
    } else if (rateLimitTimer === 0) {
      setRateLimitActive(false);
    }
    return () => clearInterval(interval);
  }, [rateLimitActive, rateLimitTimer]);

  const totalSpend = useMemo(() => campaigns.reduce((acc, curr) => acc + curr.spend, 0), [campaigns]);
  const totalResults = useMemo(() => campaigns.reduce((acc, curr) => acc + curr.results, 0), [campaigns]);
  const avgCPResult = useMemo(() => totalSpend / (totalResults || 1), [totalSpend, totalResults]);
  const avgHookRate = useMemo(() => campaigns.reduce((acc, curr) => acc + curr.hookRate, 0) / (campaigns.length || 1), [campaigns]);

  const rankedCreatives = useMemo(() => {
    const allAds = campaigns.flatMap(c => c.ads.map(ad => ({ ...ad, campaignName: c.name })));
    return allAds
      .filter(ad => ad.impressions > 5000)
      .sort((a, b) => b.hookRate - a.hookRate);
  }, [campaigns]);

  const handleGenerateInsight = async (ad: AdDetail & { campaignName: string }, force: boolean = false) => {
    if (analyzingAds[ad.adName]) return;
    if (adInsights[ad.adName] && !force) return;

    setAnalyzingAds(prev => ({ ...prev, [ad.adName]: true }));
    try {
      const insight = await getAdInsight(ad);
      const newMap = { ...adInsights, [ad.adName]: insight };
      setAdInsights(newMap);
      localStorage.setItem('vantage_ad_insights_map', JSON.stringify(newMap));
    } catch (err: any) {
      console.error("Failed to generate insight for", ad.adName, err);
      if (err.message === "RATE_LIMIT_REACHED") {
        setRateLimitTimer(30);
        setRateLimitActive(true);
      } else {
        alert(`AI Error for ${ad.adName}: ${err instanceof Error ? err.message : 'Analysis failed'}`);
      }
    } finally {
      setAnalyzingAds(prev => ({ ...prev, [ad.adName]: false }));
    }
  };

  const handleGenerateMasterInsight = async () => {
    if (Object.keys(adInsights).length === 0) {
      alert("Generate at least 1 ad insight first to build a master analysis.");
      return;
    }
    setIsGeneratingMaster(true);
    try {
      const ads = campaigns.flatMap(c => c.ads.map(ad => ({ ...ad, campaignName: c.name })));
      const insight = await getMasterInsight(ads, adInsights);
      setMasterInsight(insight);
      localStorage.setItem('vantage_master_insight', JSON.stringify(insight));
    } catch (err) {
      alert("Failed to generate Strategic Overview. Check console.");
    } finally {
      setIsGeneratingMaster(false);
    }
  };


  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light' : ''} bg-[var(--bg-color)] text-[var(--text-secondary)] transition-colors duration-300`}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeAccount={activeAccount}
        onAccountChange={setActiveAccount}
      />

      <main className="ml-64 p-12 min-h-screen flex flex-col">
        <header className="flex items-center justify-between mb-12 sticky top-0 bg-[var(--header-bg)] backdrop-blur-xl z-40 py-4 border-b border-[var(--border-color)] transition-colors duration-300">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white capitalize tracking-tighter flex items-center gap-4">
              {activeTab === DashboardTab.CREATIVE ? 'Hook Intelligence' :
                activeTab === DashboardTab.SETTINGS ? 'System' :
                  activeTab === DashboardTab.AI_INSIGHTS ? 'AI Intelligence' :
                    activeTab === DashboardTab.UA_VAULT ? 'The UA Vault' :
                      activeTab === DashboardTab.INFLUENCER_CRM ? 'Influencer CRM' :
                        activeTab === DashboardTab.SCRIPTING_AGENT ? 'Scripting Agent' :
                          activeTab.replace('_', ' ')}
            </h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-[0.2em]">
                {activeTab === DashboardTab.AI_INSIGHTS ? 'Compiled Strategic Forecasting' : 'Ranking: Hook Rate Performance Metrics'}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {activeTab === DashboardTab.OVERVIEW && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center justify-between">
                <div className="flex bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-1.5 shadow-2xl overflow-hidden self-start transition-colors duration-300">
                  {(['Meta Ads', 'Google Ads'] as const).map(platform => (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      className={`px-8 py-2.5 text-[11px] font-black rounded-xl transition-all duration-300 ${activePlatform === platform ? 'bg-[var(--brand-blue)] text-white shadow-lg shadow-blue-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                <div className="flex bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-1.5 shadow-2xl overflow-hidden self-start flex-shrink-0 transition-colors duration-300">
                  <span className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border border-[var(--brand-blue)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest mr-2">
                    <span className="w-2 h-2 bg-[var(--brand-blue)] rounded-full animate-pulse shadow-[0_0_10px_var(--brand-blue)]"></span> {timeframe} DATA ACTIVE
                  </span>
                  {(['7D', '30D'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setTimeframe(period)}
                      className={`px-6 py-2.5 text-[11px] font-black rounded-xl transition-all duration-300 ${timeframe === period ? 'bg-[var(--brand-yellow)] text-black shadow-lg shadow-yellow-500/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard label="Period Ad Spend" value={`₹${Math.round(totalSpend).toLocaleString()}`} change="+0.0%" trend="neutral" loading={loading} />
                <KPICard label="Gross Conversions" value={Math.round(totalResults).toLocaleString()} change="+0.0%" trend="neutral" loading={loading} />
                <KPICard label="Avg CP Result" value={`₹${avgCPResult.toFixed(2)}`} change="-1.2%" trend="up" loading={loading} />
                <KPICard label="Elite Hook Rate" value={`${(avgHookRate * 100).toFixed(1)}%`} change="+4.5%" trend="up" loading={loading} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[var(--card-bg)] p-10 rounded-[48px] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-blue)]/5 blur-[80px] rounded-full"></div>
                  <div className="relative z-10">
                    <h3 className="font-black text-[var(--text-primary)] text-xl tracking-tight mb-10 flex items-center gap-3">
                      <span className="w-2 h-8 bg-[var(--brand-blue)] rounded-full"></span>
                      Cost Per Result (WoW Comparison)
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={wowData}>
                          <defs>
                            <linearGradient id="colorCPR" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={11} fontWeight="700" axisLine={false} tickLine={false} tickMargin={15} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} fontWeight="700" axisLine={false} tickLine={false} tickMargin={15} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: 'var(--brand-blue)', fontWeight: '900' }}
                          />
                          <Area type="monotone" dataKey="cpr" name="CP Result (₹)" stroke="var(--brand-blue)" strokeWidth={5} fill="url(#colorCPR)" animationDuration={1500} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--card-bg)] p-10 rounded-[48px] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group transition-colors duration-300">
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--brand-yellow)]/5 blur-[80px] rounded-full"></div>
                  <div className="relative z-10">
                    <h3 className="font-black text-[var(--text-primary)] text-xl tracking-tight mb-10 flex items-center gap-3">
                      <span className="w-2 h-8 bg-[var(--brand-yellow)] rounded-full"></span>
                      Budget Allocation by Campaign Type
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={spendData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={10} fontWeight="900" width={120} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px' }}
                          />
                          <Bar dataKey="spend" name="Amount Spent (₹)" radius={[0, 12, 12, 0]} barSize={24}>
                            {spendData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.type === 'FORM_SUBMIT' ? '#f59e0b' : entry.type === 'APP_DOWNLOAD' ? 'var(--brand-blue)' : 'var(--brand-yellow)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              <MainTable data={campaigns} />
            </div>
          )}

          {activeTab === DashboardTab.CREATIVE && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center justify-between bg-gradient-to-br from-[var(--card-bg)] to-black p-12 rounded-[56px] border border-[var(--border-color)] relative overflow-hidden shadow-2xl transition-colors duration-300">
                <div className="space-y-4 relative z-10">
                  <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">Raw Hook Intelligence</h2>
                  <p className="text-[var(--text-secondary)] font-bold text-lg max-w-md">Click <span className="text-[var(--brand-yellow)] font-black italic underline decoration-[var(--brand-yellow)]/30 underline-offset-4">Generate AI Insights</span> to analyze why specific hooks resonance with the ICP.</p>
                </div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[var(--brand-blue)]/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute top-10 right-20 text-[120px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase italic">WINNERS</div>
              </div>

              {rateLimitActive && (
                <div className="p-10 bg-[var(--brand-yellow)]/5 rounded-[40px] border border-[var(--brand-yellow)]/20 flex items-center gap-6 text-[var(--brand-yellow)] animate-in fade-in slide-in-from-top-6 duration-700 shadow-[0_0_50px_rgba(255,215,0,0.05)] transition-colors duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--brand-yellow)]/10 flex items-center justify-center text-3xl shadow-inner text-[var(--brand-yellow)]">⏳</div>
                  <div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] mb-2 text-[var(--brand-yellow)]/60">Vantage Engine Cooling Down</p>
                    <p className="text-xl font-bold">Please wait <span className="text-white font-black px-3 py-1 bg-[var(--brand-yellow)] text-black rounded-lg mx-1">{rateLimitTimer}s</span> before initiating next analysis session.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {rankedCreatives.length === 0 ? (
                  <div className="col-span-full py-40 text-center border-2 border-dashed border-[var(--border-color)] rounded-[56px]">
                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.3em]">No creatives met the 5,000 impression threshold</p>
                  </div>
                ) : rankedCreatives.map((ad, i) => (
                  <div key={i} className="group bg-[var(--card-bg)] rounded-[56px] overflow-hidden border border-[var(--border-color)] shadow-2xl hover:border-[var(--brand-yellow)]/30 transition-all hover:-translate-y-4 flex flex-col relative transition-colors duration-300">
                    <div className="aspect-[9/16] bg-black relative">
                      {getAdVideoUrl(ad.adName) ? (
                        <CreativePreview
                          videoUrl={getAdVideoUrl(ad.adName)!}
                          adName={ad.adName}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-color)]">
                          <div className="text-center p-8 space-y-4">
                            <span className="block text-6xl group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0">🎬</span>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">{ad.adName}</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-8 left-8 flex flex-col gap-3">
                        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border ${i === 0 ? 'bg-[var(--brand-yellow)] text-black border-[var(--brand-yellow)]' : 'bg-black/40 backdrop-blur-xl text-white border-white/10'}`}>
                          {i === 0 ? '🏆 ELITE HOOK' : i < 3 ? '🌟 WINNER' : `#${i + 1} SCALE READY`}
                        </div>
                      </div>

                      <div className="absolute bottom-8 left-8 right-8 p-10 bg-black/60 backdrop-blur-2xl rounded-[48px] border border-white/5 space-y-6 shadow-2xl">
                        <div className="space-y-1">
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Stopping Power</p>
                          <p className="text-5xl font-black text-[var(--brand-yellow)] italic leading-none">{(ad.hookRate * 100).toFixed(1)}<span className="text-2xl ml-1 text-white/20">%</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter block">IMPRESSIONS</span>
                            <span className="text-[13px] font-black text-white">{Math.round(ad.impressions).toLocaleString()}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter block">NET SPEND</span>
                            <span className="text-[13px] font-black text-white">₹{Math.round(ad.spend).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/40 font-bold truncate tracking-tight uppercase bg-white/5 p-2 rounded-lg text-center">{ad.adName}</p>
                      </div>
                    </div>

                    <div className="p-10 bg-black/20 space-y-4">
                      {getAdVideoUrl(ad.adName) ? (
                        <>
                          <button
                            onClick={() => handleGenerateInsight(ad)}
                            disabled={analyzingAds[ad.adName]}
                            className={`w-full py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${adInsights[ad.adName] ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[var(--brand-blue)] text-white shadow-[0_15px_30px_rgba(0,102,255,0.2)] hover:scale-[1.02] active:scale-95'}`}
                          >
                            {analyzingAds[ad.adName] ? (
                              <>
                                <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                VANTAGE ENGINE ANALYSING...
                              </>
                            ) : adInsights[ad.adName] ? (
                              <>✨ INTELLIGENCE COMPILED</>
                            ) : (
                              <>GENERATE AI INSIGHTS</>
                            )}
                          </button>

                          {adInsights[ad.adName] && !analyzingAds[ad.adName] && (
                            <button
                              onClick={() => handleGenerateInsight(ad, true)}
                              className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] hover:bg-white/5 transition-all border border-transparent hover:border-[var(--brand-yellow)]/20"
                            >
                              REGENERATE PERSPECTIVE ↺
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] bg-[var(--border-color)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed flex items-center justify-center gap-3 grayscale transition-colors duration-300"
                        >
                          <span className="text-xl">🚫</span> CREATIVE UNAVAILABLE
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === DashboardTab.AI_INSIGHTS && (
            <div className="space-y-16 selection:bg-[var(--brand-yellow)] selection:text-black transition-colors duration-300">
              {/* Strategic Master Overview */}
              <div className="bg-[var(--card-bg)] rounded-[72px] p-16 border border-[var(--border-color)] shadow-2xl relative overflow-hidden group transition-colors duration-300">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--brand-blue)]/5 blur-[150px] rounded-full group-hover:bg-[var(--brand-blue)]/10 transition-all duration-1000"></div>
                <div className="relative z-10 space-y-12">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="w-12 h-1 bg-[var(--brand-yellow)] rounded-full"></span>
                        <h2 className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">Strategic Intelligence Overview</h2>
                      </div>
                      <p className="text-[var(--text-secondary)] font-bold text-lg opacity-80">Multi-creative aggregation & roadmap forecasting for Zoop India.</p>
                    </div>
                    <button
                      onClick={handleGenerateMasterInsight}
                      disabled={isGeneratingMaster}
                      className={`px-12 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${isGeneratingMaster ? 'bg-[var(--border-color)] text-[var(--text-secondary)]' : 'bg-[var(--brand-blue)] text-white shadow-[0_20px_40px_rgba(0,102,255,0.3)] hover:scale-105 active:scale-95'}`}
                    >
                      {isGeneratingMaster ? (
                        <>
                          <div className="w-5 h-5 border-3 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          SYNTHESIZING STRATEGY...
                        </>
                      ) : masterInsight ? 'REGENERATE MASTER STRATEGY ↺' : 'GENERATE STRATEGIC OVERVIEW ✨'}
                    </button>
                  </div>

                  {masterInsight ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-6">
                          <p className="text-[11px] font-black text-[var(--brand-yellow)] uppercase tracking-[0.4em]">THE BIG PICTURE</p>
                          <p className="text-3xl text-[var(--text-primary)] font-bold leading-relaxed tracking-tight selection:bg-white selection:text-black italic">"{masterInsight.summary}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {[
                            { icon: '🪝', label: 'Future Hook Direction', content: masterInsight.futureHookDirection },
                            { icon: '📹', label: 'Content Type Strategy', content: masterInsight.contentTypeStrategy },
                            { icon: '✂️', label: 'Editing Evolution', content: masterInsight.editingEvolution },
                            { icon: '🎭', label: 'New Persona Expansion', content: masterInsight.newPersonas }
                          ].map((card, idx) => (
                            <div key={idx} className="p-10 bg-[var(--bg-color)] rounded-[48px] border border-[var(--border-color)] space-y-6 hover:border-[var(--brand-yellow)]/30 transition-all group/card shadow-xl transition-colors duration-300">
                              <div className="flex items-center gap-4">
                                <span className="text-3xl group-hover/card:scale-110 transition-transform">{card.icon}</span>
                                <p className="text-[11px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em]">{card.label}</p>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{card.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-[var(--brand-blue)] to-[#0044CC] rounded-[56px] p-12 space-y-8 shadow-[0_30px_60px_rgba(0,102,255,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl shadow-inner group-hover:rotate-12 transition-transform">🧪</div>
                          <p className="text-xs font-black text-white uppercase tracking-[0.3em]">A/B Roadmaps</p>
                        </div>
                        <div className="text-blue-50 text-sm font-bold leading-relaxed whitespace-pre-line bg-black/20 p-8 rounded-[40px] border border-white/10 relative z-10 shadow-inner italic">
                          {masterInsight.experiments}
                        </div>
                        <div className="pt-6 border-t border-white/20 flex items-center justify-between relative z-10">
                          <div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Last Compiled</p>
                            <p className="text-xs font-black text-white">{masterInsight.date}</p>
                          </div>
                          <div className="px-4 py-2 bg-black/30 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/5">v1.2 ACTIVE</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-32 text-center border-2 border-dashed border-[var(--border-color)] rounded-[56px] bg-white/[0.01] transition-colors duration-300">
                      <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--text-secondary)] opacity-20 text-5xl">🔭</div>
                      <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] mb-3 text-sm">Vantage Intelligence Not Yet Compiled</p>
                      <p className="text-xs text-[var(--text-secondary)] opacity-60 font-bold">Aggregate individual creative insights to unlock cross-persona strategic forecasting.</p>
                    </div>
                  )}
                </div>
              </div>

              {Object.keys(adInsights).length === 0 ? (
                <div className="py-40 text-center bg-[var(--card-bg)] rounded-[72px] border border-dashed border-[var(--border-color)] transition-colors duration-300">
                  <div className="w-28 h-28 bg-[var(--bg-color)] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--text-secondary)] opacity-40 shadow-inner transition-colors duration-300">
                    <Icons.AI />
                  </div>
                  <h3 className="text-2xl font-black text-[var(--text-secondary)] uppercase tracking-[0.4em]">No Intelligence Compiled</h3>
                  <p className="text-[var(--text-secondary)] opacity-60 font-bold text-sm mt-4">Navigate to <span className="text-[var(--brand-yellow)] italic">"Hook Intelligence"</span> and generate analysis for active winners.</p>
                </div>
              ) : (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  {/* Compact Uniform Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.entries(adInsights)
                      .map(([adName, insight]: [string, AIInsight], idx) => (
                        <div key={idx} className="group flex flex-col bg-[var(--bg-color)] rounded-[32px] border border-[var(--border-color)] shadow-xl hover:border-[var(--brand-blue)]/40 transition-all duration-500 overflow-hidden relative cursor-pointer hover:-translate-y-2" onClick={() => setExpandedAd(adName)}>
                          {getAdVideoUrl(adName) && (
                            <div className="relative group/thumb overflow-hidden border-b border-[var(--border-color)]">
                              <CreativePreview
                                videoUrl={getAdVideoUrl(adName)!}
                                adName={adName}
                                aspectRatio="aspect-video"
                                showPlayButton={false}
                                className="w-full opacity-60 group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent"></div>
                              <div className="absolute bottom-4 left-6">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[var(--brand-yellow)]/10 text-[var(--brand-yellow)] border-[var(--brand-yellow)]/20'}`}>
                                  {insight.type}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="p-6 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${insight.type === 'success' ? 'bg-emerald-500' : 'bg-[var(--brand-yellow)]'}`}></span>
                              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate">{adName}</p>
                            </div>
                            <h4 className="text-sm font-black text-[var(--text-primary)] tracking-tight leading-snug italic line-clamp-1 group-hover:text-[var(--brand-yellow)] transition-colors">"{insight.title}"</h4>
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[8px] font-bold text-[var(--text-secondary)] opacity-80 uppercase tracking-tighter">
                                {insight.date?.split(',')[0]}
                              </span>
                              <span className="text-[8px] font-black text-[var(--brand-blue)] uppercase tracking-widest hidden group-hover:block">Analyze ↗</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Expanded Detail Modal System */}
                  {expandedAd && adInsights[expandedAd] && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 lg:p-24 animate-in fade-in duration-300">
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setExpandedAd(null)}></div>
                      <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[var(--card-bg)] rounded-[72px] border border-[var(--border-color)] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-500 transition-colors duration-300">
                        <button
                          onClick={() => setExpandedAd(null)}
                          className="absolute top-8 right-12 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-primary)] text-3xl z-50 transition-all border border-white/5"
                        >✕</button>

                        <div className="lg:w-1/2 bg-black relative">
                          {getAdVideoUrl(expandedAd) ? (
                            <CreativePreview
                              videoUrl={getAdVideoUrl(expandedAd)!}
                              adName={expandedAd}
                              aspectRatio="h-full"
                              className="h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-800 text-9xl">🎬</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden lg:block pointer-events-none"></div>
                        </div>

                        <div className="flex-1 p-12 overflow-y-auto space-y-10 custom-scrollbar">
                          <header className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${adInsights[expandedAd].type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[var(--brand-yellow)]/10 text-[var(--brand-yellow)] border-[var(--brand-yellow)]/20'}`}>
                                  {expandedAd.toUpperCase()}
                                </span>
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{adInsights[expandedAd].date || 'REALTIME'}</span>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const ad = rankedCreatives.find(a => a.adName === expandedAd);
                                    if (ad) handleGenerateInsight(ad, true);
                                  }}
                                  disabled={analyzingAds[expandedAd]}
                                  className="px-6 py-3 bg-white/5 hover:bg-[var(--brand-yellow)] hover:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 disabled:opacity-50"
                                >
                                  {analyzingAds[expandedAd] ? 'ANALYZING...' : 'REGENERATE PERSPECTIVE ↺'}
                                </button>
                              </div>
                            </div>
                            <h2 className="text-5xl font-black text-[var(--text-primary)] tracking-tighter leading-[0.9] italic group-hover:text-[var(--brand-yellow)]">"{adInsights[expandedAd].title}"</h2>
                          </header>

                          <div className="bg-[var(--bg-color)] p-8 rounded-[32px] border border-[var(--border-color)] relative overflow-hidden transition-colors duration-300">
                            <div className="absolute top-0 right-0 p-4 bg-white/[0.02] text-[10px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest rounded-bl-3xl">Customer Internal Dialogue</div>
                            <p className="text-xl font-bold text-[var(--text-secondary)] opacity-90 italic leading-relaxed">
                              "{adInsights[expandedAd].content}"
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                              { label: 'Hook Type', value: adInsights[expandedAd].hookVibe }, // Mapped from Bucket 1
                              { label: 'Production Vibe', value: adInsights[expandedAd].productionStyle }, // Mapped from Bucket 2
                              { label: 'Video Length', value: adInsights[expandedAd].videoLengthCategory }, // Mapped from Bucket 3
                              { label: 'Emotional Angle', value: adInsights[expandedAd].emotionalAngle }, // Mapped from Bucket 4
                              { label: 'Strategic Why', value: adInsights[expandedAd].strategicWhy }
                            ].map((f, i) => (
                              <div key={i} className="p-8 bg-[var(--bg-color)]/20 rounded-[24px] border border-[var(--border-color)] space-y-4 shadow-inner hover:border-white/10 transition-all transition-colors duration-300">
                                <p className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em]">{f.label}</p>
                                <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">{f.value}</p>
                              </div>
                            ))}
                          </div>

                          <div className="p-8 bg-white/[0.01] rounded-[32px] border border-blue-500/10 space-y-6 shadow-inner">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[var(--brand-blue)] rounded-xl flex items-center justify-center text-white"><Icons.AI /></div>
                              <p className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em]">Expert Technical Post-Mortem</p>
                            </div>
                            <p className="text-md font-bold text-[var(--text-secondary)] opacity-80 leading-relaxed italic border-l-4 border-[var(--border-color)] pl-10">"{adInsights[expandedAd].backgroundAnalysis}"</p>
                          </div>

                          <div className="p-8 bg-[var(--brand-yellow)] rounded-[28px] flex items-center justify-between group-hover:scale-[1.02] transition-all">
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] mb-3">ACTIONABLE ADAPTATION ROADMAP</p>
                              <p className="text-lg font-black text-black uppercase tracking-tight leading-none">{adInsights[expandedAd].recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}






          {activeTab === DashboardTab.UA_VAULT && (
            <UAVault />
          )}

          {activeTab === DashboardTab.INFLUENCER_CRM && (
            <InfluencerCRM />
          )}

          {activeTab === DashboardTab.SCRIPTING_AGENT && (
            <ScriptingAgent />
          )}

          {activeTab === DashboardTab.AUDIENCE && (
            <div className="bg-[var(--card-bg)] p-20 rounded-[72px] border border-[var(--border-color)] shadow-2xl animate-in fade-in duration-700 min-h-[500px] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--brand-blue)]/5 blur-[150px] rounded-full"></div>
              <div className="text-center space-y-8 relative z-10">
                <div className="w-32 h-32 bg-[var(--bg-color)] rounded-[48px] flex items-center justify-center mx-auto text-[var(--brand-yellow)] shadow-2xl border border-[var(--border-color)] transition-colors duration-300">
                  <Icons.Audience />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Audience Deep-Dive</h3>
                  <p className="text-[var(--text-secondary)] font-bold text-lg max-w-sm mx-auto leading-relaxed">Behavioral psychographics for the 35-55 female entrepreneur demographic is being synthesized at the edge.</p>
                </div>
                <div className="pt-8">
                  <button disabled className="px-10 py-5 bg-[var(--border-color)] text-[var(--text-secondary)] opacity-40 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] border border-white/5">Synthesizing Profile v2.0</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-32 py-16 border-t border-[var(--border-color)] flex items-center justify-between transition-colors duration-300">
          <p className="text-[11px] text-[var(--text-secondary)] opacity-60 font-black uppercase tracking-[0.4em]">© 2026 ZOOP MEDIA VANTAGE • BUILT FOR STRATEGIC SCALE</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest uppercase">Benchmarked: Feb 2–15</span>
            <span className="text-[10px] font-black text-[var(--brand-yellow)] uppercase tracking-widest uppercase border-b border-[var(--brand-yellow)]/30 pb-1 cursor-pointer hover:text-[var(--text-primary)] transition-colors">v1.2.4 Status: Stable</span>
          </div>
        </footer>
      </main>

      {/* Floating Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-[100] flex gap-2 p-1.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full shadow-2xl backdrop-blur-xl transition-colors duration-300">
        <button 
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-[#CCFF00] text-black shadow-lg scale-110' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)]'}`}
          title="Light Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-[#0066FF] text-white shadow-lg scale-110' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)]'}`}
          title="Dark Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
