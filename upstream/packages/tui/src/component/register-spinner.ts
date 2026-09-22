import { getComponentCatalogue } from "@opentui/solid/components"
import { registerSpinner } from "opentui-spinner/solid"

export function registerApt5Spinner() {
  if (!getComponentCatalogue().spinner) registerSpinner()
}
