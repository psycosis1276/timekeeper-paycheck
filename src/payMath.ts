import { stateCalc } from "./stateData";

export type Punch = { i: string; o: string };
export type Day = { punches: Punch[]; lunch: string; hol: boolean; ovr?: boolean; hpre?: string; hph?: string; hm?: string };
export type Settings = {
  rate: string; period: "weekly" | "biweekly"; weekStart: string; periodStart: string;
  mode: "weekly" | "daily" | "combo"; weeklyOT: string; dailyOT: string; otMult: string;
  dtOn: boolean; dailyDT: string; dtMult: string; seventh: boolean;
  holPreset: string; holMult: string; holPaidHrs: string; holCountsOT: boolean; holPaidCountsOT: boolean; holInteract: "higher" | "stack";
  k401: string; roth: string; ins: string; post: string;
  filing: "single" | "mfj" | "hoh"; step2: boolean; dep: string; other4a: string; ded4b: string; extra4c: string;
  state: string; stCode: string; stFiling: "single" | "mfj"; stDeps: string; stExtra: string; local: string;
};
export type Saved = { label: string; hours: number; gross: number; fed: number; ss: number; med: number; state: number; pre: number; post: number; net: number; ssWages: number; medWages: number; misc?: number };
export type Misc = { id: string; name: string; amt: string; kind: "fixed" | "pct"; pre: boolean; fica: boolean; freq: "every" | "once" | "inst"; bal: string; done: boolean };
export const sampleMisc = (): Misc[] => [
  { id: "m1", name: "Uniform rental", amt: "12", kind: "fixed", pre: false, fica: false, freq: "every", bal: "0", done: false },
  { id: "m2", name: "Employee purchase", amt: "25", kind: "fixed", pre: false, fica: false, freq: "inst", bal: "150", done: false },
];

export const DAYN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const KEY = "tk-paycheck-v1";

export const defaults: Settings = {
  rate: "25", period: "weekly", weekStart: "0", periodStart: "2026-11-01",
  mode: "combo", weeklyOT: "40", dailyOT: "8", otMult: "1.5",
  dtOn: false, dailyDT: "12", dtMult: "2", seventh: false,
  holPreset: "ot15", holMult: "1.5", holPaidHrs: "0", holCountsOT: true, holPaidCountsOT: false, holInteract: "higher",
  k401: "5", roth: "0", ins: "40", post: "0",
  filing: "single", step2: false, dep: "0", other4a: "0", ded4b: "0", extra4c: "0", state: "0", stCode: "CUSTOM", stFiling: "single", stDeps: "0", stExtra: "0", local: "0",
};
export const blank = (): Day => ({ punches: [{ i: "", o: "" }], lunch: "0", hol: false });
export const sampleDays = (): Day[] => {
  const d: Day[] = Array.from({ length: 14 }, blank);
  d[1] = { punches: [{ i: "06:00", o: "16:30" }], lunch: "30", hol: false };
  d[2] = { punches: [{ i: "07:00", o: "15:30" }], lunch: "30", hol: false };
  d[3] = { punches: [{ i: "07:00", o: "11:00" }, { i: "11:30", o: "15:30" }], lunch: "0", hol: false };
  d[4] = { punches: [{ i: "06:00", o: "14:30" }], lunch: "30", hol: true };
  d[5] = { punches: [{ i: "22:00", o: "06:30" }], lunch: "30", hol: false };
  return d;
};

// 2026 IRS Pub 15-T annual percentage method: [atLeast, base, rate]
export const T: Record<string, number[][]> = {
  mfj: [[0, 0, 0], [19300, 0, .10], [44100, 2480, .12], [120100, 11600, .22], [230700, 35932, .24], [422850, 82048, .32], [531750, 116896, .35], [788000, 206583.5, .37]],
  single: [[0, 0, 0], [7500, 0, .10], [19900, 1240, .12], [57900, 5800, .22], [113200, 17966, .24], [209275, 41024, .32], [263725, 58448, .35], [648100, 192979.25, .37]],
  hoh: [[0, 0, 0], [15550, 0, .10], [33250, 1770, .12], [83000, 7740, .22], [121250, 16155, .24], [217300, 39207, .32], [271750, 56631, .35], [656150, 191171, .37]],
  mfj2: [[0, 0, 0], [16100, 0, .10], [28500, 1240, .12], [66500, 5800, .22], [121800, 17966, .24], [217875, 41024, .32], [272325, 58448, .35], [400450, 103291.75, .37]],
  single2: [[0, 0, 0], [8050, 0, .10], [14250, 620, .12], [33250, 2900, .22], [60900, 8983, .24], [108938, 20512, .32], [136163, 29224, .35], [328350, 96489.63, .37]],
  hoh2: [[0, 0, 0], [12075, 0, .10], [20925, 885, .12], [45800, 3870, .22], [64925, 8077.5, .24], [112950, 19603.5, .32], [140175, 28315.5, .35], [332375, 95585.5, .37]],
};
export const SS_BASE = 184500;

