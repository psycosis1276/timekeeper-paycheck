export type PayTax = { l: string; r: number; c?: number; wk?: number };
export type StateInfo = { n: string; y: number; src: string; none?: number; b?: number[][]; m?: number[][]; std?: number[]; pers?: number[]; dep?: number; cr?: number; k?: number; ut?: number; ax?: string; pay?: PayTax[] };
// Rates, brackets, deductions and exemptions: Tax Foundation 2026 compilation (https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/) cross-referenced to each state's revenue site in src. Payroll taxes: 2026 state agency rates (NJ from nj.gov/labor).
// State withholding data. Reusable table: one entry per state with year and official source. b = single brackets [floor, rate], m = married brackets, std = [single, married] standard deduction, pers = [single, married] personal exemption, dep = per dependent/allowance, cr = pers/dep are tax credits, k = 401(k) deferrals taxable for state, pay = employee payroll taxes (r rate, c annual wage cap, wk weekly max), ax = approximation note.
export const STATE_DATA: Record<string, StateInfo> = {
  AL: {n:"Alabama",y:2026,src:"https://www.revenue.alabama.gov/",b:[[0,0.02],[500,0.04],[3000,0.05]],m:[[0,0.02],[1000,0.04],[6000,0.05]],std:[3000,8500],pers:[1500,3000],dep:1000,ax:"Annual-tax approximation; ignores AL deduction for federal tax withheld and std deduction phase-down, so it runs high."},
  AK: {n:"Alaska",y:2026,src:"https://tax.alaska.gov/",none:1},
  AZ: {n:"Arizona",y:2026,src:"https://azdor.gov/",b:[[0,0.025]],std:[0,0],ax:"AZ withholding is an employee-elected % on Form A-4 (0.5%–3.5%, default 2.0%); this uses 2.5%. Use Custom % to match your A-4."},
  AR: {n:"Arkansas",y:2026,src:"https://www.dfa.arkansas.gov/",b:[[0,0.02],[4600,0.039]],std:[2470,4940],pers:[29,58],dep:29,cr:1,ax:"Annual-tax approximation; AR's low-income tables and bracket adjustment not modeled."},
  CA: {n:"California",y:2026,src:"https://edd.ca.gov/en/payroll_taxes/",b:[[0,0.01],[11079,0.02],[26264,0.04],[41452,0.06],[57542,0.08],[72724,0.093],[371479,0.103],[445771,0.113],[742953,0.123],[1000000,0.133]],m:[[0,0.01],[22158,0.02],[52528,0.04],[82904,0.06],[115084,0.08],[145448,0.093],[742958,0.103],[891542,0.113],[1000000,0.123],[1485906,0.133]],std:[5540,11080],pers:[153,306],dep:153,cr:1,ax:"Annual-tax approximation of EDD Method B (2025-indexed brackets; EDD's own withholding schedules differ slightly).",pay:[{l:"CA SDI",r:0.013}]},
  CO: {n:"Colorado",y:2026,src:"https://tax.colorado.gov/",b:[[0,0.044]],std:[16100,32200],ax:"Uses federal std deduction as allowance; CO DR 0004 withholding allowance differs slightly.",pay:[{l:"CO FAMLI",r:0.0044,c:184500}]},
  CT: {n:"Connecticut",y:2026,src:"https://portal.ct.gov/drs",b:[[0,0.02],[10000,0.045],[50000,0.055],[100000,0.06],[200000,0.065],[250000,0.069],[500000,0.0699]],m:[[0,0.02],[20000,0.045],[100000,0.055],[200000,0.06],[400000,0.065],[500000,0.069],[1000000,0.0699]],pers:[15000,24000],ax:"Annual-tax approximation; CT exemption phase-out, personal credits, and recapture not modeled (CT-W4 codes).",pay:[{l:"CT Paid Leave",r:0.005,c:184500}]},
  DE: {n:"Delaware",y:2026,src:"https://revenue.delaware.gov/",b:[[0,0],[2000,0.022],[5000,0.039],[10000,0.048],[20000,0.052],[25000,0.0555],[60000,0.066]],std:[3250,6500],pers:[110,220],dep:110,cr:1,pay:[{l:"DE Paid Leave",r:0.004,c:184500}],ax:"Annual-tax approximation; DE Paid Leave employee share assumes employer passes 50% to employees (10+ employees)."},
  DC: {n:"District of Columbia",y:2026,src:"https://otr.cfo.dc.gov/",b:[[0,0.04],[10000,0.06],[40000,0.065],[60000,0.085],[250000,0.0925],[500000,0.0975],[1000000,0.1075]],std:[16100,32200]},
  FL: {n:"Florida",y:2026,src:"https://floridarevenue.com/",none:1},
  GA: {n:"Georgia",y:2026,src:"https://dor.georgia.gov/",b:[[0,0.0519]],std:[12000,24000],dep:4000},
  HI: {n:"Hawaii",y:2026,src:"https://tax.hawaii.gov/",b:[[0,0.014],[9600,0.032],[14400,0.055],[19200,0.064],[24000,0.068],[36000,0.072],[48000,0.076],[125000,0.079],[175000,0.0825],[225000,0.09],[275000,0.1],[325000,0.11]],m:[[0,0.014],[19200,0.032],[28800,0.055],[38400,0.064],[48000,0.068],[72000,0.072],[96000,0.076],[250000,0.079],[350000,0.0825],[450000,0.09],[550000,0.1],[650000,0.11]],std:[4400,8800],pers:[1144,2288],dep:1144,ax:"Annual-tax approximation of HI withholding; HI TDI is approximate (0.5% up to a weekly max, varies by employer plan).",pay:[{l:"HI TDI (approx)",r:0.005,wk:7.5}]},
  ID: {n:"Idaho",y:2026,src:"https://tax.idaho.gov/",b:[[0,0],[4811,0.053]],m:[[0,0],[9622,0.053]],std:[16100,32200]},
  IL: {n:"Illinois",y:2026,src:"https://tax.illinois.gov/",b:[[0,0.0495]],pers:[2925,5850],dep:2925},
  IN: {n:"Indiana",y:2026,src:"https://www.in.gov/dor/",b:[[0,0.0295]],pers:[1000,2000],dep:1500,ax:"State rate only; Indiana county tax (about 1%–3%) goes in the Local % field."},
  IA: {n:"Iowa",y:2026,src:"https://revenue.iowa.gov/",b:[[0,0.038]],std:[16100,32200],pers:[40,80],dep:40,cr:1,ax:"Annual-tax approximation of IA withholding formula."},
  KS: {n:"Kansas",y:2026,src:"https://www.ksrevenue.gov/",b:[[0,0.052],[23000,0.0558]],m:[[0,0.052],[46000,0.0558]],std:[3605,8240],pers:[9160,18320],dep:2320,ax:"Annual-tax approximation; KS K-4 withholding allowances differ."},
  KY: {n:"Kentucky",y:2026,src:"https://revenue.ky.gov/",b:[[0,0.035]],std:[3360,3360],ax:"State rate only; KY city/county occupational taxes go in Local %."},
  LA: {n:"Louisiana",y:2026,src:"https://revenue.louisiana.gov/",b:[[0,0.03]],std:[12875,25750]},
  ME: {n:"Maine",y:2026,src:"https://www.maine.gov/revenue/",b:[[0,0.058],[27399,0.0675],[64849,0.0715]],m:[[0,0.058],[54849,0.0675],[129749,0.0715]],std:[8350,16700],pers:[5300,10600],ax:"Annual-tax approximation of ME withholding (std deduction phase-out not modeled).",pay:[{l:"ME PFML",r:0.005,c:184500}]},
  MD: {n:"Maryland",y:2026,src:"https://www.marylandtaxes.gov/",b:[[0,0.02],[1000,0.03],[2000,0.04],[3000,0.0475],[100000,0.05],[125000,0.0525],[150000,0.055],[250000,0.0575],[500000,0.0625],[1000000,0.065]],m:[[0,0.02],[1000,0.03],[2000,0.04],[3000,0.0475],[150000,0.05],[175000,0.0525],[225000,0.055],[300000,0.0575],[600000,0.0625],[1200000,0.065]],std:[3350,6700],pers:[3200,6400],dep:3200,ax:"State only; MD county tax (2.25%–3.3%) goes in Local %. MD FAMLI contributions start 2027, so none in 2026."},
  MA: {n:"Massachusetts",y:2026,src:"https://www.mass.gov/orgs/massachusetts-department-of-revenue",b:[[0,0.05],[1083150,0.09]],pers:[4400,8800],dep:1000,pay:[{l:"MA PFML",r:0.0046,c:184500}],ax:"Annual-tax approximation; MA PFML 0.46% assumes a 25+ employee employer passing the max employee share."},
  MI: {n:"Michigan",y:2026,src:"https://www.michigan.gov/taxes",b:[[0,0.0425]],pers:[5900,11800],dep:5900,ax:"State only; Detroit (2.4%) and other city taxes go in Local %."},
  MN: {n:"Minnesota",y:2026,src:"https://www.revenue.state.mn.us/",b:[[0,0.0535],[33310,0.068],[109430,0.0785],[203150,0.0985]],m:[[0,0.0535],[48700,0.068],[193480,0.0785],[337930,0.0985]],std:[15300,30600],dep:5300,pay:[{l:"MN Paid Leave",r:0.0044,c:184500}],ax:"Annual-tax approximation of MN withholding; Paid Leave assumes employer passes 50% (0.44%)."},
  MS: {n:"Mississippi",y:2026,src:"https://www.dor.ms.gov/",b:[[0,0],[10000,0.04]],std:[2300,4600],pers:[6000,12000],dep:1500},
  MO: {n:"Missouri",y:2026,src:"https://dor.mo.gov/",b:[[0,0],[1348,0.02],[2696,0.025],[4044,0.03],[5392,0.035],[6740,0.04],[8088,0.045],[9436,0.047]],std:[16100,32200]},
  MT: {n:"Montana",y:2026,src:"https://mtrevenue.gov/",b:[[0,0.047],[47500,0.0565]],m:[[0,0.047],[95000,0.0565]],std:[16100,32200],ax:"Annual-tax approximation of MT withholding."},
  NE: {n:"Nebraska",y:2026,src:"https://revenue.nebraska.gov/",b:[[0,0.0246],[4130,0.0351],[24760,0.0455]],m:[[0,0.0246],[8250,0.0351],[49530,0.0455]],std:[8850,17700],pers:[176,352],dep:176,cr:1,ax:"Annual-tax approximation; NE Circular EN tables differ."},
  NV: {n:"Nevada",y:2026,src:"https://tax.nv.gov/",none:1},
  NH: {n:"New Hampshire",y:2026,src:"https://www.revenue.nh.gov/",none:1},
  NJ: {n:"New Jersey",y:2026,src:"https://www.nj.gov/treasury/taxation/",k:1,b:[[0,0.014],[20000,0.0175],[35000,0.035],[40000,0.0553],[75000,0.0637],[500000,0.0897],[1000000,0.1075]],m:[[0,0.014],[20000,0.0175],[50000,0.0245],[70000,0.035],[80000,0.0553],[150000,0.0637],[500000,0.0897],[1000000,0.1075]],pers:[1000,2000],dep:1500,ax:"Annual-tax approximation of NJ-WT rate tables A–E. NJ taxes 401(k) deferrals for state purposes.",pay:[{l:"NJ SDI",r:0.0019,c:171100},{l:"NJ FLI",r:0.0023,c:171100},{l:"NJ UI/WF",r:0.00425,c:44800}]},
  NM: {n:"New Mexico",y:2026,src:"https://www.tax.newmexico.gov/",b:[[0,0.015],[5500,0.032],[16500,0.043],[33500,0.047],[66500,0.049],[210000,0.059]],m:[[0,0.015],[8000,0.032],[25000,0.043],[50000,0.047],[100000,0.049],[315000,0.059]],std:[16100,32200],dep:4000},
  NY: {n:"New York",y:2026,src:"https://www.tax.ny.gov/",b:[[0,0.039],[8500,0.044],[11700,0.0515],[13900,0.054],[80650,0.059],[215400,0.0685],[1077550,0.0965],[5000000,0.103],[25000000,0.109]],m:[[0,0.039],[17150,0.044],[23600,0.0515],[27900,0.054],[161550,0.059],[323200,0.0685],[2155350,0.0965],[5000000,0.103],[25000000,0.109]],std:[8000,16050],dep:1000,ax:"Annual-tax approximation; NYS-50-T withholding tables use their own deduction and allowance values. NYC/Yonkers go in Local %.",pay:[{l:"NY SDI",r:0.005,wk:0.6},{l:"NY PFL",r:0.00432,c:95349}]},
  NC: {n:"North Carolina",y:2026,src:"https://www.ncdor.gov/",b:[[0,0.0399]],std:[12750,25500],dep:2500},
  ND: {n:"North Dakota",y:2026,src:"https://www.tax.nd.gov/",b:[[0,0],[48475,0.0195],[244825,0.025]],m:[[0,0],[80975,0.0195],[298075,0.025]],std:[16100,32200]},
  OH: {n:"Ohio",y:2026,src:"https://tax.ohio.gov/",b:[[0,0],[26050,0.0275]],pers:[2400,4800],dep:2400,ax:"Annual-tax approximation; Ohio's employer withholding formula (exemption $650 each, own rate table) differs. City/school district taxes go in Local %."},
  OK: {n:"Oklahoma",y:2026,src:"https://oklahoma.gov/tax.html",b:[[0,0],[3750,0.025],[4900,0.035],[7200,0.045]],m:[[0,0],[7500,0.025],[9800,0.035],[14400,0.045]],std:[6350,12700],pers:[1000,2000],dep:1000},
  OR: {n:"Oregon",y:2026,src:"https://www.oregon.gov/dor/",b:[[0,0.0475],[4550,0.0675],[11400,0.0875],[125000,0.099]],m:[[0,0.0475],[9100,0.0675],[22800,0.0875],[250000,0.099]],std:[2910,5820],pers:[256,512],dep:256,cr:1,ax:"Annual-tax approximation; OR withholding also subtracts a federal tax amount (not modeled), so it runs high.",pay:[{l:"OR Paid Leave",r:0.006,c:184500},{l:"OR statewide transit",r:0.001}]},
  PA: {n:"Pennsylvania",y:2026,src:"https://www.revenue.pa.gov/",k:1,b:[[0,0.0307]],ax:"Exact flat 3.07%; PA taxes 401(k) deferrals. Local EIT goes in Local %."},
  RI: {n:"Rhode Island",y:2026,src:"https://tax.ri.gov/",b:[[0,0.0375],[82050,0.0475],[186450,0.0599]],std:[11200,22400],pers:[5250,10500],dep:5250,pay:[{l:"RI TDI",r:0.011,c:100000}]},
  SC: {n:"South Carolina",y:2026,src:"https://dor.sc.gov/",b:[[0,0],[3640,0.03],[18230,0.06]],std:[8350,16700],dep:4930,ax:"Annual-tax approximation of SC withholding formula."},
  SD: {n:"South Dakota",y:2026,src:"https://dor.sd.gov/",none:1},
  TN: {n:"Tennessee",y:2026,src:"https://www.tn.gov/revenue.html",none:1},
  TX: {n:"Texas",y:2026,src:"https://comptroller.texas.gov/",none:1},
  UT: {n:"Utah",y:2026,src:"https://tax.utah.gov/",b:[[0,0.045]],ut:1,ax:"Approximation of Utah's withholding: 4.5% minus a $966 base credit ($1,932 married) that phases out at 1.3% above $18,213 ($36,426)."},
  VT: {n:"Vermont",y:2026,src:"https://tax.vermont.gov/",b:[[0,0.0335],[49400,0.066],[119700,0.076],[249700,0.0875]],m:[[0,0.0335],[82500,0.066],[199450,0.076],[304000,0.0875]],std:[7650,15300],pers:[5300,10600],dep:5300,ax:"Annual-tax approximation of VT withholding (2025 amounts)."},
  VA: {n:"Virginia",y:2026,src:"https://www.tax.virginia.gov/",b:[[0,0.02],[3000,0.03],[5000,0.05],[17000,0.0575]],std:[8750,17500],pers:[930,1860],dep:930},
  WA: {n:"Washington",y:2026,src:"https://dor.wa.gov/",none:1,pay:[{l:"WA PFML",r:0.00807,c:184500},{l:"WA Cares",r:0.0058}]},
  WV: {n:"West Virginia",y:2026,src:"https://tax.wv.gov/",b:[[0,0.0222],[10000,0.0296],[25000,0.0333],[40000,0.0444],[60000,0.0482]],pers:[2000,4000],dep:2000},
  WI: {n:"Wisconsin",y:2026,src:"https://www.revenue.wi.gov/",b:[[0,0.035],[15110,0.044],[51950,0.053],[332720,0.0765]],m:[[0,0.035],[20150,0.044],[69260,0.053],[443630,0.0765]],std:[13960,25840],pers:[700,1400],dep:700,ax:"Annual-tax approximation; WI std deduction phase-out and WT-4 method not modeled."},
  WY: {n:"Wyoming",y:2026,src:"https://revenue.wyo.gov/",none:1},
};

