declare global {
  const APT5_VERSION: string
  const APT5_CHANNEL: string
}

export const InstallationVersion = typeof APT5_VERSION === "string" ? APT5_VERSION : "local"
export const InstallationChannel = typeof APT5_CHANNEL === "string" ? APT5_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
