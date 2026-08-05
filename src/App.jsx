import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  dbSet,
  dbUpdate,
  dbOnValue,
} from "./firebase";
import { buildDefaultChemicalDatabase } from "./defaultChemicals";

// Navigation & Page Components
import Navigation from "./components/Navigation";
import PageChemicalDashboard from "./components/PageChemicalDashboard";
import PageDetoxPanel from "./components/PageDetoxPanel";
import PageTelemetryAnalytics from "./components/PageTelemetryAnalytics";

// Global Modal & Helper Components
import AIChatbot from "./components/AIChatbot";
import PDFReportExporter from "./components/PDFReportExporter";
import FirebaseConfigPanel from "./components/FirebaseConfigPanel";
import ChemicalForm from "./components/ChemicalForm";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  // Page Router State: 'catalog' | 'detox' | 'telemetry'
  const [currentPage, setCurrentPage] = useState("catalog");

  // Selection & Modal States
  const [selectedKey, setSelectedKey] = useState("sulfuric_acid");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPdfExport, setShowPdfExport] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Decontamination Simulator State
  const [isPurifying, setIsPurifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [simulatedToxicity, setSimulatedToxicity] = useState(0);
  const [simulatedSafetyVal, setSimulatedSafetyVal] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  
  // Chemical Database State
  const [chemicalDatabase, setChemicalDatabase] = useState({});

  const localIntervalRef = useRef(null);

  // 1. Load/sync chemical database from Firebase Realtime Database
  useEffect(() => {
    let unsubscribe = null;
    try {
      const defaultDb = buildDefaultChemicalDatabase();
      setChemicalDatabase(defaultDb);

      unsubscribe = dbOnValue("chemical_database", (snapshot) => {
        try {
          if (snapshot && snapshot.exists()) {
            const data = snapshot.val();
            if (data && typeof data === "object" && Object.keys(data).length > 0) {
              setChemicalDatabase(data);
            }
          } else {
            console.log("Chemical database empty in Firebase. Seeding default catalog...");
            dbSet("chemical_database", defaultDb);
          }
        } catch (err) {
          console.error("Error in chemical_database listener:", err);
        }
      });
    } catch (err) {
      console.error("Error loading chemical database:", err);
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // 2. Sync active state and logs from Firebase
  useEffect(() => {
    let unsubscribeState = null;
    let unsubscribeLogs = null;
    try {
      unsubscribeState = dbOnValue("active_state", (snapshot) => {
        try {
          if (snapshot && snapshot.exists()) {
            const val = snapshot.val();
            if (val && typeof val === "object") {
              if (val.selectedKey) setSelectedKey(val.selectedKey);
              setIsPurifying(val.isPurifying || false);
              setProgress(val.progress || 0);
              setActiveStep(val.activeStep || 1);
              setSimulatedToxicity(val.simulatedToxicity || 0);
              setSimulatedSafetyVal(val.simulatedSafetyVal || 0);
            }
          }
        } catch (err) {
          console.error("Error in active_state listener:", err);
        }
      });

      unsubscribeLogs = dbOnValue("sim_logs", (snapshot) => {
        try {
          if (snapshot && snapshot.exists()) {
            setSimLogs(snapshot.val() || []);
          } else {
            setSimLogs([]);
          }
        } catch (err) {
          console.error("Error in sim_logs listener:", err);
        }
      });
    } catch (err) {
      console.error("Error syncing active state:", err);
    }

    return () => {
      if (typeof unsubscribeState === "function") unsubscribeState();
      if (typeof unsubscribeLogs === "function") unsubscribeLogs();
    };
  }, []);

  // Map active chemical object
  const activeChemical = useMemo(() => {
    return chemicalDatabase[selectedKey] || chemicalDatabase["sulfuric_acid"] || null;
  }, [selectedKey, chemicalDatabase]);

  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
  };

  // Select chemical & transition automatically to Page 2 (Detox Panel) when called from Catalog
  const selectChemical = (key, autoTransitionToDetox = true) => {
    const chem = chemicalDatabase[key];
    setSelectedKey(key);

    if (chem) {
      if (localIntervalRef.current) {
        clearInterval(localIntervalRef.current);
        localIntervalRef.current = null;
      }

      const initialTox = chem.toxicity || 50;
      const initialSafety = 95 - Math.round(initialTox * 0.4);

      dbSet("active_state", {
        selectedKey: key,
        isPurifying: false,
        progress: 0,
        activeStep: 1,
        simulatedToxicity: initialTox,
        simulatedSafetyVal: initialSafety,
      });

      dbSet("sim_logs", [
        {
          time: getTimestamp(),
          message: `Target chemical changed to ${chem.name} (${chem.formula}). Operational logic initialized.`,
          type: "neutral",
        },
      ]);
    }

    if (autoTransitionToDetox) {
      setCurrentPage("detox");
    }
  };

  // Run Decontamination Simulation Cycle
  const startDecontaminationCycle = () => {
    if (!activeChemical || isPurifying) return;

    const startLogs = [
      {
        time: getTimestamp(),
        message: `🔄 INITIATING DECONTAMINATION PROTOCOL FOR ${activeChemical.name.toUpperCase()}...`,
        type: "warn",
      },
    ];

    dbSet("sim_logs", startLogs);
    dbUpdate("active_state", {
      isPurifying: true,
      progress: 0,
      activeStep: 1,
    });

    const totalDuration = 8000;
    const stepsCount = 100;
    const intervalTime = totalDuration / stepsCount;

    const efficiencyPct = (activeChemical?.detox?.discharge?.efficiency || 95) / 100;
    const targetToxicity = Math.round(activeChemical.toxicity * (1 - efficiencyPct));
    const targetSafety = Math.round(
      95 - activeChemical.toxicity * 0.2 + efficiencyPct * 20
    );

    let localProgress = 0;
    let localActiveStep = 1;
    let currentLogs = [...startLogs];

    if (localIntervalRef.current) {
      clearInterval(localIntervalRef.current);
    }

    localIntervalRef.current = setInterval(() => {
      localProgress += 1;

      let logMessage = null;
      let logType = "neutral";

      if (localProgress === 1) {
        localActiveStep = 1;
        logMessage = `[STAGE 1] Neutralization active. Dosing agent: ${activeChemical?.detox?.neutralization?.recomm || "Sodium Carbonate"}.`;
      } else if (localProgress === 26) {
        localActiveStep = 2;
        logMessage = `[STAGE 2] Absorption active. Activated carbon & zeolite beds loaded.`;
      } else if (localProgress === 51) {
        localActiveStep = 3;
        logMessage = `[STAGE 3] Advanced Oxidation Process triggered. Initiating radical generation.`;
      } else if (localProgress === 76) {
        localActiveStep = 4;
        logMessage = `[STAGE 4] Discharge checks loading. Calibrating water-quality sensors.`;
      }

      if (logMessage) {
        currentLogs = [
          ...currentLogs,
          { time: getTimestamp(), message: logMessage, type: logType },
        ];
        dbSet("sim_logs", currentLogs);
      }

      const tFraction = localProgress / 100;
      const calculatedTox = Math.round(
        activeChemical.toxicity -
          tFraction * (activeChemical.toxicity - targetToxicity)
      );
      const calculatedSafety = Math.round(
        95 -
          Math.round(activeChemical.toxicity * 0.4) +
          tFraction * (targetSafety - (95 - Math.round(activeChemical.toxicity * 0.4)))
      );

      dbUpdate("active_state", {
        progress: localProgress,
        activeStep: localActiveStep,
        simulatedToxicity: calculatedTox,
        simulatedSafetyVal: calculatedSafety,
      });

      if (localProgress >= 100) {
        clearInterval(localIntervalRef.current);
        localIntervalRef.current = null;

        const finalLogs = [
          ...currentLogs,
          {
            time: getTimestamp(),
            message: `✅ DETOXIFICATION SUCCESSFUL: ${activeChemical.name} effluent fully processed. Settle-residual toxicity locked at ${targetToxicity}% (Standard compliance met).`,
            type: "success",
          },
        ];

        dbSet("sim_logs", finalLogs);
        dbUpdate("active_state", {
          isPurifying: false,
        });
      }
    }, intervalTime);
  };

  // Reset Simulation
  const resetSimulation = () => {
    if (localIntervalRef.current) {
      clearInterval(localIntervalRef.current);
      localIntervalRef.current = null;
    }

    if (activeChemical) {
      const initialTox = activeChemical.toxicity;
      const initialSafety = 95 - Math.round(activeChemical.toxicity * 0.4);

      dbSet("active_state", {
        selectedKey: selectedKey,
        isPurifying: false,
        progress: 0,
        activeStep: 1,
        simulatedToxicity: initialTox,
        simulatedSafetyVal: initialSafety,
      });

      dbSet("sim_logs", [
        {
          time: getTimestamp(),
          message: `Simulation reset for ${activeChemical.name}. System in standby.`,
          type: "neutral",
        },
      ]);
    }
  };

  useEffect(() => {
    return () => {
      if (localIntervalRef.current) {
        clearInterval(localIntervalRef.current);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
        {/* Navigation Bar */}
        <Navigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedChemical={activeChemical}
          onOpenAIChat={() => setShowAIChat(true)}
          onOpenPdfExport={() => setShowPdfExport(true)}
          onOpenConfigPanel={() => setShowConfigPanel(true)}
          onOpenAddForm={() => setShowAddForm(true)}
        />

        {/* Main 3-Page Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentPage === "catalog" && (
            <PageChemicalDashboard
              chemicalDatabase={chemicalDatabase}
              selectedKey={selectedKey}
              onSelectChemical={(key) => selectChemical(key, true)}
              onOpenAddForm={() => setShowAddForm(true)}
            />
          )}

          {currentPage === "detox" && (
            <PageDetoxPanel
              chemicalDatabase={chemicalDatabase}
              selectedKey={selectedKey}
              onSelectChemical={(key) => selectChemical(key, false)}
              activeChemical={activeChemical}
              isPurifying={isPurifying}
              progress={progress}
              activeStep={activeStep}
              simulatedToxicity={simulatedToxicity}
              simulatedSafetyVal={simulatedSafetyVal}
              simLogs={simLogs}
              onStartPurification={startDecontaminationCycle}
              onResetSimulation={resetSimulation}
            />
          )}

          {currentPage === "telemetry" && (
            <PageTelemetryAnalytics
              chemicalDatabase={chemicalDatabase}
              selectedKey={selectedKey}
              onSelectChemical={(key) => selectChemical(key, false)}
              activeChemical={activeChemical}
            />
          )}
        </main>

        {/* Global Modals & Drawers */}
        {showAddForm && (
          <ChemicalForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSaveSuccess={(newKey) => {
              setShowAddForm(false);
              selectChemical(newKey, true);
            }}
          />
        )}

        {showAIChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4 overflow-hidden relative">
              <div className="flex justify-end pb-2">
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-xl"
                >
                  ✕ Close AI Advisor
                </button>
              </div>
              <AIChatbot activeChemical={activeChemical} />
            </div>
          </div>
        )}

        {showPdfExport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold font-orbitron text-white">Export Report</h3>
                <button onClick={() => setShowPdfExport(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <PDFReportExporter activeChemical={activeChemical} simLogs={simLogs} />
            </div>
          </div>
        )}

        {showConfigPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold font-orbitron text-white">System Settings</h3>
                <button onClick={() => setShowConfigPanel(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <FirebaseConfigPanel />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
