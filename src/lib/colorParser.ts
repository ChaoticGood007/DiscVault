import tinycolor from 'tinycolor2';

export function parseDiscColor(input: string | null | undefined): string {
  if (!input) return '#94a3b8'; // Default slate-400

  let colorStr = input.toLowerCase().trim();
  const isClear = colorStr.includes('clear');
  if (isClear) {
    colorStr = colorStr.replace('clear', '').trim();
  }

  // 1. Handle specific Disc Golf exact matches / overrides
  if (colorStr === 'glow' || colorStr === 'moonshine' || colorStr === 'eclipse') {
    return isClear ? 'rgba(220, 242, 181, 0.3)' : '#dcf2b5'; 
  }
  if (colorStr === '' || colorStr === 'cryztal' || colorStr === 'ice') {
    return 'rgba(255, 255, 255, 0.4)'; 
  }

  // 2. Strip out pattern/plastic modifiers that confuse the color parser
  const modifiersToRemove = [
    'halo', 'swirl', 'swirly', 'burst', 'bursty', 'overmold', 'shatter', 'splatter', 
    'metal flake', 'glitter', 'sparkle', 'champion', 'star', 'z', 'esp', 'fuzion', 
    'lucid', 'opto', 'classic', 'dx', 'pro', 'gstar', 'k1', 'k2', 'k3'
  ];
  
  for (const mod of modifiersToRemove) {
    colorStr = colorStr.replace(new RegExp(`\\b${mod}\\b`, 'g'), '').trim();
  }

  // 3. Handle 'neon', 'dayglow', 'light', 'dark', 'deep'
  colorStr = colorStr.replace(/dayglow/g, 'neon');
  const hasNeon = colorStr.includes('neon');
  const hasLight = colorStr.includes('light');
  const hasDark = colorStr.includes('dark');
  const hasDeep = colorStr.includes('deep');

  if (hasNeon) colorStr = colorStr.replace('neon', '').trim();
  if (hasLight) colorStr = colorStr.replace('light', '').trim();
  if (hasDark) colorStr = colorStr.replace('dark', '').trim();
  if (hasDeep) colorStr = colorStr.replace('deep', '').trim();

  const applyClear = (hex: string) => {
    if (!isClear) return hex;
    const c = tinycolor(hex).toRgb();
    return `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`;
  }

  const applyModifiers = (color: tinycolor.Instance) => {
    if (hasNeon) color = color.saturate(100).lighten(10);
    if (hasLight) color = color.lighten(20);
    if (hasDark) color = color.darken(20);
    if (hasDeep) color = color.darken(10).saturate(20);
    return color.toHexString();
  }

  // 4. Try parsing with tinycolor
  const parsed = tinycolor(colorStr);
  
  if (parsed.isValid()) {
    const hex = applyModifiers(parsed);
    return applyClear(hex);
  }

  // 5. Fallback for some common color combinations it might fail on (e.g. "pinkish red")
  const baseColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'grey', 'gray', 'teal', 'cyan', 'magenta'];
  for (const base of baseColors) {
    if (colorStr.includes(base)) {
      const fallbackParsed = tinycolor(base);
      const hex = applyModifiers(fallbackParsed);
      return applyClear(hex);
    }
  }

  // 6. Absolute Fallback
  return isClear ? 'rgba(148, 163, 184, 0.5)' : '#94a3b8';
}
