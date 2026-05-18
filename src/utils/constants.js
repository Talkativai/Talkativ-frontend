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

// id    = Ultravox voice ID — used for actual phone calls via Ultravox
// ttsId = Cartesia voice ID — used for TTS preview of the greeting message

export const VOICE_CATALOGUE = {
  female: [
    { n: "Gabrielle",  id: "33175488-b0f9-4f11-a0c6-3f4edd47353e", ttsId: "b7d50908-b17c-442d-ad8d-810c63997fd9", d: "Warm & professional",   accent: "American"   },
    { n: "Karri",      id: "edc061c1-8761-4705-a927-934b754f510e", ttsId: "c45bc5ec-dc68-4feb-8829-6e6b2748095d", d: "Friendly & bright",      accent: "American"   },
    { n: "Jacqueline", id: "aa601962-1cbd-4bbd-9d96-3c7a93c3414a", ttsId: "79a125e8-cd45-4c13-8a67-188112f4dd22", d: "Confident & empathic",   accent: "American"   },
    { n: "Kai",        id: "4c8d6eb4-c021-4d56-aec9-656bf6ca6046", ttsId: "95d51f79-c397-46f9-b349-0b14e52ac08b", d: "Warm & southern",        accent: "American"   },
    { n: "Claire",     id: "d20e12df-6fd9-428e-a81f-ba0090de13d9", ttsId: "41534e16-2966-4c6b-9670-111411def906", d: "Clear & engaging",       accent: "British"    },
    { n: "Louisamay",  id: "534bb930-9642-4ec3-b5c0-e82426d22add", ttsId: "694f9369-afd5-4635-9664-811ec98da2d3", d: "Bright & expressive",    accent: "Irish"      },
    { n: "Hannah",     id: "8ff05d3d-d78d-40a6-88c1-dd1efcf571f0", ttsId: "b7d50908-b17c-442d-ad8d-810c63997fd9", d: "Knowledgeable & upbeat", accent: "Australian" },
  ],
  male: [
    { n: "David",  id: "ef6757de-79b1-497b-ad54-c6bef635e2b7", ttsId: "2ee87190-8f84-4925-97da-e52547f9462c", d: "Smooth & trustworthy",     accent: "American"   },
    { n: "Troy",   id: "199c9635-edbe-4f9c-a626-ca31fb151d15", ttsId: "a0e99841-438c-4a64-b679-ae501e7d6091", d: "Charming & down-to-earth", accent: "American"   },
    { n: "Grant",  id: "5f8e97b1-cd48-431a-b6a1-3b94306d8914", ttsId: "ed81fd13-2016-4a49-8fe3-c0d2761695fc", d: "Steady & professional",    accent: "American"   },
    { n: "Clive",  id: "a6afd1fc-960f-45d3-9e46-e8182af650b9", ttsId: "f9836c6e-a0bd-460e-9d3c-f7299fa60f94", d: "Deep & comforting",        accent: "British"    },
    { n: "Arlo",   id: "280a8e4d-2974-4593-87eb-fb74f0278a2e", ttsId: "63ff761f-c1e8-414b-b969-d1833d1c870c", d: "Warm & captivating",       accent: "Australian" },
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
