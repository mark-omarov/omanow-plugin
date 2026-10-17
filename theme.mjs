// Keys match omarchy's colors.toml; values are its Tokyo Night.
const DEFAULT_THEME = {
  background: "#1a1b26",
  dark_background: "#13141c",
  darker_background: "#0e0e14",
  lighter_background: "#24283b",
  foreground: "#a9b1d6",
  dark_foreground: "#565f89",
  bright_foreground: "#c0caf5",
  accent: "#7aa2f7",
  selection: "#292e42",
  muted: "#414868",
  red: "#f7768e",
  yellow: "#e0af68",
  orange: "#eb927b",
  green: "#9ece6a",
  cyan: "#449dab",
  blue: "#7aa2f7",
  magenta: "#ad8ee6",
  bright_yellow: "#ff9e64",
  bright_cyan: "#0db9d7",
  bright_magenta: "#bb9af7",
};

// Reads only flat `key = "#rrggbb"` lines, which is all colors.toml holds.
export function parseColorsToml(text) {
  const theme = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([a-z_]+)\s*=\s*"(#[0-9a-fA-F]{6})"/);
    if (m) theme[m[1]] = m[2].toLowerCase();
  }
  return theme;
}

export function resolveTheme(partial) {
  return Object.assign({}, DEFAULT_THEME, partial || {});
}

// Shared theme links encode keys in this order: only ever append.
export const THEME_KEYS = Object.freeze(Object.keys(DEFAULT_THEME));

export function encodeTheme(theme) {
  return THEME_KEYS.map((k) => resolveTheme(theme)[k].slice(1)).join("");
}

export function decodeTheme(text) {
  if (typeof text !== "string" || !/^[0-9a-f]+$/i.test(text) || text.length % 6 || text.length > THEME_KEYS.length * 6) return null;
  const theme = {};
  for (let i = 0; i < text.length / 6; i++) theme[THEME_KEYS[i]] = `#${text.slice(i * 6, i * 6 + 6).toLowerCase()}`;
  return theme;
}
