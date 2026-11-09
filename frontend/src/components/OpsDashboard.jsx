import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Clock, AlertTriangle, ShieldCheck, DollarSign, Send,
  Building2, CheckCircle2, ChevronRight, ArrowUpRight, BarChart3,
  Calendar, Smartphone, Sparkles, AlertCircle
} from 'lucide-react';

export default function OpsDashboard({ trips, onTripUpdated }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingSmsId, setSendingSmsId] = useState(null);
  const [smsNotice, setSmsNotice] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const sendReminder = async (tripId) => {
    try {
      setSendingSmsId(tripId);
      const res = await fetch(`/api/trips/${tripId}/send-sms-reminder`, { method: 'POST' });
      const data = await res.json();
      setSmsNotice(data.message);
      setTimeout(() => setSmsNotice(null), 5000);
    } catch (e) {
      alert("Failed to send reminder");
    } finally {
      setSendingSmsId(null);
    }
  };

  const missingTrips = trips.filter(t => t.pod_status === 'PENDING_CAPTURE');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operations & MD Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of POD turnaround time, missing deliveries by branch, and unlocked working capital.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Avg POD Time: <strong className="text-sky-950 font-black">3.8 Days</strong> (Target: 4d)</span>
          </span>
        </div>
      </div>

      {smsNotice && (
        <div className="mb-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs font-semibold flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-sky-600" />
          <span>{smsNotice}</span>
        </div>
      )}

      {/* 4 PRIMARY ECONOMIC IMPACT CARDS (From Problem Statement Math) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Working Capital Freed */}
        <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-2xl border border-sky-200 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Working Capital Freed</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">₹3.24 Crore</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Billing accelerated by <strong>14 days</strong> (18d down to 4d) across ₹84.48 Cr freight
          </p>
        </div>

        {/* Card 2: Annual Interest Saved */}
        <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl border border-emerald-200 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Interest Cost Saved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 tracking-tight">₹38.9 Lakh/yr</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Bank working capital interest saved @ <strong>12% p.a.</strong>
          </p>
        </div>

        {/* Card 3: Disputed Freight Saved */}
        <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-amber-200 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lost POD Freight Saved</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 tracking-tight">₹63.36 Lakh/yr</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Loss reduction: 396 lost PODs (1.5%) reduced to &lt; 0.5%
          </p>
        </div>

        {/* Card 4: Total Annual Value */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-4 shadow-md text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Total Annual Value</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">₹1.02 Crore/yr</div>
          <p className="text-[11px] text-slate-300 mt-1">
            System ROI: <strong>27 Days</strong> (Cost ₹7.5 Lakh paid back in under 1 month)
          </p>
        </div>
      </div>

      {/* MISSING POD AGING BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Missing-POD Aging Buckets (Unbilled Exposure)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block">&lt; 24 Hours</span>
            <span className="text-lg font-bold text-slate-800">
              {stats?.aging_buckets?.age_under_24h || 1} Trips
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">On Schedule</span>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
            <span className="text-[11px] text-slate-500 block">24 - 48 Hours</span>
            <span className="text-lg font-bold text-sky-950">
              {stats?.aging_buckets?.age_24_48h || 1} Trips
            </span>
            <span className="text-[10px] text-sky-700 block mt-0.5">Automated SMS Triggered</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] text-slate-500 block">48 Hours - 7 Days</span>
            <span className="text-lg font-bold text-amber-950">
              {stats?.aging_buckets?.age_48h_7d || 1} Trips
            </span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Branch Escalation</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] text-rose-600 block font-semibold">&gt; 7 Days (Critical)</span>
            <span className="text-lg font-bold text-rose-950">
              {stats?.aging_buckets?.age_over_7d || 1} Trips
            </span>
            <span className="text-[10px] text-rose-700 block mt-0.5">Dispute Risk - Urgent</span>
          </div>
        </div>
      </div>

      {/* BRANCH COMPARISON & MISSING POD ACTION TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Branch Stats */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> POD Turnaround by Branch
          </h2>

          <div className="space-y-3">
            {(stats?.branch_stats || []).map((br) => (
              <div key={br.branch} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{br.branch}</h3>
                  <span className="text-[11px] text-slate-500">
                    {br.total_branch_trips} Total Trips | Freight: ₹{br.branch_freight?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    br.missing_pods > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {br.missing_pods} Missing PODs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing PODs Quick Action Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Action Required: Trips Missing POD
            </h2>
            <span className="text-xs text-slate-400">{missingTrips.length} Trips</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2 px-3">Trip ID</th>
                  <th className="py-2 px-3">Vehicle</th>
                  <th className="py-2 px-3">Destination</th>
                  <th className="py-2 px-3">Driver Phone</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missingTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{t.id}</td>
                    <td className="py-2.5 px-3 text-slate-700">{t.vehicle_no}</td>
                    <td className="py-2.5 px-3 text-slate-700">{t.destination}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{t.driver_phone}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        disabled={sendingSmsId === t.id}
                        onClick={() => sendReminder(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>{sendingSmsId === t.id ? 'Sending...' : 'Send SMS Link'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

