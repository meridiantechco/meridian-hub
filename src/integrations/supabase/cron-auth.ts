export function getCronSecrets(): string[] {
  const currentSecret = process.env["CRON_SECRET"];
  const previousSecret = process.env["CRON_SECRET_PREVIOUS"];

  return [currentSecret, previousSecret].filter((secret): secret is string =>
    Boolean(secret && secret.length > 0),
  );
}

export function isValidCronSecret(headerSecret: string | null): boolean {
  if (!headerSecret) {
    return false;
  }

  const validSecrets = getCronSecrets();
  return validSecrets.includes(headerSecret);
}
