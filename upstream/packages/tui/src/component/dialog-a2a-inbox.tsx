import type { A2aInboxResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"
import { useTuiConfig } from "../config"
import { useToast } from "../ui/toast"
import { DialogPrompt } from "../ui/dialog-prompt"
import { errorMessage } from "../util/error"
import { useBindings, useCommandShortcut } from "../keymap"

type InboxMessage = A2aInboxResponse[number]

export function parseAgentName(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed
}

export function parseA2aRecipient(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed
}

export function parseA2aMessageType(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed
}

export function parseA2aPayloadJson(input: string): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(input) }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Invalid JSON" }
  }
}

export function a2aMessageFooter(message: InboxMessage): string {
  return `${message.from} · ${message.type} · ${message.origin === "signed" ? "verified" : message.origin}`
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
  const sendHint = useCommandShortcut("dialog.a2a.send")

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
      {
        name: "dialog.a2a.send",
        title: "Send A2A message",
        category: "Dialog",
        run() {
          void sendMessage()
        },
      },
    ],
    bindings: [...tuiConfig.keybinds.get("dialog.a2a.refresh"), ...tuiConfig.keybinds.get("dialog.a2a.send")],
  }))

  async function sendMessage() {
    const toInput = await DialogPrompt.show(dialog, "Send to", { placeholder: "Agent name" })
    const to = parseA2aRecipient(toInput)
    if (!to) {
      dialog.replace(() => <DialogA2AInbox agent={props.agent} />)
      return
    }
    const typeInput = await DialogPrompt.show(dialog, "Message type", { placeholder: "Type" })
    const type = parseA2aMessageType(typeInput)
    if (!type) {
      dialog.replace(() => <DialogA2AInbox agent={props.agent} />)
      return
    }
    const payloadInput = await DialogPrompt.show(dialog, "Payload (JSON)", { placeholder: '{"key": "value"}' })
    if (payloadInput === null) {
      dialog.replace(() => <DialogA2AInbox agent={props.agent} />)
      return
    }
    const parsed = parseA2aPayloadJson(payloadInput)
    if (!parsed.ok) {
      toast.show({
        variant: "error",
        title: "Invalid JSON payload",
        message: parsed.message,
      })
      dialog.replace(() => <DialogA2AInbox agent={props.agent} />)
      return
    }
    try {
      const result = await sdk.client.a2A.send({ from: props.agent, to, type, payload: parsed.value })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to send message",
          message: errorMessage(result.error),
        })
      }
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to send message",
        message: errorMessage(err),
      })
    }
    dialog.replace(() => <DialogA2AInbox agent={props.agent} />)
  }

  async function ackMessage(message: InboxMessage) {
    try {
      const result = await sdk.client.a2A.ack({ id: message.id })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to acknowledge message",
          message: errorMessage(result.error),
        })
      }
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to acknowledge message",
        message: errorMessage(err),
      })
    }
    await refetch()
  }

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
        {
          command: "dialog.a2a.ack",
          title: "ack",
          disabled: (option) => option === undefined,
          onTrigger: (option) => {
            const message = (messages() ?? []).find((item) => item.id === option.value)
            if (!message) return
            void ackMessage(message)
          },
        },
      ]}
      footerHints={[{ title: "send", label: sendHint() }]}
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
