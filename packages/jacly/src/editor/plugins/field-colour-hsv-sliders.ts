
export function colourHexaToRgbObject(hex: string): { r: number; g: number; b: number } {
  // Remove the leading '#' if present
  hex = hex.replace(/^#/, '');

  // Parse the hex string into RGB components
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

export function colourHexaToRgbString(hex: string): string {
  const { r, g, b } = colourHexaToRgbObject(hex);
  return `{ r: ${r}, g: ${g}, b: ${b} }`;
}
