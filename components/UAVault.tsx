import React, { useState } from 'react';
import { Icons, COLORS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface ContentItem {
    id: string;
    name: string;
    type: 'video' | 'image';
    side: 'seller' | 'buyer';
    theme: string;
    hook: string;
    date: string;
    thumbnail?: string;
}


const UAVault: React.FC = () => {
    const [activeBucket, setActiveBucket] = useState<'seller' | 'buyer' | 'end_screens' | 'cta_screens'>('seller');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Default options
    const defaultThemes = ['UGC', 'Testimonial', 'Product Focus', 'Problem-Solution', 'Lifestyle'];
    const defaultHooks = ['Problem First', 'Benefit First', 'Curiosity', 'Fear of Missing Out', 'Direct Offer'];

    const [themes, setThemes] = useState<string[]>(defaultThemes);
    const [hooks, setHooks] = useState<string[]>(defaultHooks);

    const [isAddingNewTheme, setIsAddingNewTheme] = useState(false);
    const [isAddingNewHook, setIsAddingNewHook] = useState(false);

    const [content, setContent] = useState<ContentItem[]>([
        { id: '1', name: 'seller_ugc_problemfirst_2026-03-10', type: 'video', side: 'seller', theme: 'UGC', hook: 'Problem First', date: '2026-03-10' },
        { id: '2', name: 'buyer_testimonial_benefitfirst_2026-03-11', type: 'video', side: 'buyer', theme: 'Testimonial', hook: 'Benefit First', date: '2026-03-11' },
    ]);

    const [formData, setFormData] = useState({
        theme: '',
        hook: '',
        customTheme: '',
        customHook: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Load options on mount
    React.useEffect(() => {
        const loadInitialOptions = async () => {
            try {
                const response = await fetch('/config/options.txt');
                if (response.ok) {
                    const rawText = await response.text();
                    const lines = rawText.split('\n');
                    const themesLine = lines.find(l => l.startsWith('THEMES:'))?.replace('THEMES:', '').trim().split(',') || [];
                    const hooksLine = lines.find(l => l.startsWith('HOOKS:'))?.replace('HOOKS:', '').trim().split(',') || [];

                    if (themesLine.length) setThemes(themesLine.map(t => t.trim()));
                    if (hooksLine.length) setHooks(hooksLine.map(h => h.trim()));
                }
            } catch (err) {
                console.log("Using default options");
            }

            setFormData(prev => ({
                ...prev,
                theme: themes[0] || 'UGC',
                hook: hooks[0] || 'Problem First'
            }));

            const savedThemes = localStorage.getItem('vault_custom_themes');
            const savedHooks = localStorage.getItem('vault_custom_hooks');

            if (savedThemes) setThemes(prev => Array.from(new Set([...prev, ...JSON.parse(savedThemes)])));
            if (savedHooks) setHooks(prev => Array.from(new Set([...prev, ...JSON.parse(savedHooks)])));
        };

        loadInitialOptions();
    }, []);

    const generateName = () => {
        const themeValue = isAddingNewTheme ? formData.customTheme : formData.theme;
        const hookValue = isAddingNewHook ? formData.customHook : formData.hook;

        const formattedTheme = (themeValue || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const formattedHook = (hookValue || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const bucketTag = activeBucket === 'end_screens' ? 'endscreens' : activeBucket === 'cta_screens' ? 'ctascreens' : activeBucket;
        return `${bucketTag}_${formattedTheme}_${formattedHook}_${formData.date}`;
    };

    const handleAddContent = async () => {
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        let finalTheme = formData.theme;
        let finalHook = formData.hook;

        if (isAddingNewTheme && formData.customTheme) {
            finalTheme = formData.customTheme;
            if (!themes.includes(finalTheme)) {
                const updatedThemes = [...themes, finalTheme];
                setThemes(updatedThemes);
                const customOnly = updatedThemes.filter(t => !defaultThemes.includes(t));
                localStorage.setItem('vault_custom_themes', JSON.stringify(customOnly));
            }
        }

        if (isAddingNewHook && formData.customHook) {
            finalHook = formData.customHook;
            if (!hooks.includes(finalHook)) {
                const updatedHooks = [...hooks, finalHook];
                setHooks(updatedHooks);
                const customOnly = updatedHooks.filter(h => !defaultHooks.includes(h));
                localStorage.setItem('vault_custom_hooks', JSON.stringify(customOnly));
            }
        }

        setIsUploading(true);
        const generatedFilename = generateName();
        const ext = selectedFile.name.split('.').pop();
        const fullFilename = `${generatedFilename}.${ext}`;

        try {
            const { data, error } = await supabase.storage
                .from('ua-vault')
                .upload(fullFilename, selectedFile, { upsert: true });

            if (error) throw error;

            const newId = (content.length + 1).toString();
            const newItem: ContentItem = {
                id: newId,
                name: generatedFilename,
                type: 'video',
                side: activeBucket as any,
                theme: finalTheme,
                hook: finalHook,
                date: formData.date,
            };
            setContent([...content, newItem]);
            setIsFormOpen(false);
            setIsAddingNewTheme(false);
            setIsAddingNewHook(false);
            setFormData(prev => ({ ...prev, customTheme: '', customHook: '' }));
            setSelectedFile(null);
        } catch (err: any) {
            console.error("Upload error:", err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredContent = content
        .filter(item => item.side === activeBucket)
        .sort((a, b) => {
            const dateA = a.name.split('_').pop() || a.date;
            const dateB = b.name.split('_').pop() || b.date;
            return dateB.localeCompare(dateA);
        });

    return (
        <div className="p-6 space-y-8 animate-fade-in text-[var(--text-secondary)] transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">UA Vault</h1>
                    <p className="text-[var(--text-secondary)] opacity-80 mt-1">Manage and organize your creative assets</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-color)] flex flex-wrap gap-1">
                        <button
                            onClick={() => setActiveBucket('seller')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeBucket === 'seller'
                                ? 'bg-[var(--brand-blue)] text-white shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            Seller Side
                        </button>
                        <button
                            onClick={() => setActiveBucket('buyer')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeBucket === 'buyer'
                                ? 'bg-[var(--brand-blue)] text-white shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            Buyer Side
                        </button>
                        <button
                            onClick={() => setActiveBucket('end_screens')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeBucket === 'end_screens'
                                ? 'bg-[var(--brand-blue)] text-white shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            End Screens
                        </button>
                        <button
                            onClick={() => setActiveBucket('cta_screens')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeBucket === 'cta_screens'
                                ? 'bg-[var(--brand-blue)] text-white shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            CTA Screens
                        </button>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-[var(--brand-yellow)] hover:bg-[var(--brand-yellow)]/90 text-black px-4 py-2.5 rounded-xl font-semibold transition-all shadow-xl shadow-yellow-500/10 active:scale-95 whitespace-nowrap"
                    >
                        <Icons.Plus />
                        Add Content
                    </button>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContent.map((item) => (
                    <div key={item.id} className="bg-[var(--card-bg)] group rounded-2xl overflow-hidden border border-[var(--border-color)] hover:border-[var(--brand-blue)]/50 transition-all duration-300 shadow-xl">
                        <div className="aspect-[9/16] bg-[var(--bg-color)] flex items-center justify-center relative group-hover:bg-[var(--border-color)] transition-colors">
                            <Icons.Creative />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] uppercase font-bold text-white border border-white/10 tracking-wider">
                                {item.type}
                            </div>
                        </div>
                        <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
                            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--brand-blue)] transition-colors">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-color)] text-[var(--text-secondary)] border border-[var(--border-color)]">{item.theme}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-color)] text-[var(--text-secondary)] border border-[var(--border-color)]">{item.hook}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="relative bg-[var(--card-bg)] w-full max-w-md p-8 rounded-3xl border border-[var(--border-color)] shadow-2xl animate-fade-in transition-colors duration-300">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Enforce Nomenclature</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Theme</label>
                                {!isAddingNewTheme ? (
                                    <select
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--brand-blue)] transition-colors transition-colors duration-300"
                                        value={formData.theme}
                                        onChange={(e) => {
                                            if (e.target.value === 'ADD_NEW') {
                                                setIsAddingNewTheme(true);
                                            } else {
                                                setFormData({ ...formData, theme: e.target.value });
                                            }
                                        }}
                                    >
                                        {themes.map(t => <option key={t} value={t}>{t}</option>)}
                                        <option value="ADD_NEW" className="text-[var(--brand-blue)] font-bold">+ Add New...</option>
                                    </select>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            autoFocus
                                            placeholder="Enter custom theme name..."
                                            className="w-full bg-[var(--bg-color)] border border-[var(--brand-blue)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none transition-colors duration-300"
                                            value={formData.customTheme}
                                            onChange={(e) => setFormData({ ...formData, customTheme: e.target.value })}
                                        />
                                        <button
                                            onClick={() => setIsAddingNewTheme(false)}
                                            className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                                        >
                                            ← Back to list
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Hook</label>
                                {!isAddingNewHook ? (
                                    <select
                                        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--brand-blue)] transition-colors transition-colors duration-300"
                                        value={formData.hook}
                                        onChange={(e) => {
                                            if (e.target.value === 'ADD_NEW') {
                                                setIsAddingNewHook(true);
                                            } else {
                                                setFormData({ ...formData, hook: e.target.value });
                                            }
                                        }}
                                    >
                                        {hooks.map(h => <option key={h} value={h}>{h}</option>)}
                                        <option value="ADD_NEW" className="text-[var(--brand-blue)] font-bold">+ Add New...</option>
                                    </select>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            autoFocus
                                            placeholder="Enter custom hook name..."
                                            className="w-full bg-[var(--bg-color)] border border-[var(--brand-blue)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none transition-colors duration-300"
                                            value={formData.customHook}
                                            onChange={(e) => setFormData({ ...formData, customHook: e.target.value })}
                                        />
                                        <button
                                            onClick={() => setIsAddingNewHook(false)}
                                            className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                                        >
                                            ← Back to list
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--brand-blue)] transition-colors transition-colors duration-300"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Upload File</label>
                                <input
                                    type="file"
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--brand-blue)] transition-colors transition-colors duration-300"
                                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>

                            <div className="pt-4 p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)]">
                                <label className="block text-[10px] font-bold text-[var(--brand-blue)] uppercase tracking-widest mb-1">Generated Output</label>
                                <div className="text-lg font-mono text-[var(--brand-yellow)] break-all">{generateName()}</div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => { setIsFormOpen(false); setSelectedFile(null); }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-semibold hover:bg-white/5 transition-colors transition-colors duration-300"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddContent}
                                    disabled={isUploading || !selectedFile}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--brand-blue)] text-white font-semibold hover:bg-[var(--brand-blue)]/90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Confirm & Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UAVault;
