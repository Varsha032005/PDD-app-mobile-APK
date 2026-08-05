import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase, ref, set, push, onValue, get, update } from "firebase/database";

let app = null;
let db = null;
let isConnected = false;

// Helper to check if Firebase is configured
const getFirebaseConfig = () => {
  try {
    // Check localStorage first
    const localConfig = localStorage.getItem("firebaseConfig");
    if (localConfig) {
      try {
        const parsed = JSON.parse(localConfig);
        if (parsed && (parsed.databaseURL || parsed.apiKey)) {
          return parsed;
        }
      } catch (_e) {
        console.warn("Failed to parse localStorage firebaseConfig, removing invalid config");
        localStorage.removeItem("firebaseConfig");
      }
    }
  } catch (_e) {
    // localStorage may not be available in some environments
    console.warn("localStorage not available");
  }

  // Check Vite environment variables
  try {
    const envConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    };

    if (envConfig.databaseURL || envConfig.apiKey) {
      return envConfig;
    }
  } catch (_e) {
    console.warn("import.meta.env not available");
  }

  return null;
};

// Initialize Firebase safely
try {
  const config = getFirebaseConfig();
  if (config) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      db = getDatabase(app);
      isConnected = true;
      console.log("Firebase initialized successfully with configuration:", config.databaseURL);
    } catch (err) {
      console.error("Firebase initialization failed:", err);
      isConnected = false;
      app = null;
      db = null;
    }
  } else {
    console.log("No Firebase configuration found. Running in local offline mode.");
  }
} catch (err) {
  console.error("Firebase config loading failed:", err);
  isConnected = false;
  app = null;
  db = null;
}

// Mock database fallback for offline/unconfigured mode
class MockDatabase {
  constructor() {
    this.listeners = {};
    this.state = {
      active_state: {
        selectedKey: "",
        isPurifying: false,
        progress: 0,
        activeStep: 1,
        simulatedToxicity: 0,
        simulatedSafetyVal: 0
      },
      sim_logs: [
        { time: "10:15:00", message: "Decontamination telemetry systems in standby mode (Local Offline Fallback).", type: "neutral" }
      ],
      chat_logs: [
        { sender: 'AI', text: "Smart Environmental AI core activated. Awaiting telemetry inquiry..." }
      ]
    };
  }

  set(path, value) {
    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        this.state[parts[0]] = value;
      } else if (parts.length >= 2) {
        if (!this.state[parts[0]]) this.state[parts[0]] = {};
        let target = this.state[parts[0]];
        for (let i = 1; i < parts.length - 1; i++) {
          if (!target[parts[i]]) target[parts[i]] = {};
          target = target[parts[i]];
        }
        target[parts[parts.length - 1]] = value;
      }
      // Use setTimeout to avoid synchronous re-triggering during render
      setTimeout(() => {
        this.trigger(path);
        if (parts.length > 1) {
          this.trigger(parts[0]);
        }
      }, 0);
    } catch (err) {
      console.error("MockDatabase.set error:", err);
    }
    return Promise.resolve();
  }

  update(path, value) {
    try {
      const parts = path.split('/');
      let target = this.state;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          if (!target[parts[i]]) target[parts[i]] = {};
          if (i === parts.length - 1) {
            Object.assign(target[parts[i]], value);
          } else {
            target = target[parts[i]];
          }
        } else {
          Object.assign(target, value);
        }
      }
      setTimeout(() => {
        this.trigger(path);
        if (parts.length > 1) {
          this.trigger(parts[0]);
        }
      }, 0);
    } catch (err) {
      console.error("MockDatabase.update error:", err);
    }
    return Promise.resolve();
  }

  push(path, value) {
    try {
      const parts = path.split('/');
      const node = parts[0];
      if (!this.state[node]) {
        this.state[node] = [];
      }
      const newId = Math.random().toString(36).substring(2, 15);
      if (Array.isArray(this.state[node])) {
        this.state[node].push(value);
      } else if (typeof this.state[node] === 'object') {
        this.state[node][newId] = value;
      }
      setTimeout(() => {
        this.trigger(path);
        this.trigger(node);
      }, 0);
      return Promise.resolve({ key: newId });
    } catch (err) {
      console.error("MockDatabase.push error:", err);
      return Promise.resolve({ key: "error" });
    }
  }

  get(path) {
    try {
      const parts = path.split('/');
      let data = this.state;
      for (const part of parts) {
        if (part && data != null) {
          data = data[part];
        }
      }
      return Promise.resolve({
        exists: () => data !== undefined && data !== null,
        val: () => data
      });
    } catch (err) {
      console.error("MockDatabase.get error:", err);
      return Promise.resolve({
        exists: () => false,
        val: () => null
      });
    }
  }

  onValue(path, callback) {
    try {
      if (!this.listeners[path]) {
        this.listeners[path] = [];
      }
      this.listeners[path].push(callback);
      // Deliver initial value asynchronously to prevent state update during render
      setTimeout(() => {
        this.get(path).then(snapshot => {
          try {
            callback(snapshot);
          } catch (err) {
            console.error("MockDatabase.onValue callback error:", err);
          }
        });
      }, 0);

      return () => {
        if (this.listeners[path]) {
          this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
        }
      };
    } catch (err) {
      console.error("MockDatabase.onValue error:", err);
      return () => {};
    }
  }

  trigger(path) {
    try {
      if (this.listeners[path]) {
        this.get(path).then(snapshot => {
          this.listeners[path]?.forEach(cb => {
            try {
              cb(snapshot);
            } catch (err) {
              console.error("MockDatabase listener error:", err);
            }
          });
        });
      }
    } catch (err) {
      console.error("MockDatabase.trigger error:", err);
    }
  }
}

