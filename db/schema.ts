import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";
export const rounds = sqliteTable("rounds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  deadline: integer("deadline").notNull(),
  status: text("status").notNull().default("open"),
  countA: integer("count_a"),
  countB: integer("count_b"),
  commentary: text("commentary").notNull().default(""),
  commentarySource: text("commentary_source").notNull().default("preset"),
});
export const votes = sqliteTable("votes", {
  roundId: integer("round_id").notNull().references(() => rounds.id),
  participant: text("participant").notNull(),
  choice: text("choice").notNull(),
}, (table) => [primaryKey({ columns: [table.roundId, table.participant] })]);
