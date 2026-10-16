/** A required server setting. Fails with a clear message instead of a confusing connection or URL error later. */
export function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Set it in .env.local (or your host's settings).`);
  return value;
}
