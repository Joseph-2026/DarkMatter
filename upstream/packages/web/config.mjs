const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://github.com/Joseph-2026/DarkMatter" : `https://${stage}.apt5.ai`,
  console: stage === "production" ? "https://github.com/Joseph-2026/DarkMatter/auth" : `https://${stage}.apt5.ai/auth`,
  email: "help@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/anomalyco/opencode",
  discord: "https://github.com/Joseph-2026/DarkMatter/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/v2/docs" },
  ],
}
