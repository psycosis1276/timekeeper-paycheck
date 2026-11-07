// Run: npm test
import { classify, computePaycheck, defaults, sampleDays, sampleMisc, blank, type Settings, type Day } from "../src/payMath";
import { stateCalc } from "../src/stateData";

let fails = 0;
const eq = (name: string, got: number, want: number) => {
  const ok = Math.abs(got - want) < 0.006;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${got.toFixed(2)}, want ${want.toFixed(2)}`);
};
const S = (o: Partial<Settings> = {}): Settings => ({ ...defaults, ...o });
const wk = (hs: number[]) => hs.map((h) => ({ h, hol: false, ph: 0, m: 1 }));
const sum = (r: { reg: number; ot: number; dt: number }[]) => r.reduce((a, x) => ({ reg: a.reg + x.reg, ot: a.ot + x.ot, dt: a.dt + x.dt }), { reg: 0, ot: 0, dt: 0 });

// Overtime
let r = sum(classify(wk([0, 10, 10, 10, 10, 10, 0]), S({ mode: "weekly" })));
eq("weekly 5x10 reg", r.reg, 40); eq("weekly 5x10 OT", r.ot, 10);
r = sum(classify(wk([10, 10, 10, 10, 10, 5, 0]), S()));
eq("combo 10x5+5 reg", r.reg, 40); eq("combo 10x5+5 OT", r.ot, 15);
r = sum(classify(wk([13]), S()));
eq("combo 13h DT off reg", r.reg, 8); eq("combo 13h DT off OT", r.ot, 5);
r = sum(classify(wk([13]), S({ dtOn: true })));
eq("13h DT on OT", r.ot, 4); eq("13h DT on DT", r.dt, 1);
r = sum(classify(wk([8, 8, 8, 8, 8, 8, 9]), S({ dtOn: true, seventh: true })));
eq("7th day reg", r.reg, 40); eq("7th day OT", r.ot, 16); eq("7th day DT", r.dt, 1);

// Holiday presets: Thursday holiday, 8h worked, $25
const one = (h: number, ph: string, m: string, o: Partial<Settings> = {}) => {
  const d: Day[] = Array.from({ length: 14 }, blank);
  d[4] = { punches: [{ i: "06:00", o: h === 8 ? "14:00" : "16:00" }], lunch: "0", hol: true };
  return computePaycheck(S({ holPaidHrs: ph, holMult: m, ...o }), d, [], []).gross;
};
eq("straight time", one(8, "0", "1"), 200);
eq("1.5x worked", one(8, "0", "1.5"), 300);
eq("2x worked", one(8, "0", "2"), 400);
eq("holiday pay only", one(8, "8", "1"), 400);
eq("holiday pay + 1.5x", one(8, "8", "1.5"), 500);
eq("holiday pay + 2x", one(8, "8", "2"), 600);
eq("custom 4h + 1.75x", one(8, "4", "1.75"), 450);
eq("10h holiday 1.5x higher-of", one(10, "0", "1.5"), 375);
eq("10h holiday 1.5x stack", one(10, "0", "1.5", { holInteract: "stack" }), 400);
eq("10h holiday 2x higher-of", one(10, "0", "2"), 500);
eq("10h holiday 2x stack", one(10, "0", "2", { holInteract: "stack" }), 525);

// Sample week
const c = computePaycheck(defaults, sampleDays(), [], sampleMisc());
eq("sample gross", c.gross, 1175); eq("sample federal", c.fed, 87.23); eq("sample net", c.net, 865.20);

// States (sample week: state wages 1076.25, 401k 58.75, FICA wages 1135, weekly, single)
const st = (code: string) => stateCalc(code, 1076.25, 1135, 52, false, 0, 0, 1135);
eq("TX", st("TX").tax, 0); eq("PA", st("PA").tax, 34.84); eq("IL", st("IL").tax, 50.49);
eq("CA", st("CA").tax, 27.07); eq("CA SDI", st("CA").lines[0][1], 14.755);
eq("NY", st("NY").tax, 46.64); eq("NY SDI", st("NY").lines[0][1], 0.6); eq("NY PFL", st("NY").lines[1][1], 4.90);
eq("OH", st("OH").tax, 14.55); eq("GA", st("GA").tax, 43.88); eq("NC", st("NC").tax, 33.16); eq("VA", st("VA").tax, 46.23);

console.log(fails ? `\n${fails} FAILED` : "\nAll tests passed");
(globalThis as unknown as { process: { exit: (c: number) => void } }).process.exit(fails ? 1 : 0);
