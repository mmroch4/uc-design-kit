/**
 * Shared helpers of the browser checks (check-pages, check-a11y, check-dom):
 * reading their options, splitting the pages between parallel CI jobs (--shard=i/n) and checking
 * several pages at the same time inside one job (--concurrency=n).
 *
 * Both options keep every check: a shard only chooses which pages this job
 * checks, and the n shards together check every page exactly once.
 */
import os from "node:os";

/** Reads --name=value (or the environment variable `envName`) from the command line; "" when absent. */
export function option(args, name, envName) {
  const prefix = `--${name}=`;
  const arg = args.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : (envName && process.env[envName]) || "";
}

/** --shard=i/n (or CHECK_SHARD=i/n): this job checks the i-th of n parts, 1-based. */
export function parseShard(args) {
  const value = option(args, "shard", "CHECK_SHARD");
  if (!value) return { index: 1, total: 1 };
  const match = /^(\d+)\/(\d+)$/.exec(value);
  const index = match ? Number(match[1]) : 0;
  const total = match ? Number(match[2]) : 0;
  if (!match || total < 1 || index < 1 || index > total) throw new Error(`--shard must be i/n with 1 <= i <= n, got "${value}"`);
  return { index, total };
}

/**
 * The items of this shard. Items are dealt in turn (1, 2, ..., n, 1, 2, ...)
 * over the sorted list, so pages of the same folder, which cost about the
 * same, are spread over every shard.
 */
export function shardOf(items, shard) {
  return items.filter((_, position) => position % shard.total === shard.index - 1);
}

/** --concurrency=n (or CHECK_CONCURRENCY=n): pages checked at the same time. Default: CPU count, at most 4. */
export function parseConcurrency(args) {
  const value = option(args, "concurrency", "CHECK_CONCURRENCY");
  if (!value) return Math.max(1, Math.min(4, os.availableParallelism ? os.availableParallelism() : os.cpus().length));
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(`--concurrency must be a positive integer, got "${value}"`);
  return n;
}

/** Filter arguments: everything that is not an --option. */
export function filterArgs(args) {
  return args.filter((arg) => !arg.startsWith("--"));
}

/**
 * Runs task(item) for every item, at most `concurrency` at a time, and calls
 * report(item, result) in the order of `items`, so the log reads the same as
 * a sequential run. A task that throws is reported with { error }.
 */
export async function runPool(items, concurrency, task, report) {
  const results = new Array(items.length);
  const done = new Array(items.length).fill(false);
  let next = 0;
  let reported = 0;
  const flush = () => {
    while (reported < items.length && done[reported]) {
      report(items[reported], results[reported]);
      results[reported] = undefined;
      reported += 1;
    }
  };
  const worker = async () => {
    while (next < items.length) {
      const position = next;
      next += 1;
      try {
        results[position] = await task(items[position]);
      } catch (error) {
        results[position] = { error };
      }
      done[position] = true;
      flush();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  flush();
}

/** Keeps the items whose text contains one of the filters (every item without filters). */
export function matchFilters(items, filters, text = (item) => item) {
  return items.filter((item) => !filters.length || filters.some((filter) => text(item).includes(filter)));
}

/**
 * Prints one checked page as every browser check does: "ok" or "FAIL", then
 * one line per problem (✗) and per warning (!). Returns whether it failed.
 */
export function reportPage(name, problems, warnings = []) {
  console.log(`${problems.length ? "FAIL" : "ok  "} ${name}`);
  for (const problem of problems) console.log(`       ✗ ${problem}`);
  for (const warning of warnings) console.log(`       ! ${warning}`);
  return problems.length > 0;
}

/** Prints which part of the pages this shard checks (nothing when there is one shard). */
export function logShard(shard, count, of) {
  if (shard.total > 1) console.log(`Shard ${shard.index}/${shard.total}: ${count} of ${of} pages.`);
}
