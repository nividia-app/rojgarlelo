import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../types';
import { BarChart3, TrendingUp, Users, MapPin, Target, RefreshCw, Briefcase, Award, Building2 } from 'lucide-react';

interface AdminAnalyticsProps {
  token: string | null;
}

export default function AdminAnalytics({ token }: AdminAnalyticsProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Could not pull metrics report');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-500 mb-2" />
        <p className="text-sm text-zinc-500">Calculating system metrics. Please wait...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-700 bg-red-100 rounded-2xl">
        <p className="text-sm font-bold">Failed to load hiring analytics summary report.</p>
        <button onClick={fetchAnalytics} className="mt-2 text-xs underline font-semibold text-zinc-900 cursor-pointer">
          Retry Sync Sequence
        </button>
      </div>
    );
  }

  // Calculate status summaries
  const statusLabels = {
    applied: { text: "Applied", color: "bg-blue-500/10 text-blue-700 font-bold border-blue-500/20" },
    screening: { text: "Screening", color: "bg-amber-500/10 text-amber-700 font-bold border-amber-500/20" },
    interview: { text: "Interview Phase", color: "bg-indigo-500/10 text-indigo-700 font-bold border-indigo-500/20" },
    selected: { text: "Offered / Selected", color: "bg-emerald-500/10 text-emerald-705 font-bold border-emerald-500/20" },
    rejected: { text: "Rejected", color: "bg-rose-500/10 text-rose-700 font-bold border-rose-500/20" }
  };

  // SVG Chart Dimensions & Helpers
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 30;

  // Render responsive coordinates for engagement timeline (6 months view)
  const renderEngagementChart = () => {
    const list = data.candidateEngagement;
    if (list.length === 0) return null;

    const maxVal = Math.max(...list.map(d => Math.max(d.applications, d.jobViews / 4))) || 10;
    
    // Generate SVG path coordinates
    const appPoints = list.map((item, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (list.length - 1);
      const y = chartHeight - padding - (item.applications / maxVal) * (chartHeight - padding * 2);
      return { x, y };
    });

    const viewPoints = list.map((item, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (list.length - 1);
      // Normalized: job view values scaled down for representation
      const y = chartHeight - padding - ((item.jobViews / 4) / maxVal) * (chartHeight - padding * 2);
      return { x, y };
    });

    const appPath = appPoints.reduce((p, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${p} L ${pt.x} ${pt.y}`, "");
    const viewPath = viewPoints.reduce((p, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${p} L ${pt.x} ${pt.y}`, "");

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e4e4e7" strokeWidth="1.5" />
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* View Line Path (Violet) */}
          <path d={viewPath} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Application Line Path (Charcoal) */}
          <path d={appPath} fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots and Tooltips */}
          {appPoints.map((pt, i) => (
            <g key={`dotsApp-${i}`}>
              <circle cx={pt.x} cy={pt.y} r="4" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={viewPoints[i].x} cy={viewPoints[i].y} r="4" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
              {/* x-axis label */}
              <text x={pt.x} y={chartHeight - 10} textAnchor="middle" className="text-[10px] font-mono fill-zinc-400 font-bold">
                {list[i].month.split(" ")[0]}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 justify-end mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-zinc-900 inline-block"></span>
            <span>Direct Applications ({data.totalApplications})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-violet-400 inline-block"></span>
            <span>Job Views Index (Scaled)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="analytics_dashboard_panel" className="space-y-6">
      
      {/* Dynamic Summary Cards */}
      <div id="analytics_metrics_bento" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Vacancies</span>
            <Briefcase className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-4">
            <h4 id="metric_jobs_count" className="text-3xl font-black text-zinc-900 tracking-tight">{data.totalJobs}</h4>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">Multi-Company Listings</p>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Sourcing Companies</span>
            <Building2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-4">
            <h4 id="metric_companies_count" className="text-3xl font-black text-zinc-900 tracking-tight">{data.totalCompanies}</h4>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">Managed Workspaces</p>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Seekers</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-4">
            <h4 id="metric_candidates_count" className="text-3xl font-black text-zinc-900 tracking-tight">{data.totalCandidates}</h4>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">Profile-Verified Talents</p>
          </div>
        </div>

        <div className="bg-zinc-55 border bg-zinc-900 border-zinc-800 rounded-2xl p-4 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hiring Submissions</span>
            <Target className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-4">
            <h4 id="metric_applications_count" className="text-3xl font-black text-white tracking-tight">{data.totalApplications}</h4>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">Submitted Resumes</p>
          </div>
        </div>

      </div>

      {/* Main Charts Matrix */}
      <div id="analytics_analytics_visuals" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dual trends timeline */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <TrendingUp className="w-4 h-4 text-zinc-700" />
            <h3 className="font-bold text-sm text-zinc-950">Applicant Engagement Trends</h3>
          </div>
          
          {renderEngagementChart()}

          <div className="p-3 bg-zinc-50 rounded-xl space-y-2 text-xs text-zinc-600">
            <div className="font-bold text-zinc-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Sourcing Insights & Forecast
            </div>
            <p className="leading-relaxed">
              Job applications increased by <b>24%</b> month-over-month, primarily driven by Senior React/TS Roles and Cloud DevSecOps job postings in Bengaluru and Hyderabad branches.
            </p>
          </div>
        </div>

        {/* Status Pipeline distribution */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <BarChart3 className="w-4 h-4 text-zinc-700" />
              <h3 className="font-bold text-sm text-zinc-950">Candidate Status Funnel</h3>
            </div>

            <div className="space-y-2.5">
              {Object.entries(data.byStatus).map(([statusKey, count]) => {
                const label = (statusLabels as any)[statusKey] || { text: statusKey, color: 'bg-zinc-100 text-zinc-700' };
                const percentage = data.totalApplications > 0 ? ((count as number) / data.totalApplications) * 100 : 0;
                
                return (
                  <div key={statusKey} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-zinc-750">
                      <span id={`status_label_${statusKey}`} className="capitalize">{label.text}</span>
                      <span className="font-mono text-zinc-500">{count} applications</span>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div
                        id={`status_bar_${statusKey}`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                        className={`h-full rounded-full transition-all duration-500 bg-zinc-900`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-650">
            <span>Overall Sourcing Health:</span>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase text-[10px]">Optimal</span>
          </div>
        </div>

      </div>

      {/* Recruiter performances and Geographic Vacancy roster */}
      <div id="analytics_recruiter_and_location" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geographic Open Locations map */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <MapPin className="w-4 h-4 text-zinc-700" />
            <h3 className="font-bold text-sm text-zinc-950">Vacancy Geography Heat</h3>
          </div>

          <div className="space-y-4">
            {data.byLocation.length === 0 ? (
              <p className="text-center py-4 text-zinc-400 text-xs font-semibold">No locations matching active lists.</p>
            ) : (
              data.byLocation.map((loc) => (
                <div key={loc.name} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-850 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {loc.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Offices & Co-work spaces</span>
                  </div>
                  
                  {/* Visual allocation metrics */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {loc.count} quotas open
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recruiter comparison and velocity */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Target className="w-4 h-4 text-zinc-700" />
            <h3 className="font-bold text-sm text-zinc-950">Recruiter Dispatch Velocity</h3>
          </div>

          <div className="divide-y divide-zinc-100">
            {data.recruiterPerformance.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-zinc-900">{item.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    {item.name.toLowerCase().includes('anjali') ? 'Apex Sourcing Team' : 'Nebula Human Resources'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <div className="text-center">
                    <div id={`recruiter_jobs_${item.name.split(' ')[0]}`} className="text-zinc-900">{item.jobsOwned}</div>
                    <div className="text-[9px] text-zinc-400 font-sans uppercase font-extrabold">Jobs</div>
                  </div>
                  <div className="text-center border-l border-zinc-200 pl-4">
                    <div className="text-zinc-900">{item.interviewsConducted}</div>
                    <div className="text-[9px] text-zinc-400 font-sans uppercase font-extrabold">Interviews</div>
                  </div>
                  <div className="text-center border-l border-zinc-200 pl-4 text-emerald-600">
                    <div>{item.conversions}</div>
                    <div className="text-[9px] text-zinc-400 font-sans uppercase font-extrabold">Hires</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
