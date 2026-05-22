export type NeglectCategory = "critical" | "severe" | "moderate";

export interface Crisis {
  rank: number;
  name: string;
  country: string;
  iso: string;
  type: string;
  severity: number;       // 0-5
  composite: number;      // 0-100
  coverage?: number;      // % funded (undefined = no HRP / unmeasured)
  silence?: number;       // 0-100 silence score
  noHrp?: boolean;
  chronic?: boolean;
  worsening?: boolean;
  category: NeglectCategory;
  totalPin?: string;            // e.g. "9.3M people in need"
  worstSector?: string;         // e.g. "Nutrition"
  fundingGap?: string;          // e.g. "$2.4B funding gap"
  yearsUnderfunded?: number;
  historicalAvgCoverage?: number; // %
  scoreExplanation?: string;
  monthsTracked?: number;
  dataConfidence?: "High" | "Medium" | "Low";
}

export interface Signal {
  title: string;
  crisis: string;
  body: string;
}

export interface Dossier {
  title: string;
  summary: string;
  metrics: { label: string; value: string }[];
  crises: Crisis[];
  signals: Signal[];
  advisory: {
    headline: string;
    body: string;
    angles: string[];
  };
}

export const SUGGESTED_QUERIES = [
  "Which crises in Africa are worsening right now?",
  "Show me the top 5 critically overlooked crises globally",
  "Which crises have no formal response plan?",
  "Where should a donor focus for maximum impact?",
  "Show me coverage collapse crises — funded before, abandoned now",
  "Which crises have the most people in need but lowest funding?",
];

export const INDEX_STATS = [
  { label: "Crises tracked", value: "758" },
  { label: "Countries covered", value: "95" },
  { label: "Snapshots", value: "78 mo" },
  { label: "Funding gap 2025", value: "$29B" },
];

export const DATA_SOURCES = "GCSI · INFORM Severity · OCHA FTS · HNO";

