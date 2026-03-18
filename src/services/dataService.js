import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ODDS_KEY = import.meta.env.VITE_ODDS_API_KEY;

const CACHE_TIME = 60000;

// 🔥 ALL SPORTS YOU SUPPORT
const SPORTS = [
  "basketball_nba",
  "americanfootball_nfl",
  "baseball_mlb",
  "icehockey_nhl",
  "basketball_ncaab",
  "americanfootball_ncaaf",
  "tennis_atp",
  "mma_mixed_martial_arts"
];

// ---------------------------
// 🔥 MAIN ENTRY (GET ALL SPORTS)
// ---------------------------
export async function getAllSportsData() {
  const ref = doc(db, "cache", "all_sports");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const cached = snap.data();
    if (Date.now() - cached.ts < CACHE_TIME) {
      return cached.data;
    }
  }

  const results = {};

  for (const sport of SPORTS) {
    const data = await fetchSport(sport);
    results[sport] = data;
  }

  await setDoc(ref, {
    data: results,
    ts: Date.now()
  });

  return results;
}

// ---------------------------
// 🔥 FETCH SINGLE SPORT
// ---------------------------
async function fetchSport(sport) {
  try {
    if (!ODDS_KEY) {
      console.error("Missing API key");
      return [];
    }

    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_KEY}&regions=us&markets=h2h`
    );

    if (!res.ok) {
      console.error(`API failed for ${sport}`);
      return [];
    }

    const json = await res.json();

    return normalizeOdds(json, sport);
  } catch (err) {
    console.error(`Error fetching ${sport}`, err);
    return [];
  }
}

// ---------------------------
// 🔥 NORMALIZE DATA
// ---------------------------
function normalizeOdds(data, sport) {
  if (!data || !Array.isArray(data)) return [];

  return data.map(game => {
    const book = game.bookmakers?.[0];
    const market = book?.markets?.[0];

    const outcomes = market?.outcomes || [];

    return {
      sport,
      home: game.home_team,
      away: game.away_team,
      teams: `${game.home_team} vs ${game.away_team}`,

      odds: outcomes.map(o => ({
        name: o.name,
        price: o.price
      }))
    };
  });
}
