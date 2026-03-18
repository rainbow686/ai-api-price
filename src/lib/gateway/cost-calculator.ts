import { createEdgeClient } from '@/lib/supabase/client';

/**
 * Cost Calculator - AI API Pricing
 *
 * Fetches current prices from database and calculates costs
 * based on input/output tokens.
 */

interface PriceData {
  inputPricePer1k: number;
  outputPricePer1k: number;
}

/**
 * Calculate cost for a single API request
 */
export async function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  const price = await getPrice(provider, model);

  const inputCost = (inputTokens / 1000) * price.inputPricePer1k;
  const outputCost = (outputTokens / 1000) * price.outputPricePer1k;

  return parseFloat((inputCost + outputCost).toFixed(8));
}

/**
 * Get current price for a model
 */
export async function getPrice(
  provider: string,
  model: string
): Promise<PriceData> {
  const supabase = createEdgeClient();

  // Fetch current price (effective_to IS NULL means currently active)
  const { data, error } = await supabase
    .from('price_tiers')
    .select('input_price_per_1k, output_price_per_1k')
    .eq('provider', provider)
    .eq('model', model)
    .is('effective_to', null)
    .single();

  if (error || !data) {
    // Fallback to hardcoded prices if DB lookup fails
    const fallbackPrice = getFallbackPrice(provider, model);
    if (fallbackPrice) {
      return fallbackPrice;
    }
    throw new Error(`Price not found for ${provider}/${model}`);
  }

  return {
    inputPricePer1k: data.input_price_per_1k,
    outputPricePer1k: data.output_price_per_1k,
  };
}

/**
 * Fallback prices - used when DB lookup fails
 * These should be updated regularly
 */
function getFallbackPrice(provider: string, model: string): PriceData | null {
  const fallbackPrices: Record<string, PriceData> = {
    // OpenAI
    'openai/gpt-4': { inputPricePer1k: 0.03, outputPricePer1k: 0.06 },
    'openai/gpt-4-turbo': { inputPricePer1k: 0.01, outputPricePer1k: 0.03 },
    'openai/gpt-3.5-turbo': { inputPricePer1k: 0.0005, outputPricePer1k: 0.0015 },
    'openai/gpt-4o': { inputPricePer1k: 0.005, outputPricePer1k: 0.015 },
    'openai/gpt-4o-mini': { inputPricePer1k: 0.00015, outputPricePer1k: 0.0006 },

    // Anthropic
    'anthropic/claude-3-opus': { inputPricePer1k: 0.015, outputPricePer1k: 0.075 },
    'anthropic/claude-3-sonnet': { inputPricePer1k: 0.003, outputPricePer1k: 0.015 },
    'anthropic/claude-3-haiku': { inputPricePer1k: 0.00025, outputPricePer1k: 0.00125 },
    'anthropic/claude-3-5-sonnet': { inputPricePer1k: 0.003, outputPricePer1k: 0.015 },

    // Google
    'google/gemini-pro': { inputPricePer1k: 0.0005, outputPricePer1k: 0.0015 },
    'google/gemini-ultra': { inputPricePer1k: 0.002, outputPricePer1k: 0.008 },
  };

  const key = `${provider}/${model}`;
  return fallbackPrices[key] || null;
}

/**
 * Batch calculate costs for multiple requests
 */
export async function calculateBatchCost(
  requests: Array<{
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
  }>
): Promise<number[]> {
  const costs: number[] = [];

  for (const request of requests) {
    const cost = await calculateCost(
      request.provider,
      request.model,
      request.inputTokens,
      request.outputTokens
    );
    costs.push(cost);
  }

  return costs;
}
