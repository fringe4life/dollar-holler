/**
 * Last browser-visible list href (`pathname` + `search`).
 * Kit's `navigation.from.url` is the load URL, not the shallow list query.
 */
let lastVisibleListHref: string | undefined;

export const rememberListHref = (href: string): void => {
  lastVisibleListHref = href;
};

/** Return href when it shares a pathname with the opener load URL. */
export const listReturnHrefFor = (fromPathname: string): string | undefined => {
  if (!lastVisibleListHref?.startsWith(fromPathname)) {
    return undefined;
  }
  return lastVisibleListHref;
};