export const n = (v: string) => { const x = parseFloat(v); return isFinite(x) ? x : 0; };
export const mins = (t: string) => { const m = /^(\d{1,2}):?(\d{2})$/.exec(t.trim()); if (!m) return -1; const h = +m[1], mm = +m[2]; return h > 23 || mm > 59 ? -1 : h * 60 + mm; };
export const dayHours = (d: Day) => {
  let tot = 0;
  d.punches.forEach((p: Punch) => { const a = mins(p.i), b = mins(p.o); if (a < 0 || b < 0) return; let x = b - a; if (x <= 0) x += 1440; tot += x; });
  return Math.max(0, (tot - (tot > 0 ? n(d.lunch) : 0)) / 60);
};
export const money = (v: number) => (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const hrs = (v: number) => v.toFixed(2);

export const PRESETS: { value: string; label: string; h: string; m: string }[] = [
  { value: "straight", label: "Straight time (no premium)", h: "0", m: "1" },
  { value: "ot15", label: "Time and a half for hours worked", h: "0", m: "1.5" },
  { value: "dt2", label: "Double time for hours worked", h: "0", m: "2" },
  { value: "paid", label: "Holiday pay only (paid hours, not worked)", h: "8", m: "1" },
  { value: "paid15", label: "Holiday pay + time and a half worked", h: "8", m: "1.5" },
  { value: "paid2", label: "Holiday pay + double time worked", h: "8", m: "2" },
  { value: "custom", label: "Custom", h: "", m: "" },
];
export type Cls = { reg: number; ot: number; dt: number; holW: number; holOT: number; holPaid: number };
export type DayCls = { reg: number; ot: number; dt: number };
export function classify(days: { h: number; hol: boolean; ph: number; m: number }[], s: Settings): DayCls[] {
  const out: DayCls[] = [];
  const dOT = n(s.dailyOT), dDT = s.dtOn ? n(s.dailyDT) : Infinity, wOT = n(s.weeklyOT);
  let cum = 0;
  const allWorked = days.length === 7 && days.every((d) => d.h > 0);
  days.forEach((d, i) => {
    const h = d.h;
    if (d.hol && s.holPaidCountsOT) cum += d.ph;
    if (d.hol && !s.holCountsOT) { out.push({ reg: h, ot: 0, dt: 0 }); return; }
    let reg = h, ot = 0, dt = 0;
    if (s.mode !== "weekly") {
      if (s.mode === "combo" && s.seventh && allWorked && i === 6) { reg = 0; ot = Math.min(h, dOT); dt = Math.max(h - dOT, 0); }
      else { reg = Math.min(h, dOT); ot = Math.min(Math.max(h - dOT, 0), dDT - dOT); dt = Math.max(h - dDT, 0); }
    }
    if (s.mode !== "daily") { const room = Math.max(wOT - cum, 0); const over = Math.max(reg - room, 0); reg -= over; ot += over; cum += reg; }
    out.push({ reg, ot, dt });
  });
  return out;
}

export function fedTax(perGross: number, s: Settings, periods: number) {
  const key = s.filing + (s.step2 ? "2" : "");
  const stdDed = s.step2 ? 0 : s.filing === "mfj" ? 12900 : 8600;
  const adj = Math.max(0, perGross * periods + n(s.other4a) - n(s.ded4b) - stdDed);
  let row = T[key][0];
  T[key].forEach((r: number[]) => { if (adj >= r[0]) row = r; });
  const annual = row[1] + (adj - row[0]) * row[2];
  return Math.max(0, annual / periods - n(s.dep) / periods) + n(s.extra4c);
}

export function computePaycheck(s: Settings, days: Day[], saved: Saved[], misc: Misc[]) {
  const nDays = s.period === "weekly" ? 7 : 14;
  const periods = s.period === "weekly" ? 52 : 26;
    const rate = n(s.rate);
    const hd = days.slice(0, nDays).map((d: Day) => ({ h: dayHours(d), hol: d.hol, ph: d.ovr ? n(d.hph || "0") : n(s.holPaidHrs), m: d.ovr ? n(d.hm || "1") : n(s.holMult) }));
    const c: Cls = { reg: 0, ot: 0, dt: 0, holW: 0, holOT: 0, holPaid: 0 };
    const pay: Cls = { reg: 0, ot: 0, dt: 0, holW: 0, holOT: 0, holPaid: 0 };
    const oM = n(s.otMult), dM = n(s.dtMult);
    for (let w = 0; w < nDays; w += 7) {
      const sl = hd.slice(w, w + 7);
      classify(sl, s).forEach((r: DayCls, k: number) => {
        const d = sl[k];
        if (d.hol) {
          const f = (x: number) => s.holInteract === "stack" ? d.m + x - 1 : Math.max(d.m, x);
          c.holW += r.reg; pay.holW += r.reg * rate * d.m;
          c.holOT += r.ot + r.dt; pay.holOT += r.ot * rate * f(oM) + r.dt * rate * f(dM);
          c.holPaid += d.ph; pay.holPaid += d.ph * rate;
        } else { c.reg += r.reg; c.ot += r.ot; c.dt += r.dt; pay.reg += r.reg * rate; pay.ot += r.ot * rate * oM; pay.dt += r.dt * rate * dM; }
      });
    }
    const gross = pay.reg + pay.ot + pay.dt + pay.holW + pay.holOT + pay.holPaid;
    const k401 = gross * n(s.k401) / 100, roth = gross * n(s.roth) / 100, ins = Math.min(n(s.ins), gross), post = n(s.post);
    const ytdSS = saved.reduce((a: number, x: Saved) => a + x.ssWages, 0), ytdMed = saved.reduce((a: number, x: Saved) => a + x.medWages, 0);
    const mi = misc.filter((m: Misc) => !m.done && !(m.freq === "inst" && n(m.bal) <= 0)).map((m: Misc) => { let a = m.kind === "pct" ? gross * n(m.amt) / 100 : n(m.amt); if (m.freq === "inst") a = Math.min(a, n(m.bal)); return { m, take: Math.max(0, a) }; });
    const miPre = mi.filter((x) => x.m.pre).reduce((a: number, x) => a + x.take, 0);
    const miFica = mi.filter((x) => x.m.pre && x.m.fica).reduce((a: number, x) => a + x.take, 0);
    const ficaWages = Math.max(0, gross - ins - miFica);
    const ssWages = Math.max(0, Math.min(ficaWages, SS_BASE - ytdSS));
    const ss = ssWages * 0.062;
    const addl = Math.max(0, ytdMed + ficaWages - Math.max(200000, ytdMed));
    const med = ficaWages * 0.0145 + addl * 0.009;
    const fitWages = Math.max(0, gross - k401 - ins - miPre);
    const fed = gross > 0 ? fedTax(fitWages, s, periods) : 0;
    const ytdGross = saved.reduce((a: number, x: Saved) => a + x.medWages, 0);
    const sc = s.stCode === "CUSTOM" ? { tax: fitWages * n(s.state) / 100, lines: [] as [string, number][] } : stateCalc(s.stCode, fitWages, fitWages + k401, periods, s.stFiling === "mfj", n(s.stDeps), ytdGross, ficaWages);
    const st = gross > 0 ? sc.tax + n(s.stExtra) : 0;
    const stLines = sc.lines;
    const stPay = stLines.reduce((a: number, x: [string, number]) => a + x[1], 0);
    const local = fitWages * n(s.local) / 100;
    let net = gross - k401 - ins - roth - post - ss - med - fed - st - stPay - local - mi.reduce((a: number, x) => a + x.take, 0);
    const short = net < -0.005 ? -net : 0;
    let rem = short;
    for (let k = mi.length - 1; k >= 0 && rem > 0; k--) { const cut = Math.min(rem, mi[k].take); mi[k].take -= cut; rem -= cut; net += cut; }
    let postT = post; if (rem > 0) { const cut = Math.min(rem, postT); postT -= cut; rem -= cut; net += cut; }
    net = Math.max(0, net);
    const miscTot = mi.reduce((a: number, x) => a + x.take, 0);
    return { hd, c, pay, gross, k401, roth, ins, post: postT, ss, med, fed, st, stLines, stPay, local, net, mi, miscTot, short, ssWages, ficaWages, total: hd.reduce((a, d) => a + d.h, 0) };
}
