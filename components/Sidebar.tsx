
import React, { useState } from 'react';
import { DashboardTab } from '../types';
import { Icons, COLORS } from '../constants';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  activeAccount: string;
  onAccountChange: (account: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeAccount,
  onAccountChange
}) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const accounts = [
    { id: 'zoop-india', name: 'Zoop India Main', region: 'IN' },
    { id: 'zoop-global', name: 'Zoop Global Store', region: 'Global' },
    { id: 'zoop-beta', name: 'Zoop Beta Testing', region: 'QA' },
  ];

  const menuItems = [
    { id: DashboardTab.OVERVIEW, label: 'Dashboard', icon: <Icons.Dashboard /> },
    { id: DashboardTab.UA_VAULT, label: 'UA Vault', icon: <Icons.Creative /> },
    { id: DashboardTab.INFLUENCER_CRM, label: 'Influencer CRM', icon: <Icons.Audience /> },
    { id: DashboardTab.SCRIPTING_AGENT, label: 'Scripting Agent', icon: <Icons.AI /> },
    { id: DashboardTab.CREATIVE, label: 'Creative Performance', icon: <Icons.Funnel /> },
    { id: DashboardTab.AI_INSIGHTS, label: 'AI Insights', icon: <Icons.AI /> },
  ];

  const currentAccountData = accounts.find(a => a.id === activeAccount) || accounts[0];

  return (
    <aside className="w-64 h-screen bg-[var(--bg-color)] border-r border-[var(--border-color)] flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--brand-yellow)] rounded-2xl p-2 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-colors duration-300">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 30H85V70H15V30Z" fill="var(--brand-blue)" />
              <text x="50" y="55" dominantBaseline="middle" textAnchor="middle" fill="white" style={{ font: 'bold 24px sans-serif' }}>Z</text>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[var(--brand-yellow)] tracking-tighter leading-none transition-colors duration-300">ZOOP</span>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest mt-1">Live Bazaar</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-80 uppercase tracking-[0.2em]">Main Menu</p>
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${isActive
                ? 'bg-[var(--brand-blue)] text-white shadow-[0_10px_20px_rgba(0,102,255,0.2)] scale-[1.02]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--brand-yellow)]'
                }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-[var(--text-secondary)]'} group-hover:text-[var(--brand-yellow)]`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-color)] opacity-95">
        <div className="relative">
          <p className="px-4 mb-2 text-[10px] font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-[0.2em]">Ad Account</p>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--brand-yellow)]/50 transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 rounded-lg bg-[var(--brand-yellow)] flex-shrink-0 flex items-center justify-center text-[9px] font-black text-[var(--brand-blue)] transition-colors duration-300">
                {currentAccountData.region}
              </div>
              <span className="truncate">{currentAccountData.name}</span>
            </div>
            <Icons.ChevronUpDown />
          </button>

          {showAccountMenu && (
            <div className="absolute bottom-full left-0 w-full mb-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-2 space-y-1">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onAccountChange(acc.id);
                      setShowAccountMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold rounded-xl text-left transition-all ${activeAccount === acc.id ? 'bg-[var(--brand-yellow)] text-black' : 'text-[var(--text-secondary)] hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-black ${activeAccount === acc.id ? 'bg-black/10 text-black' : 'bg-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                      {acc.region}
                    </div>
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onTabChange(DashboardTab.SETTINGS)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${activeTab === DashboardTab.SETTINGS ? 'bg-[var(--brand-yellow)]/10 text-[var(--brand-yellow)]' : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg)]'
            }`}
        >
          <Icons.Settings />
          Settings
        </button>

        <div className="flex items-center gap-4 px-4 py-4 pt-6 border-t border-[var(--border-color)]">
          <div className="w-10 h-10 rounded-2xl bg-[var(--border-color)] overflow-hidden ring-2 ring-[var(--brand-yellow)]/20 flex-shrink-0">
            <img src="https://picsum.photos/40/40?grayscale" alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-[var(--text-primary)] truncate transition-colors duration-300">Senior Analyst</p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 truncate tracking-tight">meta@zoop.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
