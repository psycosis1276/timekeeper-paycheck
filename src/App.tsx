import { Page, Section, Text, Grid, Metrics, Table, Rows, Button, Input, Select, Toggle, Segmented, Callout, Fragment, useState, useEffect, useMemo, useGrokTheme } from "./kit";
import { STATE_DATA } from "./stateData";
import { Punch, Day, Settings, Saved, Misc, sampleMisc, DAYN, KEY, defaults, blank, sampleDays, n, money, hrs, PRESETS, computePaycheck } from "./payMath";

export default function App() {
  const theme = useGrokTheme();
  const [s, setS] = useState<Settings>(defaults);
  const [days, setDays] = useState<Day[]>(sampleDays());
  const [saved, setSaved] = useState<Saved[]>([]);
  const [misc, setMisc] = useState<Misc[]>(sampleMisc());
  const [view, setView] = useState<string>("time");
  const [loaded, setLoaded] = useState(false);
  const [storeOk, setStoreOk] = useState(true);

  useEffect(() => {
    try { const raw = window.localStorage.getItem(KEY); if (raw) { const j = JSON.parse(raw); if (j.s) setS({ ...defaults, ...j.s }); if (j.days) setDays(j.days); if (j.saved) setSaved(j.saved); if (j.misc) setMisc(j.misc); } }
    catch (e) { setStoreOk(false); }
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; try { window.localStorage.setItem(KEY, JSON.stringify({ s, days, saved, misc })); } catch (e) { setStoreOk(false); } }, [s, days, saved, misc, loaded]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p: Settings) => ({ ...p, [k]: v }));
  const nDays = s.period === "weekly" ? 7 : 14;
  const periods = s.period === "weekly" ? 52 : 26;
  const start = new Date(s.periodStart + "T12:00:00");
  const label = (i: number) => { const d = new Date(start.getTime() + i * 86400000); return isNaN(d.getTime()) ? DAYN[(n(s.weekStart) + i) % 7] : `${DAYN[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`; };

  const calc = useMemo(() => computePaycheck(s, days, saved, misc), [s, days, saved, misc]);
  const upMisc = (id: string, patch: Partial<Misc>) => setMisc((p: Misc[]) => p.map((m: Misc) => m.id === id ? { ...m, ...patch } : m));

  const upDay = (i: number, f: (d: Day) => Day) => setDays((p: Day[]) => { const q = p.slice(); while (q.length < 14) q.push(blank()); q[i] = f(q[i]); return q; });
  const box = { border: `1px solid ${theme.border.default}`, borderRadius: 12, padding: 14, marginBottom: 12, background: theme.bg.base };
  const row = { display: "flex", flexWrap: "wrap" as const, gap: 10, alignItems: "flex-end" };
  const cell = { flex: "1 1 120px", minWidth: 110 };
  const tiny = { color: theme.text.secondary, fontSize: theme.font.label.fontSize };

  const savePeriod = () => {
    const lbl = `${label(0)} to ${label(nDays - 1)}`;
    setSaved((p: Saved[]) => [...p, { label: lbl, hours: calc.total, gross: calc.gross, fed: calc.fed, ss: calc.ss, med: calc.med, state: calc.st + calc.stPay + calc.local, pre: calc.k401 + calc.ins, post: calc.roth + calc.post, net: calc.net, ssWages: calc.ssWages, medWages: calc.ficaWages, misc: calc.miscTot }]);
    setMisc((p: Misc[]) => p.map((m: Misc) => { const t = calc.mi.find((x) => x.m.id === m.id); if (!t) return m; if (m.freq === "once") return { ...m, done: true }; if (m.freq === "inst") { const b = Math.max(0, n(m.bal) - t.take); return { ...m, bal: String(Math.round(b * 100) / 100), done: b <= 0.005 }; } return m; }));
    const d = new Date(start.getTime() + nDays * 86400000);
    if (!isNaN(d.getTime())) set("periodStart", d.toISOString().slice(0, 10));
    setDays(Array.from({ length: 14 }, blank));
  };
  const ytd = saved.reduce((a: Saved, x: Saved) => ({ ...a, hours: a.hours + x.hours, gross: a.gross + x.gross, fed: a.fed + x.fed, ss: a.ss + x.ss, med: a.med + x.med, state: a.state + x.state, pre: a.pre + x.pre, post: a.post + x.post, net: a.net + x.net, misc: (a.misc || 0) + (x.misc || 0) }), { label: "YTD", hours: 0, gross: 0, fed: 0, ss: 0, med: 0, state: 0, pre: 0, post: 0, net: 0, ssWages: 0, medWages: 0, misc: 0 });

  return (
    <Page title="Timekeeper & Paycheck Projector" summary="Punch in your hours and see overtime, deductions, and your projected take-home check update live. Federal withholding uses the 2026 IRS Pub 15-T percentage method." width="wide">
      <Text>{`Projected net pay: ${money(calc.net)} on ${money(calc.gross)} gross for ${hrs(calc.total)} hours worked.`}</Text>
      <Metrics metrics={[
        { value: money(calc.net), label: "Projected net" },
        { value: money(calc.gross), label: "Gross" },
        { value: hrs(calc.total), label: "Hours worked" },
        { value: hrs(calc.c.ot + calc.c.dt), label: "OT + DT hours" },
      ]} />
      <Segmented options={[{ value: "time", label: "Punches" }, { value: "pay", label: "Paycheck" }, { value: "settings", label: "Settings" }, { value: "ytd", label: "Year to date" }]} value={view} onChange={(v: string) => setView(v)} />

      {view === "time" && (
        <Section heading="Punches" caption="Times as HH:MM, 24-hour. An out time earlier than the in time is treated as an overnight shift.">
          <div style={row}>
            <Button label="Clear week" variant="primary" onClick={() => setDays(Array.from({ length: 14 }, blank))} />
            <Button label="Load sample week" onClick={() => setDays(sampleDays())} />
          </div>
          <div style={{ height: 12 }} />
          {days.slice(0, nDays).map((d: Day, i: number) => (
            <div key={i} style={box}>
              <div style={{ ...row, justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ color: theme.text.primary, fontSize: theme.font.heading3.fontSize, fontWeight: 600 }}>{label(i)}</div>
                <div style={{ color: theme.text.primary, fontWeight: 600 }}>{hrs(calc.hd[i].h)} h{d.hol ? " · holiday" : ""}</div>
              </div>
              {d.punches.map((p: Punch, j: number) => (
                <div key={j} style={{ ...row, marginBottom: 8 }}>
                  <div style={cell}><Input label={`In ${j + 1}`} value={p.i} placeholder="07:00" onChange={(v: string) => upDay(i, (x: Day) => ({ ...x, punches: x.punches.map((q: Punch, k: number) => k === j ? { ...q, i: v } : q) }))} /></div>
                  <div style={cell}><Input label={`Out ${j + 1}`} value={p.o} placeholder="15:30" onChange={(v: string) => upDay(i, (x: Day) => ({ ...x, punches: x.punches.map((q: Punch, k: number) => k === j ? { ...q, o: v } : q) }))} /></div>
                  {d.punches.length > 1 && <Button label="Remove" onClick={() => upDay(i, (x: Day) => ({ ...x, punches: x.punches.filter((_q: Punch, k: number) => k !== j) }))} />}
                </div>
              ))}
              <div style={row}>
                <div style={cell}><Input label="Unpaid lunch (min)" type="number" value={d.lunch} onChange={(v: string) => upDay(i, (x: Day) => ({ ...x, lunch: v }))} /></div>
                <Button label="Add punch" onClick={() => upDay(i, (x: Day) => ({ ...x, punches: [...x.punches, { i: "", o: "" }] }))} />
                <Toggle label="Holiday" value={d.hol} onChange={(v: boolean) => upDay(i, (x: Day) => ({ ...x, hol: v }))} />
                {d.hol && <Toggle label="Different holiday pay this day" value={!!d.ovr} onChange={(v: boolean) => upDay(i, (x: Day) => ({ ...x, ovr: v, hpre: x.hpre || s.holPreset, hph: x.hph ?? s.holPaidHrs, hm: x.hm ?? s.holMult }))} />}
              </div>
              {d.hol && d.ovr && (
                <div style={{ ...row, marginTop: 8 }}>
                  <div style={{ flex: "2 1 220px" }}><Select label="This day's holiday preset" value={d.hpre || "custom"} options={PRESETS.map((p) => ({ value: p.value, label: p.label }))} onChange={(v: string) => upDay(i, (x: Day) => { const p = PRESETS.find((q) => q.value === v); return { ...x, hpre: v, hph: p && p.h !== "" ? p.h : x.hph, hm: p && p.m !== "" ? p.m : x.hm }; })} /></div>
                  <div style={cell}><Input label="Paid hours (not worked)" type="number" value={d.hph || ""} onChange={(v: string) => upDay(i, (x: Day) => ({ ...x, hph: v, hpre: "custom" }))} /></div>
                  <div style={cell}><Input label="Multiplier on worked" type="number" value={d.hm || ""} onChange={(v: string) => upDay(i, (x: Day) => ({ ...x, hm: v, hpre: "custom" }))} /></div>
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {view === "pay" && (
        <Fragment>
          <Section heading="Hours and earnings">
            <Table columns={["Category", "Hours", "Rate", "Amount"]} rows={[
              ["Regular", hrs(calc.c.reg), money(n(s.rate)), money(calc.pay.reg)],
              [`Overtime ${s.otMult}x`, hrs(calc.c.ot), money(n(s.rate) * n(s.otMult)), money(calc.pay.ot)],
              [`Double time ${s.dtMult}x`, hrs(calc.c.dt), money(n(s.rate) * n(s.dtMult)), money(calc.pay.dt)],
              ["Holiday hours worked (with premium)", hrs(calc.c.holW), calc.c.holW ? money(calc.pay.holW / calc.c.holW) : "", money(calc.pay.holW)],
              [`Holiday overtime (${s.holInteract === "stack" ? "stacked" : "higher of"})`, hrs(calc.c.holOT), calc.c.holOT ? money(calc.pay.holOT / calc.c.holOT) : "", money(calc.pay.holOT)],
              ["Holiday pay (not worked)", hrs(calc.c.holPaid), money(n(s.rate)), money(calc.pay.holPaid)],
              ["Gross pay", hrs(calc.c.reg + calc.c.ot + calc.c.dt + calc.c.holW + calc.c.holOT + calc.c.holPaid), "", money(calc.gross)],
            ]} emphasis={5} />
          </Section>
          <Section heading="Deductions and net">
            <Table columns={["Item", "Amount"]} rows={[
              ["Gross pay", money(calc.gross)],
              [`401(k) pre-tax ${s.k401}%`, money(-calc.k401)],
              ["Health/dental/vision pre-tax", money(-calc.ins)],
              ["Federal income tax (2026 Pub 15-T)", money(-calc.fed)],
              ["Social Security 6.2%", money(-calc.ss)],
              ["Medicare 1.45%", money(-calc.med)],
              [s.stCode === "CUSTOM" ? `State tax (custom ${s.state}%)` : `${STATE_DATA[s.stCode].n} income tax (${STATE_DATA[s.stCode].y}, estimate)`, money(-calc.st)],
              ...calc.stLines.map((x: [string, number]) => [x[0], money(-x[1])]),
              [`Local/city tax ${s.local}%`, money(-calc.local)],
              [`Roth 401(k) ${s.roth}%`, money(-calc.roth)],
              ["Union dues / other post-tax", money(-calc.post)],
              ...calc.mi.map((x) => [`${x.m.name}${x.m.pre ? " (pre-tax)" : ""}${x.m.freq === "inst" ? `, ${money(n(x.m.bal) - x.take)} left after` : x.m.freq === "once" ? ", one-time" : ""}`, money(-x.take)]),
              ["Projected net pay", money(calc.net)],
            ]} emphasis={10 + calc.stLines.length + calc.mi.length} />
            <Text>State and local figures are estimates from published 2026 rates; your actual withholding may differ.</Text>
            {calc.short > 0 && <Callout tone="warning">{`Deductions exceed this check by ${money(calc.short)}. Misc deductions were reduced so net pay stays at or above $0.`}</Callout>}
            <div style={{ height: 12 }} />
            <Button label="Save this period to year-to-date and start next" variant="primary" onClick={savePeriod} />
          </Section>
        </Fragment>
      )}

      {view === "settings" && (
        <Section heading="Settings">
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>Pay</div>
            <div style={row}>
              <div style={cell}><Input label="Hourly rate ($)" type="number" value={s.rate} onChange={(v: string) => set("rate", v)} /></div>
              <div style={cell}><Select label="Pay period" value={s.period} options={[{ value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Biweekly" }]} onChange={(v: string) => set("period", v as Settings["period"])} /></div>
              <div style={cell}><Input label="Period start (YYYY-MM-DD)" value={s.periodStart} onChange={(v: string) => set("periodStart", v)} /></div>
              <div style={cell}><Select label="Workweek starts" value={s.weekStart} options={DAYN.map((d: string, i: number) => ({ value: String(i), label: d }))} onChange={(v: string) => set("weekStart", v)} /></div>
            </div>
            <div style={{ ...tiny, marginTop: 6 }}>Set the period start date to the first day of your workweek; weekly overtime is counted per 7 days from that date.</div>
          </div>
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>Overtime</div>
            <div style={row}>
              <div style={cell}><Select label="OT rule" value={s.mode} options={[{ value: "combo", label: "Daily + weekly" }, { value: "weekly", label: "Weekly only" }, { value: "daily", label: "Daily only" }]} onChange={(v: string) => set("mode", v as Settings["mode"])} /></div>
              <div style={cell}><Input label="Weekly OT after (h)" type="number" value={s.weeklyOT} onChange={(v: string) => set("weeklyOT", v)} /></div>
              <div style={cell}><Input label="Daily OT after (h)" type="number" value={s.dailyOT} onChange={(v: string) => set("dailyOT", v)} /></div>
              <div style={cell}><Input label="OT multiplier" type="number" value={s.otMult} onChange={(v: string) => set("otMult", v)} /></div>
            </div>
            <div style={{ ...row, marginTop: 8 }}>
              <Toggle label="Double time after daily limit" value={s.dtOn} onChange={(v: boolean) => set("dtOn", v)} />
              <div style={cell}><Input label="DT after (h/day)" type="number" value={s.dailyDT} onChange={(v: string) => set("dailyDT", v)} /></div>
              <div style={cell}><Input label="DT multiplier" type="number" value={s.dtMult} onChange={(v: string) => set("dtMult", v)} /></div>
              <Toggle label="7th consecutive day rule" value={s.seventh} onChange={(v: boolean) => set("seventh", v)} />
            </div>
          </div>
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>Holidays</div>
            <div style={row}>
              <div style={{ flex: "2 1 220px" }}><Select label="Holiday pay preset" value={s.holPreset} options={PRESETS.map((p) => ({ value: p.value, label: p.label }))} onChange={(v: string) => { const p = PRESETS.find((q) => q.value === v); setS((o: Settings) => ({ ...o, holPreset: v, holPaidHrs: p && p.h !== "" ? p.h : o.holPaidHrs, holMult: p && p.m !== "" ? p.m : o.holMult })); }} /></div>
              <div style={cell}><Input label="Holiday pay hours (not worked)" type="number" value={s.holPaidHrs} onChange={(v: string) => setS((o: Settings) => ({ ...o, holPaidHrs: v, holPreset: "custom" }))} /></div>
              <div style={cell}><Input label="Multiplier on hours worked" type="number" value={s.holMult} onChange={(v: string) => setS((o: Settings) => ({ ...o, holMult: v, holPreset: "custom" }))} /></div>
            </div>
            <div style={{ ...row, marginTop: 8 }}>
              <div style={{ flex: "2 1 220px" }}><Select label="Holiday hours that hit overtime" value={s.holInteract} options={[{ value: "higher", label: "Higher of holiday or OT rate" }, { value: "stack", label: "Stack OT premium on holiday rate" }]} onChange={(v: string) => set("holInteract", v as Settings["holInteract"])} /></div>
              <Toggle label="Worked holiday hours count toward OT" value={s.holCountsOT} onChange={(v: boolean) => set("holCountsOT", v)} />
              <Toggle label="Unworked holiday pay hours count toward weekly 40" value={s.holPaidCountsOT} onChange={(v: boolean) => set("holPaidCountsOT", v)} />
            </div>
          </div>
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>Deductions per period</div>
            <div style={row}>
              <div style={cell}><Input label="401(k) pre-tax %" type="number" value={s.k401} onChange={(v: string) => set("k401", v)} /></div>
              <div style={cell}><Input label="Insurance pre-tax $" type="number" value={s.ins} onChange={(v: string) => set("ins", v)} /></div>
              <div style={cell}><Input label="Roth 401(k) %" type="number" value={s.roth} onChange={(v: string) => set("roth", v)} /></div>
              <div style={cell}><Input label="Union dues / other post-tax $" type="number" value={s.post} onChange={(v: string) => set("post", v)} /></div>
            </div>
          </div>
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>Miscellaneous deductions</div>
            {misc.map((m: Misc) => (
              <div key={m.id} style={{ borderTop: `1px solid ${theme.border.subtle}`, paddingTop: 10, marginBottom: 10 }}>
                <div style={row}>
                  <div style={{ flex: "2 1 180px" }}><Input label="Deduction label" value={m.name} onChange={(v: string) => upMisc(m.id, { name: v })} /></div>
                  <div style={cell}><Input label={m.kind === "pct" ? "% of gross" : m.freq === "inst" ? "$ per period" : "Amount $"} type="number" value={m.amt} onChange={(v: string) => upMisc(m.id, { amt: v })} /></div>
                  <div style={cell}><Select label="Type" value={m.kind} options={[{ value: "fixed", label: "Fixed $" }, { value: "pct", label: "% of gross" }]} onChange={(v: string) => upMisc(m.id, { kind: v as Misc["kind"] })} /></div>
                  <div style={cell}><Select label="Frequency" value={m.freq} options={[{ value: "every", label: "Every period" }, { value: "once", label: "One-time" }, { value: "inst", label: "Installment" }]} onChange={(v: string) => upMisc(m.id, { freq: v as Misc["freq"], done: false })} /></div>
                  {m.freq === "inst" && <div style={cell}><Input label="Balance left $" type="number" value={m.bal} onChange={(v: string) => upMisc(m.id, { bal: v, done: n(v) <= 0 })} /></div>}
                </div>
                <div style={{ ...row, marginTop: 8 }}>
                  <Toggle label="Pre-tax (lowers income tax)" value={m.pre} onChange={(v: boolean) => upMisc(m.id, { pre: v, fica: v ? m.fica : false })} />
                  {m.pre && <Toggle label="Also lowers SS/Medicare" value={m.fica} onChange={(v: boolean) => upMisc(m.id, { fica: v })} />}
                  {m.done && <div style={tiny}>{m.freq === "inst" ? "Paid off" : "Done"}</div>}
                  {m.done && <Button label="Reactivate" onClick={() => upMisc(m.id, { done: false })} />}
                  <Button label="Remove" onClick={() => setMisc((p: Misc[]) => p.filter((q: Misc) => q.id !== m.id))} />
                </div>
              </div>
            ))}
            <Button label="Add deduction" variant="primary" onClick={() => setMisc((p: Misc[]) => [...p, { id: "m" + Date.now(), name: "New deduction", amt: "0", kind: "fixed", pre: false, fica: false, freq: "every", bal: "0", done: false }])} />
          </div>
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>Taxes (W-4 2020 or later)</div>
            <div style={row}>
              <div style={cell}><Select label="Filing status" value={s.filing} options={[{ value: "single", label: "Single / MFS" }, { value: "mfj", label: "Married jointly" }, { value: "hoh", label: "Head of household" }]} onChange={(v: string) => set("filing", v as Settings["filing"])} /></div>
              <Toggle label="Step 2 box checked" value={s.step2} onChange={(v: boolean) => set("step2", v)} />
              <div style={cell}><Input label="Step 3 dependents $/yr" type="number" value={s.dep} onChange={(v: string) => set("dep", v)} /></div>
              <div style={cell}><Input label="4(a) other income $/yr" type="number" value={s.other4a} onChange={(v: string) => set("other4a", v)} /></div>
              <div style={cell}><Input label="4(b) deductions $/yr" type="number" value={s.ded4b} onChange={(v: string) => set("ded4b", v)} /></div>
              <div style={cell}><Input label="4(c) extra $/period" type="number" value={s.extra4c} onChange={(v: string) => set("extra4c", v)} /></div>
            </div>
          </div>
          <div style={box}>
            <div style={{ ...tiny, marginBottom: 8 }}>State and local tax (estimates)</div>
            <div style={row}>
              <div style={{ flex: "2 1 200px" }}><Select label="State" value={s.stCode} options={[{ value: "CUSTOM", label: "Custom flat %" }, ...Object.keys(STATE_DATA).sort((a: string, b: string) => STATE_DATA[a].n.localeCompare(STATE_DATA[b].n)).map((k: string) => ({ value: k, label: STATE_DATA[k].n }))]} onChange={(v: string) => set("stCode", v)} /></div>
              {s.stCode === "CUSTOM" && <div style={cell}><Input label="Custom state %" type="number" value={s.state} onChange={(v: string) => set("state", v)} /></div>}
              <div style={cell}><Select label="State filing status" value={s.stFiling} options={[{ value: "single", label: "Single" }, { value: "mfj", label: "Married" }]} onChange={(v: string) => set("stFiling", v as Settings["stFiling"])} /></div>
              <div style={cell}><Input label="State allowances/dependents" type="number" value={s.stDeps} onChange={(v: string) => set("stDeps", v)} /></div>
              <div style={cell}><Input label="Extra state withholding $" type="number" value={s.stExtra} onChange={(v: string) => set("stExtra", v)} /></div>
              <div style={cell}><Input label="Local/city tax %" type="number" value={s.local} onChange={(v: string) => set("local", v)} /></div>
            </div>
            <div style={{ ...tiny, marginTop: 6 }}>{s.stCode === "CUSTOM" ? "Custom: flat % of state-taxable wages." : `${STATE_DATA[s.stCode].n}: ${STATE_DATA[s.stCode].y} rules. ${STATE_DATA[s.stCode].none ? "No state income tax on wages." : STATE_DATA[s.stCode].ax || "Uses the state's annual brackets, deductions and exemptions."} Source: ${STATE_DATA[s.stCode].src}`}</div>
            <div style={{ ...tiny, marginTop: 4 }}>Local % examples: NYC about 3.08%–3.88%, Philadelphia 3.74%, PA local EIT often 1%–2%, Ohio cities 1%–2.5%, Detroit 2.4%. Enter the rate only; no address needed.</div>
          </div>
          <Button label="Reset settings to defaults" onClick={() => setS(defaults)} />
        </Section>
      )}

      {view === "ytd" && saved.length > 0 && (
        <Section heading="Year to date">
          <Table columns={["Period", "Hours", "Gross", "Federal", "SS", "Medicare", "Misc", "Net"]} rows={[
            ...saved.map((x: Saved) => [x.label, hrs(x.hours), money(x.gross), money(x.fed), money(x.ss), money(x.med), money(x.misc || 0), money(x.net)]),
            ["Total", hrs(ytd.hours), money(ytd.gross), money(ytd.fed), money(ytd.ss), money(ytd.med), money(ytd.misc || 0), money(ytd.net)],
          ]} emphasis={saved.length} />
          <div style={{ height: 12 }} />
          <Button label="Remove last saved period" onClick={() => setSaved((p: Saved[]) => p.slice(0, -1))} />
        </Section>
      )}
      {view === "ytd" && saved.length === 0 && (
        <Section heading="Year to date">
          <Text>Save a pay period from the Paycheck tab to start the running total. Social Security stops at the 2026 wage base of $184,500 using these saved totals.</Text>
        </Section>
      )}

      <Text>No personal info is collected: only rates, hours, filing status, counts and amounts. Your data stays on this device.</Text>
      {!storeOk && <Callout tone="warning">This viewer blocked local storage, so entries will reset when the page reloads.</Callout>}
    </Page>
  );
}
