export const VS_DAY_KEYS   = ["mon","tue","wed","thu","fri","sat","sun"];
export const VS_DAY_LABELS = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

export const makeDefaultSchedule = () => ({
  mon: { open: false, openTime: "09:00", closeTime: "17:00" },
  tue: { open: false, openTime: "09:00", closeTime: "17:00" },
  wed: { open: false, openTime: "09:00", closeTime: "17:00" },
  thu: { open: false, openTime: "09:00", closeTime: "17:00" },
  fri: { open: false, openTime: "09:00", closeTime: "17:00" },
  sat: { open: false, openTime: "09:00", closeTime: "17:00" },
  sun: { open: false, openTime: "09:00", closeTime: "17:00" },
});

export const parseSchedule = (obj) => {
  if (!obj) return makeDefaultSchedule();
  const r = {};
  for (const day of VS_DAY_KEYS) {
    const v = obj[day];
    if (!v || v === "closed") r[day] = { open: false, openTime: "09:00", closeTime: "17:00" };
    else { const [o, c] = v.split("-"); r[day] = { open: true, openTime: o || "09:00", closeTime: c || "17:00" }; }
  }
  return r;
};

export const buildHours = (is24h, sched) => {
  if (is24h) return { is24h: "true" };
  const r = { is24h: "false" };
  Object.entries(sched).forEach(([d, v]) => { r[d] = v.open ? `${v.openTime}-${v.closeTime}` : "closed"; });
  return r;
};
