const SIGNATURE_PREFIX = 'sha256=';

/** Render a byte array as a lowercase hex string. */
const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

/** Constant-time comparison for equal-length signature strings. */
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
};

/**
 * Verify a GitHub `x-hub-signature-256` header against the raw request body
 * using the configured webhook secret. Returns false for any malformed input.
 */
export const verifyGithubSignature = async (
  secret: string,
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> => {
  if (secret === '' || signatureHeader === null) {
    return false;
  }

  if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) {
    return false;
  }

  const provided = signatureHeader.slice(SIGNATURE_PREFIX.length);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = toHex(new Uint8Array(signature));

  return timingSafeEqual(provided, expected);
};
