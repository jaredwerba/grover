import { AEO_SECTIONS } from "./about-sections";
import { dispensaries } from "./dispensaries";
import { strains } from "./strains";
import { growers } from "./growers";

/**
 * Render a markdown representation of one of Cove's public pages.
 * Returns null for unregistered paths — the caller should fall through
 * to the normal HTML response in that case.
 *
 * Paths handled: /, /about, /trail, /strain, /vermont-first
 */
export function renderMarkdownForPath(path: string): string | null {
  switch (path) {
    case "/":
      return renderLanding();
    case "/about":
      return renderAbout();
    case "/trail":
      return renderTrail();
    case "/strain":
      return renderStrains();
    case "/vermont-first":
      return renderVermontFirst();
    default:
      return null;
  }
}

// Escape pipes so they don't break markdown tables.
function cell(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderLanding(): string {
  return `# Cove — Vermont's Cannabis Companion

Cove is a guide to Vermont's licensed cannabis scene: dispensaries, craft growers, and strains. It pairs structured local data with an AI concierge that answers questions before you walk into a dispensary.

For adults 21+ only.

## Explore

- [About & FAQ](/about) — first-timer guidance, tourist laws, edibles vs. smoking, and why AI helps you choose.
- [Cannatrail](/trail) — every licensed Vermont dispensary on an interactive map.
- [Strain Library](/strain) — searchable library of Vermont cannabis cultivars.
- [Vermont-First](/vermont-first) — directory of Vermont's craft cultivators.

## Sourcing

Data is curated from the Vermont Cannabis Control Board and the Vermont Growers Association.
`;
}

function renderAbout(): string {
  const parts: string[] = ["# About Cove — Vermont Cannabis Guide\n"];
  for (const section of AEO_SECTIONS) {
    parts.push(`## ${section.question}\n`);
    parts.push(`${section.shortAnswer}\n`);
    for (const block of section.body) {
      parts.push(`### ${block.heading}\n`);
      parts.push(`${block.text}\n`);
    }
  }
  return parts.join("\n");
}

function renderTrail(): string {
  const rows = dispensaries.map(
    (d) =>
      `| ${cell(d.name)} | ${cell(d.city)} | ${cell(d.tags.join(", "))} | ${cell(d.phone)} | ${cell(d.website)} |`
  );
  return `# Cannatrail — Vermont Dispensaries

Every licensed cannabis dispensary in Vermont, on one map. Adult-use and medical, all state-verified.

${dispensaries.length} dispensaries listed. Hours and menus can shift — always confirm with the dispensary directly before visiting.

| Name | City | Tags | Phone | Website |
|---|---|---|---|---|
${rows.join("\n")}
`;
}

function renderStrains(): string {
  const rows = strains.map(
    (s) =>
      `| ${cell(s.name)} | ${cell(s.type)} | ${cell(s.thc)} | ${cell(s.cbd)} | ${cell(s.effects.join(", "))} | ${cell(s.terpenes.join(", "))} | ${cell(s.flavors.join(", "))} |`
  );
  return `# Strain Library

Vermont cannabis cultivars — THC/CBD, effects, terpenes, and flavor profiles. Use this as a starting point; ask Cove for a personal recommendation based on what you're looking for.

${strains.length} cultivars listed.

| Name | Type | THC | CBD | Effects | Terpenes | Flavors |
|---|---|---|---|---|---|---|
${rows.join("\n")}
`;
}

function renderVermontFirst(): string {
  const rows = growers.map(
    (g) => `| ${cell(g.name)} | ${cell(g.town)} | ${cell(g.website)} |`
  );
  return `# Vermont-First — Craft Growers

Vermont's licensed cannabis cultivators. Small-batch, state-verified, and locally grown.

${growers.length} cultivators listed.

| Name | Town | Website |
|---|---|---|
${rows.join("\n")}
`;
}
