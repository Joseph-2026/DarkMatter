import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260924054856_swarm",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`swarm_run\` (
          \`id\` text PRIMARY KEY,
          \`swarm_id\` text NOT NULL,
          \`role\` text NOT NULL,
          \`task\` text NOT NULL,
          \`directory\` text NOT NULL,
          \`session_id\` text,
          \`task_id\` text,
          \`status\` text DEFAULT 'pending' NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_swarm_run_swarm_id_swarm_id_fk\` FOREIGN KEY (\`swarm_id\`) REFERENCES \`swarm\`(\`id\`)
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`swarm\` (
          \`id\` text PRIMARY KEY,
          \`name\` text NOT NULL,
          \`status\` text DEFAULT 'active' NOT NULL,
          \`board_id\` text,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`CREATE INDEX \`swarm_run_swarm_idx\` ON \`swarm_run\` (\`swarm_id\`);`)
    })
  },
} satisfies DatabaseMigration.Migration
