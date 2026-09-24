import type { MemoryOsListResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"
import { useTuiConfig } from "../config"
import { useToast } from "../ui/toast"
import { errorMessage } from "../util/error"
import { useBindings } from "../keymap"

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
    ],
    bindings: tuiConfig.keybinds.get("dialog.memory.refresh"),
  }))

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
      ]}
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
