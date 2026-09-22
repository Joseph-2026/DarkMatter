import { run as runTui, type TuiInput } from "@apt5/tui"
import { Global } from "@apt5/core/global"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(AppNodeBuilder.build(Global.node)))
}
