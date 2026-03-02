/**
 * D2R Item Parser
 * ─────────────────────────────────────────────────────────────────────
 * Parses raw clipboard text copied from Diablo II: Resurrected's
 * in-game item tooltip into a structured ItemData JSONB object.
 *
 * D2R clipboard format example:
 *   Grief
 *   Phase Blade
 *   One-Hand Damage: 30 to 70
 *   Durability: 30 of 30
 *   Required Level: 59
 *   +40% Increased Attack Speed
 *   Damage +400
 *   Ethereal (Cannot be Repaired), Socketed (5: 5 Used)
 */


type ItemType = 'runeword' | 'unique' | 'set' | 'rare' | 'magic' | 'normal';

export interface ParsedItem {
  name: string;
  baseItem: string;
  type: ItemType;
  runes?: string[];
  ethereal: boolean;
  sockets?: number;
  stats: Array<{ name: string; value: string }>;
  quality?: string;
}

// Known D2R rune names (all 33)
const D2_RUNES = new Set([
  'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
  'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem',
  'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber',
  'Jah', 'Cham', 'Zod',
]);

// Lines to skip — they describe equipment stats, not item properties
const SKIP_PATTERNS = [
  /^one-hand damage:/i,
  /^two-hand damage:/i,
  /^throw damage:/i,
  /^smite damage:/i,
  /^defense:/i,
  /^durability:/i,
  /^quantity:/i,
  /^required (strength|dexterity|level):/i,
  /^(sword|axe|mace|staff|wand|scepter|bow|crossbow|javelin|spear|polearm|dagger|claw|orb|amazon|necromancer|sorceress|paladin|druid|assassin) class/i,
  /^item version:/i,
  /^item level:/i,
  /^fingerprint:/i,
  /^(eth|)\s*(superior|damaged|cracked)\s*/i,
];

const STAT_NOISE = [
  /^ethereal \(cannot be repaired\)/i,
  /^socketed \(/i,
];

/**
 * Determines item type by examining the name and stats lines.
 * Because clipboard text has no colour data we use heuristics:
 *  - Name contains recognisable runeword fragments / rune listing → runeword
 *  - Line explicitly says "(x Runeword)" → runeword
 *  - Falls back to 'normal' if nothing conclusive found.
 *  The frontend allows the user to override the detected type.
 */
function detectType(
  name: string,
  lines: string[],
  runes: string[],
): ItemType {
  const nameLower = name.toLowerCase();

  if (runes.length > 0) return 'runeword';

  const fullText = lines.join(' ').toLowerCase();
  if (fullText.includes('runeword')) return 'runeword';

  // Single-word or two-word — simple heuristic.
  // Real colour detection would require OCR; here the user confirms in the UI.
  const words = nameLower.trim().split(/\s+/);
  if (words.length === 2 && !fullText.includes('of ')) return 'rare';
  if (words.length === 1) return 'unique';

  return 'normal';
}

/**
 * Extracts runes from a "Rune Word: El+Eld+..." style line or from
 * stat lines that list rune insertions.
 */
function extractRunes(lines: string[]): string[] {
  for (const line of lines) {
    const runeWordMatch = line.match(/Rune Word[:\s]+(.+)/i);
    if (runeWordMatch) {
      return runeWordMatch[1]!
        .split(/[+,]/)
        .map((r) => r.trim())
        .filter((r) => D2_RUNES.has(r));
    }
  }

  // Fallback: individual "X Rune" lines
  const found: string[] = [];
  for (const line of lines) {
    const m = line.match(/^(\w+)\s+Rune$/);
    if (m && D2_RUNES.has(m[1]!)) found.push(m[1]!);
  }
  return found;
}

/**
 * Parses raw D2R clipboard text.
 * Returns null if the text is too short to be a valid item.
 */
export function parseD2RItem(rawText: string): ParsedItem | null {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const name     = lines[0]!;
  const baseItem = lines[1]!;

  // Remaining lines
  const rest = lines.slice(2);

  // ── Ethereal ────────────────────────────────────────────────────────
  const ethereal = rest.some((l) => /ethereal/i.test(l));

  // ── Sockets ──────────────────────────────────────────────────────────
  let sockets: number | undefined;
  for (const l of rest) {
    const m = l.match(/socketed\s*\(\s*(\d+)/i);
    if (m) {
      sockets = parseInt(m[1]!, 10);
      break;
    }
  }

  // ── Runes ────────────────────────────────────────────────────────────
  const runes = extractRunes(rest);

  // ── Stats ────────────────────────────────────────────────────────────
  const stats: Array<{ name: string; value: string }> = [];

  for (const line of rest) {
    // Skip noisy / metadata lines
    if (SKIP_PATTERNS.some((p) => p.test(line))) continue;
    if (STAT_NOISE.some((p) => p.test(line)))    continue;
    if (/^rune word:/i.test(line))               continue;

    // Numeric prefix stat: "+40% Increased Attack Speed"
    const numericPrefixMatch = line.match(/^([+\-]?\d[\d.,]*%?)\s+(.+)/);
    if (numericPrefixMatch) {
      stats.push({ name: numericPrefixMatch[2]!, value: numericPrefixMatch[1]! });
      continue;
    }

    // Suffix stat: "Damage +400" → name="Damage", value="+400"
    const suffixMatch = line.match(/^(.+?)\s+([+\-]?\d[\d.,]*%?)$/);
    if (suffixMatch) {
      stats.push({ name: suffixMatch[1]!, value: suffixMatch[2]! });
      continue;
    }

    // Percentage full-line: "35% Chance of Open Wounds"
    const pctMatch = line.match(/^(\d+%)\s+(.+)/);
    if (pctMatch) {
      stats.push({ name: pctMatch[2]!, value: pctMatch[1]! });
      continue;
    }

    // Plain descriptive line — treat as a boolean-style stat
    if (line.length > 0 && line.length < 120) {
      stats.push({ name: line, value: 'yes' });
    }
  }

  const type = detectType(name, rest, runes);

  return {
    name,
    baseItem,
    type,
    ...(runes.length > 0 && { runes }),
    ethereal,
    ...(sockets !== undefined && { sockets }),
    stats,
  };
}
