export * as FreeRouter from "./free-router"

import { ModelV2 } from "./model"
import { ProviderV2 } from "./provider"

export interface Ref {
  readonly providerID: ProviderV2.ID
  readonly modelID: ModelV2.ID
}

// Ordered OpenRouter free-tier chain: primary first, fallbacks after.
// Resolution returns the first entry present in the available catalog.
export const Chain: Ref[] = [
  { providerID: ProviderV2.ID.openrouter, modelID: ModelV2.ID.make("nex-agi/nex-n2.5-mini:free") },
  { providerID: ProviderV2.ID.openrouter, modelID: ModelV2.ID.make("nvidia/nemotron-3-ultra") },
  { providerID: ProviderV2.ID.openrouter, modelID: ModelV2.ID.make("liquid/lfm-2.5") },
  { providerID: ProviderV2.ID.openrouter, modelID: ModelV2.ID.make("cohere/north-mini-code") },
]

export function resolve(chain: Ref[], models: Ref[]): Ref | undefined {
  return chain.find((ref) =>
    models.some((model) => model.providerID === ref.providerID && model.modelID === ref.modelID),
  )
}
