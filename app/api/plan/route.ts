import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { destination, days, styles } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante dans Vercel env vars." },
        { status: 500 }
      );
    }

    const prompt = `
Tu es un expert en organisation de voyages.

Destination: ${destination}
Nombre de jours: ${days}
Style: ${Array.isArray(styles) ? styles.join(", ") : ""}

Réponds en JSON STRICTEMENT (pas de texte hors JSON) :

{
  "cities": ["ville1", "ville2"],
  "activities": ["activité1", "activité2"],
  "itinerary": [
    {
      "day": 1,
      "city": "ville",
      "morning": "...",
      "afternoon": "...",
      "evening": "..."
    }
  ]
}

Règles:
- itinéraire réaliste, pas trop chargé
- regroupe les jours par zones (évite de changer de ville tous les jours)
- activités cohérentes avec le style
- JSON valide uniquement
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await response.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}
