import React, { useState, useMemo } from "react";
import {
  Search,
  Mic,
  MicOff,
  Filter,
  PlusCircle,
  FlaskConical,
  Flame,
  ShieldAlert,
  Biohazard,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Acids",
  "Bases",
  "Heavy Metals",
  "Solvents",
  "Organics",
  "Gases",
  "Cyanides",
  "Pesticides",
];

const PageChemicalDashboard = ({
  chemicalDatabase,
  selectedKey,
  onSelectChemical,
  onOpenAddForm,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Voice recognition search toggle
  const toggleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Filter chemicals based on search query and selected category
  const filteredChemicals = useMemo(() => {
    const list = Object.entries(chemicalDatabase || {});
    return list.filter(([key, chem]) => {
      const matchesCategory =
        selectedCategory === "All" ||
        chem.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "Cyanides" && chem.name?.toLowerCase().includes("cyanide")) ||
        (selectedCategory === "Pesticides" && chem.hazardCategory?.toLowerCase().includes("pesticide"));

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const nameMatch = chem.name?.toLowerCase().includes(query);
      const formulaMatch = chem.formula?.toLowerCase().includes(query);
      const hazardMatch = chem.hazardCategory?.toLowerCase().includes(query);
      const keyMatch = key.toLowerCase().includes(query);

      return matchesCategory && (nameMatch || formulaMatch || hazardMatch || keyMatch);
    });
  }, [chemicalDatabase, searchQuery, selectedCategory]);

  const handleTileClick = (key, chem) => {
    setToastMessage(`Transitioning to Detox Panel for ${chem.name}...`);
    onSelectChemical(key);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold font-orbitron">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header & Search Section */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-orbitron uppercase tracking-widest mb-1">
              <FlaskConical className="h-4 w-4" />
              <span>Page 1: Chemical Catalog & Operational Database</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Process Chemical Catalog
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Select any chemical tile to process its operational logic and execute 3 distinct decontamination remediation cycles in Page 2.
            </p>
          </div>

          <button
            onClick={onOpenAddForm}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-orbitron text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Chemical</span>
          </button>
        </div>

        {/* Search Bar & Voice Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 85+ chemicals by name, formula, or hazard class (e.g. H2SO4, Cyanide, Mercury)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                isListening
                  ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/50"
                  : "text-slate-400 hover:text-cyan-400"
              }`}
              title="Toggle Voice Search"
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800 shrink-0 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Showing: <strong className="text-cyan-300 font-bold">{filteredChemicals.length}</strong> / {Object.keys(chemicalDatabase || {}).length}</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none relative z-10">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold font-orbitron whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Chemical Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredChemicals.map(([key, chem]) => {
          const isSelected = selectedKey === key;
          const tox = chem.toxicity || 50;

          // Severity colors
          const isDanger = tox >= 80;
          const isWarning = tox >= 50 && tox < 80;
          const toxBadgeColor = isDanger
            ? "bg-rose-950/80 border-rose-500/50 text-rose-300"
            : isWarning
            ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
            : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300";

          return (
            <div
              key={key}
              onClick={() => handleTileClick(key, chem)}
              className={`group relative glass-card p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
                isSelected
                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40"
                  : "border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Header inside tile */}
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300">
                      {chem.formula || "Chem"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {chem.category || "General"}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${toxBadgeColor}`}>
                    Tox {tox}%
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {chem.name}
                </h3>

                {/* Hazard description */}
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {chem.hazardCategory || "Hazardous chemical agent requiring specialized decontamination treatment."}
                </p>
              </div>

              {/* Footer info & Action trigger */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <Biohazard className="h-3.5 w-3.5 text-amber-400" />
                  <span>NFPA: {chem.nfpa?.health || 2}-{chem.nfpa?.flammability || 0}-{chem.nfpa?.instability || 0}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-orbitron font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Process</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChemicals.length === 0 && (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-800 space-y-3">
          <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white font-orbitron">No Chemicals Match Your Search</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search query or switching categories. You can also add a new custom chemical to the catalog.
          </p>
          <button
            onClick={onOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 font-orbitron text-xs font-bold hover:bg-cyan-900 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Custom Chemical</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PageChemicalDashboard;
