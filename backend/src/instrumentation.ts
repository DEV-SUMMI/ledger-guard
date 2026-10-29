// Validates configuration at startup so a misconfigured deploy fails immediately.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("@/lib/env");
    getEnv();
  }
}
