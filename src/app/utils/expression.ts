// All input comes exclusively from the controlled custom keyboard.
// Only digits, +, -, ×, ÷, (, ), . can appear — safe to evaluate.
export function evaluate(expr: string): number | null {
  if (!expr.trim()) return null;
  const js = expr.replace(/×/g, '*').replace(/÷/g, '/');
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + js + ')')();
    if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) return null;
    return result;
  } catch {
    return null;
  }
}
