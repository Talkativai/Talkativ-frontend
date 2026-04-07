export const fmtPrice = (p) => p != null ? `£${Number(p).toFixed(2)}` : '';

export const catEmoji = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("drink") || n.includes("beverage") || n.includes("cocktail")) return "🍹";
  if (n.includes("dessert") || n.includes("sweet") || n.includes("cake")) return "🍰";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("burger") || n.includes("sandwich")) return "🍔";
  if (n.includes("salad")) return "🥗";
  if (n.includes("soup")) return "🍲";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("fish") || n.includes("seafood")) return "🐟";
  if (n.includes("pasta") || n.includes("noodle")) return "🍝";
  if (n.includes("rice") || n.includes("bowl")) return "🍚";
  if (n.includes("breakfast") || n.includes("brunch")) return "🍳";
  if (n.includes("starter") || n.includes("appetizer") || n.includes("snack")) return "🥨";
  if (n.includes("side")) return "🥙";
  if (n.includes("vegan") || n.includes("veggie") || n.includes("vegetarian")) return "🥦";
  if (n.includes("special")) return "⭐";
  if (n.includes("kids")) return "🧒";
  return "🍽️";
};

export const formatSchedule = (schedule) => {
  if (!schedule) return null;
  if (schedule.is24h === "true") return "24/7";
  // If hours were auto-found from a business search (Google Places / Claude)
  if (schedule.searchHours) return schedule.searchHours;
  const days = ["mon","tue","wed","thu","fri","sat","sun"];
  const dayNames = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };
  const open = days.filter(d => schedule[d] && schedule[d] !== "closed");
  if (open.length === 0) return null;
  const times = open.map(d => schedule[d]);
  const allSame = times.every(t => t === times[0]);
  if (allSame) {
    const first = dayNames[open[0]];
    const last = open.length > 1 ? `–${dayNames[open[open.length - 1]]}` : "";
    return `${first}${last} · ${times[0].replace("-", "–")}`;
  }
  return open.slice(0, 3).map(d => `${dayNames[d]}: ${schedule[d].replace("-","–")}`).join(", ") + (open.length > 3 ? ` +${open.length - 3} more` : "");
};
