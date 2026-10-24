/**
 * Firebase Auth error codes → plain language.
 *
 * Raw strings such as "Firebase: Error (auth/invalid-credential)." tell a
 * student nothing. Codes are mapped here; the original error object stays in
 * the console for debugging, never on screen.
 *
 * Note: with email-enumeration protection enabled, Firebase returns
 * `auth/invalid-credential` for both "no such user" and "wrong password" —
 * deliberately, so an attacker cannot probe which addresses are registered.
 */

const AUTH_MESSAGES: Record<string, string> = {
  // sign-in
  'auth/invalid-credential': 'Incorrect email or password. Check the address and try again.',
  'auth/invalid-login-credentials': 'Incorrect email or password. Check the address and try again.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute, then try again.',
  'auth/network-request-failed': 'Network problem — check your connection and try again.',

  // project configuration
  'auth/configuration-not-found': 'Email/password sign-in is not enabled for this project.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this project.',
  'auth/unauthorized-domain': 'This domain is not authorised for sign-in in Firebase.',
  'auth/invalid-api-key': 'The Firebase API key is missing or invalid for this deployment.',

  // sign-up
  'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
  'auth/weak-password': 'Password should be at least 6 characters.',

  // popup / redirect providers
  'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
  'auth/popup-blocked': 'The browser blocked the sign-in window. Allow pop-ups and try again.',
  'auth/cancelled-popup-request': '',
};

/** Returns a human message for a Firebase auth error, or `fallback`. */
export function friendlyAuthError(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code;
  if (code && code in AUTH_MESSAGES) return AUTH_MESSAGES[code];
  return fallback;
}

/** True when the user simply closed the popup — not an error worth showing. */
export function isPopupCancel(err: unknown): boolean {
  return (err as { code?: string })?.code === 'auth/cancelled-popup-request';
}
