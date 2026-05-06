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
  // ── Ordering / KDS ──
  { name: "Square",   icon: "🟦", type: "ordering",    fields: [{ key: "accessToken", label: "Access Token", ph: "EAAAl..." }, { key: "locationId",   label: "Location ID",   ph: "LXXXXXXXXXXXXXXXX" }] },
  { name: "Clover",   icon: "🍀", type: "ordering",    fields: [{ key: "accessToken", label: "Access Token", ph: "..." },      { key: "merchantId",   label: "Merchant ID",   ph: "XXXXXXXXXXXXXXXX"  }] },
  { name: "SumUp",    icon: "🟠", type: "ordering",    fields: [{ key: "apiKey",      label: "API Key",      ph: "sup_sk_..." },{ key: "merchantCode", label: "Merchant Code", ph: "M..."              }] },
  { name: "Zettle",   icon: "💳", type: "ordering",    fields: [{ key: "apiKey",      label: "API Key",      ph: "..."        }] },
  { name: "SpotOn",   icon: "📍", type: "ordering",    fields: [{ key: "apiKey",      label: "API Key",      ph: "sp_live_..." },{ key: "siteId",      label: "Site ID",      ph: "SITE-XXXXXXXX"     }] },
  // ── Reservations ──
  { name: "resOS",    icon: "📅", type: "reservation", fields: [{ key: "apiKey",      label: "API Key",      ph: "res_live_..." },{ key: "propertyId",  label: "Property ID",  ph: "PROP-XXXXXXXX"    }] },
  { name: "ResDiary", icon: "📒", type: "reservation", fields: [{ key: "apiKey",      label: "API Key",      ph: "..." },         { key: "restaurantId",label: "Restaurant ID", ph: "..."              }] },
  { name: "OpenTable",icon: "🍽️", type: "reservation", fields: [{ key: "apiKey",      label: "API Key",      ph: "..." },         { key: "restaurantId",label: "Restaurant ID", ph: "..."              }] },
  { name: "Collins",  icon: "📋", type: "reservation", fields: [{ key: "apiKey",      label: "API Key",      ph: "..." },         { key: "venueId",     label: "Venue ID",     ph: "..."              }] },
];

// All voices use Cartesia Sonic-2 model via Ultravox.
// IDs are Cartesia voice IDs — verify / replace from your Cartesia dashboard.
// See setup.md for instructions.

// ElevenLabs voice IDs (commented out — replaced by Cartesia below):
// female: EXAVITQu4vr4xnSDxMaL, cgSgspJ2msm6clMCkdW9, XrExE9yKIg1WjnnlVkGX, Xb7hH8MSUJpSbSDYk0k2, pFZP5JQG7iQjIQuC4Bku
// male:   cjVigY5qzO86Huf0OWal, iP95p4xoKVk53GoZ742B, onwK4e9ZLuTAKqWW03F9, JBFqnCBsd6RMkjVDRZzb, nPczCjzI2devNBz1zQrb
// neutral: SAz9YHcvj6GT2YYXdXww

export const VOICE_CATALOGUE = {
  female: [
    { n: "Sarah",   id: "b7d50908-b17c-442d-ad8d-810c63997fd9", d: "Warm & professional",   accent: "American" },
    { n: "Jessica", id: "c45bc5ec-dc68-4feb-8829-6e6b2748095d", d: "Friendly & bright",      accent: "American" },
    { n: "Matilda", id: "41534e16-2966-4c6b-9670-111411def906", d: "Knowledgeable & upbeat", accent: "American" },
    { n: "Alice",   id: "79a125e8-cd45-4c13-8a67-188112f4dd22", d: "Clear & engaging",       accent: "British"  },
    { n: "Lily",    id: "95d51f79-c397-46f9-b349-0b14e52ac08b", d: "Confident & velvety",    accent: "British"  },
  ],
  male: [
    { n: "Eric",   id: "ed81fd13-2016-4a49-8fe3-c0d2761695fc", d: "Smooth & trustworthy",     accent: "American" },
    { n: "Chris",  id: "a0e99841-438c-4a64-b679-ae501e7d6091", d: "Charming & down-to-earth", accent: "American" },
    { n: "Daniel", id: "63ff761f-c1e8-414b-b969-d1833d1c870c", d: "Steady & professional",    accent: "British"  },
    { n: "George", id: "f9836c6e-a0bd-460e-9d3c-f7299fa60f94", d: "Warm & captivating",       accent: "British"  },
    { n: "Brian",  id: "2ee87190-8f84-4925-97da-e52547f9462c", d: "Deep & comforting",        accent: "American" },
  ],
  neutral: [
    { n: "River",  id: "694f9389-aac1-45b6-b726-9d9369183238", d: "Calm & relaxed",           accent: "American" },
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
