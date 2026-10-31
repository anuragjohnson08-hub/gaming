/**
 * 19. IDEMPOTENCY KEYS
 * Generates and tracks unique client action tokens to deduplicate actions,
 * prevent accidental double-clicks, and handle optimistic retries safely.
 */

const executedActions = new Set<string>();

export function generateIdempotencyKey(actionPrefix: string, payloadId: string): string {
  const nonce = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  return `${actionPrefix}:${payloadId}:${nonce}`;
}

export function executeWithIdempotency(
  key: string,
  action: () => void,
  cooldownMs: number = 800
): boolean {
  if (executedActions.has(key)) {
    return false; // Action already processed
  }

  executedActions.add(key);
  try {
    action();
  } finally {
    setTimeout(() => {
      executedActions.delete(key);
    }, cooldownMs);
  }
  return true;
}
