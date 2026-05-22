import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Database,
  Sparkles,
  AlertOctagon,
  TrendingDown,
  EyeOff,
  Map as MapIcon,
  ArrowRight,
  Globe2,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  CalendarX,
} from "lucide-react";
import {
  SUGGESTED_QUERIES,
  DATA_SOURCES,
  type Crisis,
  type Dossier,
  type NeglectCategory,
} from "@/lib/dossier-data";
import {
  getDemoDossierForQuery,
  getDemoChatResponse,
  LIBYA_DETAIL_SECTION,
} from "@/lib/demo-dossier";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Geo-Insight — The Silence Index" },
      {
        name: "description",
        content:
          "A conversational briefing tool for UN coordinators surfacing humanitarian crises where need outpaces funding.",
      },
    ],
  }),
  component: SilenceIndex,
});

const CAT_LABEL: Record<NeglectCategory, string> = {
  critical: "Critically overlooked",
  severe: "Severely overlooked",
  moderate: "Moderately overlooked",
};

const CAT_COLOR: Record<NeglectCategory, string> = {
  critical: "var(--color-crit)",
  severe: "var(--color-severe)",
  moderate: "var(--color-moderate)",
};

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
  isDossierPointer?: boolean;
}


const QUERY_DELAY_MS = 1400;

