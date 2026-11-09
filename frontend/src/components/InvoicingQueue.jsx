import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Download, FileText, CheckCircle2, ChevronRight,
  Printer, ArrowUpRight, ShieldCheck, Sparkles, Building2, Calendar
} from 'lucide-react';

export default function InvoicingQueue({ onInvoiceCreated }) {
  const [clientGroups, setClientGroups] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [billingCycle, setBillingCycle] = useState('Weekly');
  const [successNotice, setSuccessNotice] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [queueRes, invRes] = await fetch('/api/billing/invoicing-queue').then(r => r.json()),
            invoicesData = await fetch('/api/billing/invoices').then(r => r.json());

      setClientGroups(queueRes.client_groups || []);
      setInvoices(invoicesData.invoices || []);

      // Default select all trips in each client group
      const initialSelected = {};
      (queueRes.client_groups || []).forEach(grp => {
        initialSelected[grp.client_name] = grp.trips.map(t => t.id);
      });
      setSelectedTrips(initialSelected);
    } catch (e) {
      console.error("Failed to load invoicing queue", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTripSelection = (clientName, tripId) => {
    setSelectedTrips(prev => {
      const current = prev[clientName] || [];
      const updated = current.includes(tripId)
        ? current.filter(id => id !== tripId)
        : [...current, tripId];
      return { ...prev, [clientName]: updated };
    });
  };

  const generateInvoiceForClient = async (group) => {
    const tripIds = selectedTrips[group.client_name] || [];
    if (tripIds.length === 0) {
      alert("Please select at least one trip to generate an invoice.");
      return;
    }

    try {
      setIsGenerating(true);
      const res = await fetch('/api/billing/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: group.client_id,
          trip_ids: tripIds,
          billing_cycle: billingCycle
        })
      });

      if (!res.ok) throw new Error("Invoice generation failed");
      const data = await res.json();
      setSuccessNotice(`Generated Invoice ${data.invoice_no} (₹${data.total_amount?.toLocaleString('en-IN')}) with certified POD attached!`);
      fetchData();
      if (onInvoiceCreated) onInvoiceCreated();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header & Tally Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Verified Billing & Tally Export Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Batch verified trips by client and cycle, attach signed POD images, and export directly into Tally Prime.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/api/billing/export/tally-xml"
            download="Tally_Sales_Vouchers.xml"
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Tally XML</span>
          </a>

          <a
            href="/api/billing/export/excel"
            download="SarathiPOD_Billing_Summary.xlsx"
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel Sheet</span>
          </a>
        </div>
      </div>

      {successNotice && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Client Batches Section */}
      <div className="space-y-6 mb-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Ready for Invoicing (Grouped by Client)
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading billing queue...</div>
        ) : clientGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">All Verified Trips Invoiced!</h3>
            <p className="text-xs text-slate-500 mt-1">
              New verified trips will appear here automatically as soon as drivers capture PODs or billing approves reviews.
            </p>
          </div>
        ) : (
          clientGroups.map((group) => {
            const selectedInGroup = selectedTrips[group.client_name] || [];
            const selectedTotalFreight = group.trips
              .filter(t => selectedInGroup.includes(t.id))
              .reduce((sum, t) => sum + t.freight_amount, 0);

            return (
              <div key={group.client_name} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Group Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{group.client_name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {group.trip_count} verified trips | Total Freight: ₹{group.total_freight?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Batch Invoicing Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
                      >
                        <option value="Weekly (Nov W1)">Weekly (Nov W1)</option>
                        <option value="Fortnightly">Fortnightly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    <button
                      disabled={isGenerating || selectedInGroup.length === 0}
                      onClick={() => generateInvoiceForClient(group)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Generate Invoice ({selectedInGroup.length})</span>
                    </button>
                  </div>
                </div>

                {/* Trips Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedInGroup.length === group.trips.length}
                            onChange={(e) => {
                              setSelectedTrips(prev => ({
                                ...prev,
                                [group.client_name]: e.target.checked ? group.trips.map(t => t.id) : []
                              }));
                            }}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                        </th>
                        <th className="py-2.5 px-3">Trip ID</th>
                        <th className="py-2.5 px-3">LR Number</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Destination</th>
                        <th className="py-2.5 px-3">Freight (₹)</th>
                        <th className="py-2.5 px-3">POD Status</th>
                        <th className="py-2.5 px-3 text-right">Preview POD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.trips.map((t) => {
                        const isChecked = selectedInGroup.includes(t.id);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTripSelection(group.client_name, t.id)}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{t.id}</td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{t.lr_no}</td>
                            <td className="py-2.5 px-3 text-slate-600">{t.vehicle_no}</td>
                            <td className="py-2.5 px-3 text-slate-600">{t.destination}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              ₹{t.freight_amount?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {t.image_url ? (
                                <a
                                  href={t.image_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sky-600 hover:text-sky-800 font-semibold underline text-[11px]"
                                >
                                  View POD
                                </a>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Generated Invoices Archive Section */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Generated Invoices (With Embedded PODs & Tally Mappings)
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Cycle</th>
                <th className="py-3 px-3">Trips</th>
                <th className="py-3 px-3">Freight (₹)</th>
                <th className="py-3 px-3">Total Inc. GST (₹)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">PDF Invoice + POD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.invoice_no}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{inv.client_name}</td>
                  <td className="py-3 px-3 text-slate-600">{inv.billing_cycle}</td>
                  <td className="py-3 px-3 text-slate-600">{inv.trip_count} trips</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    ₹{inv.total_freight?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{inv.total_amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`/api/billing/invoices/${inv.invoice_no}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Download PDF</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

