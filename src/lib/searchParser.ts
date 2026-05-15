import { Prisma } from "@prisma/client"

const FIELD_ALIASES: Record<string, string> = {
  mold: 'mold.name',
  name: 'mold.name',
  disc: 'mold.name',
  category: 'mold.category',
  type: 'mold.category',
  brand: 'mold.brand',
  company: 'mold.brand',
  secpattern: 'secondaryPattern',
  pattern: 'secondaryPattern',
  design: 'secondaryPattern',
  plastic: 'plastic',
  color: 'color',
  stamp: 'stamp',
  foil: 'stampFoil',
  stampfoil: 'stampFoil',
  weight: 'weight',
  speed: 'mold.speed',
  glide: 'mold.glide',
  turn: 'mold.turn',
  fade: 'mold.fade',
  condition: 'condition',
  location: 'location',
}

function parseNumericOperator(val: string) {
  // e.g. "9-11"
  const rangeMatch = val.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (rangeMatch) return { gte: parseFloat(rangeMatch[1]), lte: parseFloat(rangeMatch[2]) }
  
  // e.g. ">9", "<=10", "=0"
  const opMatch = val.match(/^(>=|<=|>|<|=)?(-?\d+(?:\.\d+)?)$/);
  if (!opMatch) return null;
  const num = parseFloat(opMatch[2])
  switch(opMatch[1]) {
    case '>': return { gt: num }
    case '<': return { lt: num }
    case '>=': return { gte: num }
    case '<=': return { lte: num }
    case '=': return { equals: num }
    default: return { equals: num }
  }
}

function parseStringWildcard(val: string) {
  const starts = val.startsWith('*')
  const ends = val.endsWith('*')
  const clean = val.replace(/^\*|\*$/g, '')
  if (starts && ends) return { contains: clean }
  if (starts) return { endsWith: clean }
  if (ends) return { startsWith: clean }
  // default exact match behaviour for fielded queries without wildcards
  return { startsWith: clean, endsWith: clean }
}