function SilenceIndex() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossierKey, setDossierKey] = useState(0);
  const [hasDossier, setHasDossier] = useState(false);
  const [activeDossier, setActiveDossier] = useState<Dossier | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);

  const submit = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;
    setInput("");
    setChat((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    setLastQuery(q);

    const isFirstDossier = !hasDossier;
    await new Promise((r) => setTimeout(r, QUERY_DELAY_MS));

    const dossier = getDemoDossierForQuery(q);
    setActiveDossier(dossier);
    setHasDossier(true);
    setDossierKey((k) => k + 1);

    const answer = getDemoChatResponse(q, dossier, isFirstDossier);
    setChat((prev) => [
      ...prev,
      {
        role: "assistant",
        text: answer,
        isDossierPointer: true,
      },
    ]);

    setLoading(false);
  };

  // Auto-run a mock query on first mount so testers see the dossier immediately
  useEffect(() => {
    submit(SUGGESTED_QUERIES[0] ?? "Show me the top neglected crises");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* LEFT — Dossier (65%) */}
      <section className="basis-[65%] min-w-0 flex flex-col border-r border-border">
        <div className="h-12 border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-baseline gap-3">
            <span className="eyebrow">Dossier</span>
            <span className="text-[12px] text-muted-foreground">
              {loading
                ? "Querying crisis database"
                : hasDossier
                  ? "Generated just now"
                  : "Awaiting query"}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">
            {loading ? (
              <LoadingState />
            ) : hasDossier && activeDossier ? (
              <DossierView
                key={dossierKey}
                dossier={activeDossier}
                showLibyaDetail={/\blibya\b/i.test(lastQuery)}
              />
            ) : (
              <EmptyDossier />
            )}
          </div>
        </div>
      </section>

      {/* RIGHT — Conversation (35%) */}
      <section className="basis-[35%] min-w-0 flex flex-col bg-[color:var(--color-panel)]/40">
        {/* Header with logo */}
        <div className="h-12 border-b border-border flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
              <Globe2 className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-[13px] font-semibold">Geo-Insight</div>
              <div className="eyebrow-muted text-[8.5px] tracking-[0.18em] -mt-0.5">
                The Silence Index
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
            <span
              className="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-amber)] border-[color:var(--color-amber)]/45 bg-[color:var(--color-amber)]/10"
              title="Prototype UI using curated crisis intelligence data"
            >
              Demo mode
            </span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-[color:var(--color-moderate)] opacity-60 animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--color-moderate)]" />
              </span>
              <Database className="h-3 w-3" />
              Databricks
            </span>
          </div>
        </div>

        {/* Chat thread */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-3">
          {chat.length === 0 && (
            <div className="text-[12.5px] leading-relaxed text-muted-foreground">
              Welcome. Ask the index a question — about a country, a region, a
              funding gap, or who's been forgotten. The briefing renders on the
              left; the conversation stays here.
            </div>
          )}
          {chat.map((m, i) => (
            <ChatBubble key={i} m={m} />
          ))}
          {loading && (
            <div className="flex gap-1.5 pl-1">
              <span className="dot h-1.5 w-1.5 rounded-full bg-primary" />
              <span
                className="dot h-1.5 w-1.5 rounded-full bg-primary"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="dot h-1.5 w-1.5 rounded-full bg-primary"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          )}
        </div>

        {/* Chips + single input */}
        <div className="px-5 pt-3 pb-4 border-t border-border bg-[color:var(--color-panel)]/60">
          <div className="eyebrow-muted text-[9px] mb-2">Suggested queries</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTED_QUERIES.map((c) => (
              <button
                key={c}
                onClick={() => submit(c)}
                disabled={loading}
                className="text-[11px] leading-snug text-left px-2.5 py-1 rounded-full border border-border bg-[color:var(--color-panel-2)]/60 text-foreground/80 hover:border-primary/60 hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {c}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <div className="border border-border rounded-md bg-[color:var(--color-panel)] focus-within:border-primary/70 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                placeholder={
                  hasDossier
                    ? "Ask a follow-up question…"
                    : "Ask about any crisis, region, or funding gap…"
                }
                rows={2}
                className="w-full bg-transparent px-3.5 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground/70 resize-none"
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[10px] text-muted-foreground pl-1.5">
                  Enter to send · Shift+Enter for newline
                </span>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-3.5 py-1.5 rounded-sm bg-primary text-primary-foreground text-[12px] font-medium tracking-wide hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      Analyzing
                      <span className="inline-flex">
                        <span className="h-1 w-1 rounded-full bg-primary-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1 w-1 rounded-full bg-primary-foreground animate-bounce ml-[1px]" style={{ animationDelay: '150ms' }} />
                        <span className="h-1 w-1 rounded-full bg-primary-foreground animate-bounce ml-[1px]" style={{ animationDelay: '300ms' }} />
                      </span>
                    </>
                  ) : hasDossier ? (
                    <>
                      Ask
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Generate dossier
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Stats footer */}
          <div className="mt-4 pt-3 border-t border-border grid grid-cols-4 gap-2 text-center">
            <FooterStat label="Crises" value="758" />
            <FooterStat label="Snapshots" value="78 mo" />
            <FooterStat label="Data" value="’19–’26" />
            <FooterStat label="Gap" value="$29B" emphasize />
          </div>
          <div className="mt-2 text-[9.5px] leading-relaxed text-muted-foreground/80 text-center">
            {DATA_SOURCES}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMsg }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] text-[13px] leading-relaxed rounded-md px-3.5 py-2.5 bg-[color:var(--color-panel-2)] border border-border text-foreground/90">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="border-l-2 border-primary/60 pl-3 pr-1 py-1 text-[13px] leading-relaxed text-foreground/85">
      <div className="eyebrow-muted text-[9px] mb-1">Index</div>
      {m.text}
      {m.isDossierPointer && (
        <div className="mt-1.5 text-[11px] text-primary inline-flex items-center gap-1">
          <ArrowRight className="h-3 w-3 rotate-180" /> See dossier
        </div>
      )}
    </div>
  );
}

function EmptyDossier() {
  return (
    <div className="h-full min-h-[520px] flex flex-col items-center justify-center text-center py-20">
      <div className="h-14 w-14 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center mb-6">
        <Globe2 className="h-7 w-7 text-primary" strokeWidth={2} />
      </div>
      <div className="font-serif text-[26px] font-semibold tracking-tight">
        Geo-Insight
      </div>
      <div className="eyebrow-muted mt-1.5">The Silence Index</div>
      <p className="mt-6 text-[14px] text-muted-foreground max-w-sm leading-relaxed">
        Ask a question to generate a crisis briefing.
      </p>
    </div>
  );
}

