import React, { useEffect, useState } from "react";
import { Lock, Loader2, Terminal } from "lucide-react";
import { apiFetch, savePassword } from "../api";

type GateState = "checking" | "locked" | "open";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const check = async () => {
    try {
      const res = await apiFetch("/api/auth-check");
      const data = await res.json();
      return !data.required || data.ok;
    } catch {
      // Server unreachable: let the app load so the real error shows inside it.
      return true;
    }
  };

  useEffect(() => {
    check().then((ok) => setState(ok ? "open" : "locked"));
    const onLocked = () => setState("locked");
    window.addEventListener("aeos:locked", onLocked);
    return () => window.removeEventListener("aeos:locked", onLocked);
  }, []);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    savePassword(input);
    const ok = await check();
    setBusy(false);
    if (ok) {
      setState("open");
      setInput("");
    } else {
      savePassword("");
      setError("Wrong password. Please try again.");
    }
  };

  if (state === "open") return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      {state === "checking" ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : (
        <form onSubmit={unlock} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold">AEOS Content Command</h1>
              <p className="text-xs text-slate-500">Enter the access password to continue</p>
            </div>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={busy || !input}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Unlock
          </button>
        </form>
      )}
    </div>
  );
}