const mockDb = new MockDatabase();

// Exported wrapper functions that route to Firebase if connected, or MockDatabase if not
export const isConfigured = () => isConnected;

export const dbSet = (path, value) => {
  try {
    if (isConnected && db) {
      return set(ref(db, path), value);
    }
    return mockDb.set(path, value);
  } catch (err) {
    console.error("dbSet error:", err);
    return Promise.resolve();
  }
};

export const dbUpdate = (path, value) => {
  try {
    if (isConnected && db) {
      return update(ref(db, path), value);
    }
    return mockDb.update(path, value);
  } catch (err) {
    console.error("dbUpdate error:", err);
    return Promise.resolve();
  }
};

export const dbPush = (path, value) => {
  try {
    if (isConnected && db) {
      return push(ref(db, path), value);
    }
    return mockDb.push(path, value);
  } catch (err) {
    console.error("dbPush error:", err);
    return Promise.resolve({ key: "error" });
  }
};

export const dbGet = (path) => {
  try {
    if (isConnected && db) {
      return get(ref(db, path));
    }
    return mockDb.get(path);
  } catch (err) {
    console.error("dbGet error:", err);
    return Promise.resolve({ exists: () => false, val: () => null });
  }
};

export const dbOnValue = (path, callback) => {
  try {
    if (isConnected && db) {
      const dbRef = ref(db, path);
      const wrappedCallback = (snapshot) => {
        try {
          callback(snapshot);
        } catch (err) {
          console.error("dbOnValue callback error for path:", path, err);
        }
      };
      return onValue(dbRef, wrappedCallback, (error) => {
        console.error("Firebase onValue error for path:", path, error);
        // Fall back to mock if Firebase connection fails
        isConnected = false;
        db = null;
        return mockDb.onValue(path, callback);
      });
    }
    return mockDb.onValue(path, callback);
  } catch (err) {
    console.error("dbOnValue error:", err);
    return () => {};
  }
};

export const saveConfigToLocal = (newConfig) => {
  try {
    localStorage.setItem("firebaseConfig", JSON.stringify(newConfig));
  } catch (_e) {
    console.error("Failed to save Firebase config to localStorage");
  }
  window.location.reload();
};

export const clearConfigFromLocal = () => {
  try {
    localStorage.removeItem("firebaseConfig");
  } catch (_e) {
    console.error("Failed to clear Firebase config from localStorage");
  }
  window.location.reload();
};
