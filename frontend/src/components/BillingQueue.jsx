import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Eye, ZoomIn, ZoomOut,
  RotateCcw, Sparkles, Clock, MapPin, User, FileText, Check, AlertCircle,
  Edit3, Lock, ShieldAlert, ArrowRight
} from 'lucide-react';

export default function BillingQueue({ onTripUpdated }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [billingNotes, setBillingNotes] = useState('');
  const [correctedQty, setCorrectedQty] = useState('');
  const [correctedRemarks, setCorrectedRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/billing/review-queue');
      const data = await res.json();
      setItems(data.items || []);
      if (data.items && data.items.length > 0 && !selectedItem) {
        selectTripForReview(data.items[0]);
      }
    } catch (err) {
      console.error("Failed to load review queue", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const selectTripForReview = (item) => {
    setSelectedItem(item);
    setZoomLevel(1);
    setBillingNotes(item.remarks || '');
    setCorrectedQty(item.received_quantity || '650 Bags / 32.5 MT');
    setCorrectedRemarks(item.shortage_damage_remarks || item.remarks || '');
    setActionSuccessMsg(null);
  };

  const handleReviewAction = async (actionType) => {
    if (!selectedItem) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/billing/review/${selectedItem.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          billing_notes: billingNotes,
          received_quantity: correctedQty,
          shortage_damage_remarks: correctedRemarks,
          retake_reason: actionType === 'REQUEST_RETAKE' ? 'Clear stamp required by Billing' : null
        })
      });

      if (!res.ok) throw new Error("Action failed");
      const result = await res.json();
      setActionSuccessMsg(`Trip ${selectedItem.id} marked as ${result.new_pod_status}`);
      if (onTripUpdated) onTripUpdated();
      fetchQueue();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Billing Executive Review Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {items.length} Pending Actions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop review for flagged PODs, shortage/damage remarks, and retake requests before invoice generation.
          </p>
        </div>

        {/* DPDP Act 2023 Notice */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600">
          <Lock className="w-3.5 h-3.5 text-sky-600" />
          <span>DPDP Act 2023 Compliant: PII Protected & Audit Logged</span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Review Queue List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Flagged Trips</h2>
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading review queue...</div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Queue is Clear!</p>
              <p className="text-xs text-slate-500 mt-1">All PODs have been verified or resolved.</p>
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => selectTripForReview(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-sm ring-1 ring-sky-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{item.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.pod_status === 'NEEDS_REVIEW'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.pod_status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-800 truncate">{item.client_name}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span>{item.vehicle_no}</span>
                    <span className="font-semibold text-slate-900">₹{item.freight_amount?.toLocaleString('en-IN')}</span>
                  </div>

                  {item.remarks && (
                    <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 font-medium">
                      ⚠️ {item.remarks}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Split Screen Comparison (POD Image & AI Corrections) */}
        {selectedItem ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Split Screen Left: Interactive Document Viewer */}
            <div className="md:w-1/2 p-4 bg-slate-900 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" /> Source of Truth: POD
                </span>
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <button
                    onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.2))}
                    className="p-1 hover:text-sky-400"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
                    className="p-1 hover:text-sky-400"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 hover:text-sky-400"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Document Image with pan & zoom container */}
              <div className="relative my-4 overflow-auto max-h-[480px] bg-slate-950 rounded-xl p-2 flex items-center justify-center">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt="POD Document"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                    className="transition-transform duration-150 max-w-full rounded shadow-md object-contain"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No image uploaded yet for this trip
                  </div>
                )}
              </div>

              {/* Geotag Stamp Info on Document */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Lat: {selectedItem.gps_lat || 19.8762}°N, Lng: {selectedItem.gps_lng || 75.3433}°E</span>
                </div>
                <span>Captured: {new Date(selectedItem.captured_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Split Screen Right: AI Extraction & Manual Correction Form */}
            <div className="md:w-1/2 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Reviewing Trip</span>
                    <h3 className="text-base font-bold text-slate-900">{selectedItem.id}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    LR: {selectedItem.lr_no}
                  </span>
                </div>

                {/* AI Extracted vs Expected Comparison */}
                <div className="my-4 space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" /> AI Vision Diagnostics
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Confidence: {Math.round((selectedItem.confidence_score || 0.75) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Stamp Status:</span>
                        <span className={`font-semibold ${selectedItem.stamp_detected ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {selectedItem.stamp_detected ? 'Verified Seal' : 'Missing / Incomplete'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Signature:</span>
                        <span className={`font-semibold ${selectedItem.signature_detected ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {selectedItem.signature_detected ? 'Signed by Consignee' : 'Unconfirmed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Override Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Received Quantity Confirmation
                      </label>
                      <input
                        type="text"
                        value={correctedQty}
                        onChange={(e) => setCorrectedQty(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
                        placeholder="e.g. 644 Cartons (6 short) or 32.5 MT"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Shortage / Damage Deduction Remarks
                      </label>
                      <input
                        type="text"
                        value={correctedRemarks}
                        onChange={(e) => setCorrectedRemarks(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 outline-none text-rose-700"
                        placeholder="e.g. 6 cartons short deducted from freight ledger"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Billing Executive Notes (Internal)
                      </label>
                      <textarea
                        rows={2}
                        value={billingNotes}
                        onChange={(e) => setBillingNotes(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 outline-none"
                        placeholder="Verified with plant manager on phone. Approved for freight billing."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleReviewAction('APPROVE')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve for Invoicing</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleReviewAction('REQUEST_RETAKE')}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request Retake</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleReviewAction('FLAG_DISPUTE')}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Hold Freight</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Select a trip from the left queue to inspect
          </div>
        )}
      </div>
    </div>
  );
}

