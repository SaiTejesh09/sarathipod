import React from 'react';
import { Truck, ShieldCheck, FileSpreadsheet, LayoutDashboard, UploadCloud, Users, Globe2, Sparkles, Building2 } from 'lucide-react';

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  demoUsers,
  lang,
  setLang,
  reviewQueueCount
}) {
  const tabs = [
    { id: 'driver', label: lang === 'mr' ? 'ड्रायव्हर कॅमेरा' : lang === 'hi' ? 'ड्राइवर कैमरा' : 'Driver Capture', icon: Truck, roleMin: 'driver' },
    { id: 'billing_review', label: lang === 'mr' ? 'बिलिंग रिव्ह्यू' : lang === 'hi' ? 'बिलिंग रिव्यू' : 'Review Queue', icon: ShieldCheck, badge: reviewQueueCount, roleMin: 'billing' },
    { id: 'invoicing', label: lang === 'mr' ? 'बिलिंग व Tally' : lang === 'hi' ? 'बिलिंग और Tally' : 'Billing & Tally', icon: FileSpreadsheet, roleMin: 'billing' },
    { id: 'dashboard', label: lang === 'mr' ? 'डॅशबोर्ड' : lang === 'hi' ? 'डैशबोर्ड' : 'Ops Dashboard', icon: LayoutDashboard, roleMin: 'driver' },
    { id: 'import', label: lang === 'mr' ? 'ट्रिप इम्पोर्ट' : lang === 'hi' ? 'ट्रिप इम्पोर्ट' : 'Trip Import', icon: UploadCloud, roleMin: 'billing' },
    { id: 'client_portal', label: lang === 'mr' ? 'क्लायंट पोर्टल' : lang === 'hi' ? 'क्लाइंट पोर्टल' : 'Client View', icon: Building2, roleMin: 'driver' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Top Banner for Company & Quick Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-800">Company A Logistics</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 hidden sm:inline">Chhatrapati Sambhajinagar, Maharashtra</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-medium border border-sky-200 hidden md:inline">
            140 Own Trucks + 200 Hired
          </span>
        </div>

        {/* Demo Role Switcher & Language Selector */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${lang === 'mr' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${lang === 'hi' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              English
            </button>
          </div>

          {/* Role selector for reviewer */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium hidden sm:inline">Role:</span>
            <select
              value={currentUser.username}
              onChange={(e) => {
                const found = demoUsers.find(u => u.username === e.target.value);
                if (found) {
                  setCurrentUser(found);
                  if (found.role === 'driver') setCurrentTab('driver');
                  else if (found.role === 'billing') setCurrentTab('billing_review');
                  else if (found.role === 'ops_head' || found.role === 'director') setCurrentTab('dashboard');
                  else if (found.role === 'client') setCurrentTab('client_portal');
                }
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {demoUsers.map(u => (
                <option key={u.username} value={u.username}>
                  {u.full_name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-sky-600/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">Sarathi<span className="text-sky-600">POD</span></span>
              <span className="inline-flex items-center gap-0.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-0.5">Automated POD & Billing Engine</p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

