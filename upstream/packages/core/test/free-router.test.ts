import { describe, expect, test } from "bun:test"
import { FreeRouter } from "@apt5/core/free-router"
import { ModelV2 } from "@apt5/core/model"
import { ProviderV2 } from "@apt5/core/provider"

const ref = (modelID: string) => ({ providerID: ProviderV2.ID.openrouter, modelID: ModelV2.ID.make(modelID) })

describe("FreeRouter", () => {
  test("chain starts with the nex-agi free primary", () => {
    expect(FreeRouter.Chain.map((entry) => String(entry.modelID))).toEqual([
      "nex-agi/nex-n2.5-mini:free",
      "nvidia/nemotron-3-ultra",
      "liquid/lfm-2.5",
      "cohere/north-mini-code",
    ])
    const primary = FreeRouter.Chain[0]
    if (!primary) throw new Error("Free chain is empty")
    expect(primary).toEqual(ref("nex-agi/nex-n2.5-mini:free"))
  })

  test("resolve prefers the primary over fallbacks", () => {
    const hit = FreeRouter.resolve(FreeRouter.Chain, [
      ref("cohere/north-mini-code"),
      ref("nex-agi/nex-n2.5-mini:free"),
    ])
    expect(hit ? String(hit.modelID) : undefined).toBe("nex-agi/nex-n2.5-mini:free")
  })

  test("resolve falls through to the first available fallback", () => {
    const hit = FreeRouter.resolve(FreeRouter.Chain, [ref("liquid/lfm-2.5"), ref("cohere/north-mini-code")])
    expect(hit ? String(hit.modelID) : undefined).toBe("liquid/lfm-2.5")
  })

  test("resolve returns undefined when the chain is exhausted", () => {
    expect(FreeRouter.resolve(FreeRouter.Chain, [ref("other/model")])).toBeUndefined()
    expect(FreeRouter.resolve(FreeRouter.Chain, [])).toBeUndefined()
  })
})