export function parseSearchQuery(query: string, vaultId: string | null = null, bagPaths: string[] = []): Prisma.InventoryWhereInput {
  const where: any = {};
  if (vaultId && vaultId !== 'all') {
    where.collectionId = vaultId;
  }

  if (!query || !query.trim()) return where;

  const exact: string[] = [];
  const fields: { key: string, val: string }[] = [];
  const fuzzy: string[] = [];

  // Match: key:"value", key:value, "exact", or fuzzy
  const regex = /(?:([a-zA-Z]+):)?"([^"]+)"|(?:([a-zA-Z]+):)([^\s]+)|"([^"]+)"|([^\s]+)/g;
  let match;
  while ((match = regex.exec(query)) !== null) {
    if (match[1] && match[2]) {
      fields.push({ key: match[1].toLowerCase(), val: match[2] });
    } else if (match[3] && match[4]) {
      fields.push({ key: match[3].toLowerCase(), val: match[4] });
    } else if (match[5]) {
      exact.push(match[5]);
    } else if (match[6]) {
      fuzzy.push(match[6]);
    }
  }

  const andConditions: any[] = [];

  const fieldGroups: Record<string, any[]> = {};

  for (const f of fields) {
    // Special handling for inbag
    if (f.key === 'inbag' || f.key === 'bag') {
      const isTrue = f.val.toLowerCase() === 'true' || f.val === '1' || f.val.toLowerCase() === 'yes';
      if (isTrue) {
        if (bagPaths.length > 0) {
          andConditions.push({
            OR: bagPaths.flatMap(p => [
              { location: p },
              { location: { startsWith: p + '/' } }
            ])
          })
        } else {
          andConditions.push({ id: 'none' })
        }
      } else {
        if (bagPaths.length > 0) {
          andConditions.push({
            NOT: { OR: bagPaths.flatMap(p => [
              { location: p },
              { location: { startsWith: p + '/' } }
            ])}
          })
        }
      }
      continue;
    }
    
    const dbFieldPath = FIELD_ALIASES[f.key];
    if (!dbFieldPath) {
      fuzzy.push(`${f.key}:${f.val}`);
      continue;
    }

    const isNumeric = ['mold.speed', 'mold.glide', 'mold.turn', 'mold.fade', 'weight', 'condition'].includes(dbFieldPath);
    let condition: any;

    if (isNumeric) {
      const numCond = parseNumericOperator(f.val);
      if (numCond) {
        condition = numCond;
      } else {
        // failed to parse numeric, just treat it as fuzzy string for robustness?
      }
    } else {
      condition = parseStringWildcard(f.val);
    }

    if (condition) {
      if (!fieldGroups[dbFieldPath]) fieldGroups[dbFieldPath] = [];
      fieldGroups[dbFieldPath].push(condition);
    }
  }

  for (const [path, conds] of Object.entries(fieldGroups)) {
    const parts = path.split('.');
    const orList = conds.map(c => {
      if (parts.length === 2) {
        return { [parts[0]]: { [parts[1]]: c } };
      }
      return { [path]: c };
    });
    andConditions.push(orList.length > 1 ? { OR: orList } : orList[0]);
  }

  for (const e of exact) {
    // strict exact match on mold.name
    andConditions.push({ mold: { name: { startsWith: e, endsWith: e } } });
  }

  if (fuzzy.length > 0) {
    const fuzzyStr = fuzzy.join(' ');
    andConditions.push({
      OR: [
        { mold: { name: { contains: fuzzyStr } } },
        { mold: { brand: { contains: fuzzyStr } } },
        { mold: { category: { contains: fuzzyStr } } },
        { plastic: { contains: fuzzyStr } },
        { color: { contains: fuzzyStr } },
        { stamp: { contains: fuzzyStr } },
        { stampFoil: { contains: fuzzyStr } },
        { location: { contains: fuzzyStr } },
        { notes: { contains: fuzzyStr } },
      ]
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

export function extractSearchTokens(query: string): Record<string, string> {
  const state: Record<string, string> = {};
  if (!query) return state;

  const regex = /(?:([a-zA-Z]+):)?"([^"]+)"|(?:([a-zA-Z]+):)([^\s]+)/g;
  let match;
  
  const multi: Record<string, string[]> = {};

  while ((match = regex.exec(query)) !== null) {
    const key = (match[1] || match[3])?.toLowerCase();
    const val = match[2] || match[4];
    if (!key || !val) continue;

    if (['speed','glide','turn','fade','weight','condition','cond'].includes(key)) {
      const field = key === 'cond' ? 'Cond' : key.charAt(0).toUpperCase() + key.slice(1);
      const rangeMatch = val.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
      if (rangeMatch) {
        state[`min${field}`] = rangeMatch[1];
        state[`max${field}`] = rangeMatch[2];
      } else {
        const opMatch = val.match(/^(>=|<=|>|<|=)?(-?\d+(?:\.\d+)?)$/);
        if (opMatch) {
          if (opMatch[1] === '>=' || opMatch[1] === '>') state[`min${field}`] = opMatch[2];
          else if (opMatch[1] === '<=' || opMatch[1] === '<') state[`max${field}`] = opMatch[2];
          else if (!opMatch[1] || opMatch[1] === '=') {
            state[`min${field}`] = opMatch[2];
            state[`max${field}`] = opMatch[2];
          }
        }
      }
    } else {
      let normalizedKey = key;
      if (key === 'foil') normalizedKey = 'stampFoil';
      if (key === 'location') normalizedKey = 'locations';
      
      const cleanVal = val.replace(/^\*|\*$/g, '');
      if (!multi[normalizedKey]) multi[normalizedKey] = [];
      multi[normalizedKey].push(cleanVal);
    }
  }

  for (const [k, v] of Object.entries(multi)) {
    if (k === 'ink') {
      state[k] = v[0];
    } else {
      state[k] = v.join(',');
    }
  }

  return state;
}
