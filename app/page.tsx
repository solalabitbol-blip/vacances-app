"use client";

import { useMemo, useState } from "react";

const STYLES = [
  "Luxe",
  "Sac à dos",
  "Plage",
  "Visites culturelles",
  "Nature",
  "Food",
  "Nightlife",
  "Romantique",
  "Chill",
];

type ItineraryDay = {
  day: number;
  city: string;
  morning: string;
  afternoon: string;
  evening: string;
};

type Trip = {
  destination: string;
  days: number;
  styles: string[];
  cities: string[];
  activities: string[];
  itinerary: ItineraryDay[];
  createdAt: string;
};

function splitLines(raw: string) {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<number>(10);
  const [citiesRaw, setCitiesRaw] = useState("Bangkok\nKrabi\nKoh Samui");
  const [activitiesRaw, setActivitiesRaw] = useState(
    "Temple / visites\nPlage\nSnorkeling\nMarchés\nMassage / spa"
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Plage", "Chill"]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const cities = useMemo(() => splitLines(citiesRaw), [citiesRaw]);
  const activities = useMemo(() => splitLines(activitiesRaw), [activitiesRaw]);

  function toggleStyle(style: string) {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  function generateItinerary() {
    const safeDays = Math.max(1, Number(days) || 1);
    const safeCities = cities.length ? cities : ["Ville 1"];
    const safeActivities = activities.length ? activities : ["Activité libre"];

    // Répartit les jours entre les villes
    const base = Math.floor(safeDays / safeCities.length);
    const extra = safeDays % safeCities.length;

    const plan: ItineraryDay[] = [];
    let activityIndex = 0;

    safeCities.forEach((city, i) => {
      const cityDays = base + (i < extra ? 1 : 0);
      for (let d = 1; d <= cityDays; d++) {
        const a1 = safeActivities[activityIndex % safeActivities.length];
        const a2 = safeActivities[(activityIndex + 1) % safeActivities.length];
        activityIndex += 2;

        plan.push({
          day: plan.length + 1,
          city,
          morning: a1,
          afternoon: a2,
          evening: selectedStyles.includes("Chill")
            ? "Dîner + balade tranquille"
            : "Dîner + sortie",
        });
      }
    });

    const trip: Trip = {
      destination,
      days: safeDays,
      styles: selectedStyles,
      cities: safeCities,
      activities: safeActivities,
      itinerary: plan,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("vacances_trip", JSON.stringify(trip));
    setItinerary(plan);
  }

  function loadTrip() {
    const raw = localStorage.getItem("vacances_trip");
    if (!raw) return alert("Aucun voyage sauvegardé.");
    const trip = JSON.parse(raw) as Trip;

    setDestination(trip.destination || "");
    setDays(trip.days || 10);
    setSelectedStyles(trip.styles || []);
    setCitiesRaw((trip.cities || []).join("\n"));
    setActivitiesRaw((trip.activities || []).join("\n"));
    setItinerary(trip.itinerary || []);
  }

  function clearTrip() {
    localStorage.removeItem("vacances_trip");
    setItinerary([]);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Vacances Planner</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Tu choisis destination + villes + activités + style → l’app génère un itinéraire.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadTrip}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
            >
              Charger
            </button>
            <button
              onClick={clearTrip}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
            >
              Effacer
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Destination</span>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Thaïlande, Japon, Mexique..."
                className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Nombre de jours</span>
              <input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-40 rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-semibold">Style de vacances</span>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => {
                const active = selectedStyles.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    className={
                      "rounded-full border px-3 py-2 text-sm font-semibold transition " +
                      (active
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white hover:bg-neutral-50")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Villes (1 par ligne)</span>
              <textarea
                value={citiesRaw}
                onChange={(e) => setCitiesRaw(e.target.value)}
                rows={8}
                className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Activités (1 par ligne)</span>
              <textarea
                value={activitiesRaw}
                onChange={(e) => setActivitiesRaw(e.target.value)}
                rows={8}
                className="rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={generateItinerary}
              className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
            >
              Générer l’itinéraire
            </button>
            <span className="text-sm text-neutral-600">
              (L’itinéraire est sauvegardé automatiquement sur ton ordi.)
            </span>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-extrabold">Itinéraire</h2>

          {itinerary.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">
              Clique sur <span className="font-semibold">Générer l’itinéraire</span> pour voir le plan jour par jour.
            </p>
          ) : (
            <div className="mt-3 grid gap-3">
              {itinerary.map((d) => (
                <div
                  key={d.day}
                  className="rounded-2xl border border-neutral-200 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-base font-extrabold">
                      Jour {d.day} — <span className="text-neutral-700">{d.city}</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Matin / Après-midi / Soir
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="rounded-xl bg-neutral-50 p-3">
                      <span className="font-semibold">Matin :</span> {d.morning}
                    </div>
                    <div className="rounded-xl bg-neutral-50 p-3">
                      <span className="font-semibold">Après-midi :</span> {d.afternoon}
                    </div>
                    <div className="rounded-xl bg-neutral-50 p-3">
                      <span className="font-semibold">Soir :</span> {d.evening}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
