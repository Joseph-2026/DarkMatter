import type { A2aInboxResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"
import { useTuiConfig } from "../config"
import { useToast } from "../ui/toast"
import { errorMessage } from "../util/error"
import { useBindings } from "../keymap"

type InboxMessage = A2aInboxResponse[number]

export function parseAgentName(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed
}

export function a2aMessageFooter(message: InboxMessage): string {
  return `${message.from} · ${message.type}`
}

export function a2aMessageOptions(messages: InboxMessage[]) {
  return messages.map((message) => ({
    title: message.id.slice(0, 8),
    value: message.id,
    description: a2aMessageFooter(message),
    footer: message.status,
  }))
}

export function DialogA2AInbox(props: { agent: string }) {
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const tuiConfig = useTuiConfig()

  const [messages, { refetch }] = createResource(
    () => props.agent,
    async (agent) => {
      const result = await sdk.client.a2A.inbox({ agent })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to load inbox",
          message: errorMessage(result.error),
        })
        return []
      }
      return result.data ?? []
    },
  )

  const options = createMemo(() => a2aMessageOptions(messages() ?? []))

  onMount(() => {
    dialog.setSize("large")
  })

  useBindings(() => ({
    commands: [
      {
        name: "dialog.a2a.refresh",
        title: "Refresh A2A inbox",
        category: "Dialog",
        run() {
          void refetch()
        },
      },
    ],
    bindings: tuiConfig.keybinds.get("dialog.a2a.refresh"),
  }))

  return (
    <DialogSelect
      title={`Inbox: ${props.agent}`}
      options={options()}
      emptyView={<InboxEmpty />}
      onSelect={() => {
        dialog.clear()
      }}
      actions={[
        {
          command: "dialog.a2a.refresh",
          title: "refresh",
          onTrigger: () => {
            void refetch()
          },
        },
      ]}
    />
  )
}

function InboxEmpty() {
  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1}>
      <text>No pending messages</text>
    </box>
  )
}
