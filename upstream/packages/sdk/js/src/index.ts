export * from "./client.js"
export * from "./server.js"

import { createApt5Client } from "./client.js"
import { createApt5Server } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createOpencode(options?: ServerOptions) {
  const server = await createApt5Server({
    ...options,
  })

  const client = createApt5Client({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
