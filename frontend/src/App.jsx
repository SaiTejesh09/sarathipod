import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DriverCapture from './components/DriverCapture';
import BillingQueue from './components/BillingQueue';
import InvoicingQueue from './components/InvoicingQueue';
import OpsDashboard from './components/OpsDashboard';
import TripImport from './components/TripImport';
import ClientPortal from './components/ClientPortal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('driver');
  const [lang, setLang] = useState('mr'); // Default Marathi as per Maharashtra brief
  const [trips, setTrips] = useState([]);
  const [demoUsers, setDemoUsers] = useState([]);
  const [smsTokenParam, setSmsTokenParam] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: "USR-DRV-01",
    username: "driver1",
    full_name: "Ramesh Pawar (रमेश पवार)",
    role: "driver",
    branch: "Chhatrapati Sambhajinagar"
  });

  const loadInitialData = async () => {
    try {
      const [tripsRes, usersRes] = await Promise.all([
        fetch('/api/trips').then(r => r.json()),
        fetch('/api/auth/demo-users').then(r => r.json())
      ]);
      setTrips(tripsRes.trips || []);
      setDemoUsers(usersRes.demo_users || []);
    } catch (e) {
      console.error("Error loading initial data", e);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check direct URL path for Hired Driver SMS link or Client Portal
    const path = window.location.pathname;
    if (path.startsWith('/p/')) {
      const token = path.replace('/p/', '');
      setSmsTokenParam(token);
      setCurrentTab('driver');
    } else if (path.startsWith('/portal')) {
      setCurrentTab('client_portal');
    }
  }, []);

  const reviewQueueCount = trips.filter(
    t => t.pod_status === 'NEEDS_REVIEW' || t.pod_status === 'RETAKE_REQUESTED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar with Role & Language Switcher */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        demoUsers={demoUsers}
        lang={lang}
        setLang={setLang}
        reviewQueueCount={reviewQueueCount}
      />

      {/* Reviewer Quick Scenario Guided Tour Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span className="font-bold text-sky-300">Reviewer 1-Click Guided Scenarios:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setCurrentTab('driver');
                const drv = demoUsers.find(u => u.role === 'driver');
                if (drv) setCurrentUser(drv);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              1️⃣ Driver POD Capture
            </button>
            <button
              onClick={() => {
                setCurrentTab('billing_review');
                const bil = demoUsers.find(u => u.role === 'billing');
                if (bil) setCurrentUser(bil);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              2️⃣ Split-Screen Review Queue
            </button>
            <button
              onClick={() => {
                setCurrentTab('invoicing');
                const bil = demoUsers.find(u => u.role === 'billing');
                if (bil) setCurrentUser(bil);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              3️⃣ Tally XML & Invoice PDF
            </button>
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                const dir = demoUsers.find(u => u.role === 'director' || u.role === 'ops_head');
                if (dir) setCurrentUser(dir);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              4️⃣ Ops & ROI Dashboard (₹1.02 Cr)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'driver' && (
          <DriverCapture
            trips={trips}
            onTripUpdated={loadInitialData}
            lang={lang}
            initialSmsToken={smsTokenParam}
          />
        )}

        {currentTab === 'billing_review' && (
          <BillingQueue
            onTripUpdated={loadInitialData}
          />
        )}

        {currentTab === 'invoicing' && (
          <InvoicingQueue
            onInvoiceCreated={loadInitialData}
          />
        )}

        {currentTab === 'dashboard' && (
          <OpsDashboard
            trips={trips}
            onTripUpdated={loadInitialData}
          />
        )}

        {currentTab === 'import' && (
          <TripImport
            onImportSuccess={loadInitialData}
          />
        )}

        {currentTab === 'client_portal' && (
          <ClientPortal
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Clean, Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">SarathiPOD 1.0</span> — Built for Company A, Chhatrapati Sambhajinagar, Maharashtra
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span>Tally Prime Integration Ready</span>
            <span>•</span>
            <span>Offline Highway Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

