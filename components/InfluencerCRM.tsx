import React, { useState, useEffect } from 'react';
import { Icons, COLORS } from '../constants';
import { supabase } from '../lib/supabaseClient';

type InfluencerStatus = 'Shortlisted' | 'Reached Out' | 'Negotiating' | 'Locked' | 'Successful';

interface Influencer {
    id: number;
    name: string;
    status: InfluencerStatus;
    campaign: string;
    price: number;
    platform: string;
    vibe: string;
    why_them: string;
    comments: string;
    created_at: string;
    // Deliverables
    reels_count?: number;
    stories_count?: number;
    shorts_count?: number;
    long_vids_count?: number;
    negotiated_price?: number;
    planned_live_date?: string;
    actual_live_date?: string;
    // Analytics
    followers?: number;
    views?: number;
    likes?: number;
    comments_count?: number;
    shares?: number;
    engagement_rate?: number;
    cpv?: number;
    reach_follower_ratio?: number;
}

const InfluencerCRM: React.FC = () => {
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInfluencers();
    }, []);

    const fetchInfluencers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('influencers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setInfluencers(data);
        } catch (error: any) {
            console.error('Error fetching influencers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [isAdding, setIsAdding] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [newInfluencer, setNewInfluencer] = useState({
        name: '', campaign: '', price: '', platform: '', vibe: '', why_them: '', comments: ''
    });

    const getStatusColor = (status: InfluencerStatus) => {
        switch (status) {
            case 'Shortlisted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Reached Out': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Negotiating': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'Locked': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
            case 'Successful': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const handleAddInfluencer = async () => {
        if (!newInfluencer.name) return;
        const item = {
            name: newInfluencer.name,
            platform: newInfluencer.platform,
            campaign: newInfluencer.campaign,
            price: parseFloat(newInfluencer.price) || 0,
            vibe: newInfluencer.vibe,
            why_them: newInfluencer.why_them,
            comments: newInfluencer.comments,
            status: 'Shortlisted',
        };

        try {
            const { data, error } = await supabase.from('influencers').insert([item]).select().single();
            if (error) throw error;
            if (data) {
                setInfluencers([data, ...influencers]);
            }
        } catch (error: any) {
            console.error('Error adding influencer:', error);
            alert(`Failed to add: ${error.message}`);
        }

        setIsAdding(false);
        setNewInfluencer({ name: '', campaign: '', price: '', platform: '', vibe: '', why_them: '', comments: '' });
    };

    const handleUpdate = async (id: number, field: keyof Influencer, value: any) => {
        const previousInfluencers = [...influencers];
        const updatedInfluencer = influencers.find(inf => inf.id === id);
        if (!updatedInfluencer) return;

        const newInf = { ...updatedInfluencer, [field]: value };
        
        // Auto-calculate metrics
        const basePrice = newInf.negotiated_price || newInf.price || 0;
        const totalEngagement = (newInf.likes || 0) + (newInf.comments_count || 0) + (newInf.shares || 0);
        
        if (newInf.views && newInf.views > 0) {
            newInf.cpv = basePrice / newInf.views;
        }
        if (newInf.followers && newInf.followers > 0) {
            newInf.engagement_rate = (totalEngagement / newInf.followers) * 100;
            newInf.reach_follower_ratio = (newInf.views || 0) / newInf.followers;
        }

        setInfluencers(influencers.map(inf => inf.id === id ? newInf : inf));

        try {
            const { error } = await supabase.from('influencers').update({ 
                [field]: value,
                cpv: newInf.cpv,
                engagement_rate: newInf.engagement_rate,
                reach_follower_ratio: newInf.reach_follower_ratio
            }).eq('id', id);
            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating influencer:', error);
            setInfluencers(previousInfluencers);
            alert(`Failed to save: ${error.message}`);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in text-[var(--text-secondary)] transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Influencer Marketing CRM</h1>
                    <p className="text-[var(--text-secondary)] opacity-80 mt-1">Track and manage influencer partnerships</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/10 active:scale-95"
                >
                    <Icons.Plus />
                    Add Influencer
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {influencers.map((inf) => {
                    const isExpanded = expandedId === inf.id;
                    return (
                        <div key={inf.id} className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] overflow-hidden transition-all duration-300 shadow-xl">
                            {/* Header (always visible) */}
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : inf.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border shadow-lg group transition-all duration-300 ${
                                        inf.status === 'Successful' 
                                        ? 'border-[var(--brand-yellow)]/50 bg-gradient-to-br from-[var(--brand-yellow)]/20 to-[var(--brand-blue)]/20 shadow-[0_0_15px_rgba(255,240,0,0.2)] scale-110' 
                                        : 'border-[var(--border-color)] bg-white/5'
                                    }`}>
                                        <img 
                                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${inf.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                            alt={inf.name}
                                            className="w-full h-full object-cover transform group-hover:scale-120 transition-transform duration-700"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[var(--text-primary)] text-lg transition-colors duration-300">{inf.name}</h3>
                                            <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-white/5 px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                                                #{String(inf.id).padStart(3, '0')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-[var(--text-secondary)] opacity-80">{inf.platform}</p>
                                            {inf.campaign && (
                                                <>
                                                    <span className="text-slate-700">•</span>
                                                    <p className="text-sm text-[var(--brand-blue)] font-medium">{inf.campaign}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {!isExpanded && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-[var(--text-secondary)]">₹{inf.price}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${getStatusColor(inf.status)}`}>
                                                {inf.status}
                                            </span>
                                        </div>
                                    )}
                                    <Icons.ChevronRight className={`transition-transform duration-300 text-[var(--text-secondary)] ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="p-6 pt-0 border-t border-[var(--border-color)] bg-[var(--bg-color)]/30 mt-4 space-y-6">
                                    {/* Magic Analytics Parser (For data in comments) */}
                                    {(() => {
                                        if (inf.status === 'Successful' && inf.comments?.includes('PERFORMANCE:')) {
                                            const parts = inf.comments.split('|').map(p => p.trim());
                                            parts.forEach(part => {
                                                if (part.includes('Followers:')) inf.followers = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, '')) * (part.includes('k') ? 1000 : 1);
                                                if (part.includes('Views:')) inf.views = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, '')) * (part.includes('k') ? 1000 : 1);
                                                if (part.includes('Likes:')) inf.likes = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, ''));
                                                if (part.includes('Comments:')) inf.comments_count = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, ''));
                                                if (part.includes('Shares:')) inf.shares = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, ''));
                                                if (part.includes('CPV:')) inf.cpv = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, ''));
                                                if (part.includes('Engagement:')) inf.engagement_rate = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, ''));
                                                if (part.includes('Reach x Follower:')) inf.reach_follower_ratio = parseFloat(part.split(':')[1].replace(/[k,x,%]/g, ''));
                                            });
                                        }
                                        return null;
                                    })()}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Status</label>
                                            <select
                                                value={inf.status}
                                                onChange={(e) => handleUpdate(inf.id, 'status', e.target.value)}
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm cursor-pointer transition-colors duration-300"
                                            >
                                                <option value="Shortlisted">Shortlisted</option>
                                                <option value="Reached Out">Reached Out</option>
                                                <option value="Negotiating">Negotiating</option>
                                                <option value="Locked">Locked</option>
                                                <option value="Successful">Successful</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Price (Numeric)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm transition-colors duration-300"
                                                value={inf.price}
                                                onChange={(e) => handleUpdate(inf.id, 'price', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Platform</label>
                                            <select
                                                value={inf.platform}
                                                onChange={(e) => handleUpdate(inf.id, 'platform', e.target.value)}
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm cursor-pointer transition-colors duration-300"
                                            >
                                                <option value="">Select Platform</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="YouTube">YouTube</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Campaign</label>
                                            <input
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm transition-colors duration-300"
                                                value={inf.campaign}
                                                onChange={(e) => handleUpdate(inf.id, 'campaign', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Vibe</label>
                                            <input
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm transition-colors duration-300"
                                                value={inf.vibe}
                                                onChange={(e) => handleUpdate(inf.id, 'vibe', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Deliverables Logic */}
                                    {(inf.platform === 'Instagram' || inf.platform === 'YouTube') && (
                                        <div className="p-6 rounded-2xl bg-white/5 border border-[var(--border-color)] space-y-4">
                                            <h4 className="text-xs font-bold text-[var(--brand-blue)] uppercase tracking-widest">Deliverables Setup</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {inf.platform === 'Instagram' ? (
                                                    <>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Reels (Qty)</label>
                                                            <select
                                                                value={inf.reels_count || 0}
                                                                onChange={(e) => handleUpdate(inf.id, 'reels_count', parseInt(e.target.value))}
                                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm cursor-pointer transition-colors duration-300"
                                                            >
                                                                {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Stories (Qty)</label>
                                                            <select
                                                                value={inf.stories_count || 0}
                                                                onChange={(e) => handleUpdate(inf.id, 'stories_count', parseInt(e.target.value))}
                                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm cursor-pointer transition-colors duration-300"
                                                            >
                                                                {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                                            </select>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Shorts (Qty)</label>
                                                            <select
                                                                value={inf.shorts_count || 0}
                                                                onChange={(e) => handleUpdate(inf.id, 'shorts_count', parseInt(e.target.value))}
                                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm cursor-pointer transition-colors duration-300"
                                                            >
                                                                {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Long Vids (Qty)</label>
                                                            <select
                                                                value={inf.long_vids_count || 0}
                                                                onChange={(e) => handleUpdate(inf.id, 'long_vids_count', parseInt(e.target.value))}
                                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm cursor-pointer transition-colors duration-300"
                                                            >
                                                                {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                                            </select>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Financials & Dates */}
                                    {/* Analytics Section for Successful Campaigns */}
                                    {inf.status === 'Successful' && (
                                        <div className="p-6 rounded-2xl bg-[var(--brand-blue)]/5 border border-[var(--brand-blue)]/20 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold text-[var(--brand-blue)] uppercase tracking-widest">Campaign Analytics</h4>
                                                <div className="flex gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">CPV</p>
                                                        <p className="text-sm font-mono text-[var(--brand-blue)]">₹{inf.cpv?.toFixed(3) || '0.00'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Engagement</p>
                                                        <p className="text-sm font-mono text-emerald-500">{inf.engagement_rate?.toFixed(2) || '0.0'}%</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Reach x Follower</p>
                                                        <p className="text-sm font-mono text-[var(--brand-yellow)]">{inf.reach_follower_ratio?.toFixed(2) || '0.0'}x</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Followers</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs outline-none"
                                                        value={inf.followers || ''}
                                                        onChange={(e) => handleUpdate(inf.id, 'followers', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Views</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs outline-none"
                                                        value={inf.views || ''}
                                                        onChange={(e) => handleUpdate(inf.id, 'views', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Likes</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs outline-none"
                                                        value={inf.likes || ''}
                                                        onChange={(e) => handleUpdate(inf.id, 'likes', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Comments</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs outline-none"
                                                        value={inf.comments_count || ''}
                                                        onChange={(e) => handleUpdate(inf.id, 'comments_count', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">Shares</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs outline-none"
                                                        value={inf.shares || ''}
                                                        onChange={(e) => handleUpdate(inf.id, 'shares', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Negotiated Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60 text-sm">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl pl-8 pr-4 py-2 focus:border-emerald-500 outline-none text-sm transition-colors duration-300"
                                                    value={inf.negotiated_price || ''}
                                                    placeholder="0.00"
                                                    onChange={(e) => handleUpdate(inf.id, 'negotiated_price', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Target Live Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm transition-colors duration-300"
                                                value={inf.planned_live_date || ''}
                                                onChange={(e) => handleUpdate(inf.id, 'planned_live_date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Actual Live Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm transition-colors duration-300"
                                                value={inf.actual_live_date || ''}
                                                onChange={(e) => handleUpdate(inf.id, 'actual_live_date', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Why Them?</label>
                                        <input
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2 focus:border-[var(--brand-blue)] outline-none text-sm transition-colors duration-300"
                                            value={inf.why_them}
                                            onChange={(e) => handleUpdate(inf.id, 'why_them', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--brand-yellow)] uppercase tracking-widest mb-2">Performance Comments (Business Impact)</label>
                                        <textarea
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:border-[var(--brand-blue)] outline-none text-sm min-h-[100px] resize-y transition-colors duration-300"
                                            placeholder="Add notes about ROI, audience engagement, link clicks..."
                                            value={inf.comments}
                                            onChange={(e) => handleUpdate(inf.id, 'comments', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
                    <div className="relative bg-[var(--card-bg)] w-full max-w-lg p-8 rounded-3xl border border-[var(--border-color)] shadow-2xl animate-fade-in transition-colors duration-300">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Add New Influencer</h2>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="flex items-center gap-6 mb-8 p-6 rounded-3xl bg-[var(--bg-color)]/50 border border-[var(--border-color)] shadow-inner">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--brand-blue)]/20 to-[#0044CC]/20 flex items-center justify-center overflow-hidden border border-[var(--brand-blue)]/30 shadow-2xl relative group">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${newInfluencer.name || 'Zoop'}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Preview</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Influencer Discovery</label>
                                    <input
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-5 py-4 focus:border-[var(--brand-blue)] outline-none transition-all duration-300 placeholder:text-[var(--text-secondary)]/30 text-lg font-medium"
                                        placeholder="Type name to generate character..."
                                        value={newInfluencer.name}
                                        onChange={e => setNewInfluencer({ ...newInfluencer, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Platform</label>
                                    <select
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:border-[var(--brand-blue)] outline-none cursor-pointer transition-colors duration-300"
                                        value={newInfluencer.platform}
                                        onChange={e => setNewInfluencer({ ...newInfluencer, platform: e.target.value })}
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="YouTube">YouTube</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Campaign</label>
                                    <input
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:border-[var(--brand-blue)] outline-none transition-colors duration-300"
                                        placeholder="e.g. Summer Launch"
                                        value={newInfluencer.campaign}
                                        onChange={e => setNewInfluencer({ ...newInfluencer, campaign: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Price (Numeric)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:border-[var(--brand-blue)] outline-none transition-colors duration-300"
                                        placeholder="₹"
                                        value={newInfluencer.price}
                                        onChange={e => setNewInfluencer({ ...newInfluencer, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Vibe</label>
                                    <input
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:border-[var(--brand-blue)] outline-none transition-colors duration-300"
                                        placeholder="e.g. Minimalist, High Energy"
                                        value={newInfluencer.vibe}
                                        onChange={e => setNewInfluencer({ ...newInfluencer, vibe: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Why Them?</label>
                                <input
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:border-[var(--brand-blue)] outline-none transition-colors duration-300"
                                    value={newInfluencer.why_them}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, why_them: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 mt-4 border-t border-[var(--border-color)]">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-semibold hover:bg-white/5 transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddInfluencer}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--brand-blue)] text-white font-semibold hover:bg-[var(--brand-blue)]/90 shadow-lg shadow-blue-500/20"
                                >
                                    Add to CRM
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfluencerCRM;
