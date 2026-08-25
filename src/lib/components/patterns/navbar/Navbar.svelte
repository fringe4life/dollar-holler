<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { cq, gridItem } from "#styled-system/patterns/index.js";
  import { afterNavigate } from "$app/navigation";
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getToast } from "#lib/components/patterns/toast/toaster.svelte.ts";
  import { logout } from "#features/auth/auth.remote.ts";
  import { isActive } from "#lib/utils/is-active.ts";
  import NavbarItem from "./NavbarItem.svelte";
  import NavbarMenuButton from "./NavbarMenuButton.svelte";
  import { navItemControlClass, navItemLiClass } from "./nav-item-styles";

  const toast = getToast();
  const NAVIGATION_ID = "primary-navigation";

  const navItems = [
    { href: resolve("invoices"), title: "Invoices" },
    { href: resolve("clients"), title: "Clients" },
    { href: resolve("settings"), title: "Settings" },
  ];
  const path = $derived(page.url.pathname);

  let navElement: HTMLElement | undefined;

  const handleNavClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const link = event.target.closest("a");
    if (
      !link ||
      !navElement?.contains(link) ||
      !navElement.matches(":popover-open")
    ) {
      return;
    }

    navElement.hidePopover();
  };

  afterNavigate(() => navElement?.hidePopover());

  const navLayer = css({
    blockSize: "100dvh",
    display: { base: "none", md: "flex" },
    inlineSize: "full",
    inset: 0,
    isolation: "isolate",
    margin: 0,
    maxBlockSize: "none",
    maxInlineSize: "none",
    padding: 0,
    position: { base: "fixed", md: "sticky" },
    transitionBehavior: "allow-discrete",
    transitionDuration: "normal",
    transitionProperty: "display, overlay",
    zIndex: 9999,

    _open: { display: "flex" },
    "&:popover-open > div": {
      translate: { base: "0 0", md: "0 0" },
      _starting: {
        translate: { base: "-100% 0", md: "0 0" },
      },
    },
    "&:not(:popover-open) > button > span": {
      rotate: "0deg",
      _after: { rotate: "0deg", translate: "0 5px" },
      _before: { opacity: 1, translate: "0 -10px" },
    },
  });

  const navDrawer = css({
    alignItems: "center",
    backgroundColor: "daisyBush",
    blockSize: "100dvh",
    display: "flex",
    flexDirection: "column",
    inlineSize: "full",
    inset: 0,
    overflowY: { base: "auto", md: "clip" },
    position: "absolute",
    textAlign: "center",
    translate: { base: "-100% 0", md: "0 0" },
    transitionDuration: "normal",
    transitionProperty: "translate",
    zIndex: 0,
  });
</script>

<svelte:document onclick={handleNavClick} />

<header class={cx(gridItem({ colSpan: { md: 3 }, zIndex: 20 }), cq())}>
  <!-- mobile nav control -->
  <NavbarMenuButton
    aria-label="Open navigation"
    command="toggle-popover"
    commandfor={NAVIGATION_ID}
    state="open"
  />
  <nav
    bind:this={navElement}
    class={navLayer}
    id={NAVIGATION_ID}
    popover="auto"
  >
    <!-- The close control is in the top layer, outside the translated drawer. -->
    <NavbarMenuButton
      aria-label="Close navigation"
      command="hide-popover"
      commandfor={NAVIGATION_ID}
      state="close"
    />
    <div class={navDrawer}>
      <div class={css({ marginBlock: 10, marginBlockEnd: 24 })}>
        <a href={resolve("/")}>
          <img
            alt="Doller Holla company logo"
            class={css({ marginInline: "auto", zIndex: 0 })}
            src={asset("images/logo.svg")}
          />
        </a>
      </div>
      <ul
        class={cx(
          "group",
          css({
            fontSize: { base: "xl", "@/xs": "2xl" },
            fontWeight: { base: "medium", "@/xs": "semibold" },
            listStyle: "none",
          })
        )}
        style:--active-nav-left={`url(${asset("images/active-nav--left.svg")})`}
        style:--active-nav-right={`url(${asset("images/active-nav--right.svg")})`}
      >
        {#each navItems as { href, title } (title)}
          <NavbarItem {href} isActive={isActive(href, path)} {title} />
        {/each}
        <li class={navItemLiClass}>
          <form
            {...logout.enhance(async (form) => {
              if (!(await form.submit())) {
                toast.error("Logout failed");
              }
            })}
            data-sveltekit-replacestate
          >
            <button
              class={navItemControlClass}
              disabled={logout.pending > 0}
              type="submit"
            >
              Logout
            </button>
          </form>
        </li>
      </ul>
    </div>
  </nav>
</header>
