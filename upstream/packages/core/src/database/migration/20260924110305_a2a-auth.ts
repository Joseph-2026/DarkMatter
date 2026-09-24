import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260924110305_a2a-auth",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`swarm_agent\` (
          \`id\` text PRIMARY KEY,
          \`swarm_id\` text NOT NULL,
          \`name\` text NOT NULL,
          \`public_key\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_swarm_agent_swarm_id_swarm_id_fk\` FOREIGN KEY (\`swarm_id\`) REFERENCES \`swarm\`(\`id\`)
        );
      `)
      yield* tx.run(`ALTER TABLE \`a2a_message\` ADD \`origin\` text DEFAULT 'legacy' NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`a2a_message\` ADD \`signature\` text;`)
      yield* tx.run(`CREATE INDEX \`swarm_agent_swarm_name_idx\` ON \`swarm_agent\` (\`swarm_id\`,\`name\`);`)
    })
  },
} satisfies DatabaseMigration.Migration
