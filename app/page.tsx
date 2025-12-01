"use client";

import { useState } from "react";

export default function Home() {
  const [tripText, setTripText] = useState("");
  const [parsed, setParsed] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setParsed(null);

    try {
      const res = await fetch("/api/parse-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest: tripText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setParsed(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">PilotPrompt</h1>
          <p className="text-slate-300">
            Built by <span className="font-semibold">Robin Linhart</span>. Type
            your trip in plain English and let AI structure it.
          </p>
          <p className="text-xs text-slate-500">
            Contact:{" "}
            <a href="mailto:rlinhart99@gmail.com" className="underline">
              rlinhart99@gmail.com
            </a>
          </p>
        </header>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
          <h2 className="font-semibold text-lg">New Trip Request</h2>
          <p className="text-sm text-slate-400">
            Describe your trip. PilotPrompt will call an AI endpoint and show
            you the structured result (and log it in the database).
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">
                Describe your trip
              </label>
              <textarea
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                rows={4}
                placeholder='Example: "Dallas to Rome for a week in May, under $1800 total, no Spirit, at least 3★ hotel near the center."'
                value={tripText}
                onChange={(e) => setTripText(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !tripText.trim()}
              className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 transition px-4 py-2 text-sm font-semibold text-slate-950"
            >
              {loading ? "Parsing..." : "Parse Trip with PilotPrompt"}
            </button>
          </form>

          {error && <p className="text-sm text-red-400">Error: {error}</p>}

          {parsed && (
            <div className="mt-4 text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto max-h-60">
              <p className="mb-1 font-semibold text-slate-200">
                Parsed response:
              </p>
              <pre>{JSON.stringify(parsed, null, 2)}</pre>
            </div>
          )}
        </section>

        <div className="text-center text-xs text-slate-400">
          <a
            href="/trips"
            className="underline text-sky-400 hover:text-sky-300"
          >
            View saved trips →
          </a>
        </div>

        <footer className="text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} PilotPrompt · Built by Robin Linhart
        </footer>
      </div>
    </main>
  );
}
