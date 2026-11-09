import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Plus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function TripImport({ onImportSuccess }) {
  const [csvText, setCsvText] = useState(
`Company B (cement),MH20 FD 5512,0,Chhatrapati Sambhajinagar,Nagpur,38500,Nagpur,Dnyaneshwar Shinde,+91 98229 11001,LR-45980,241098452200
Company C (steel),MH20 GT 9011,0,Chhatrapati Sambhajinagar,Pune,26000,Pune,Kishor Kadam,+91 98229 22002,LR-45981,241098452201
Company D (packaged foods),MH15 BY 8810,1,Chhatrapati Sambhajinagar,Indore,41200,Indore,Gopal Patil (Hired),+91 94229 33003,LR-45982,241098452202`
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importedResults, setImportedResults] = useState(null);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const lines = csvText.trim().split('\n');
      const items = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          client_name: parts[0] || 'Company B (cement)',
          vehicle_no: parts[1] || 'MH20 EL 1234',
          is_hired: parts[2] === '1' || parts[2]?.toLowerCase() === 'yes',
          origin: parts[3] || 'Chhatrapati Sambhajinagar',
          destination: parts[4] || 'Nagpur',
          freight_amount: parseFloat(parts[5]) || 32000,
          branch: parts[6] || 'Nagpur',
          driver_name: parts[7] || 'Driver',
          driver_phone: parts[8] || '+91 98220 00000',
          lr_no: parts[9] || 'LR-99999',
          eway_bill_no: parts[10] || '241099999999'
        };
      });

      const res = await fetch('/api/trips/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });

      if (!res.ok) throw new Error("Import failed");
      const data = await res.json();
      setImportedResults(data);
      if (onImportSuccess) onImportSuccess();
    } catch (e) {
      alert("Import error: " + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Trip Dispatch & LR Import</h1>
        <p className="text-xs text-slate-500 mt-1">
          Import daily dispatched loads with LR and e-way bill numbers from ERP/Tally. Automatically generates unique SMS capture tokens for drivers.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Paste CSV Rows (Client, Vehicle, Hired(0/1), Origin, Dest, Freight, Branch, Driver, Phone, LR, E-Way Bill)
        </label>

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:border-sky-500 outline-none leading-relaxed"
          placeholder="Client, Vehicle, Hired, Origin, Destination, Freight, Branch, Driver, Phone, LR, E-Way Bill"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {csvText.trim().split('\n').filter(Boolean).length} trips ready for dispatch
          </span>

          <button
            disabled={isImporting}
            onClick={handleImport}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isImporting ? 'Importing...' : 'Dispatch & Generate SMS Links'}</span>
          </button>
        </div>
      </div>

      {/* Imported Results */}
      {importedResults && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Successfully Dispatched {importedResults.imported_count} Trips!</span>
          </div>

          <div className="space-y-2">
            {importedResults.trips.map(tr => (
              <div key={tr.id} className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{tr.id}</span>
                  <span className="text-slate-400 mx-2">|</span>
                  <span className="font-mono text-slate-600">LR: {tr.lr_no}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-700 font-medium">SMS Upload Link Ready</span>
                  <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                    {tr.sms_upload_link}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

