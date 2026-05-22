import {
  DEFAULT_DOSSIER,
  DATA_SOURCES,
  type Crisis,
  type Dossier,
  type Signal,
} from "./dossier-data";

const AFRICAN_ISO = new Set(["LBY", "ZWE", "SSD", "SOM", "MAR"]);

function cloneDossier(partial: Partial<Dossier>): Dossier {
  const base = DEFAULT_DOSSIER;
  return {
    title: partial.title ?? base.title,
    summary: partial.summary ?? base.summary,
    metrics: partial.metrics ?? [...base.metrics],
    crises: partial.crises ?? [...base.crises],
    signals: partial.signals ?? [...base.signals],
    advisory: partial.advisory ?? { ...base.advisory, angles: [...base.advisory.angles] },
  };
}

function reRank(crises: Crisis[]): Crisis[] {
  return crises.map((c, i) => ({ ...c, rank: i + 1 }));
}

function filterSignals(signals: Signal[], isoSet: Set<string>): Signal[] {
  return signals.filter((s) => {
    const tokens = s.crisis.split(/[·,]/).map((t) => t.trim());
    return tokens.some((t) => isoSet.has(t) || [...isoSet].some((iso) => s.crisis.includes(iso)));
  });
}

function metricsFor(crises: Crisis[]): Dossier["metrics"] {
  const critical = crises.filter((c) => c.category === "critical").length;
  const noHrp = crises.filter((c) => c.noHrp).length;
  const worsening = crises.filter((c) => c.worsening).length;
  return [
    { label: "Crises identified", value: String(crises.length) },
    { label: "Critically overlooked", value: String(critical) },
    { label: "Without HRP", value: String(noHrp) },
    { label: "Worsening trend", value: String(worsening) },
  ];
}

const LIBYA_CRISIS = DEFAULT_DOSSIER.crises.find((c) => c.iso === "LBY")!;

const LIBYA_DETAIL_SECTION = {
  headline: "Libya — detailed crisis breakdown",
  bullets: [
    "Composite 64.6: severity 3.8 held for 62 months while FTS coverage fell from 48% to 15.5%.",
    "Gap score driven by (3.8 × (1 − 0.155) × 1.2 worsening multiplier) ≈ 3.84 — among the highest in the index.",
    "Silence score 65: chronic neglect (20) + severe underfunding (15) + worsening trend (10) + high donor concentration (10).",
    "Nutrition cluster is worst-funded; child-survival outcomes deteriorating despite stable headline severity.",
    "No consolidated appeal refresh in two cycles — bilateral reporting sparse; treat FTS as lower bound.",
  ],
};

function libyaDossier(): Dossier {
  const crises = reRank([{ ...LIBYA_CRISIS, rank: 1 }]);
  return cloneDossier({
    title: "Libya — Complex Emergency · Detailed Breakdown",
    summary:
      "Deep-dive on the #1 ranked crisis: a chronic, worsening file where measured severity has plateaued at 3.8 while funding coverage collapsed. Nutrition is the critical sector gap; advocacy should frame child-survival financing, not generic emergency relief.",
    metrics: [
      { label: "Composite score", value: "64.6" },
      { label: "Coverage", value: "15.5%" },
      { label: "Silence score", value: "65" },
      { label: "Months tracked", value: "62" },
    ],
    crises,
    signals: DEFAULT_DOSSIER.signals.filter((s) => s.crisis.includes("LBY")),
    advisory: {
      headline: "Libya-specific donor framing",
      body: "Lead with nutrition cluster underfunding and the 48% → 15.5% coverage collapse as measurable evidence. Pair with chronic-neglect narrative (62 months tracked) for board-level urgency without relying on sudden-onset headlines.",
      angles: [
        "Frame as child-survival / nutrition financing — not generic L3 emergency.",
        "Cite historical average coverage (48%) vs current (15.5%) as the evidence base.",
        "Flag worsening multiplier: severity trend increasing despite flat headline INFORM score.",
        "Recommend bilateral nutrition pledges where pooled funds have stalled.",
      ],
    },
  });
}

