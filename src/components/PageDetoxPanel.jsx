import React from "react";
import MolecularCanvas from "./MolecularCanvas";
import CircularGauge from "./CircularGauge";
import SmartDetoxificationSystem from "./SmartDetoxificationSystem";
import {
  FlaskConical,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Flame,
  Droplets,
  RotateCcw,
  Play,
  Pause,
  ChevronDown,
  CheckCircle2,
  Cpu,
  Sparkles,
} from "lucide-react";

const PageDetoxPanel = ({
  chemicalDatabase,
  selectedKey,
  onSelectChemical,
  activeChemical,
  isPurifying,
  progress,
  activeStep,
  simulatedToxicity,
  simulatedSafetyVal,
  simLogs,
  onStartPurification,
  onResetSimulation,
}) => {
  // If no active chemical selected, pick first in database or default to sulfuric_acid
  const currentChem = activeChemical || chemicalDatabase["sulfuric_acid"] || Object.values(chemicalDatabase)[0];

  const tox = simulatedToxicity !== undefined && simulatedToxicity > 0 ? simulatedToxicity : (currentChem?.toxicity || 75);
  const safety = simulatedSafetyVal !== undefined && simulatedSafetyVal > 0 ? simulatedSafetyVal : Math.max(10, 100 - tox);

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Top Banner / Chemical Switcher */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-orbitron uppercase tracking-widest mb-1">
              <Cpu className="h-4 w-4" />
              <span>Page 2: Chemical Detoxification Processing Panel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{currentChem?.name || "Select Chemical"}</span>
              <span className="text-sm font-mono px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                {currentChem?.formula || "N/A"}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
              Operational logic panel displaying 3 distinct remediation processes and automated decontamination control for the selected chemical.
            </p>
          </div>

          {/* Quick Dropdown Chemical Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <label className="block text-[10px] font-mono text-slate-400 mb-1">Active Chemical Target:</label>
              <select
                value={selectedKey}
                onChange={(e) => onSelectChemical(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 text-cyan-300 font-orbitron text-xs font-bold px-4 py-2.5 pr-10 rounded-xl focus:outline-none focus:border-cyan-400 transition-all cursor-pointer shadow-lg"
              >
                {Object.entries(chemicalDatabase || {}).map(([key, chem]) => (
                  <option key={key} value={key} className="bg-slate-950 text-slate-200">
                    {chem.name} ({chem.formula})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 bottom-3 h-4 w-4 text-cyan-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Chemical Operational Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Molecular & Hazard Metadata Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-orbitron font-bold text-slate-400 uppercase tracking-wider">
                Molecular Structure & Profile
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                CAS: {currentChem?.cas || "7664-93-9"}
              </span>
            </div>

            {/* Interactive Molecular Canvas */}
            <div className="h-44 w-full rounded-2xl bg-slate-950/90 border border-slate-800/80 overflow-hidden relative mb-4">
              <MolecularCanvas chemicalKey={selectedKey || "sulfuric_acid"} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400 font-mono">Category:</span>
                <span className="text-white font-semibold">{currentChem?.category || "Industrial Acid"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400 font-mono">Hazard Rating:</span>
                <span className="text-amber-400 font-semibold">{currentChem?.hazardCategory || "High Corrosive"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400 font-mono">Safety Status:</span>
                <span className={`font-semibold ${currentChem?.recommendations?.safetyStatus === "Danger" ? "text-rose-400" : "text-emerald-400"}`}>
                  {currentChem?.recommendations?.safetyStatus || "Caution Required"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Required PPE:</span>
            <div className="flex flex-wrap gap-1">
              {(currentChem?.ppe || ["Full Hazmat Suit", "Vapor Respirator", "Acid Boots"]).map((item, idx) => (
                <span key={idx} className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Gauges & Controls Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs font-orbitron font-bold text-slate-400 uppercase tracking-wider">
              Toxicity & System Safety Gauges
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 border border-slate-800">
              {isPurifying ? "CYCLE_IN_PROGRESS" : "SYSTEM_READY"}
            </span>
          </div>

          {/* Dual Gauges */}
          <div className="flex justify-center items-center gap-6 my-2">
            <div className="flex flex-col items-center">
              <CircularGauge value={tox} title="Toxicity Load" color="#f43f5e" size={120} />
              <span className="text-[10px] font-mono text-slate-400 mt-1">Hazard Level</span>
            </div>

            <div className="flex flex-col items-center">
              <CircularGauge value={safety} title="Safety Index" color="#10b981" size={120} />
              <span className="text-[10px] font-mono text-slate-400 mt-1">Effluent Safety</span>
            </div>
          </div>

          {/* Decontamination Action Controls */}
          <div className="w-full flex gap-3 pt-2">
            <button
              onClick={onStartPurification}
              disabled={isPurifying}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-orbitron font-bold text-xs transition-all shadow-lg ${
                isPurifying
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20"
              }`}
            >
              {isPurifying ? (
                <>
                  <Pause className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Purifying ({progress}%)</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run Remediation Cycle</span>
                </>
              )}
            </button>

            <button
              onClick={onResetSimulation}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              title="Reset Simulation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tactical Recommendation Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Treatment Overview
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Verified Logic
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                  Core Strategy:
                </span>
                <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                  {currentChem?.recommendations?.detoxProcess || "Controlled alkaline buffering, activated carbon adsorption, and advanced chemical oxidation."}
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                  Waste Disposal & Filtration:
                </span>
                <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                  {currentChem?.recommendations?.wasteMgmt || "Dewatering slurry precipitate and high-pressure reverse osmosis polishing."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Handling Protocol:</span>
            <span className="text-cyan-300 font-bold truncate max-w-[200px]">
              {currentChem?.safeHandling?.split(".")[0] || "Standard Hazmat Precautions"}
            </span>
          </div>
        </div>
      </div>

      {/* 3 DISTINCT REMEDIATION PROCESSES PANEL */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <span>3 Distinct Remediation Processes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific chemical neutralization, physical absorption, and oxidation/reduction safety protocols for <strong className="text-cyan-300">{currentChem?.name}</strong>.
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 self-start sm:self-auto">
            Target pH: 6.5 - 8.5 | Safe Discharge Compliance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PROCESS 1: Neutralization Formulas & Reagents */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-orbitron text-cyan-400 uppercase tracking-wider">
                      Neutralization
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">Chemical Buffering</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {currentChem?.detox?.neutralization?.efficiency || 94}% Eff
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">
                    Reaction Equation:
                  </span>
                  <code className="text-[11px] font-mono text-cyan-300 font-bold block break-all">
                    {currentChem?.detox?.neutralization?.reaction || "H₂SO₄ + Na₂CO₃ → Na₂SO₄ + H₂O + CO₂"}
                  </code>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Reagent Agent:</span>
                    <span className="text-emerald-400 font-bold">
                      {currentChem?.detox?.neutralization?.recomm || "Sodium Carbonate"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Monitoring Sensor:</span>
                    <span className="text-cyan-400 font-semibold">
                      {currentChem?.detox?.neutralization?.monitoring || "pH Electrodes"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                  {currentChem?.detox?.neutralization?.method || "Stoichiometric alkaline buffering to neutralize corrosive acid hydronium ions."}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Reaction Enthalpy:</span>
              <span className="text-amber-400 font-bold">Exothermic (-57 kJ/mol)</span>
            </div>
          </div>

          {/* PROCESS 2: Physical Absorption & Filtration Methods */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-orbitron text-teal-400 uppercase tracking-wider">
                      Physical Absorption
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">VOC & Phase Separation</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {currentChem?.detox?.absorption?.efficiency || 98}% Eff
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">
                    Active Media Bed:
                  </span>
                  <span className="text-[11px] font-mono text-teal-300 font-bold block">
                    {currentChem?.detox?.absorption?.technique || "Activated Carbon & Zeolite Matrix"}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Absorption Method:</span>
                    <span className="text-teal-400 font-bold">
                      {currentChem?.detox?.absorption?.method?.split(".")[0] || "Gas Scrubbing & Vapor Trap"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Bed Depth & Retention:</span>
                    <span className="text-cyan-400 font-semibold">1.5m Bed (120s HRT)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                  Physical surface binding on high micro-pore activated media to isolate organic vapors and non-reactive chemical residues.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>VOC Recovery Rate:</span>
              <span className="text-teal-400 font-bold">&gt; 99.2% Capture</span>
            </div>
          </div>

          {/* PROCESS 3: Oxidation / Reduction Safety Cycles */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-orbitron text-indigo-400 uppercase tracking-wider">
                      Oxidation / Reduction
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">Destruction Cycle</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {currentChem?.detox?.oxidation?.efficiency || 90}% Eff
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">
                    Oxidizing Agents & Catalyst:
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300 font-bold block">
                    {currentChem?.detox?.oxidation?.agents || "Fenton's Reagent (Fe²⁺/H₂O₂) & UV Ozonation"}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Redox Technique:</span>
                    <span className="text-indigo-400 font-bold">
                      {currentChem?.detox?.oxidation?.method?.split(".")[0] || "Advanced Oxidation Process (AOP)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Radical Generation:</span>
                    <span className="text-cyan-400 font-semibold">•OH Hydroxyl Radicals</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                  Rapid catalytic destruction of complex molecular bonds into inert aqueous byproducts ($H_2O$, $CO_2$, mineral salts).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Byproduct Compliance:</span>
              <span className="text-emerald-400 font-bold">Zero Toxic Residue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive System Flow Monitor Component */}
      <SmartDetoxificationSystem
        activeChemical={currentChem}
        isPurifying={isPurifying}
        progress={progress}
        activeStep={activeStep}
        logs={simLogs}
      />
    </div>
  );
};

export default PageDetoxPanel;
