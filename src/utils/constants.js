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

export const VOICE_CATALOGUE = {
  female: [
    { n: "Aria",  id: "21m00Tcm4TlvDq8ikWAM", d: "Warm & professional" },
    { n: "Domi",  id: "AZnzlk1XvdvUeBnXmlld", d: "Confident" },
    { n: "Bella", id: "EXAVITQu4vr4xnSDxMaL", d: "Soft & pleasant" },
    { n: "Elli",  id: "MF3mGyEYCl7XYWbV9V6O", d: "Young & friendly" },
  ],
  male: [
    { n: "Antoni", id: "ErXwobaYiN019PkySvjV", d: "Well-rounded" },
    { n: "Arnold", id: "VR6AewLTigWG4xSOukaG", d: "Crisp & professional" },
    { n: "Adam",   id: "pNInz6obpgDQGcFmaJgB", d: "Deep & authoritative" },
    { n: "Sam",    id: "yoZ06aMxZJJ28mfd3POQ", d: "Raspy & casual" },
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
