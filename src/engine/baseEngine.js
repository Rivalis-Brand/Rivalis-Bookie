export function calculateRisk(prop) {
  const score =
    prop.hitRate * 4 +
    prop.form * 0.3 +
    prop.matchup * 2;

  return Math.max(5, Math.min(95, 100 - score));
}

export function rank(data) {
  return data
    .map(p => ({ ...p, risk: calculateRisk(p) }))
    .sort((a, b) => a.risk - b.risk);
}