export function stateCalc(code: string, wagesPer: number, wagesPer401k: number, periods: number, mfj: boolean, deps: number, ytdGross: number, payWages: number) {
  const d = STATE_DATA[code];
  const out: { tax: number; lines: [string, number][] } = { tax: 0, lines: [] };
  if (!d) return out;
  const i = mfj ? 1 : 0;
  if (!d.none && d.b) {
    const W = (d.k ? wagesPer401k : wagesPer) * periods;
    const std = d.std ? d.std[i] : 0, pers = d.pers ? d.pers[i] : 0, dep = (d.dep || 0) * deps;
    const ti = Math.max(0, W - std - (d.cr ? 0 : pers + dep));
    const br = (mfj && d.m) || d.b;
    let t = 0;
    br.forEach((r: number[], k: number) => { const top = k + 1 < br.length ? br[k + 1][0] : Infinity; if (ti > r[0]) t += (Math.min(ti, top) - r[0]) * r[1]; });
    if (d.cr) t -= pers + dep;
    if (d.ut) { const base = mfj ? 1932 : 966, th = mfj ? 36426 : 18213; t -= Math.max(0, base - 0.013 * Math.max(0, W - th)); }
    out.tax = Math.max(0, t) / periods;
  }
  (d.pay || []).forEach((p: PayTax) => { let w = payWages; if (p.c) w = Math.max(0, Math.min(w, p.c - ytdGross)); let a = w * p.r; if (p.wk) a = Math.min(a, p.wk * (52 / periods)); out.lines.push([p.l, a]); });
  return out;
}
