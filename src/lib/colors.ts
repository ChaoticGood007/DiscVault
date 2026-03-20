export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 79, g: 70, b: 229 }; // default indigo-600
}

function mix(color1: {r: number, g: number, b: number}, color2: {r: number, g: number, b: number}, weight: number) {
  const w = weight / 100;
  return {
    r: Math.round(color1.r * w + color2.r * (1 - w)),
    g: Math.round(color1.g * w + color2.g * (1 - w)),
    b: Math.round(color1.b * w + color2.b * (1 - w))
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export function generateTailwindPalette(hex: string) {
  const base = hexToRgb(hex);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  
  // Calculate relative brightness to ensure accessible text contrast
  const brightness = (base.r * 299 + base.g * 587 + base.b * 114) / 1000;
  const contrastColor = brightness > 155 ? '#0f172a' : '#ffffff';
  
  return {
    '--color-indigo-50': rgbToHex(mix(base, white, 10).r, mix(base, white, 10).g, mix(base, white, 10).b),
    '--color-indigo-100': rgbToHex(mix(base, white, 20).r, mix(base, white, 20).g, mix(base, white, 20).b),
    '--color-indigo-200': rgbToHex(mix(base, white, 40).r, mix(base, white, 40).g, mix(base, white, 40).b),
    '--color-indigo-300': rgbToHex(mix(base, white, 60).r, mix(base, white, 60).g, mix(base, white, 60).b),
    '--color-indigo-400': rgbToHex(mix(base, white, 80).r, mix(base, white, 80).g, mix(base, white, 80).b),
    '--color-indigo-500': rgbToHex(mix(base, white, 90).r, mix(base, white, 90).g, mix(base, white, 90).b), 
    '--color-indigo-600': rgbToHex(base.r, base.g, base.b),
    '--color-indigo-700': rgbToHex(mix(base, black, 80).r, mix(base, black, 80).g, mix(base, black, 80).b),
    '--color-indigo-800': rgbToHex(mix(base, black, 60).r, mix(base, black, 60).g, mix(base, black, 60).b),
    '--color-indigo-900': rgbToHex(mix(base, black, 40).r, mix(base, black, 40).g, mix(base, black, 40).b),
    '--color-indigo-950': rgbToHex(mix(base, black, 20).r, mix(base, black, 20).g, mix(base, black, 20).b),
    '--color-indigo-contrast': contrastColor,
  };
}
