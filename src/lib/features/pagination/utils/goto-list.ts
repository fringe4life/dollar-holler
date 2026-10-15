import { browser } from "$app/env";
import { goto } from "$app/navigation";
import { withViewTransition } from "#lib/client/view-transition.ts";
import {
  applyListNav,
  nextCanonicalSearch,
  readListQuery,
  type ListNav,
} from "./list-query";
import { buildListSearchString, type ListPage, visibleListUrl } from "./url";

const listHref = (page: ListPage, nav: ListNav): string => {
  const url = visibleListUrl(page);
  const next = applyListNav(readListQuery(page), nav);
  return `${url.pathname}${buildListSearchString(next, url.searchParams)}`;
};

/** Shallow list navigation. Forward and backward run the directional view transition. */
export const gotoList = async (page: ListPage, nav: ListNav): Promise<void> => {
  const href = listHref(page, nav);
  const update = () => {
    // `page.url.pathname` is already resolved. `resolve()` would prefix base again.
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- visible list URL, not a route id
    return goto(href, { shallow: true });
  };
  if (nav.type === "forward" || nav.type === "backward") {
    await withViewTransition({ types: [nav.type], update });
    return;
  }
  if (nav.type === "search") {
    await withViewTransition({ update });
    return;
  }
  await update();
};

/**
 * Quiet `replace` when `q` / `cursor` / `direction` / `limit` are not canonical.
 * The parsed query does not change, so the list request is unchanged.
 */
export const canonicalizeListUrl = (page: ListPage): void => {
  if (!browser) {
    return;
  }
  const url = visibleListUrl(page);
  const search = nextCanonicalSearch(url);
  if (search === null) {
    return;
  }
  // eslint-disable-next-line svelte/no-navigation-without-resolve -- visible list URL, not a route id
  void goto(`${url.pathname}${search}`, { replace: true, shallow: true });
};