export const DEFAULT_DOSSIER: Dossier = {
  title: "The Silence Index — Top Overlooked Crises, Q2 2026",
  summary:
    "Ten humanitarian situations were flagged this week where measured severity sharply outpaces donor attention. Chronic, worsening crises dominate the top of the index — several have been tracked for years with declining coverage and no consolidated appeal.",
  metrics: [
    { label: "Crises identified", value: "10" },
    { label: "Critically overlooked", value: "6" },
    { label: "Without HRP", value: "2" },
    { label: "Worsening trend", value: "5" },
  ],
  crises: [
    {
      rank: 1,
      name: "Complex crisis in Libya",
      country: "Libya",
      iso: "LBY",
      type: "Complex emergency",
      severity: 3.8,
      composite: 64.56,
      coverage: 15.5,
      silence: 65,
      chronic: true,
      worsening: true,
      category: "critical",
      worstSector: "Nutrition",
      historicalAvgCoverage: 48,
      monthsTracked: 62,
      dataConfidence: "Medium",
      scoreExplanation:
        "Severity has hovered at 3.8 for over five years while coverage collapsed from a historical 48% to 15.5%. Nutrition cluster is the worst-funded.",
    },
    {
      rank: 2,
      name: "Syrian Regional Crisis",
      country: "Regional · Levant",
      iso: "SYR-REG",
      type: "Cross-border displacement",
      severity: 4.4,
      composite: 63.95,
      silence: 50,
      noHrp: true,
      chronic: true,
      category: "critical",
      dataConfidence: "Medium",
      scoreExplanation:
        "No HRP exists for the regional file, so coverage is structurally unmeasured. Severity computed from displacement and host-community indicators.",
    },
    {
      rank: 3,
      name: "Complex crisis in Zimbabwe",
      country: "Zimbabwe",
      iso: "ZWE",
      type: "Complex emergency",
      severity: 3.6,
      composite: 63.03,
      coverage: 15.1,
      silence: 65,
      chronic: true,
      worsening: true,
      category: "critical",
      worstSector: "Shelter",
      yearsUnderfunded: 6,
      historicalAvgCoverage: 38,
      monthsTracked: 78,
      dataConfidence: "High",
      scoreExplanation:
        "Six consecutive years of severe underfunding. Shelter cluster has received <10% of requirements for three appeal cycles.",
    },
    {
      rank: 4,
      name: "Displacement from Venezuela to Chile",
      country: "Chile",
      iso: "CHL",
      type: "Mixed migration flow",
      severity: 3.2,
      composite: 62.10,
      coverage: 0.7,
      silence: 60,
      chronic: true,
      worsening: true,
      category: "critical",
      historicalAvgCoverage: 12,
      monthsTracked: 54,
      dataConfidence: "Medium",
      scoreExplanation:
        "Coverage at 0.7% is among the lowest measured anywhere in the index. Onward migration pressure is rising while regional attention has moved to other corridors.",
    },
    {
      rank: 5,
      name: "Syrian conflict",
      country: "Syria",
      iso: "SYR001",
      type: "Protracted armed conflict",
      severity: 4.8,
      composite: 62.07,
      coverage: 16.5,
      chronic: true,
      category: "critical",
      totalPin: "16.6M",
      worstSector: "Education",
      monthsTracked: 78,
      dataConfidence: "High",
      scoreExplanation:
        "Largest PIN in the index (16.6M). Education sector is the worst-funded; child learning outcomes deteriorating in NW and NE.",
    },
    {
      rank: 6,
      name: "Syrian conflict (appeal)",
      country: "Syria",
      iso: "SYR-HRP",
      type: "HRP — protracted conflict",
      severity: 4.7,
      composite: 61.20,
      coverage: 16.5,
      chronic: true,
      category: "critical",
      fundingGap: "$2.4B",
      monthsTracked: 78,
      dataConfidence: "High",
      scoreExplanation:
        "Funding gap of $2.4B against the consolidated appeal. Coverage has plateaued at ~16% for two cycles.",
    },
    {
      rank: 7,
      name: "Floods in northern Morocco",
      country: "Morocco",
      iso: "MAR",
      type: "Sudden-onset disaster",
      severity: 4.9,
      composite: 61.00,
      silence: 30,
      noHrp: true,
      category: "severe",
      dataConfidence: "Low",
      scoreExplanation:
        "Highest severity in the index but no HRP triggered, so coverage cannot be measured. Bilateral assistance reporting is sparse.",
    },
    {
      rank: 8,
      name: "Complex crisis in South Sudan",
      country: "South Sudan",
      iso: "SSD",
      type: "Complex emergency",
      severity: 4.4,
      composite: 60.18,
      coverage: 24.5,
      chronic: true,
      worsening: true,
      category: "severe",
      totalPin: "9.3M",
      worstSector: "Camp Coordination",
      monthsTracked: 78,
      dataConfidence: "High",
      scoreExplanation:
        "9.3M PIN with deteriorating CCCM coverage as displacement camps consolidate. Coverage trending downward each quarter.",
    },
    {
      rank: 9,
      name: "Complex crisis in Somalia",
      country: "Somalia",
      iso: "SOM",
      type: "Complex emergency",
      severity: 4.5,
      composite: 58.87,
      coverage: 17.3,
      chronic: true,
      category: "severe",
      totalPin: "6M",
      worstSector: "Logistics",
      monthsTracked: 78,
      dataConfidence: "High",
      scoreExplanation:
        "Logistics cluster underfunding is throttling delivery for every other sector. Composite penalised for enabler-cluster gap.",
    },
    {
      rank: 10,
      name: "Displacement from Venezuela to Peru",
      country: "Peru",
      iso: "PER",
      type: "Mixed migration flow",
      severity: 3.1,
      composite: 58.63,
      coverage: 6.2,
      chronic: true,
      worsening: true,
      category: "severe",
      historicalAvgCoverage: 22,
      monthsTracked: 54,
      dataConfidence: "Medium",
      scoreExplanation:
        "Coverage collapsed from 22% historical average to 6.2%. Onward movement to Lima continues to grow.",
    },
  ],
  signals: [
    {
      title: "No HRP — structurally invisible",
      crisis: "SYR-REG · MAR",
      body: "No formal response plan exists, so coverage cannot be measured and the situation is absent from consolidated appeal tracking.",
    },
    {
      title: "Chronic neglect",
      crisis: "LBY · ZWE · SYR001 · SSD · SOM",
      body: "Tracked for 60+ months without measurable improvement in severity or coverage. Donor attention has moved on; needs have not.",
    },
    {
      title: "Coverage collapse",
      crisis: "LBY · ZWE · CHL · PER",
      body: "Coverage has dropped sharply from historical averages — Libya 48% → 15.5%, Peru 22% → 6.2%, Chile from 12% to under 1%.",
    },
    {
      title: "Worsening trend",
      crisis: "LBY · ZWE · CHL · SSD · PER",
      body: "Severity is increasing month over month across five of the ten flagged crises, despite stable or declining funding.",
    },
    {
      title: "Chronic underfunding",
      crisis: "ZWE",
      body: "Zimbabwe has been severely underfunded for six consecutive appeal cycles — the longest sustained gap currently tracked.",
    },
    {
      title: "Enabler-cluster failure",
      crisis: "SOM",
      body: "Somalia's Logistics cluster underfunding cascades into every other sector's delivery capacity — a hidden multiplier on need.",
    },
  ],
  advisory: {
    headline: "Advisory — Where a marginal donor dollar moves the needle",
    body: "The clearest unfunded gaps sit outside the headline-grabbing files: Libya's nutrition response, Zimbabwe's shelter cycle, and the Venezuelan onward-displacement corridors to Chile and Peru. These are measurable, chronic, and worsening — and they receive a fraction of comparable severities elsewhere.",
    angles: [
      "Frame Libya nutrition as child-survival financing, not generic emergency relief — chronic profile.",
      "Pair Zimbabwe shelter allocation with the sixth-year underfunding narrative for board-level urgency.",
      "Use the Venezuela corridor coverage collapse (22% → 6.2%) as the public evidence base for renewed Lima/Santiago appeals.",
      "Flag Morocco floods bilaterally — no HRP means standard pooled-fund mechanisms will not trigger.",
    ],
  },
};