function africaDossier(): Dossier {
  const crises = reRank(
    DEFAULT_DOSSIER.crises.filter((c) => AFRICAN_ISO.has(c.iso)),
  );
  const isoSet = new Set(crises.map((c) => c.iso));
  return cloneDossier({
    title: "African Crises — Regional Briefing, Q2 2026",
    summary:
      "Six African situations where severity outpaces funding: Libya, Zimbabwe, South Sudan, Somalia, and Morocco floods. Worsening trends cluster in the Sahel-adjacent and Horn files; Morocco is sudden-onset with no HRP.",
    metrics: metricsFor(crises),
    crises,
    signals: filterSignals(DEFAULT_DOSSIER.signals, isoSet).length
      ? filterSignals(DEFAULT_DOSSIER.signals, isoSet)
      : DEFAULT_DOSSIER.signals.slice(0, 4),
    advisory: {
      headline: "Regional advisory — African portfolio",
      body: "Prioritise Horn logistics enablers (Somalia) alongside Libya nutrition and Zimbabwe shelter — three measurable sector gaps with chronic profiles. Morocco requires bilateral framing (no HRP).",
      angles: [
        "Horn: Somalia logistics underfunding cascades across all sectors.",
        "North Africa: Libya nutrition + Morocco bilateral track (no pooled fund trigger).",
        "Southern Africa: Zimbabwe six-year shelter underfunding signal.",
      ],
    },
  });
}

function worseningDossier(): Dossier {
  const crises = reRank(DEFAULT_DOSSIER.crises.filter((c) => c.worsening));
  const isoSet = new Set(crises.map((c) => c.iso));
  return cloneDossier({
    title: "Worsening Crises — Increasing Severity Trend",
    summary:
      "Five crises where month-over-month severity is increasing despite stable or declining funding: Libya, Zimbabwe, Chile corridor, South Sudan, and Peru corridor.",
    metrics: metricsFor(crises),
    crises,
    signals: DEFAULT_DOSSIER.signals.filter((s) => s.title.toLowerCase().includes("worsening")),
    advisory: {
      headline: "Advisory — worsening-trend files",
      body: "Donor narratives should emphasise trajectory, not snapshot severity alone. These five files penalise composite via the 1.2× worsening multiplier.",
      angles: [
        "Use trend language: 'coverage flat, severity rising' for board briefings.",
        "Pair Venezuela corridor data (Chile 0.7%, Peru 6.2%) with displacement numbers.",
        "South Sudan: flag CCCM deterioration in consolidating camps.",
      ],
    },
  });
}

function noHrpDossier(): Dossier {
  const crises = reRank(DEFAULT_DOSSIER.crises.filter((c) => c.noHrp));
  return cloneDossier({
    title: "Crises Without a Formal Humanitarian Response Plan",
    summary:
      "Two situations structurally invisible to consolidated appeal tracking: Syrian Regional Crisis and Morocco floods. Coverage cannot be measured — absence of HRP data is not absence of need.",
    metrics: metricsFor(crises),
    crises,
    signals: DEFAULT_DOSSIER.signals.filter((s) =>
      s.title.toLowerCase().includes("no hrp"),
    ),
    advisory: {
      headline: "Advisory — no-HRP advocacy",
      body: "Standard pooled-fund mechanisms will not trigger. Advocacy must route through bilateral channels and regional coordination forums.",
      angles: [
        "Syrian Regional: displacement + host-community indicators as proxy metrics.",
        "Morocco floods: highest severity (4.9) but no appeal — flag bilaterally.",
      ],
    },
  });
}

function donorDossier(): Dossier {
  return cloneDossier({
    title: "Donor Impact Briefing — Where Marginal Dollars Move the Needle",
    summary:
      "Curated for donor advisors: the clearest unfunded gaps outside headline files, with sector-specific framing angles for board-level conversations.",
    metrics: [
      { label: "Priority files", value: "4" },
      { label: "Sector gaps flagged", value: "6" },
      { label: "Chronic profiles", value: "8" },
      { label: "Data confidence", value: "Mixed" },
    ],
    crises: DEFAULT_DOSSIER.crises.slice(0, 5),
    signals: DEFAULT_DOSSIER.signals.slice(0, 3),
    advisory: DEFAULT_DOSSIER.advisory,
  });
}

function topFiveDossier(): Dossier {
  const crises = reRank(DEFAULT_DOSSIER.crises.slice(0, 5));
  return cloneDossier({
    title: "Top 5 Critically Overlooked Crises — Q2 2026",
    summary:
      "The five highest composite scores in the Silence Index this quarter — all critically overlooked, dominated by chronic protracted files.",
    metrics: metricsFor(crises),
    crises,
    signals: DEFAULT_DOSSIER.signals.slice(0, 4),
    advisory: {
      headline: "Top-5 donor prioritisation",
      body: "Libya, Syrian Regional, Zimbabwe, Chile corridor, and Syria in-country dominate the index. Coverage gaps are measurable; chronic profiles dominate.",
      angles: DEFAULT_DOSSIER.advisory.angles.slice(0, 3),
    },
  });
}

