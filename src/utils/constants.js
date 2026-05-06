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

// Ultravox native voice IDs — fetched from GET /api/voices on 2026-05-06.
// previewUrl plays directly in the browser (no backend call needed).

// Cartesia voice IDs (commented out — replaced by Ultravox native voices):
// female: b7d50908, c45bc5ec, 41534e16, 79a125e8, 95d51f79
// male:   ed81fd13, a0e99841, 63ff761f, f9836c6e, 2ee87190, 694f9389

export const VOICE_CATALOGUE = {
  female: [
    { n: "Gabrielle",  id: "33175488-b0f9-4f11-a0c6-3f4edd47353e", d: "Warm & professional",   accent: "American",   preview: "https://storage.googleapis.com/eleven-public-prod/database/workspace/78dd7503125c4d469c94dfbcbd84a2f0/voices/s50zV0dPjgaPRdN9zm48/79be234c-7ef3-4c79-9e7c-7504a0389cc9.mp3" },
    { n: "Karri",      id: "edc061c1-8761-4705-a927-934b754f510e", d: "Friendly & bright",      accent: "American",   preview: "https://storage.googleapis.com/eleven-public-prod/database/workspace/0a77e7110b634dcfbca359bd73fcf3e1/voices/3mip1Cv2rZYeio9MCzfr/acc0eb59-7987-4021-9821-994a9d5d0674.mp3" },
    { n: "Jacqueline", id: "aa601962-1cbd-4bbd-9d96-3c7a93c3414a", d: "Confident & empathic",   accent: "American",   preview: "https://api.ultravox.ai/api/voices/aa601962-1cbd-4bbd-9d96-3c7a93c3414a/preview" },
    { n: "Kai",        id: "4c8d6eb4-c021-4d56-aec9-656bf6ca6046", d: "Warm & southern",        accent: "American",   preview: "https://storage.googleapis.com/eleven-public-prod/database/user/user_3201ke05362jffxb3f26gk16v7c1/voices/cauGUrZQIRUvQs3glrUi/P9bFulU1haCdQ8WVO2Hm.mp3" },
    { n: "Claire",     id: "d20e12df-6fd9-428e-a81f-ba0090de13d9", d: "Clear & engaging",       accent: "British",    preview: "https://storage.googleapis.com/eleven-public-prod/database/user/ELeA7CKtleSESH8BpD3OM2V7Yl52/voices/M6KCOw7VXEJAZwuYFLuz/HAsg5402NG9hIFAebjBp.mp3" },
    { n: "Louisamay",  id: "534bb930-9642-4ec3-b5c0-e82426d22add", d: "Bright & expressive",    accent: "Irish",      preview: "https://storage.googleapis.com/eleven-public-prod/database/user/ersG3RCNCTRpe9MK8jEdRK0SUd32/voices/t6WJWTYTryhcQnrBHdCr/10fc89cd-43ad-4482-8905-f61b664276df.mp3" },
    { n: "Hannah",     id: "8ff05d3d-d78d-40a6-88c1-dd1efcf571f0", d: "Knowledgeable & upbeat", accent: "Australian", preview: "https://storage.googleapis.com/eleven-public-prod/database/user/7tvaSRybYYZ7ja2RTmrVkfJ75f93/voices/M7ya1YbaeFaPXljg9BpK/8Wc09F9557roFsMSjG9E.mp3" },
  ],
  male: [
    { n: "David",  id: "ef6757de-79b1-497b-ad54-c6bef635e2b7", d: "Smooth & trustworthy",     accent: "American",   preview: "https://storage.googleapis.com/eleven-public-prod/database/workspace/c82e402fd662470da3fea6b9de2d8830/voices/TqOasn6BO225ydKxXhaK/787a2e15-1cdf-48cf-bba7-58a61efa2ce5.mp3" },
    { n: "Troy",   id: "199c9635-edbe-4f9c-a626-ca31fb151d15", d: "Charming & down-to-earth", accent: "American",   preview: "https://storage.googleapis.com/eleven-public-prod/database/workspace/0d44aa28e67d42fa98c8abe4fed8d472/voices/ZaKvp9zQ7lsOFdP7CRL9/bd805f67-1c93-492c-bbb5-d0c9be7abcd4.mp3" },
    { n: "Grant",  id: "5f8e97b1-cd48-431a-b6a1-3b94306d8914", d: "Steady & professional",    accent: "American",   preview: "https://api.ultravox.ai/api/voices/5f8e97b1-cd48-431a-b6a1-3b94306d8914/preview" },
    { n: "Clive",  id: "a6afd1fc-960f-45d3-9e46-e8182af650b9", d: "Deep & comforting",        accent: "British",    preview: "https://api.ultravox.ai/api/voices/a6afd1fc-960f-45d3-9e46-e8182af650b9/preview" },
    { n: "Arlo",   id: "280a8e4d-2974-4593-87eb-fb74f0278a2e", d: "Warm & captivating",       accent: "Australian", preview: "https://storage.googleapis.com/eleven-public-prod/database/user/3ItejxaxjmRxo2lIz4YyLODumW03/voices/snyKKuaGYk1VUEh42zbW/jD73dqt4cfgCvl4RP262.mp3" },
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
