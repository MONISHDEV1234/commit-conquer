export function validateEnv() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const required = ["DB_URL", "STRIPE_KEY", "JWT_SECRET"];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("FATAL: Missing required environment variables", missing);
    process.exit(1);
  }
}

/**
 * Returns the JWT secret with NO fallback.
 * Throws a fatal error if called without JWT_SECRET set (outside of test env).
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV !== "test") {
    console.error("FATAL ERROR: JWT_SECRET is not defined");
    process.exit(1);
  }
  // In test mode, return a safe fixed test secret so JWT operations work.
  return secret ?? "test-jwt-secret-do-not-use-in-production";
}
