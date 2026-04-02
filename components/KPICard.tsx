
import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, change, trend, loading }) => {
  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] p-8 rounded-[40px] border border-[var(--border-color)] animate-pulse">
        <div className="h-4 w-24 bg-[var(--border-color)] rounded-lg mb-4" />
        <div className="h-10 w-32 bg-[var(--bg-color)] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] p-8 rounded-[40px] border border-[var(--border-color)] hover:border-[var(--brand-yellow)]/30 transition-all group overflow-hidden relative shadow-2xl">
      <div className="relative z-10">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter group-hover:text-[var(--brand-yellow)] transition-colors">{value}</h3>
        </div>
        {change && (
          <p className={`text-[10px] mt-4 font-black uppercase tracking-widest flex items-center gap-1.5 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-[var(--text-secondary)]'
            }`}>
            <span className={`px-2 py-0.5 rounded-md ${trend === 'up' ? 'bg-emerald-400/10' : trend === 'down' ? 'bg-rose-400/10' : 'bg-[var(--text-secondary)]/10'}`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {change}
            </span>
            <span className="text-[9px] opacity-40">VS LAST 30D</span>
          </p>
        )}
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-[60px] opacity-[0.03] transition-all group-hover:opacity-10 ${label.toLowerCase().includes('spend') ? 'bg-[var(--brand-blue)]' : 'bg-[var(--brand-yellow)]'
        }`}></div>
    </div>
  );
};

export default KPICard;
