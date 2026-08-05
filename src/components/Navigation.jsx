import React from "react";
import {
  FlaskConical,
  Activity,
  Cpu,
  Bot,
  FileSpreadsheet,
  Settings,
  Sparkles,
} from "lucide-react";

const Navigation = ({
  currentPage,
  setCurrentPage,
  selectedChemical,
  onOpenAIChat,
  onOpenPdfExport,
  onOpenConfigPanel,
  onOpenAddForm,
}) => {
  const tabs = [
    {
      id: "catalog",
      label: "Chemical Catalog",
      shortLabel: "Catalog",
      icon: FlaskConical,
      badge: "85+ DB",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: "detox",
      label: "Detoxification Panel",
      shortLabel: "Detox Panel",
      icon: Cpu,
      badge: selectedChemical ? selectedChemical.formula : "Select",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "telemetry",
      label: "Analytics & Telemetry",
      shortLabel: "Telemetry",
      icon: Activity,
      badge: "LIVE",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-orbitron tracking-wider text-white">
                PDD <span className="text-cyan-400">MOBILE</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                v2.4 PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Process Decontamination & Operational Logic
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-orbitron transition-all duration-300 ${
                  isActive
                    ? "text-white bg-slate-800 shadow-md border border-slate-700/60 shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-cyan-400" : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                    isActive
                      ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                      : "bg-slate-950/60 text-slate-500 border-slate-800"
                  }`}
                >
                  {tab.badge}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Add Chemical Quick Trigger */}
          <button
            onClick={onOpenAddForm}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-medium transition-all"
            title="Add Custom Chemical"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Add Chem</span>
          </button>

          {/* AI Chatbot Button */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400 animate-bounce" />
            <span className="hidden sm:inline font-orbitron text-[11px]">AI Advisor</span>
          </button>

          {/* PDF Report Export */}
          <button
            onClick={onOpenPdfExport}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Export Report"
          >
            <FileSpreadsheet className="h-4 w-4" />
          </button>

          {/* Settings / Config */}
          <button
            onClick={onOpenConfigPanel}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Firebase & System Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-2">
        <div className="grid grid-cols-3 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? "bg-slate-900 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? "text-cyan-400 animate-pulse" : ""}`} />
                <span className="text-[10px] font-bold font-orbitron tracking-tight truncate">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
