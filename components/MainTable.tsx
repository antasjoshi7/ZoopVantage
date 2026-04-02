
import React, { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  SortingFn,
} from '@tanstack/react-table';
import { Campaign } from '../types';
import { Icons, COLORS } from '../constants';
import CreativePreview from './CreativePreview';
import { getAdVideoUrl } from '../services/creativeService';

interface MainTableProps {
  data: Campaign[];
}

const columnHelper = createColumnHelper<Campaign>();

const MainTable: React.FC<MainTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedCampaigns);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCampaigns(next);
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Campaign / Ad Name',
      cell: (info) => {
        const isExpanded = expandedCampaigns.has(info.row.original.id);
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(info.row.original.id); }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-[var(--brand-yellow)] text-black' : 'bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] border border-[var(--border-color)]'}`}
              >
                {isExpanded ? '−' : '+'}
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--text-primary)] truncate max-w-[200px] group-hover:text-[var(--brand-yellow)] transition-colors">{info.getValue()}</span>
                {info.row.original.type === 'WHATSAPP_MESSAGE' && <span className="text-emerald-400 text-xs shadow-[0_0_10px_rgba(52,211,153,0.2)]"><Icons.WhatsApp /></span>}
                {info.row.original.type === 'APP_DOWNLOAD' && <span className="text-blue-400 text-xs shadow-[0_0_10px_rgba(96,165,250,0.2)]"><Icons.Download /></span>}
              </div>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] opacity-60 font-bold uppercase tracking-wider pl-9 mt-1">
              {info.row.original.ads.length} Creative{info.row.original.ads.length !== 1 ? 's' : ''} • {info.row.original.type.replace('_', ' ')}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('spend', {
      header: 'Total Spend',
      cell: (info) => <span className="font-mono font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">₹{Math.round(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('results', {
      header: 'Results',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-black text-[var(--text-primary)]">{Math.round(info.getValue()).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-tighter">
            {info.row.original.type === 'WHATSAPP_MESSAGE' ? 'Messages' : info.row.original.type === 'APP_DOWNLOAD' ? 'Installs' : 'Leads'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('costPerResult', {
      header: 'CP Result',
      cell: (info) => (
        <span className={`font-mono font-black text-xs px-3 py-1.5 rounded-xl border ${info.getValue() < 30 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[var(--bg-color)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}>
          ₹{info.getValue().toFixed(2)}
        </span>
      ),
    }),
    columnHelper.accessor('hookRate', {
      header: 'Avg Hook %',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-black text-[var(--brand-blue)]">{(info.getValue() * 100).toFixed(1)}%</span>
          <div className="w-16 h-1 w-full max-w-[60px] bg-[var(--bg-color)] rounded-full mt-2 overflow-hidden ring-1 ring-[var(--border-color)]">
            <div className="h-full bg-gradient-to-r from-[var(--brand-blue)] to-[#0044CC]" style={{ width: `${info.getValue() * 100}%` }}></div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('view100Rate', {
      header: 'Retention %',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-black text-[var(--text-secondary)]">{(info.getValue() * 100).toFixed(2)}%</span>
          <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-tighter">
            {Math.round(info.row.original.videoPlays100).toLocaleString()} FULL PLAYS
          </span>
        </div>
      ),
    }),
  ], [expandedCampaigns]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-[var(--card-bg)] rounded-[40px] border border-[var(--border-color)] overflow-hidden shadow-2xl transition-colors duration-300">
      <div className="p-8 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card-bg)] transition-colors duration-300">
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)]">
            <Icons.Search />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-[13px] font-bold text-[var(--text-primary)] placeholder-[var(--text-secondary)] opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]/20 focus:border-[var(--brand-yellow)]/50 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-yellow)] animate-pulse"></span>
            Live Performance Tracking
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[var(--bg-color)]/50 transition-colors duration-300">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--brand-yellow)] transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {table.getRowModel().rows.map((row) => {
              const campaign = row.original as Campaign;
              const isExpanded = expandedCampaigns.has(campaign.id);
              return (
                <React.Fragment key={row.id}>
                  <tr className={`group transition-all cursor-pointer ${isExpanded ? 'bg-[var(--brand-yellow)]/5' : 'hover:bg-[var(--text-primary)]/[0.02]'}`} onClick={() => toggleExpand(campaign.id)}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-8 py-6 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && campaign.ads.map((ad, idx) => (
                    <tr key={`${row.id}-ad-${idx}`} className="bg-[var(--bg-color)] border-l-4 border-[var(--brand-yellow)] transition-colors duration-300">
                      <td className="px-12 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {getAdVideoUrl(ad.adName) && (
                            <CreativePreview
                              videoUrl={getAdVideoUrl(ad.adName)!}
                              adName={ad.adName}
                              showPlayButton={true}
                              aspectRatio="w-12 h-12"
                              className="rounded-lg"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-[var(--brand-yellow)]">{ad.adName}</span>
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest">Active Creative</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">₹{Math.round(ad.spend).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-black text-[var(--text-primary)]">{Math.round(ad.results).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-[var(--text-secondary)] opacity-60">₹{ad.costPerResult.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-black text-[var(--brand-blue)]">{(ad.hookRate * 100).toFixed(1)}%</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-bold text-[var(--text-secondary)] opacity-60">{(ad.view100Rate * 100).toFixed(2)}%</span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] text-[10px]">No campaigns matching active filters</p>
        </div>
      )}
    </div>
  );
};

export default MainTable;
