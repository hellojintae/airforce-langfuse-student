// Shared Day 2 names, with explicit 2-C overrides. Never log credentials.
export function modelConfig(env: NodeJS.ProcessEnv = process.env) {
  const timeout = Number(env.LLM_TIMEOUT_SEC || 60);
  if (!Number.isFinite(timeout) || timeout <= 0 || timeout > 600) throw new Error('LLM_TIMEOUT_SEC must be 1..600');
  const base = env.MODEL_BASE_URL || env.LLM_BASE_URL;
  const openrouter = base ? new URL(base).hostname === 'openrouter.ai' : false;
  return {
    base,
    key: env.MODEL_API_KEY || env.LLM_API_KEY || (openrouter ? env.OPENROUTER_API_KEY : undefined),
    modelA: env.MODEL_A || env.LLM_MODEL,
    // A second model must be selected explicitly; do not silently compare A with itself.
    modelB: env.MODEL_B,
    timeoutMs: Math.round(timeout * 1000),
  };
}
