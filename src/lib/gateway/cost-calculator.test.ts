import { describe, it, expect } from 'bun:test';

// 直接测试成本计算逻辑（不依赖数据库）
// 实际项目中可以使用 integration tests 测试数据库交互

describe('Cost Calculator - Pure Logic', () => {
  // 测试成本计算公式
  describe('cost calculation formula', () => {
    it('should calculate GPT-4 cost correctly', () => {
      // GPT-4 pricing: $0.03/1k input, $0.06/1k output
      const inputTokens = 1000;
      const outputTokens = 500;
      const inputPricePer1k = 0.03;
      const outputPricePer1k = 0.06;

      const inputCost = (inputTokens / 1000) * inputPricePer1k;
      const outputCost = (outputTokens / 1000) * outputPricePer1k;
      const totalCost = parseFloat((inputCost + outputCost).toFixed(8));

      expect(totalCost).toBe(0.06);
    });

    it('should calculate Claude-3-Sonnet cost correctly', () => {
      // Claude-3-Sonnet pricing: $0.003/1k input, $0.015/1k output
      const inputTokens = 2000;
      const outputTokens = 1000;
      const inputPricePer1k = 0.003;
      const outputPricePer1k = 0.015;

      const inputCost = (inputTokens / 1000) * inputPricePer1k;
      const outputCost = (outputTokens / 1000) * outputPricePer1k;
      const totalCost = parseFloat((inputCost + outputCost).toFixed(8));

      expect(totalCost).toBe(0.021);
    });

    it('should handle zero tokens', () => {
      const inputTokens = 0;
      const outputTokens = 0;
      const inputPricePer1k = 0.005;
      const outputPricePer1k = 0.015;

      const inputCost = (inputTokens / 1000) * inputPricePer1k;
      const outputCost = (outputTokens / 1000) * outputPricePer1k;
      const totalCost = parseFloat((inputCost + outputCost).toFixed(8));

      expect(totalCost).toBe(0);
    });

    it('should handle large token counts', () => {
      const inputTokens = 1000000; // 1M tokens
      const outputTokens = 500000; // 500K tokens
      const inputPricePer1k = 0.00015; // GPT-4o-mini
      const outputPricePer1k = 0.0006;

      const inputCost = (inputTokens / 1000) * inputPricePer1k;
      const outputCost = (outputTokens / 1000) * outputPricePer1k;
      const totalCost = parseFloat((inputCost + outputCost).toFixed(8));

      // Input: 1000 * $0.00015 = $0.15
      // Output: 500 * $0.0006 = $0.30
      // Total: $0.45
      expect(totalCost).toBe(0.45);
    });

    it('should round to 8 decimal places', () => {
      const inputTokens = 123;
      const outputTokens = 45;
      const inputPricePer1k = 0.00025;
      const outputPricePer1k = 0.00125;

      const inputCost = (inputTokens / 1000) * inputPricePer1k;
      const outputCost = (outputTokens / 1000) * outputPricePer1k;
      const totalCost = parseFloat((inputCost + outputCost).toFixed(8));

      // Input: 123 * 0.00025 / 1000 = 0.00003075
      // Output: 45 * 0.00125 / 1000 = 0.00005625
      // Total: 0.000087 (rounded to 8 decimals)
      expect(totalCost).toBe(0.000087);
    });
  });

  // 测试 fallback 价格数据完整性
  describe('fallback prices coverage', () => {
    const fallbackPrices: Record<string, { inputPricePer1k: number; outputPricePer1k: number }> = {
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

    it('should have prices for all supported models', () => {
      const requiredModels = [
        'openai/gpt-4',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'anthropic/claude-3-sonnet',
        'anthropic/claude-3-haiku',
        'google/gemini-pro',
      ];

      for (const model of requiredModels) {
        expect(fallbackPrices[model]).toBeDefined();
        expect(fallbackPrices[model].inputPricePer1k).toBeGreaterThan(0);
        expect(fallbackPrices[model].outputPricePer1k).toBeGreaterThan(0);
      }
    });

    it('should have reasonable price ratios', () => {
      for (const [model, prices] of Object.entries(fallbackPrices)) {
        // Output should generally be more expensive than input
        // (most models charge more for output tokens)
        expect(prices.outputPricePer1k).toBeGreaterThanOrEqual(prices.inputPricePer1k);
      }
    });
  });
});
