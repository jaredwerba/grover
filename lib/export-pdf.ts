import { jsPDF } from "jspdf";

// Cove brand palette
const FOREST_DEEP = "#0b2d1b";
const FOREST = "#1a4a2e";
const FOREST_MID = "#2d5a3d";
const AMBER = "#FFB900";
const CREAM = "#f0ebe0";
const CREAM_MUTED = "#c8c0b0";

type Persona = "toker" | "grower" | "dispenser";

interface ExportArgs {
  email: string;
  persona: Persona;
}

interface Metric {
  label: string;
  value: string;
  detail?: string;
}

interface Section {
  title: string;
  metrics: Metric[];
}

/**
 * Cove-branded snapshot of the dashboard as it appears for a given
 * persona. Generated client-side with jsPDF — no server round-trip.
 * Saves a file named like `Cove-PlantManager-2026-04-20.pdf`.
 */
export function exportDashboardPdf({ email, persona }: ExportArgs): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;

  // Forest-deep background
  doc.setFillColor(FOREST_DEEP);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Amber C logomark (Fascinate-ish — jsPDF has no custom font so we
  // use the closest built-in: large bold serif substitute.)
  doc.setTextColor(AMBER);
  doc.setFont("times", "bold");
  doc.setFontSize(56);
  doc.text("C", margin, margin + 44);

  // Small "COVE" wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(CREAM);
  doc.text("COVE", margin + 62, margin + 26, { charSpace: 4 });

  // Eyebrow
  doc.setFontSize(8);
  doc.setTextColor(CREAM_MUTED);
  doc.text("VERMONT · CANNABIS COMPANION", margin + 62, margin + 40, { charSpace: 2 });

  // Right-aligned meta (date + persona)
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(8);
  doc.setTextColor(AMBER);
  doc.text(today.toUpperCase(), pageWidth - margin, margin + 26, {
    align: "right",
    charSpace: 2,
  });
  doc.setTextColor(CREAM_MUTED);
  doc.text(`REPORT · ${PERSONA_LABEL[persona].toUpperCase()}`, pageWidth - margin, margin + 40, {
    align: "right",
    charSpace: 2,
  });

  // Horizontal amber hairline under header
  doc.setDrawColor(AMBER);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 64, pageWidth - margin, margin + 64);

  // Title
  let y = margin + 112;
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.setTextColor(CREAM);
  doc.text("Dashboard Snapshot", margin, y);

  // Subtitle — email
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(CREAM_MUTED);
  doc.text(email, margin, y);

  // Sections
  y += 40;
  const sections = DATA[persona];
  for (const section of sections) {
    y = drawSection(doc, section, margin, y, pageWidth);
    y += 24;

    // Page break if needed
    if (y > pageHeight - margin - 80) {
      doc.addPage();
      doc.setFillColor(FOREST_DEEP);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      y = margin + 40;
    }
  }

  // Footer
  doc.setDrawColor(FOREST_MID);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - margin - 32, pageWidth - margin, pageHeight - margin - 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(CREAM_MUTED);
  doc.text(
    "covebud.com · Adults 21+ · Snapshot is informational only.",
    margin,
    pageHeight - margin - 16
  );
  doc.setTextColor(AMBER);
  doc.text("COVE", pageWidth - margin, pageHeight - margin - 16, {
    align: "right",
    charSpace: 2,
  });

  const filename = `Cove-${persona === "grower" ? "PlantManager" : persona === "dispenser" ? "SalesManager" : "Toker"}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function drawSection(
  doc: jsPDF,
  section: Section,
  margin: number,
  startY: number,
  pageWidth: number
): number {
  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(AMBER);
  doc.text(section.title.toUpperCase(), margin, startY, { charSpace: 3 });

  // Amber marker
  doc.setFillColor(AMBER);
  doc.rect(margin, startY + 6, 24, 1.5, "F");

  let y = startY + 24;

  // Metrics as rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  for (const metric of section.metrics) {
    // Label (left)
    doc.setTextColor(CREAM_MUTED);
    doc.text(metric.label, margin, y);

    // Value (right)
    doc.setTextColor(CREAM);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, pageWidth - margin, y, { align: "right" });

    // Detail (right, below value) if present
    if (metric.detail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(CREAM_MUTED);
      doc.text(metric.detail, pageWidth - margin, y + 11, { align: "right" });
      doc.setFontSize(11);
      y += 11;
    }

    doc.setFont("helvetica", "normal");
    y += 20;
  }

  return y;
}

const PERSONA_LABEL: Record<Persona, string> = {
  toker: "Toker",
  grower: "Plant Manager",
  dispenser: "Sales Manager",
};

// Snapshot data matching what's displayed in each tab. Update these
// alongside the tab components when the displayed numbers change.
const DATA: Record<Persona, Section[]> = {
  toker: [
    {
      title: "This Week",
      metrics: [
        { label: "Sessions", value: "7" },
        { label: "Streak", value: "4 days" },
        { label: "Month spend", value: "$124" },
      ],
    },
    {
      title: "Top Strains",
      metrics: [
        { label: "Blue Dream", value: "12 sessions" },
        { label: "OG Kush", value: "8 sessions" },
        { label: "Sour Diesel", value: "5 sessions" },
        { label: "Pineapple Express", value: "3 sessions" },
      ],
    },
    {
      title: "Effects Logged",
      metrics: [
        { label: "Relaxed", value: "45%" },
        { label: "Creative", value: "28%" },
        { label: "Sleepy", value: "18%" },
        { label: "Energized", value: "9%" },
      ],
    },
  ],

  grower: [
    {
      title: "Overview",
      metrics: [
        { label: "Active Grow Rooms", value: "3", detail: "rooms" },
        { label: "Projected Yield", value: "682,500 g" },
        { label: "Estimated Wholesale Revenue", value: "$2,050,000" },
      ],
    },
    {
      title: "Active Strains",
      metrics: [
        { label: "Blue Dream #3", value: "Flowering", detail: "Day 38 / 56 · Health 94%" },
        { label: "OG Kush #1", value: "Veg", detail: "Day 12 / 60 · Health 88%" },
        { label: "Sour D Pheno", value: "Late Flower", detail: "Day 51 / 56 · Health 97%" },
      ],
    },
    {
      title: "Compliance",
      metrics: [
        { label: "Room Count", value: "3 / 6 limit" },
        { label: "Canopy", value: "10,000 sq ft" },
        { label: "License renewal", value: "42 days", detail: "expires" },
        { label: "Waste log", value: "Up to date" },
      ],
    },
  ],

  dispenser: [
    {
      title: "Month To Date",
      metrics: [
        { label: "Revenue", value: "$25,370" },
        { label: "Transactions", value: "312" },
        { label: "Avg basket", value: "$81" },
      ],
    },
    {
      title: "Top Sellers",
      metrics: [
        { label: "Fresh Flower", value: "142 units", detail: "$4,260" },
        { label: "Pre Rolls", value: "98 units", detail: "$2,940" },
        { label: "Vapes", value: "76 units", detail: "$3,420" },
        { label: "Edibles", value: "64 units", detail: "$1,920" },
        { label: "Beverages", value: "41 units", detail: "$820" },
      ],
    },
    {
      title: "Today's Peak",
      metrics: [
        { label: "Peak hour", value: "5 PM", detail: "22 transactions" },
        { label: "Afternoon rush share", value: "~40%", detail: "3-6 PM of daily volume" },
      ],
    },
    {
      title: "Low Stock Alerts",
      metrics: [
        { label: "Gorilla Glue Vape", value: "2 left", detail: "reorder at 8" },
        { label: "Pineapple Express 7g", value: "4 left", detail: "reorder at 10" },
        { label: "Gelato Pre-Roll 1pk", value: "6 left", detail: "reorder at 12" },
      ],
    },
  ],
};