function FooterStat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="leading-tight">
      <div
        className={
          "font-serif text-[13px] " +
          (emphasize ? "text-primary font-semibold" : "text-foreground")
        }
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}





function LoadingState() {
  return (
    <div className="py-16 flex flex-col items-start">
      <div className="flex items-center gap-2 text-[15px] text-foreground/90 font-medium">
        <span>Querying crisis database</span>
        <span className="inline-flex gap-1 pl-0.5">
          <span className="dot h-2 w-2 rounded-full bg-primary" />
          <span className="dot h-2 w-2 rounded-full bg-primary" style={{ animationDelay: "0.15s" }} />
          <span className="dot h-2 w-2 rounded-full bg-primary" style={{ animationDelay: "0.3s" }} />
        </span>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground max-w-md leading-relaxed">
        Cross-referencing severity, funding coverage, HRP status, and silence signals
        across 758 tracked crises.
      </p>
    </div>
  );
}

function DossierView({
  dossier: d,
  showLibyaDetail,
}: {
  dossier: Dossier;
  showLibyaDetail?: boolean;
}) {
  return (
    <article className="animate-dossier">
      {/* Header */}
      <header className="border-b border-border pb-8">
        <div className="eyebrow mb-3">Dossier · Generated just now</div>
        <h2 className="font-serif text-[34px] leading-[1.15] font-semibold max-w-3xl">
          {d.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/85 max-w-2xl">
          {d.summary}
        </p>
      </header>

      {/* Metric strip */}
      <section className="grid grid-cols-4 border-b border-border">
        {d.metrics.map((m, i) => (
          <div
            key={m.label}
            className={"py-7 px-6 " + (i < 3 ? "border-r border-border" : "")}
          >
            <div className="font-serif text-primary text-[40px] leading-none font-semibold">
              {m.value}
            </div>
            <div className="mt-2 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              {m.label}
            </div>
          </div>
        ))}
      </section>

      {showLibyaDetail && (
        <section className="mt-8 border border-primary/35 bg-[color:var(--color-panel)] rounded-md p-6">
          <div className="eyebrow mb-2">Deep dive</div>
          <h3 className="font-serif text-[20px] font-semibold">{LIBYA_DETAIL_SECTION.headline}</h3>
          <ul className="mt-4 space-y-2.5">
            {LIBYA_DETAIL_SECTION.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-[13px] leading-relaxed text-foreground/85">
                <span className="text-primary mt-0.5">›</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Need scorer */}
      <Section eyebrow="Need scorer" title="Ranked by composite severity & funding gap">
        <div className="space-y-3">
          {d.crises.map((c) => (
            <CrisisCard key={c.iso} c={c} />
          ))}
        </div>
      </Section>

      {/* Visual ranking */}
      <Section eyebrow="Visual ranking" title="Composite Silence Score, 0–100">
        <div className="bg-[color:var(--color-panel)] border border-border rounded-md px-6 py-7">
          <div className="space-y-4">
            {d.crises.map((c, i) => (
              <BarRow key={c.iso} c={c} delayMs={i * 80} />
            ))}
          </div>
          <Legend />
        </div>
      </Section>

      {/* Silence detector */}
      <Section eyebrow="Silence detector" title="Why these crises are invisible">
        <div className="grid grid-cols-2 gap-4">
          {d.signals.map((s, i) => (
            <SignalCard key={s.title} signal={s} index={i} />
          ))}
        </div>
      </Section>

      {/* Advisory */}
      <Section eyebrow="Advocacy advisor" title="A recommendation for your next briefing">
        <div className="border border-primary/40 bg-[color:var(--color-panel)] rounded-md p-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[3px] bg-primary" />
          <div className="font-serif text-[20px] leading-snug font-semibold text-foreground max-w-2xl">
            {d.advisory.headline}
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-foreground/85 max-w-2xl">
            {d.advisory.body}
          </p>
          <ul className="mt-5 space-y-2.5">
            {d.advisory.angles.map((a) => (
              <li key={a} className="flex gap-3 text-[13px] text-foreground/90">
                <Sparkles className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Footer caveat */}
      <footer className="mt-12 pt-6 border-t border-border">
        <div className="eyebrow-muted mb-2">Data transparency</div>
        <p className="text-[12px] leading-relaxed text-muted-foreground max-w-3xl">
          Composite blends INFORM severity, OCHA FTS coverage and HNO/GCSI
          signals across 78 monthly snapshots (2019–2026). Coverage is
          structurally unmeasured for crises without an active HRP — absence of
          data is not absence of need. This briefing is decision support;
          corroborate with country teams before acting.
        </p>
      </footer>
    </article>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="eyebrow">{eyebrow} —</span>
        <h3 className="font-serif text-[20px] font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function CrisisCard({ c }: { c: Crisis }) {
  const [open, setOpen] = useState(false);
  const coverageText =
    c.coverage != null ? `${c.coverage.toFixed(1)}%` : "Unmeasured";
  const coverageWarn = c.coverage == null || c.coverage < 50;
  const catColor = CAT_COLOR[c.category];

  return (
    <div className="group relative overflow-hidden border border-border bg-[color:var(--color-panel)] rounded-md hover:border-primary/40 transition-colors">
      {/* Decorative corner accents */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-24 w-24 opacity-60"
        style={{
          background: `linear-gradient(225deg, ${catColor}14, transparent 70%)`,
        }}
      />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 bg-gradient-to-tr from-primary/[0.04] to-transparent" />

      <div className="flex">
        {/* Rank sidebar */}
        <div className="w-20 shrink-0 flex flex-col items-center pt-7 pb-6 border-r border-border/60 relative">
          <div className="font-serif text-[34px] font-bold text-primary/90 leading-none tracking-tighter">
            {String(c.rank).padStart(2, "0")}
          </div>
          <div className="h-px w-8 bg-border my-5" />
          <div className="flex-1 flex items-center">
            <span className="-rotate-90 origin-center whitespace-nowrap text-[9px] font-bold tracking-[0.24em] uppercase text-muted-foreground/70">
              Ranking Gap
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-7">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-serif text-[22px] font-semibold text-foreground leading-tight">
                  {c.name}
                </h4>
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground border border-border rounded-sm px-1.5 py-0.5 bg-[color:var(--color-panel-2)]/60">
                  {c.iso}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[12px]">
                {c.worsening && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-crit)]">
                    <TrendingUp className="h-3 w-3" strokeWidth={3} /> Worsening
                  </span>
                )}
                {c.worsening && <span className="text-muted-foreground/50">•</span>}
                <span className="text-muted-foreground">
                  {c.country} · {c.type}
                </span>
                {c.totalPin && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-foreground/85">{c.totalPin} in need</span>
                  </>
                )}
              </div>
            </div>

            <Badge cat={c.category} />
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-6 py-5 border-y border-border/60">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.18em]">
                Severity
              </p>
              <p className="text-xl font-medium text-foreground">
                {c.severity.toFixed(2)}
                <span className="text-muted-foreground text-sm italic"> / 5</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.18em]">
                Silence Score
              </p>
              <p className="text-xl font-medium text-foreground">
                {c.composite.toFixed(1)}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.18em]">
                Funding
              </p>
              <p
                className={
                  "font-serif text-xl font-bold " +
                  (coverageWarn ? "text-primary" : "text-foreground")
                }
              >
                {coverageText}
                <span className="text-[10px] font-sans font-bold uppercase block text-muted-foreground tracking-wider mt-0.5">
                  {c.coverage != null ? "Funded" : "no HRP"}
                </span>
              </p>
            </div>
          </div>

          {/* Historical + tags */}
          <div className="mt-6 space-y-5">
            {c.historicalAvgCoverage != null && c.coverage != null && (
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.18em]">
                  Historical Avg
                </span>
                <div className="flex items-center gap-2.5 font-serif italic text-primary/85">
                  <span>{c.historicalAvgCoverage}%</span>
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground/60 not-italic" />
                  <span className="text-primary font-bold not-italic">
                    {c.coverage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {(c.noHrp ||
              c.chronic ||
              c.yearsUnderfunded ||
              c.worstSector ||
              c.fundingGap) && (
              <div className="flex flex-wrap gap-2">
                {c.noHrp && <Tag>No HRP</Tag>}
                {c.chronic && <Tag>Chronic</Tag>}
                {c.yearsUnderfunded && (
                  <Tag warn>{c.yearsUnderfunded} years underfunded</Tag>
                )}
                {c.fundingGap && <Tag warn>{c.fundingGap}</Tag>}
                {c.worstSector && (
                  <Tag warn>
                    <AlertTriangle className="h-3 w-3 inline -mt-0.5 mr-1" />
                    {c.worstSector} sector critical
                  </Tag>
                )}
              </div>
            )}

            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="w-full pt-4 border-t border-border/40 flex items-center justify-between group/btn"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover/btn:text-primary transition-colors">
                How was this scored?
              </span>
              <ChevronDown
                className={
                  "h-4 w-4 text-muted-foreground/60 group-hover/btn:text-primary transition-transform duration-300 ease-in-out " +
                  (open ? "rotate-180" : "rotate-0")
                }
              />
            </button>

            <div className="score-breakdown-grid" data-open={open ? "true" : "false"}>
              <div className="score-breakdown-inner">
                <ScoreBreakdown c={c} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdown({ c }: { c: Crisis }) {
  const coverageFrac = c.coverage != null ? c.coverage / 100 : 0;
  const worseningMult = c.worsening ? 1.2 : 1.0;
  const gap = c.severity * (1 - coverageFrac) * worseningMult;

  // Reconstruct silence signal checklist
  const monthsTracked = c.monthsTracked ?? 0;
  const yearsUnder = c.yearsUnderfunded ?? 0;
  const signals: { label: string; pts: number; on: boolean }[] = [
    { label: "No formal HRP", pts: 25, on: !!c.noHrp },
    { label: "Chronic neglect 12+ months", pts: 20, on: !!c.chronic || monthsTracked >= 12 },
    {
      label: "Severely underfunded (<25%)",
      pts: 15,
      on: c.coverage != null && c.coverage < 25,
    },
    {
      label: "Chronically underfunded 3+ years",
      pts: 15,
      on: yearsUnder >= 3,
    },
    {
      label: "High donor concentration",
      pts: 10,
      on: c.coverage != null && c.coverage > 0 && c.coverage < 20,
    },
    { label: "Worsening trend", pts: 10, on: !!c.worsening },
    { label: "Consistently high severity (≥4)", pts: 5, on: c.severity >= 4 },
  ];
  const silenceComputed = signals.reduce((s, x) => s + (x.on ? x.pts : 0), 0);
  const silence = c.silence ?? silenceComputed;

  const gapContrib = (gap / 6) * 60;
  const silenceContrib = (silence / 100) * 40;
  const composite = gapContrib + silenceContrib;

  const confidence: "High" | "Medium" | "Low" =
    c.dataConfidence ??
    (c.totalPin && monthsTracked >= 12
      ? "High"
      : c.noHrp || monthsTracked < 6
        ? "Low"
        : "Medium");
  const confColor =
    confidence === "High"
      ? "var(--color-moderate)"
      : confidence === "Low"
        ? "var(--color-crit)"
        : "var(--color-severe)";
  const confReason =
    confidence === "High"
      ? "HNO data available and snapshot is recent."
      : confidence === "Low"
        ? "No HRP or stale snapshot — figures inferred."
        : "Funding data available, HNO partial.";

  const histAvg = c.historicalAvgCoverage;
  const covChange =
    histAvg != null && c.coverage != null ? c.coverage - histAvg : null;

  return (
    <div className="border-t border-border pt-5 pb-1 space-y-6">
      {/* Gap score */}
      <BreakdownBlock title="Gap score breakdown">
        <Row label="Severity" value={`${c.severity.toFixed(2)} / 5`} />
        <Row
          label="Coverage"
          value={c.coverage != null ? `${c.coverage.toFixed(1)}% funded` : "Unmeasured · no HRP"}
        />
        <Row
          label="Worsening multiplier"
          value={`${worseningMult.toFixed(1)}×${c.worsening ? " (trend increasing)" : ""}`}
        />
        <FormulaLine
          text={`Gap = ${c.severity.toFixed(2)} × (1 − ${coverageFrac.toFixed(3)}) × ${worseningMult.toFixed(1)}`}
          value={gap.toFixed(2)}
        />
      </BreakdownBlock>

      {/* Silence score */}
      <BreakdownBlock title="Silence score breakdown">
        <ul className="space-y-1.5">
          {signals.map((s) => (
            <li
              key={s.label}
              className={
                "flex items-center justify-between text-[12px] " +
                (s.on ? "text-foreground" : "text-muted-foreground/70")
              }
            >
              <span className="flex items-center gap-2">
                <span
                  className={
                    "inline-flex h-3.5 w-3.5 items-center justify-center border rounded-[2px] " +
                    (s.on
                      ? "bg-primary/20 border-primary text-primary"
                      : "border-border")
                  }
                >
                  {s.on ? "✓" : ""}
                </span>
                {s.label}
              </span>
              <span className="font-mono text-[11px]">
                {s.on ? `+${s.pts}` : `+0 / ${s.pts}`}
              </span>
            </li>
          ))}
        </ul>
        <FormulaLine text="Total silence score" value={`${silence} / 100`} />
      </BreakdownBlock>

      {/* Composite */}
      <BreakdownBlock title="Composite score">
        <Row label="Gap contribution" value={`(${gap.toFixed(2)} / 6 × 60) = ${gapContrib.toFixed(2)}`} />
        <Row
          label="Silence contribution"
          value={`(${silence} / 100 × 40) = ${silenceContrib.toFixed(2)}`}
        />
        <FormulaLine text="Final composite" value={`${composite.toFixed(2)} / 100`} />
      </BreakdownBlock>

      {/* Coverage history */}
      <BreakdownBlock title="Coverage history">
        {histAvg != null ? (
          <>
            <Row label="Historical average" value={`${histAvg}%`} />
            <Row
              label="Current coverage"
              value={c.coverage != null ? `${c.coverage.toFixed(1)}%` : "—"}
            />
            <Row
              label="Change"
              value={
                covChange != null
                  ? `${covChange < 0 ? "↓" : "↑"} ${Math.abs(covChange).toFixed(1)} pp`
                  : "—"
              }
              warn={covChange != null && covChange < 0}
            />
          </>
        ) : (
          <div className="text-[12px] text-muted-foreground">
            No historical coverage series available for this crisis.
          </div>
        )}
      </BreakdownBlock>

      {/* Data sources */}
      <BreakdownBlock title="Data sources">
        <Row label="Severity" value="GCSI / INFORM Severity Index (2019–2026)" />
        <Row label="Funding" value="OCHA FTS" />
        <Row label="People in Need" value="HNO 2024–2026" />
        <Row
          label="Last updated"
          value={`Snapshot · ${monthsTracked ? `${monthsTracked} mo tracked` : "Q2 2026"}`}
        />
      </BreakdownBlock>

      {/* Data confidence */}
      <BreakdownBlock title="Data confidence">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] border rounded-sm px-2 py-1"
            style={{ borderColor: confColor + "55", color: confColor }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: confColor }} />
            {confidence}
          </span>
          <span className="text-[12px] text-muted-foreground">{confReason}</span>
        </div>
      </BreakdownBlock>

      {c.scoreExplanation && (
        <p className="text-[12px] leading-relaxed text-foreground/75 border-l-2 border-primary/40 pl-3">
          {c.scoreExplanation}
        </p>
      )}
    </div>
  );
}

function BreakdownBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow mb-2.5">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          "font-serif text-[13px] text-right " +
          (warn ? "text-[color:var(--color-severe)]" : "text-foreground")
        }
      >
        {value}
      </span>
    </div>
  );
}

