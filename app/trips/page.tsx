import supabaseAdmin from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic"; // always fetch fresh data

type TripRow = {
  id: string;
  created_at: string;
  user_email: string | null;
  original_text: string | null;
  parsed: any;
};

export default async function TripsPage() {
  const { data, error } = await supabaseAdmin
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const trips = (data as TripRow[] | null) ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Saved Trips</h1>
            <p className="text-xs text-slate-400">
              Last {trips.length} trips parsed by PilotPrompt
            </p>
          </div>
          <a
            href="/"
            className="text-xs text-sky-400 hover:text-sky-300 underline"
          >
            ← Back to planner
          </a>
        </header>

        {error && (
          <p className="text-red-400 text-sm">
            Error loading trips: {error.message}
          </p>
        )}

        {trips.length === 0 && !error && (
          <p className="text-sm text-slate-400">
            No trips saved yet. Go back to the planner, create a trip, and it
            will appear here.
          </p>
        )}

        <div className="space-y-4">
          {trips.map((trip) => {
            let parsedSummary: string | null = null;

            try {
              const p = trip.parsed || {};
              const dest =
                (p.destination_cities && p.destination_cities[0]) ||
                "Unknown destination";
              const budget = p.total_budget_amount
                ? `$${p.total_budget_amount}`
                : "No budget set";
              const travelers = p.num_travelers || 1;

              parsedSummary = `${dest} · ${travelers} traveler(s) · ${budget}`;
            } catch {
              parsedSummary = null;
            }

            return (
              <article
                key={trip.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-400">
                    {new Date(trip.created_at).toLocaleString()}
                  </div>
                  {trip.user_email && (
                    <div className="text-[11px] text-slate-500">
                      {trip.user_email}
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-medium text-slate-100">
                    {trip.original_text}
                  </p>
                </div>

                {parsedSummary && (
                  <p className="text-xs text-slate-400">
                    Parsed summary: {parsedSummary}
                  </p>
                )}

                <details className="text-[11px] mt-1">
                  <summary className="cursor-pointer text-sky-400">
                    View full parsed JSON
                  </summary>
                  <pre className="mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 overflow-auto max-h-48">
                    {JSON.stringify(trip.parsed, null, 2)}
                  </pre>
                </details>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
