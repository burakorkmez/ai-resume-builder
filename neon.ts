import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: true,
  functions: {
    // Deploy with `neon deploy --env .env.local` so the key is uploaded as this Function's secret.
    ai: { name: "AI suggestions", source: "./functions/ai.ts", env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY! } },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
