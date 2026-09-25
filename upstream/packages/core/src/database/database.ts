export * as Database from "./database"

import { EffectDrizzleSqlite } from "@apt5/effect-drizzle-sqlite"
import { layer as sqliteLayer } from "#sqlite"
import { Context, Effect, Layer } from "effect"
import { access, rename } from "node:fs/promises"
import { Global } from "../global"
import { Flag } from "../flag/flag"
import { isAbsolute, join } from "path"
import { DatabaseMigration } from "./migration"
import { InstallationChannel } from "../installation/version"
import { makeGlobalNode } from "../effect/app-node"

const makeDatabase = EffectDrizzleSqlite.makeWithDefaults()
type DatabaseShape = Effect.Success<typeof makeDatabase>

export interface Interface {
  db: DatabaseShape
}

export class Service extends Context.Service<Service, Interface>()("/v2/storage/Database") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    yield* Effect.promise(() => migrateLegacyDatabase()).pipe(Effect.orDie)
    const db = yield* makeDatabase

    yield* db.run("PRAGMA journal_mode = WAL")
    yield* db.run("PRAGMA synchronous = NORMAL")
    yield* db.run("PRAGMA busy_timeout = 5000")
    yield* db.run("PRAGMA cache_size = -64000")
    yield* db.run("PRAGMA foreign_keys = ON")
    yield* db.run("PRAGMA wal_checkpoint(PASSIVE)")
    yield* DatabaseMigration.apply(db)

    return { db }
  }).pipe(Effect.orDie),
)

export function layerFromPath(filename: string) {
  return layer.pipe(Layer.provide(sqliteLayer({ filename })))
}

export function path() {
  if (Flag.APT5_DB) {
    if (Flag.APT5_DB === ":memory:" || isAbsolute(Flag.APT5_DB)) return Flag.APT5_DB
    return join(Global.Path.data, Flag.APT5_DB)
  }
  return names().next
}

function names() {
  const channel = InstallationChannel.replace(/[^a-zA-Z0-9._-]/g, "-")
  const base =
    ["latest", "beta", "prod"].includes(InstallationChannel) ||
    process.env.APT5_DISABLE_CHANNEL_DB === "1" ||
    process.env.APT5_DISABLE_CHANNEL_DB === "true"
      ? "apt5.db"
      : `apt5-${channel}.db`
  const legacy =
    ["latest", "beta", "prod"].includes(InstallationChannel) ||
    process.env.APT5_DISABLE_CHANNEL_DB === "1" ||
    process.env.APT5_DISABLE_CHANNEL_DB === "true"
      ? "opencode.db"
      : `opencode-${channel}.db`
  return { next: join(Global.Path.data, base), legacy: join(Global.Path.data, legacy) }
}

// One-way upgrade: an existing opencode.db moves to apt5.db on first boot.
// Runs before open and fails the layer loudly — never silently orphan history.
async function migrateLegacyDatabase() {
  if (Flag.APT5_DB) return
  const { next, legacy } = names()
  if (next === legacy) return
  try {
    await access(next)
    return
  } catch {
    // next missing — fall through to legacy check
  }
  try {
    await access(legacy)
  } catch {
    return
  }
  await rename(legacy, next)
}

export const node = makeGlobalNode({ service: Service, layer: layerFromPath(path()), deps: [] })
