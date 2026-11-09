import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, Download, ExternalLink, MapPin, Calendar, Truck, ShieldCheck } from 'lucide-react';

export default function ClientPortal({ currentUser }) {
  const [selectedClient, setSelectedClient] = useState('Company B');
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientDeliveries = async (clientKey) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/public/client-portal/${encodeURIComponent(clientKey)}`);
      const data = await res.json();
      setDeliveries(data.verified_deliveries || []);
    } catch (e) {
      console.error("Failed to load client portal", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDeliveries(selectedClient);
  }, [selectedClient]);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4" /> Client Self-Service POD Portal
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Verified Deliveries & Signed POD Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instant digital access to signed gate-pass receipts, consignee stamps, and delivery timestamps from Company A Logistics.
          </p>
        </div>

        {/* Client Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Client:</span>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 outline-none"
          >
            <option value="Company B">Company B (Cement)</option>
            <option value="Company C">Company C (Steel)</option>
            <option value="Company D">Company D (Packaged Foods)</option>
          </select>
        </div>
      </div>

      {/* Deliveries Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading verified deliveries...</div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">No delivered trips yet for {selectedClient}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveries.map((del) => (
            <div key={del.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-slate-900">{del.id}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Delivery
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">LR Number</span>
                    <span className="font-mono font-semibold text-slate-900">{del.lr_no}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vehicle</span>
                    <span className="font-semibold text-slate-900">{del.vehicle_no}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Destination</span>
                    <span className="font-semibold text-slate-900">{del.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Freight</span>
                    <span className="font-semibold text-slate-900">₹{del.freight_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* GPS and Time */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{del.destination} Gate</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(del.delivered_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* View / Download Button */}
              {del.pod_download_url ? (
                <a
                  href={del.pod_download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Verified Signed POD</span>
                </a>
              ) : (
                <div className="text-center text-[11px] text-slate-400 py-2">POD Image Pending</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

