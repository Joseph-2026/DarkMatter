import { registerCustomTheme } from "@pierre/diffs"
import { Apt5Theme } from "./marked-theme"

let registered = false

export function registerApt5Theme() {
  if (registered) return
  registered = true
  registerCustomTheme("OpenCode", () => Promise.resolve(Apt5Theme))
}
