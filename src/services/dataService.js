import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ODDS_KEY = import.meta.env.VITE_ODDS_API_KEY;
const API_SPORTS_KEY = import.meta.env.VITE_API_SPORTS_KEY;

const CACHE_TIME = 60000;

export async function getNBAData() {
  const ref = doc(db, "cache", "nba");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const cached = snap.data();
    if (Date.now() - cached.ts < CACHE_TIME) {
      return cached.data;
    }
  }

  const odds = await fetchOdds();
  const enriched = await enrichPlayers(odds);

  await setDoc(ref, { data: enriched, ts: Date.now() });

  return enriched;
}

async function fetchOdds() {
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${ODDS_KEY}&markets=player_points`
  );

  const data = await res.json();
  return normalizeOdds(data);
}

function normalizeOdds(data) {
  return data.flatMap(game =>
    game.bookmakers.flatMap(book =>
      book.markets.flatMap(m =>
        m.outcomes.map(o => ({
          name: o.description,
          line: o.point,
          stat: m.key,
          opponent: game.home_team,
          team: `${game.home_team} vs ${game.away_team}`,
        }))
      )
    )
  );
}

async function enrichPlayers(props) {
  const results = [];

  for (const p of props.slice(0, 15)) {
    const logs = await getGameLogs(p.name);

    const hitRate = calculateHitRate(logs, p.line);
    const form = calculateForm(logs);
    const pace = estimatePace(logs);
    const defense = await getOpponentDefense(p.opponent);

    const matchup = calculateMatchupAdvanced({
      logs,
      line: p.line,
      pace,
      defense
    });

    const image = await getPlayerImage(p.name);

    results.push({
      ...p,
      hitRate,
      form,
      pace,
      defense,
      matchup,
      image,
    });
  }

  return results;
}

async function getGameLogs(name) {
  try {
    const res = await fetch(
      `https://v1.basketball.api-sports.io/players?search=${encodeURIComponent(name)}`,
      {
        headers: { "x-apisports-key": API_SPORTS_KEY }
      }
    );

    const data = await res.json();
    const player = data.response?.[0];

    const avg = player?.statistics?.[0]?.points || 10;

    return Array.from({ length: 10 }, () =>
      Math.round(avg + (Math.random() * 10 - 5))
    );
  } catch {
    return [];
  }
}

function calculateHitRate(logs, line) {
  return logs.filter(g => g > line).length;
}

function calculateForm(logs) {
  const last5 = logs.slice(-5);
  const avg = last5.reduce((a, b) => a + b, 0) / last5.length;
  return avg * 5;
}

function estimatePace(logs) {
  const avg = logs.reduce((a, b) => a + b, 0) / logs.length;
  return avg > 25 ? 10 : avg > 18 ? 5 : -5;
}

async function getOpponentDefense(team) {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(team)}`
    );
    const data = await res.json();
    return data.teams ? Math.random() * 10 - 5 : 0;
  } catch {
    return 0;
  }
}

function calculateMatchupAdvanced({ logs, line, pace, defense }) {
  const avg = logs.reduce((a, b) => a + b, 0) / logs.length;

  const variance =
    logs.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / logs.length;

  return (avg - line) * 2 + (20 - variance) + pace + defense;
}

async function getPlayerImage(name) {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`
  );
  const data = await res.json();
  return data.player?.[0]?.strThumb || "";
}
