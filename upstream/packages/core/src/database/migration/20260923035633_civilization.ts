import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260923035633_civilization",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`a2a_message\` (
          \`id\` text PRIMARY KEY,
          \`from_agent\` text NOT NULL,
          \`to_agent\` text NOT NULL,
          \`type\` text NOT NULL,
          \`payload\` text NOT NULL,
          \`status\` text DEFAULT 'pending' NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`governance_audit\` (
          \`id\` text PRIMARY KEY,
          \`action\` text NOT NULL,
          \`decision\` text NOT NULL,
          \`rule_id\` text,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`governance_rule\` (
          \`id\` text PRIMARY KEY,
          \`action_pattern\` text NOT NULL,
          \`effect\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ledger_entry\` (
          \`id\` text PRIMARY KEY,
          \`session_id\` text NOT NULL,
          \`provider_id\` text NOT NULL,
          \`model_id\` text NOT NULL,
          \`input_tokens\` integer DEFAULT 0 NOT NULL,
          \`output_tokens\` integer DEFAULT 0 NOT NULL,
          \`cost\` real DEFAULT 0 NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`memory_entry\` (
          \`id\` text PRIMARY KEY,
          \`namespace\` text NOT NULL,
          \`key\` text NOT NULL,
          \`value\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`work_board\` (
          \`id\` text PRIMARY KEY,
          \`name\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`work_task\` (
          \`id\` text PRIMARY KEY,
          \`board_id\` text NOT NULL,
          \`title\` text NOT NULL,
          \`status\` text DEFAULT 'open' NOT NULL,
          \`priority\` integer DEFAULT 0 NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_work_task_board_id_work_board_id_fk\` FOREIGN KEY (\`board_id\`) REFERENCES \`work_board\`(\`id\`)
        );
      `)
    })
  },
} satisfies DatabaseMigration.Migration
