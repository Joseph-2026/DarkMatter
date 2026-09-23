import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260923150530_civilization-indexes",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`CREATE INDEX \`a2a_message_to_status_idx\` ON \`a2a_message\` (\`to_agent\`,\`status\`);`)
      yield* tx.run(`CREATE INDEX \`governance_audit_action_idx\` ON \`governance_audit\` (\`action\`);`)
      yield* tx.run(`CREATE INDEX \`ledger_entry_session_idx\` ON \`ledger_entry\` (\`session_id\`);`)
      yield* tx.run(
        `CREATE UNIQUE INDEX \`memory_entry_namespace_key_idx\` ON \`memory_entry\` (\`namespace\`,\`key\`);`,
      )
      yield* tx.run(`CREATE INDEX \`work_task_board_idx\` ON \`work_task\` (\`board_id\`);`)
    })
  },
} satisfies DatabaseMigration.Migration
