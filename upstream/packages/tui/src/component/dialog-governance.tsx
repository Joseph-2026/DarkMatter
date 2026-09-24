import type { GovernanceEvaluateResponse, GovernanceListRulesResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"
import { useTuiConfig } from "../config"
import { useTheme } from "../context/theme"
import { useToast } from "../ui/toast"
import { DialogPrompt } from "../ui/dialog-prompt"
import { errorMessage } from "../util/error"
import { useBindings, useCommandShortcut } from "../keymap"

type PolicyRule = GovernanceListRulesResponse[number]

export function parseGovernanceAction(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed
}

export function governanceRuleOptions(rules: PolicyRule[]) {
  return rules
    .toSorted((a, b) => a.pattern.localeCompare(b.pattern))
    .map((rule) => ({
      title: rule.pattern,
      value: rule.id,
      description: rule.effect,
      footer: rule.id.slice(0, 8),
    }))
}

export function DialogGovernanceRules() {
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const tuiConfig = useTuiConfig()
  const evaluateHint = useCommandShortcut("dialog.governance.evaluate")

  const [rules, { refetch }] = createResource(
    () => undefined,
    async () => {
      const result = await sdk.client.governance.listRules()
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to load policy rules",
          message: errorMessage(result.error),
        })
        return []
      }
      return result.data ?? []
    },
  )

  const options = createMemo(() => governanceRuleOptions(rules() ?? []))

  onMount(() => {
    dialog.setSize("large")
  })

  useBindings(() => ({
    commands: [
      {
        name: "dialog.governance.evaluate",
        title: "Evaluate an action against policy rules",
        category: "Dialog",
        run() {
          void evaluateAction()
        },
      },
      {
        name: "dialog.governance.refresh",
        title: "Refresh policy rules",
        category: "Dialog",
        run() {
          void refetch()
        },
      },
    ],
    bindings: [
      ...tuiConfig.keybinds.get("dialog.governance.evaluate"),
      ...tuiConfig.keybinds.get("dialog.governance.refresh"),
    ],
  }))

  async function evaluateAction() {
    const action = await DialogPrompt.show(dialog, "Evaluate action", { placeholder: "Action to evaluate" })
    const parsed = parseGovernanceAction(action)
    if (!parsed) {
      dialog.replace(() => <DialogGovernanceRules />)
      return
    }
    try {
      const result = await sdk.client.governance.evaluate({ action: parsed })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to evaluate action",
          message: errorMessage(result.error),
        })
        dialog.replace(() => <DialogGovernanceRules />)
        return
      }
      if (!result.data) {
        toast.show({
          variant: "error",
          title: "Failed to evaluate action",
          message: "Empty response from server",
        })
        dialog.replace(() => <DialogGovernanceRules />)
        return
      }
      dialog.replace(() => <DialogGovernanceResult result={result.data!} />)
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to evaluate action",
        message: errorMessage(err),
      })
      dialog.replace(() => <DialogGovernanceRules />)
    }
  }

  return (
    <DialogSelect
      title="Policy rules"
      options={options()}
      emptyView={<RulesEmpty />}
      onSelect={() => {
        dialog.clear()
      }}
      actions={[
        {
          command: "dialog.governance.evaluate",
          title: "evaluate",
          onTrigger: () => {
            void evaluateAction()
          },
        },
      ]}
      footerHints={[{ title: "evaluate", label: evaluateHint() }]}
    />
  )
}

function RulesEmpty() {
  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1}>
      <text>No policy rules yet</text>
    </box>
  )
}

export function DialogGovernanceResult(props: { result: GovernanceEvaluateResponse }) {
  const dialog = useDialog()
  const { theme } = useTheme()

  onMount(() => {
    dialog.setSize("medium")
  })

  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1} paddingBottom={1} flexDirection="column" gap={1}>
      <text fg={theme.text}>Decision: {props.result.decision}</text>
      <text fg={theme.textMuted}>Action: {props.result.action}</text>
      <text fg={theme.textMuted}>Matched rule: {props.result.ruleID ?? "none"}</text>
      <text fg={theme.textMuted}>Audited server-side by the evaluate endpoint.</text>
    </box>
  )
}
