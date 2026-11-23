/**
 * Type/compile check that is safe to run while `npm run dev` is live.
 *
 * A plain `next build` writes into the same `.next` directory the dev server is
 * serving from. Doing that mid-session pulls the compiled chunks out from under
 * the running app, and the browser then fails with:
 *
 *     missing required error components, refreshing...
 *
 * …which looks like an application bug but is just a clobbered build directory.
 * This wrapper redirects the build into `.next-check` so the dev server is never
 * disturbed. Use `npm run build` for real deployments.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BUILD_DIR: ".next-check" },
});

process.exit(result.status ?? 1);