function coverageCollapseDossier(): Dossier {
  const crises = reRank(
    DEFAULT_DOSSIER.crises.filter(
      (c) =>
        c.historicalAvgCoverage != null &&
        c.coverage != null &&
        c.coverage < c.historicalAvgCoverage * 0.5,
    ),
  );
  return cloneDossier({
    title: "Coverage Collapse — Funded Before, Abandoned Now",
    summary:
      "Crises where current FTS coverage has fallen sharply below historical averages — evidence of donor attention moving on while needs persist.",
    metrics: metricsFor(crises),
    crises,
    signals: DEFAULT_DOSSIER.signals.filter((s) =>
      s.title.toLowerCase().includes("coverage"),
    ),
    advisory: {
      headline: "Coverage-collapse advocacy",
      body: "Use historical → current coverage deltas as the public evidence base. Libya (48%→15.5%), Peru (22%→6.2%), and Chile (<1%) are the strongest narratives.",
      angles: DEFAULT_DOSSIER.advisory.angles,
    },
  });
}

function highPinLowFundingDossier(): Dossier {
  const crises = reRank(
    DEFAULT_DOSSIER.crises
      .filter((c) => c.totalPin && c.coverage != null && c.coverage < 25)
      .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)),
  );
  return cloneDossier({
    title: "High PIN · Low Funding — Maximum Unmet Need",
    summary:
      "Large populations in need with critically low appeal coverage: Syria (16.6M PIN), South Sudan (9.3M), and Somalia (6M).",
    metrics: metricsFor(crises),
    crises,
    signals: DEFAULT_DOSSIER.signals.slice(0, 4),
    advisory: {
      headline: "Scale-gap advisory",
      body: "Absolute PIN size amplifies advocacy urgency even when composite scores are close. Education (Syria) and Logistics (Somalia) are sector bottlenecks.",
      angles: [
        "Syria: 16.6M PIN — education cluster worst-funded.",
        "South Sudan: 9.3M PIN — CCCM gap in consolidating camps.",
        "Somalia: logistics enabler failure throttling all sectors.",
      ],
    },
  });
}

export function getDemoDossierForQuery(query: string): Dossier {
  const q = query.toLowerCase();

  if (/\blibya\b/.test(q)) return libyaDossier();
  if (/\bafrica\b|\bafrican\b/.test(q)) return africaDossier();
  if (/\bworsen/.test(q)) return worseningDossier();
  if (/\bno\s*hrp\b|\bresponse\s*plan\b|\bwithout\s*hrp\b|\bno\s*formal\b/.test(q))
    return noHrpDossier();
  if (/\bdonor\b|\bnordic\b|\bimpact\b|\bfocus\b/.test(q)) return donorDossier();
  if (/\btop\s*5\b|\btop\s*five\b|\bcritically\s*overlooked\b/.test(q))
    return topFiveDossier();
  if (/\bcoverage\s*collapse\b|\babandoned\b|\bfunded\s*before\b/.test(q))
    return coverageCollapseDossier();
  if (/\bpeople\s*in\s*need\b|\blowest\s*funding\b|\bhigh\s*pin\b/.test(q))
    return highPinLowFundingDossier();

  return cloneDossier({});
}

export function getDemoChatResponse(
  query: string,
  dossier: Dossier,
  isFirstDossier: boolean,
): string {
  const q = query.toLowerCase();

  if (isFirstDossier) {
    return `Dossier generated — ${dossier.crises.length} crisis${dossier.crises.length === 1 ? "" : "es"} ranked on the left (${DATA_SOURCES}). Ask another suggested question or type a follow-up.`;
  }

  if (/\blibya\b.*south\s*sudan|south\s*sudan.*libya|rank.*libya/.test(q)) {
    return "Libya's composite (64.6) edges South Sudan (60.2) because its coverage collapsed further below its historical baseline and the worsening multiplier is applied — concentrating unmet need per capita. South Sudan has a larger absolute PIN but comparatively higher 24.5% coverage.";
  }
  if (/\bnordic\b|\bdonor\b/.test(q)) {
    return "Lead with chronic, measurable gaps that match Nordic priorities: Libya nutrition (child-survival framing), Zimbabwe shelter (six-year underfunding), and Venezuela onward-displacement corridors. Frame as protection-of-civilians financing, not emergency relief.";
  }
  if (/\bexport\b|\bbriefing\s*note\b/.test(q)) {
    return "Export queued. A two-page PDF briefing note will be generated from this dossier — top crises, silence detector signals, and the advisory block.";
  }

  return `Updated briefing for your query. The left panel shows ${dossier.title} — ${dossier.summary.slice(0, 120)}…`;
}

export { LIBYA_DETAIL_SECTION };