function FormulaLine({ text, value }: { text: string; value: string }) {
  return (
    <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border pt-2">
      <span className="font-mono text-[11px] text-muted-foreground">{text}</span>
      <span className="font-serif text-[15px] font-semibold text-primary">{value}</span>
    </div>
  );
}




function Indicator({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="leading-tight">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "font-serif text-[14px] " +
          (warn ? "text-[color:var(--color-severe)]" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}

function Tag({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <span
      className={
        "text-[10px] uppercase tracking-[0.14em] border rounded-sm px-1.5 py-0.5 " +
        (warn
          ? "text-[color:var(--color-severe)] border-[color:var(--color-severe)]/40"
          : "text-muted-foreground border-border")
      }
    >
      {children}
    </span>
  );
}

function Badge({ cat }: { cat: NeglectCategory }) {
  const dot = CAT_COLOR[cat];
  return (
    <div
      className="shrink-0 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] border border-border rounded-sm px-2.5 py-1.5"
      style={{ borderColor: dot + "55" }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
      <span style={{ color: dot }}>{CAT_LABEL[cat]}</span>
    </div>
  );
}

function BarRow({ c, delayMs }: { c: Crisis; delayMs: number }) {
  const color = CAT_COLOR[c.category];
  const pct = Math.min(100, c.composite);
  return (
    <div className="grid grid-cols-[220px_1fr_60px] items-center gap-4">
      <div className="text-[13px] text-foreground/90 truncate">
        {c.name}
        <span className="text-muted-foreground text-[11px] ml-1.5">{c.iso}</span>
      </div>
      <div className="relative h-7 bg-[color:var(--color-panel-2)] rounded-sm overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 animate-bar"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            opacity: 0.85,
            animationDelay: `${delayMs}ms`,
          }}
        />
        <div className="absolute inset-y-0 left-0 right-0 flex items-center px-2 text-[10px] uppercase tracking-[0.12em] text-foreground/70">
          {CAT_LABEL[c.category]}
        </div>
      </div>
      <div className="font-serif text-[15px] font-semibold text-right text-foreground">
        {c.composite.toFixed(1)}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
      {(["critical", "severe", "moderate"] as NeglectCategory[]).map((k) => (
        <div key={k} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CAT_COLOR[k] }} />
          {CAT_LABEL[k]}
        </div>
      ))}
    </div>
  );
}

function SignalCard({
  signal,
  index,
}: {
  signal: { title: string; crisis: string; body: string };
  index: number;
}) {
  const Icon =
    [EyeOff, CalendarX, TrendingDown, TrendingUp, AlertOctagon, MapIcon][index] ?? EyeOff;
  return (
    <div className="border border-border bg-[color:var(--color-panel)] rounded-md p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-7 w-7 rounded-sm border border-border bg-[color:var(--color-panel-2)] flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h4 className="font-serif text-[15px] font-semibold">{signal.title}</h4>
      </div>
      <div className="eyebrow-muted text-[10px] mb-2">{signal.crisis}</div>
      <p className="text-[13px] leading-relaxed text-foreground/80">{signal.body}</p>
    </div>
  );
}
