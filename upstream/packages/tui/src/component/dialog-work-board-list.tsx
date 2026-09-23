import type { WorkBoardListBoardsResponse, WorkBoardListTasksResponse } from "@apt5/sdk/v2"
import { useDialog } from "../ui/dialog"
import { DialogSelect } from "../ui/dialog-select"
import { useSync } from "../context/sync"
import { useSDK } from "../context/sdk"
import { createMemo, createResource, onMount } from "solid-js"

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

  const [tasks] = createResource(
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

  return (
    <DialogSelect
      title={props.board.name}
      options={options()}
      emptyView={<TaskEmpty />}
      onSelect={() => {
        dialog.clear()
      }}
    />
  )
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
