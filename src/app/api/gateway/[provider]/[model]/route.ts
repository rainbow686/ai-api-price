import { createEdgeClient } from '@/lib/supabase/client';
import { calculateCost } from '@/lib/gateway/cost-calculator';

export const runtime = 'edge';

/**
 * AI Gateway Proxy - Unified API Endpoint
 *
 * Forwards requests to OpenAI, Anthropic, or Google based on path
 * Calculates and logs costs in real-time
 */

interface GatewayResponse {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export async function POST(request: Request) {
  const supabase = createEdgeClient();

  try {
    // Parse incoming request
    const body = await request.json();
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    // Extract provider and model from path
    // Expected format: /api/gateway/{provider}/{model}
    const provider = pathParts[3];
    const model = pathParts[4];

    if (!provider || !model) {
      return Response.json(
        { error: 'Invalid path. Expected: /api/gateway/{provider}/{model}' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders = ['openai', 'anthropic', 'google'];
    if (!validProviders.includes(provider)) {
      return Response.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Extract user ID from API key header
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return Response.json(
        { error: 'Missing X-API-Key header' },
        { status: 401 }
      );
    }

    // Lookup user by API key
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('api_key', apiKey)
      .single();

    if (userError || !user) {
      return Response.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check budget before proceeding
    const { data: budget } = await supabase
      .from('budgets')
      .select('monthly_limit_usd, cached_usage_usd, limit_type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (budget) {
      const usagePercent = budget.cached_usage_usd / budget.monthly_limit_usd;

      if (usagePercent >= 1.0 && budget.limit_type === 'hard') {
        return Response.json(
          { error: 'Budget limit exceeded. Hard limit enforced.' },
          { status: 429 }
        );
      }
    }

    // Forward request to actual provider
    const providerResponse = await forwardToProvider(
      provider,
      model,
      body,
      request.headers
    );

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();

      // Log failed request
      await supabase.from('requests').insert({
        user_id: user.id,
        provider,
        model,
        input_tokens: 0,
        output_tokens: 0,
        cost_usd: 0,
        status: 'failed',
        error_message: errorText.slice(0, 500),
      });

      return Response.json(
        { error: `Provider error: ${errorText}` },
        { status: providerResponse.status }
      );
    }

    // Parse provider response to get token counts
    const responseData = await providerResponse.json();
    const usage = extractUsage(responseData);

    // Calculate cost
    const cost = await calculateCost(
      provider,
      model,
      usage.inputTokens,
      usage.outputTokens
    );

    // Log successful request
    await supabase.from('requests').insert({
      user_id: user.id,
      provider,
      model,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      cost_usd: cost,
      status: 'success',
    });

    // Return response to client with cost headers
    return Response.json(responseData, {
      headers: {
        'X-Cost-USD': cost.toString(),
        'X-Input-Tokens': usage.inputTokens.toString(),
        'X-Output-Tokens': usage.outputTokens.toString(),
      },
    });

  } catch (error) {
    console.error('Gateway error:', error);
    return Response.json(
      { error: 'Internal gateway error' },
      { status: 500 }
    );
  }
}

/**
 * Forward request to actual AI provider
 */
async function forwardToProvider(
  provider: string,
  model: string,
  body: any,
  headers: Headers
): Promise<Response> {
  let url: string;
  let forwardHeaders: HeadersInit;

  // Get provider API key from database
  const supabase = createEdgeClient();
  const { data: apiKeyRecord } = await supabase
    .from('api_keys')
    .select('key')
    .eq('provider', provider)
    .eq('is_active', true)
    .maybeSingle();

  if (!apiKeyRecord) {
    throw new Error(`No active API key configured for ${provider}`);
  }

  const providerKey = apiKeyRecord.key;

  switch (provider) {
    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      forwardHeaders = {
        'Authorization': `Bearer ${providerKey}`,
        'Content-Type': 'application/json',
      };
      break;

    case 'anthropic':
      url = 'https://api.anthropic.com/v1/messages';
      forwardHeaders = {
        'x-api-key': providerKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      };
      break;

    case 'google':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${providerKey}`;
      forwardHeaders = {
        'Content-Type': 'application/json',
      };
      break;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  return fetch(url, {
    method: 'POST',
    headers: forwardHeaders,
    body: JSON.stringify(body),
  });
}

/**
 * Extract token usage from provider response
 */
function extractUsage(responseData: any): { inputTokens: number; outputTokens: number } {
  // OpenAI format
  if (responseData.usage?.prompt_tokens && responseData.usage?.completion_tokens) {
    return {
      inputTokens: responseData.usage.prompt_tokens,
      outputTokens: responseData.usage.completion_tokens,
    };
  }

  // Anthropic format
  if (responseData.usage?.input_tokens && responseData.usage?.output_tokens) {
    return {
      inputTokens: responseData.usage.input_tokens,
      outputTokens: responseData.usage.output_tokens,
    };
  }

  // Google format (estimated from character count if not provided)
  if (responseData.usageMetadata) {
    return {
      inputTokens: responseData.usageMetadata.promptTokenCount || 0,
      outputTokens: responseData.usageMetadata.candidatesTokenCount || 0,
    };
  }

  // Fallback
  return { inputTokens: 0, outputTokens: 0 };
}
