import React, { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import {
  Activity,
  Thermometer,
  TestTube,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const PageTelemetryAnalytics = ({
  chemicalDatabase,
  selectedKey,
  onSelectChemical,
  activeChemical,
}) => {
  const currentChem = activeChemical || chemicalDatabase["sulfuric_acid"] || Object.values(chemicalDatabase)[0];

  // Simulation Live Telemetry State
  const [isLive, setIsLive] = useState(true);
  const [flowRate, setFlowRate] = useState(45); // L/min
  const [timeSeries, setTimeSeries] = useState([]);
  const [phData, setPhData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [decayData, setDecayData] = useState([]);

  // Generate initial simulated telemetry dataset (20 points)
  useEffect(() => {
    resetTelemetry();
  }, [selectedKey]);

  const resetTelemetry = () => {
    const times = [];
    const phs = [];
    const temps = [];
    const decays = [];

    const isAcid = currentChem?.category?.toLowerCase().includes("acid") || currentChem?.name?.toLowerCase().includes("acid");
    const isBase = currentChem?.category?.toLowerCase().includes("base") || currentChem?.name?.toLowerCase().includes("alkali");

    let initialPh = isAcid ? 1.4 : isBase ? 12.8 : 4.5;
    let initialTemp = 24.0;
    let initialDecay = currentChem?.toxicity || 85;

    const now = new Date();

    for (let i = 20; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 3000);
      const timeStr = t.toTimeString().split(" ")[0];
      times.push(timeStr);

      // Simulation curve back-calculation
      const progressFactor = (20 - i) / 20;

      // pH curve moves towards 7.0
      const currentPh = Number((initialPh + (7.0 - initialPh) * progressFactor + (Math.random() * 0.2 - 0.1)).toFixed(2));
      phs.push(currentPh);

      // Temp spikes exothermic then cools
      const tempSpike = Math.sin(progressFactor * Math.PI) * 22;
      const currentTemp = Number((initialTemp + tempSpike + (Math.random() * 1.5 - 0.75)).toFixed(1));
      temps.push(currentTemp);

      // Decay exponential decay
      const currentDecay = Number((initialDecay * Math.exp(-progressFactor * 2.2) + Math.random() * 2).toFixed(1));
      decays.push(currentDecay);
    }

    setTimeSeries(times);
    setPhData(phs);
    setTempData(temps);
    setDecayData(decays);
  };

  // Real-time telemetry tick interval
  useEffect(() => {
    let interval = null;
    if (isLive) {
      interval = setInterval(() => {
        const timeStr = new Date().toTimeString().split(" ")[0];

        setTimeSeries((prev) => [...prev.slice(1), timeStr]);

        setPhData((prev) => {
          const last = prev[prev.length - 1] || 7.0;
          // Target 7.0 with minor sensor noise
          const next = Number((7.0 + (last - 7.0) * 0.9 + (Math.random() * 0.15 - 0.075)).toFixed(2));
          return [...prev.slice(1), next];
        });

        setTempData((prev) => {
          const last = prev[prev.length - 1] || 32.0;
          // Target 28.5 ambient with cooling response
          const next = Number((28.5 + (last - 28.5) * 0.85 + (Math.random() * 0.8 - 0.4)).toFixed(1));
          return [...prev.slice(1), next];
        });

        setDecayData((prev) => {
          const last = prev[prev.length - 1] || 5.0;
          // Decay approaches 1.5 ppm
          const next = Number(Math.max(0.5, (last * 0.92 + (Math.random() * 0.4 - 0.2))).toFixed(1));
          return [...prev.slice(1), next];
        });
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  // Current Latest Telemetry Metrics
  const currentPh = phData[phData.length - 1] || 7.0;
  const currentTemp = tempData[tempData.length - 1] || 28.5;
  const currentDecay = decayData[decayData.length - 1] || 1.8;

  // Chart Configurations
  const commonChartOptions = {
    chart: {
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#94a3b8",
      fontFamily: "Inter, sans-serif",
      animations: { enabled: true, easing: "linear", dynamicAnimation: { speed: 500 } },
    },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 4,
    },
    tooltip: { theme: "dark" },
    xaxis: { categories: timeSeries, labels: { style: { fontSize: "9px" } } },
  };

  // 1. pH Trend Options
  const phOptions = {
    ...commonChartOptions,
    colors: ["#06b6d4"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
    },
    yaxis: { min: 0, max: 14, title: { text: "pH Level", style: { color: "#06b6d4" } } },
    annotations: {
      position: "back",
      yaxis: [
        { y: 6.5, y2: 8.5, fillColor: "#10b981", opacity: 0.15, label: { text: "Safe Discharge Band (6.5 - 8.5)", style: { color: "#10b981", fontSize: "10px" } } },
      ],
    },
  };

  // 2. Temperature Options
  const tempOptions = {
    ...commonChartOptions,
    colors: ["#f59e0b"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.5, opacityTo: 0.05 },
    },
    yaxis: { min: 15, max: 65, title: { text: "Temp (°C)", style: { color: "#f59e0b" } } },
    annotations: {
      position: "back",
      yaxis: [
        { y: 55, borderColor: "#ef4444", strokeDashArray: 2, label: { text: "Thermal Warning (55°C)", style: { color: "#ef4444", fontSize: "10px" } } },
      ],
    },
  };

  // 3. Chemical Decay Options
  const decayOptions = {
    ...commonChartOptions,
    colors: ["#10b981"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
    },
    yaxis: { min: 0, max: 100, title: { text: "Load (ppm)", style: { color: "#10b981" } } },
  };

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Top Telemetry Header & Controls */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-orbitron uppercase tracking-widest mb-1">
              <Activity className="h-4 w-4" />
              <span>Page 3: Live Analytics & Telemetry Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Real-Time Sensor Telemetry</span>
              <span className="flex items-center gap-1 text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                STREAMING
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
              Monitoring dynamic pH stabilization trends, thermal runaway reaction guards, and chemical concentration decay kinetics for <strong className="text-cyan-300">{currentChem?.name}</strong>.
            </p>
          </div>

          {/* Telemetry Live Stream Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Chemical Selector */}
            <div className="relative">
              <select
                value={selectedKey}
                onChange={(e) => onSelectChemical(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 text-cyan-300 font-orbitron text-xs font-bold px-3.5 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                {Object.entries(chemicalDatabase || {}).map(([key, chem]) => (
                  <option key={key} value={key} className="bg-slate-950 text-slate-200">
                    {chem.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold transition-all ${
                isLive
                  ? "bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900/80"
                  : "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80"
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            <button
              onClick={resetTelemetry}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              title="Reset Telemetry Data"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: pH */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">pH Neutralization</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1">
              {currentPh} <span className="text-xs text-slate-500 font-sans">pH</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400">Neutral Target: 7.0</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <TestTube className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2: Temperature */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Reactor Temp</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1">
              {currentTemp}°C
            </div>
            <span className="text-[9px] font-mono text-slate-400">Cooling Active</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Thermometer className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3: Contaminant Decay */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Contaminant Load</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
              {currentDecay} <span className="text-xs text-slate-500 font-sans">ppm</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400">t½ Decay: 45s</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4: Flow Rate Control */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="w-full">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase mb-1">
              <span>Dosage Flow</span>
              <span className="text-indigo-400 font-bold">{flowRate} L/min</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={flowRate}
              onChange={(e) => setFlowRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Live Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: pH Neutralization Curve */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-orbitron text-white flex items-center gap-2">
                <TestTube className="h-4 w-4 text-cyan-400" />
                <span>pH Neutralization Trend</span>
              </h3>
              <p className="text-[11px] text-slate-400">Stoichiometric buffering curve towards pH 7.0</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Live Sensor
            </span>
          </div>

          <div className="h-[230px]">
            <Chart
              options={phOptions}
              series={[{ name: "pH Level", data: phData }]}
              type="area"
              height="100%"
            />
          </div>
        </div>

        {/* CHART 2: Thermal Runaway & Temperature Guard */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-orbitron text-white flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-amber-400" />
                <span>Exothermic Temperature Spikes</span>
              </h3>
              <p className="text-[11px] text-slate-400">Reaction enthalpy thermal sensor guard (°C)</p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-500/30">
              Thermal Guard
            </span>
          </div>

          <div className="h-[230px]">
            <Chart
              options={tempOptions}
              series={[{ name: "Reactor Temp (°C)", data: tempData }]}
              type="area"
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* CHART 3: Chemical Decay & Contaminant Half-Life (Full Width) */}
      <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold font-orbitron text-white flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              <span>Chemical Decay & Concentration Half-Life (ppm)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Exponential toxic load reduction during oxidation and adsorption treatment cycles</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
            99.1% Compliance
          </span>
        </div>

        <div className="h-[240px]">
          <Chart
            options={decayOptions}
            series={[{ name: "Contaminant Concentration (ppm)", data: decayData }]}
            type="area"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default PageTelemetryAnalytics;
