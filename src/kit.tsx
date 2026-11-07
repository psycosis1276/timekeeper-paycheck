// Minimal UI kit: plain React components with CSS classes (see styles.css).
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
export { Fragment, useEffect, useMemo, useState };

type Tone = "success" | "warning" | "danger" | "info";
export function useGrokTheme() {
  return {
    bg: { base: "var(--bg)" },
    border: { default: "var(--border)", subtle: "var(--border-subtle)" },
    text: { primary: "var(--text)", secondary: "var(--text-2)" },
    font: { label: { fontSize: "13px" }, heading3: { fontSize: "17px" } },
  };
}
export function Page(p: { title: string; summary?: string; width?: string; children?: ReactNode }) {
  return <main className="page"><h1>{p.title}</h1>{p.summary && <p className="summary">{p.summary}</p>}<div className="stack">{p.children}</div></main>;
}
export function Section(p: { heading?: string; caption?: string; children?: ReactNode }) {
  return <section className="section">{p.heading && <h2>{p.heading}</h2>}{p.caption && <p className="caption">{p.caption}</p>}<div className="stack">{p.children}</div></section>;
}
export function Text(p: { children?: ReactNode }) { return <p className="text">{p.children}</p>; }
export function Callout(p: { tone?: Tone; children?: ReactNode }) { return <div className={`callout ${p.tone || ""}`}>{p.children}</div>; }
export function Metrics(p: { metrics: { value: string; label: string }[] }) {
  return <div className="metrics">{p.metrics.map((m) => <div key={m.label} className="metric"><div className="mv">{m.value}</div><div className="ml">{m.label}</div></div>)}</div>;
}
export function Table(p: { columns: string[]; rows: ReactNode[][]; emphasis?: number }) {
  return <div className="tablewrap"><table><thead><tr>{p.columns.map((c, i) => <th key={i} className={i ? "num" : ""}>{c}</th>)}</tr></thead>
    <tbody>{p.rows.map((r, i) => <tr key={i} className={i === p.emphasis ? "em" : ""}>{r.map((c, j) => <td key={j} className={j ? "num" : ""}>{c}</td>)}</tr>)}</tbody></table></div>;
}
export function Button(p: { label: string; onClick: () => void; variant?: "primary" | "quiet"; disabled?: boolean }) {
  return <button type="button" className={`btn ${p.variant === "primary" ? "primary" : ""}`} onClick={p.onClick} disabled={p.disabled}>{p.label}</button>;
}
export function Input(p: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: "text" | "number" }) {
  return <label className="field">{p.label && <span>{p.label}</span>}<input type={p.type === "number" ? "number" : "text"} inputMode={p.type === "number" ? "decimal" : undefined} value={p.value} placeholder={p.placeholder} onChange={(e) => p.onChange(e.target.value)} /></label>;
}
export function Select<T extends string = string>(p: { label?: string; options: (T | { value: T; label: string })[]; value: T; onChange: (v: T) => void }) {
  const opts = p.options.map((o) => typeof o === "string" ? { value: o, label: o } : o);
  return <label className="field">{p.label && <span>{p.label}</span>}<select value={p.value} onChange={(e) => p.onChange(e.target.value as T)}>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
export function Toggle(p: { label?: string; value: boolean; onChange: (v: boolean) => void }) {
  return <label className="toggle"><input type="checkbox" checked={p.value} onChange={(e) => p.onChange(e.target.checked)} /><span>{p.label}</span></label>;
}
export function Segmented<T extends string = string>(p: { options: (T | { value: T; label: string })[]; value: T; onChange: (v: T) => void }) {
  const opts = p.options.map((o) => typeof o === "string" ? { value: o, label: o } : o);
  return <div className="seg" role="tablist">{opts.map((o) => <button type="button" key={o.value} className={o.value === p.value ? "on" : ""} onClick={() => p.onChange(o.value)}>{o.label}</button>)}</div>;
}
export const Grid = (p: { children?: ReactNode }) => <div className="grid">{p.children}</div>;
export const Rows = () => null;
