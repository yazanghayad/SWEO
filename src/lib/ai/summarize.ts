/**
 * Conversation summarization pipeline.
 *
 * Generates a structured handoff summary for human agents when a customer
 * requests to speak with a person. The summary replaces the full transcript
 * in the agent view, providing only the critical information needed.
 */

import { getAIClient, getDefaultModel } from './client';
import type { HandoffSummary } from '@/types/appwrite';

// ---------------------------------------------------------------------------
// PII masking helpers
// ---------------------------------------------------------------------------

/**
 * Mask emails and phone numbers in text to prevent accidental leakage
 * of sensitive data into summary records.
 */
function maskPII(text: string): string {
  return text
    .replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL_REDACTED]'
    )
    .replace(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
      '[PHONE_REDACTED]'
    )
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
}

// ---------------------------------------------------------------------------
// Summarization
// ---------------------------------------------------------------------------

const SUMMARIZE_PROMPT = `You are a support operations assistant. Given a chat conversation between a customer and an AI bot, produce a structured JSON summary for the human agent who will take over.

Output JSON ONLY (no markdown, no backticks) with exactly these fields:
{
  "userIntent": "One concise sentence describing what the customer wants",
  "accountDetails": "Any account/signup details mentioned (name, plan, company) or 'None provided'",
  "relevantContext": "Key context the agent needs (products discussed, errors mentioned, etc.)",
  "actionsAttempted": "What the AI already tried or told the customer",
  "urgency": "low | medium | high",
  "suggestedNextStep": "What the agent should do first"
}

Rules:
- Be concise — max 2 sentences per field.
- Do NOT include any PII (emails, phone numbers, card numbers, SSNs) even if present.
- If no information exists for a field, write "None" or "Not mentioned".
- Assess urgency based on: payment issues = high, account access = high, general questions = low, signup help = medium.`;

/**
 * Generate a structured handoff summary from conversation messages.
 *
 * @param messages Array of {role, content} from the conversation
 * @param reason  Optional reason the customer gave for requesting handoff
 * @returns Structured HandoffSummary
 */
export async function generateHandoffSummary(
  messages: Array<{ role: string; content: string }>,
  reason?: string
): Promise<HandoffSummary> {
  const openai = getAIClient();

  // Build a sanitized transcript (mask PII before sending to LLM)
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Customer' : 'AI'}: ${maskPII(m.content)}`)
    .join('\n');

  const userPrompt = reason
    ? `Customer's handoff reason: "${maskPII(reason)}"\n\n--- Conversation ---\n${transcript}`
    : `--- Conversation ---\n${transcript}`;

  try {
    const response = await openai.chat.completions.create({
      model: getDefaultModel(),
      messages: [
        { role: 'system', content: SUMMARIZE_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 512,
      temperature: 0.2
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';

    // Parse JSON — handle cases where LLM wraps in backticks
    const jsonStr = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(jsonStr);

    return {
      userIntent: String(parsed.userIntent ?? 'Unknown'),
      accountDetails: String(parsed.accountDetails ?? 'None provided'),
      relevantContext: String(parsed.relevantContext ?? 'None'),
      actionsAttempted: String(parsed.actionsAttempted ?? 'None'),
      urgency: ['low', 'medium', 'high'].includes(parsed.urgency)
        ? parsed.urgency
        : 'medium',
      suggestedNextStep: String(parsed.suggestedNextStep ?? 'Review conversation'),
      requestedAt: new Date().toISOString()
    };
  } catch {
    // Fallback: return a minimal summary if LLM fails
    return {
      userIntent: reason ?? 'Customer requested human assistance',
      accountDetails: 'None provided',
      relevantContext:
        messages.length > 0
          ? `Conversation with ${messages.length} messages`
          : 'No conversation history',
      actionsAttempted: 'AI attempted to assist but customer preferred human help',
      urgency: 'medium',
      suggestedNextStep: 'Review conversation and respond to customer',
      requestedAt: new Date().toISOString()
    };
  }
}
