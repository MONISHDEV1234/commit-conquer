export function validateEnv() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const required = ["DB_URL", "STRIPE_KEY"];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("FATAL: Missing required environment variables", missing);
    process.exit(1);
  }
}
