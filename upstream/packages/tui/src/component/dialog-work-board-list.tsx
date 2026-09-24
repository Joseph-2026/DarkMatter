import type { WorkBoardListBoardsResponse, WorkBoardListTasksResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSync } from "../context/sync"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"
import { useTuiConfig } from "../config"
import { useTheme } from "../context/theme"
import { useToast } from "../ui/toast"
import { DialogPrompt } from "../ui/dialog-prompt"
import { errorMessage } from "../util/error"
import { useBindings, useCommandShortcut } from "../keymap"

type Board = WorkBoardListBoardsResponse[number]
type BoardTask = WorkBoardListTasksResponse[number]

function loadBoards(list: () => Promise<{ data?: Board[] }>) {
  return list().then(
    (result) => result.data,
    () => undefined,
  )
}

export function DialogWorkBoardList() {
  const dialog = useDialog()
  const sync = useSync()
  const sdk = useSDK()

  const [boards, { refetch }] = createResource(
    () => undefined,
    () => loadBoards(() => sdk.client.workBoard.listBoards()),
  )

  const list = createMemo(() => boards() ?? sync.data.workboard)

  const options = createMemo(() =>
    list()
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map((board) => ({
        title: board.name,
        value: board.id,
        footer: board.id.slice(0, 8),
      })),
  )

  onMount(() => {
    dialog.setSize("large")
    void sync.workboard.refresh().then(() => refetch())
  })

  return (
    <DialogSelect
      title="Work boards"
      options={options()}
      emptyView={<BoardEmpty />}
      onSelect={(option) => {
        const board = list().find((item) => item.id === option.value)
        if (!board) return
        dialog.replace(() => <DialogWorkBoardTasks board={board} />)
      }}
    />
  )
}

function BoardEmpty() {
  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1}>
      <text>No work boards yet</text>
    </box>
  )
}

export function DialogWorkBoardTasks(props: { board: Board }) {
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const tuiConfig = useTuiConfig()
  const { theme } = useTheme()
  const createHint = useCommandShortcut("dialog.workboard.task_create")

  const [tasks, { refetch }] = createResource(
    () => props.board.id,
    (boardID) => sdk.client.workBoard.listTasks({ boardID }).then((result) => result.data ?? []),
  )

  const options = createMemo(() =>
    (tasks() ?? [])
      .toSorted((a, b) => a.title.localeCompare(b.title))
      .map((task) => ({
        title: task.title,
        value: task.id,
        category: taskStatusLabel(task.status),
        footer: taskFooter(task),
      })),
  )

  onMount(() => {
    dialog.setSize("large")
  })

  useBindings(() => ({
    commands: [
      {
        name: "dialog.workboard.task_create",
        title: "Create task on work board",
        category: "Dialog",
        run() {
          void createTask()
        },
      },
    ],
    bindings: tuiConfig.keybinds.get("dialog.workboard.task_create"),
  }))

  async function createTask() {
    const title = await DialogPrompt.show(dialog, "New task", { placeholder: "Task title" })
    if (title === null) {
      dialog.replace(() => <DialogWorkBoardTasks board={props.board} />)
      return
    }
    const parsed = parseTaskTitle(title)
    if (!parsed) {
      dialog.replace(() => <DialogWorkBoardTasks board={props.board} />)
      return
    }
    try {
      const result = await sdk.client.workBoard.createTask({
        boardID: props.board.id,
        title: parsed,
        priority: 0,
      })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to create task",
          message: errorMessage(result.error),
        })
      }
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to create task",
        message: errorMessage(err),
      })
    }
    dialog.replace(() => <DialogWorkBoardTasks board={props.board} />)
  }

  async function advanceTask(task: BoardTask) {
    const next = nextTaskStatus(task.status)
    if (!next) return
    try {
      const result = await sdk.client.workBoard.moveTask({ taskID: task.id, status: next })
      if (result.error) {
        toast.show({
          variant: "error",
          title: "Failed to move task",
          message: errorMessage(result.error),
        })
      }
    } catch (err) {
      toast.show({
        variant: "error",
        title: "Failed to move task",
        message: errorMessage(err),
      })
    }
    await refetch()
  }

  return (
    <DialogSelect
      title={props.board.name}
      options={options()}
      emptyView={<TaskEmpty />}
      onSelect={() => {
        dialog.clear()
      }}
      actions={[
        {
          command: "dialog.workboard.task_advance",
          title: "advance",
          disabled: (option) => {
            const task = (tasks() ?? []).find((item) => item.id === option?.value)
            if (!task) return true
            return nextTaskStatus(task.status) === undefined
          },
          onTrigger: (option) => {
            const task = (tasks() ?? []).find((item) => item.id === option.value)
            if (!task) return
            void advanceTask(task)
          },
        },
      ]}
      footer={
        <text fg={theme.textMuted} onMouseUp={() => void createTask()}>
          new
        </text>
      }
      footerHints={[{ title: "new", label: createHint() }]}
    />
  )
}

export function nextTaskStatus(status: BoardTask["status"]): BoardTask["status"] | undefined {
  if (status === "open") return "doing"
  if (status === "doing") return "done"
  return undefined
}

export function parseTaskTitle(title: string): string | undefined {
  const trimmed = title.trim()
  if (!trimmed) return undefined
  return trimmed
}

function TaskEmpty() {
  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1}>
      <text>No tasks on this board</text>
    </box>
  )
}

function taskStatusLabel(status: BoardTask["status"]) {
  if (status === "doing") return "Doing"
  if (status === "done") return "Done"
  return "Open"
}

function taskFooter(task: BoardTask) {
  const priority = Number(task.priority)
  if (!Number.isFinite(priority) || priority === 0) return task.status
  return `${task.status} · p${priority}`
}
