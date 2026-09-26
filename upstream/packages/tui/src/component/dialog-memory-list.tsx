import type { MemoryOsListResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"
import { useTuiConfig } from "../config"
import { useToast } from "../ui/toast"
import { DialogPrompt } from "../ui/dialog-prompt"
import { errorMessage } from "../util/error"
import { useBindings, useCommandShortcut } from "../keymap"

type MemoryEntry = MemoryOsListResponse[number]

export const DEFAULT_MEMORY_NAMESPACE = "project"

export function parseMemoryNamespace(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return DEFAULT_MEMORY_NAMESPACE
  return trimmed
}

export function memoryEntryPreview(value: unknown): string {
  if (typeof value === "string") return truncatePreview(value)
  try {
    const text = JSON.stringify(value) ?? "null"
    return truncatePreview(text)
  } catch {
    return truncatePreview(String(value))
  }
}

function truncatePreview(text: string): string {
  if (text.length <= 120) return text
  return text.slice(0, 117) + "..."
}

export function parseMemoryKey(input: string | null): string | undefined {
  if (input === null) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  return trimmed
}

export function parseMemoryJsonValue(input: string): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(input) }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Invalid JSON" }
  }
}

export function memoryEntryOptions(entries: MemoryEntry[]) {
  return entries
    .toSorted((a, b) => a.key.localeCompare(b.key))
    .map((entry) => ({
      title: entry.key,
      value: entry.id,
      description: memoryEntryPreview(entry.value),
      footer: entry.id.slice(0, 8),
    }))
}

export function DialogMemoryList(props: { namespace: string }) {
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const tuiConfig = useTuiConfig()

  const [entries, { refetch }] = createResource(
    () => props.namespace,
    async (namespace) => {
      const result = await sdk.client.memoryOs.list({ namespace })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to load memory entries",
          message: errorMessage(result.error),
        })
        return []
      }
      return result.data ?? []
    },
  )

  const options = createMemo(() => memoryEntryOptions(entries() ?? []))
  const putHint = useCommandShortcut("dialog.memory.put")

  onMount(() => {
    dialog.setSize("large")
  })

  useBindings(() => ({
    commands: [
      {
        name: "dialog.memory.refresh",
        title: "Refresh memory entries",
        category: "Dialog",
        run() {
          void refetch()
        },
      },
      {
        name: "dialog.memory.put",
        title: "Store memory entry",
        category: "Dialog",
        run() {
          void putEntry()
        },
      },
    ],
    bindings: [
      ...tuiConfig.keybinds.get("dialog.memory.refresh"),
      ...tuiConfig.keybinds.get("dialog.memory.put"),
    ],
  }))

  async function putEntry() {
    const keyInput = await DialogPrompt.show(dialog, "Memory key", { placeholder: "Key" })
    const key = parseMemoryKey(keyInput)
    if (!key) {
      dialog.replace(() => <DialogMemoryList namespace={props.namespace} />)
      return
    }
    const valueInput = await DialogPrompt.show(dialog, "Memory value (JSON)", { placeholder: '{"key": "value"}' })
    if (valueInput === null) {
      dialog.replace(() => <DialogMemoryList namespace={props.namespace} />)
      return
    }
    const parsed = parseMemoryJsonValue(valueInput)
    if (!parsed.ok) {
      toast.show({
        variant: "error",
        title: "Invalid JSON value",
        message: parsed.message,
      })
      dialog.replace(() => <DialogMemoryList namespace={props.namespace} />)
      return
    }
    try {
      const result = await sdk.client.memoryOs.put({ namespace: props.namespace, key, value: parsed.value })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to store memory entry",
          message: errorMessage(result.error),
        })
      }
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to store memory entry",
        message: errorMessage(err),
      })
    }
    dialog.replace(() => <DialogMemoryList namespace={props.namespace} />)
  }

  async function forgetEntry(entry: MemoryEntry) {
    try {
      const result = await sdk.client.memoryOs.forget({ namespace: props.namespace, key: entry.key })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to forget memory entry",
          message: errorMessage(result.error),
        })
      }
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to forget memory entry",
        message: errorMessage(err),
      })
    }
    await refetch()
  }

  return (
    <DialogSelect
      title={`Memory: ${props.namespace}`}
      options={options()}
      emptyView={<MemoryEmpty />}
      onSelect={() => {
        dialog.clear()
      }}
      actions={[
        {
          command: "dialog.memory.refresh",
          title: "refresh",
          onTrigger: () => {
            void refetch()
          },
        },
        {
          command: "dialog.memory.forget",
          title: "forget",
          disabled: (option) => option === undefined,
          onTrigger: (option) => {
            const entry = (entries() ?? []).find((item) => item.id === option.value)
            if (!entry) return
            void forgetEntry(entry)
          },
        },
      ]}
      footerHints={[{ title: "put", label: putHint() }]}
    />
  )
}

function MemoryEmpty() {
  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1}>
      <text>No memory entries in this namespace</text>
    </box>
  )
}
