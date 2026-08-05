import React, { useState } from "react";
import { isConfigured, saveConfigToLocal, clearConfigFromLocal } from "../firebase";
import { Database, ShieldCheck, ShieldAlert, Key, Settings, Trash2, CheckCircle2 } from "lucide-react";

const FirebaseConfigPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const configured = isConfigured();

  const handleSave = (e) => {
    e.preventDefault();
    try {
      // Try to parse the input as JSON
      let parsed = null;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (err) {
        // Try evaluating as a JS object if JSON parsing failed (in case it is copied directly as a JS object)
        // Sanitizing a bit
        const sanitized = jsonInput
          .replace(/const\s+\w+\s*=\s*/, "")
          .replace(/let\s+\w+\s*=\s*/, "")
          .replace(/var\s+\w+\s*=\s*/, "")
          .replace(/;\s*$/, "");
        
        // Use a safe Function construct to evaluate the object
        const evaluator = new Function(`return ${sanitized};`);
        parsed = evaluator();
      }

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid object format. Must be a key-value configuration.");
      }

      const requiredKeys = ["databaseURL"];
      const hasDatabaseUrl = parsed.databaseURL || parsed.databaseurl;
      if (!hasDatabaseUrl) {
        throw new Error("Missing 'databaseURL' in configuration. Realtime Database requires a databaseURL.");
      }

      // Standardize casing
      const finalConfig = {
        apiKey: parsed.apiKey || parsed.apikey || "",
        authDomain: parsed.authDomain || parsed.authdomain || "",
        databaseURL: parsed.databaseURL || parsed.databaseurl || "",
        projectId: parsed.projectId || parsed.projectid || "",
        storageBucket: parsed.storageBucket || parsed.storagebucket || "",
        messagingSenderId: parsed.messagingSenderId || parsed.messagingsenderid || "",
        appId: parsed.appId || parsed.appid || "",
      };

      saveConfigToLocal(finalConfig);
      setError("");
      setIsOpen(false);
    } catch (err) {
      setError(err.message || "Failed to parse configuration. Check formatting.");
    }
  };

  // UI container block disabled so 'FIREBASE CONNECTED' notification badge no longer displays at header
  return null;
};

export default FirebaseConfigPanel;
