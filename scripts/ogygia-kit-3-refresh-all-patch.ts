import type { Plugin } from "vite";

const posix = (id: string) => id.replace(/\\/g, "/");

const isOgygiaKitRemoteClientStub = (id: string) =>
  posix(id).includes("/ogygia/") &&
  posix(id).endsWith("/shims/kit-remote/client-stub.js");

const isOgygiaAppNavigationShim = (id: string) =>
  posix(id).includes("/ogygia/") &&
  posix(id).endsWith("/shims/app-navigation.js");

/**
 * Workaround: inject Kit 3's `refreshAll` export into ogygia's kit-remote client stub and
 * `$app/navigation` shim. SvelteKit 3.1 remote forms import `refreshAll` from `client.js`, which
 * ogygia aliases to the stub; 0.8.4 only exports deprecated `invalidateAll`.
 *
 * @remarks
 * Still required on `ogygia@0.8.6` with `@sveltejs/kit@3.1.0`.
 * Drop when ogygia ships `refreshAll` on both shims; re-verify `bun run build` before deleting.
 *
 * @see https://github.com/PuruVJ/ogygia/issues/37 — open
 * @see https://github.com/fringe4life/dollar-holler/issues/203 — tracking
 */
export const ogygiaKit3RefreshAllPatch = (): Plugin => ({
  name: "ogygia-kit-3-refresh-all-patch",
  enforce: "post",
  transform(code, id) {
    if (isOgygiaKitRemoteClientStub(id)) {
      if (code.includes("function refreshAll")) {
        return null;
      }
      const refreshFn = `
function refreshAll() {
	const n = nav();
	if (n?.refreshAll) return n.refreshAll();
	if (n?.invalidateAll) return n.invalidateAll();
	location.reload();
	return Promise.resolve();
}
`;
      const exportNeedle =
        "export { _goto, app, goto, handle_error, invalidateAll,";
      if (!code.includes(exportNeedle)) {
        return null;
      }
      return {
        code: code.replace(
          exportNeedle,
          `${refreshFn}${exportNeedle.replace("invalidateAll,", "invalidateAll, refreshAll,")}`
        ),
        map: null,
      };
    }

    if (isOgygiaAppNavigationShim(id)) {
      if (code.includes("function refreshAll")) {
        return null;
      }
      const refreshFn = `
function refreshAll() {
	const k = kit();
	if (k?.refreshAll) return k.refreshAll();
	const o = og();
	if (o?.refreshAll) return o.refreshAll();
	if (o?.invalidateAll) return o.invalidateAll();
	location.reload();
	return Promise.resolve();
}
`;
      const exportNeedle =
        "export { afterNavigate, beforeNavigate, bust_page_cache, disableScrollHandling, goto, invalidate, invalidateAll,";
      if (!code.includes(exportNeedle)) {
        return null;
      }
      return {
        code: code.replace(
          exportNeedle,
          `${refreshFn}${exportNeedle.replace("invalidateAll,", "invalidateAll, refreshAll,")}`
        ),
        map: null,
      };
    }

    return null;
  },
});
