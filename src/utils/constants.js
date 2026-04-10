export const STEPS = [
  { name: "Hear it live",      time: "~2 min" },
  { name: "Create account",    time: "~1 min" },
  { name: "Business info",     time: "~1 min" },
  { name: "Import menu",       time: "~3 min" },
  { name: "AI voice & script", time: "~4 min" },
  { name: "Phone number",      time: "~3 min" },
  { name: "Test call",         time: "~2 min" },
  { name: "Choose plan",       time: "~2 min" },
];

export const POS_SYSTEMS = [
  { name: "Clover",  icon: "🍀", type: "ordering",     fields: [{ key: "accessToken", label: "Access Token", ph: "..." }, { key: "merchantId", label: "Merchant ID", ph: "XXXXXXXXXXXXXXXX" }] },
  { name: "Square",  icon: "🟦", type: "ordering",     fields: [{ key: "accessToken", label: "Access Token", ph: "EAAAl..." }, { key: "locationId", label: "Location ID", ph: "LXXXXXXXXXXXXXXXX" }] },
  { name: "resOS",   icon: "📅", type: "reservation",  fields: [{ key: "apiKey", label: "API Key", ph: "res_live_..." }, { key: "propertyId", label: "Property ID", ph: "PROP-XXXXXXXX" }] },
  { name: "SpotOn",  icon: "📍", type: "ordering",     fields: [{ key: "apiKey", label: "API Key", ph: "sp_live_..." }, { key: "siteId", label: "Site ID", ph: "SITE-XXXXXXXX" }] },
];

// All voices use ElevenLabs Turbo v2.5 — natural, low-latency, phone-grade
export const VOICE_CATALOGUE = {
  female: [
    { n: "Sarah",   id: "EXAVITQu4vr4xnSDxMaL", d: "Warm & professional",    accent: "American" },
    { n: "Jessica", id: "cgSgspJ2msm6clMCkdW9", d: "Friendly & bright",       accent: "American" },
    { n: "Matilda", id: "XrExE9yKIg1WjnnlVkGX", d: "Knowledgeable & upbeat",  accent: "American" },
    { n: "Alice",   id: "Xb7hH8MSUJpSbSDYk0k2", d: "Clear & engaging",        accent: "British"  },
    { n: "Lily",    id: "pFZP5JQG7iQjIQuC4Bku", d: "Confident & velvety",     accent: "British"  },
  ],
  male: [
    { n: "Eric",   id: "cjVigY5qzO86Huf0OWal", d: "Smooth & trustworthy",      accent: "American" },
    { n: "Chris",  id: "iP95p4xoKVk53GoZ742B", d: "Charming & down-to-earth",  accent: "American" },
    { n: "Daniel", id: "onwK4e9ZLuTAKqWW03F9", d: "Steady & professional",     accent: "British"  },
    { n: "George", id: "JBFqnCBsd6RMkjVDRZzb", d: "Warm & captivating",        accent: "British"  },
    { n: "Brian",  id: "nPczCjzI2devNBz1zQrb", d: "Deep & comforting",         accent: "American" },
  ],
  neutral: [
    { n: "River",  id: "SAz9YHcvj6GT2YYXdXww", d: "Calm & relaxed",           accent: "American" },
  ],
};

export const NAV = [
  { section: "Main",    items: [["📊","Dashboard"],["📞","Calls"],["📋","Orders"],["📅","Reservations"]] },
  { section: "Agent",   items: [["🤖","My Agent"],["🎙️","Voice & Script"],["📋","Menu"],["💬","FAQs"]] },
  { section: "Account", items: [["🔌","Integrations"],["💳","Billing"],["⚙️","Settings"]] },
];

// Map nav label → hash route path (for React Router)
export const NAV_ROUTES = {
  "Dashboard":     "/dashboard",
  "Calls":         "/dashboard/calls",
  "Orders":        "/dashboard/orders",
  "Reservations":  "/dashboard/reservations",
  "My Agent":      "/dashboard/agent",
  "Voice & Script":"/dashboard/voice",
  "Menu":          "/dashboard/menu",
  "Integrations":  "/dashboard/integrations",
  "Billing":       "/dashboard/billing",
  "Settings":      "/dashboard/settings",
};
