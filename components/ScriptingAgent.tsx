import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabaseClient';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const ScriptingAgent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
            const storeId = (import.meta as any).env.VITE_GEMINI_FILE_SEARCH_STORE_ID;

            if (!apiKey) throw new Error("Missing API Key. Ensure VITE_GEMINI_API_KEY is in .env.local");

            const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

            const toolsList: any[] = [];
            if (storeId) {
                toolsList.push({
                    fileSearch: {
                        fileSearchStoreNames: [storeId]
                    }
                });
            }

            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: userMsg }] }
                ],
                config: {
                    systemInstruction: `You are the 'Zoop Script Architect'. Your mission is to assist with creating, editing, and strategizing high-converting ad contents for Zoop, an elite multi-streaming and commerce suite.

FLEXIBILITY INSTRUCTION: You do NOT always need to force a full script. If the user asks for talking points, broad highlighting points, brainstorming, or slightly tweaking an existing script, adjust your format and depth accordingly. Understand the context and exercise flexibility. Provide full scripts ONLY if requested or if it clearly implies a need for a full script.

CORE PRODUCT CONTEXT:
1. LIVE FIRST HIERARCHY: Pitch **Going Live & Multi-streaming** (Insta, YT, FB) to scale. Focus on brand-building.
2. MULTI-STREAMING USP: No more using **3 phones** to go live on 3 apps. One phone, one stream, three platforms.
3. AI CATALOGING: This is the back-end support. It automatically handles inventory and listings on their **Free Branded Website** (Professional Online Dukaan) that Zoop provides.
4. APNA BOSS: Pivot sellers from 'Majdoori' (grunt work) to 'Malaiki' (Ownership). Use status terms like **"Apna Boss Bano"**, **"Live Businesswoman Bano"**, or **"Apna Brand Banao"**.
5. IMPACT: Sellers have consistently 2x-5x their sales by going live.

CRITICAL INSTRUCTIONS:
1. TONE: 'India 2 Friendly' - grounded, trust-led, deeply aspirational. Use 'Hinglish' naturally.
2. JARGON GUARDRAIL: NEVER use corporate terms like "CEO", "Operator", "Workflow", "Data Entry", or "Data Science". Instead, use **"Order management"**, **"Majdoori"**, **"Pehchaan"**, or **"Dukaan"**.
3. LOGIC: Pitch Going Live to build a brand, then explain how **AI Cataloging** wipes out the boring manual listing work so their professional website stays updated automatically.
4. STRATEGY: 
   - Hook: Grow across social media with one stream.
   - Solution: Multi-stream with Zoop + Automatic Web Store management.
5. FORMATTING: Clean layouts. NO symbols like '|' or '---'. NO markdown repetitive '#'. Use bold (**) for power words only.
6. CTA: Action + Status (e.g., "Abhi live jao aur apna brand banao").
7. ITERATION: If asked to improve or change an existing script, apply only the requested changes while maintaining the core tone and context. Do not rewrite from scratch unless asked.

Always check the Zoop Master Context in the file search store before answering.`,
                    tools: toolsList.length > 0 ? toolsList : undefined
                }
            });

            const responseText = response.text || (response as any).text?.() || "Error generating response.";

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
        } catch (error: any) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveScript = async (text: string) => {
        try {
            const { error } = await supabase.from('scripts').insert([{
                title: text.split('\n')[0].replace(/#+\s*/, '').slice(0, 50) || 'New Script',
                content: text,
                platform: text.toLowerCase().includes('instagram') ? 'Instagram' : 
                          text.toLowerCase().includes('youtube') ? 'YouTube' : 'General'
            }]);

            if (error) throw error;
            alert('Script saved to UA Vault successfully!');
        } catch (error: any) {
            console.error('Error saving script:', error);
            alert(`Failed to save script: ${error.message}`);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col space-y-4 animate-fade-in relative z-10 w-full max-w-4xl mx-auto h-[80vh]">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3 transition-colors duration-300">
                        Zoop Script Architect
                        <span className="text-xs bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] px-2 py-1 rounded-full border border-[var(--brand-blue)]/30 tracking-wider font-semibold transition-colors duration-300">
                            Grounded in Zoop Knowledge
                        </span>
                    </h1>
                    <p className="text-[var(--text-secondary)] opacity-80 mt-1">Chat to generate persistent ad scripts.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide flex flex-col bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-2xl transition-colors duration-300">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-[var(--text-secondary)] opacity-50 gap-4">
                        <Icons.AI />
                        <p>Ask me to generate a new ad script for Zoop!</p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-[var(--brand-blue)]/20 border border-[var(--brand-blue)]/50 text-[var(--text-primary)] rounded-tr-sm' : 'bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm shadow-xl'} transition-colors duration-300`}>
                                <div className="text-sm user-select-text whitespace-pre-wrap leading-relaxed">{m.text}</div>
                                
                                {m.role === 'model' && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex gap-2">
                                        <button 
                                            onClick={() => handleSaveScript(m.text)}
                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--brand-blue)] hover:text-white transition-colors bg-[var(--brand-blue)]/10 px-3 py-2 rounded-lg border border-[var(--brand-blue)]/20 hover:bg-[var(--brand-blue)]"
                                        >
                                            <Icons.Plus />
                                            Save to Vault
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm p-4 animate-pulse">
                            <span className="text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            <div className="flex gap-3 p-3 rounded-2xl items-center border border-[var(--border-color)] sticky bottom-0 z-20 shadow-2xl backdrop-blur-3xl bg-[var(--card-bg)] opacity-95 transition-colors duration-300">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="E.g., Write a 15s Hook focused on Problem-Solution..."
                    className="flex-1 bg-transparent border-none text-[var(--text-primary)] focus:outline-none px-4 text-sm"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center shrink-0"
                >
                    <Icons.Play />
                </button>
            </div>
        </div>
    );
};

export default ScriptingAgent;
