export function canAccess(tier, required) {
  const map = { FREE: 1, PRO: 2, ELITE: 3 };
  return map[tier] >= map[required];
}
