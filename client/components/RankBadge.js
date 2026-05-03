const RANKS = [
  { name: "Newbie",  min: 0,    icon: "🪵", color: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" },
  { name: "Warrior", min: 500,  icon: "⚔️", color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
  { name: "Elite",   min: 1000, icon: "💎", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300" },
  { name: "Legend",  min: 1500, icon: "👑", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "Mythic",  min: 2000, icon: "🔥", color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" },
];

export function getRank(points) {
  return [...RANKS].reverse().find((r) => points >= r.min) || RANKS[0];
}

export default function RankBadge({ points, showName = false }) {
  const rank = getRank(points);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rank.color}`}>
      <span>{rank.icon}</span>
      {showName && <span>{rank.name}</span>}
      <span>{points} pts</span>
    </span>
  );
}