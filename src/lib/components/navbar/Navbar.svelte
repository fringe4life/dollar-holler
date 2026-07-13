<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { cq, gridItem, vstack } from "styled-system/patterns";
  import { afterNavigate } from "$app/navigation";
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Toggle } from "$lib/client/runes/Toggle.svelte";
  import { isActive } from "$lib/utils/is-active";
  import NavbarItem from "./NavbarItem.svelte";

  const navItems = [
    { href: resolve("/invoices"), title: "Invoices" },
    { href: resolve("/clients"), title: "Clients" },
    { href: resolve("/settings"), title: "Settings" },
    { href: resolve("/logout"), title: "Logout" },
  ];
  const path = $derived(page.url.pathname);

  const nav = new Toggle();
  afterNavigate(nav.off);

  const navShell = vstack({
    backgroundColor: "daisyBush",
    blockSize: "100dvh",
    inlineSize: "full",
    inset: 0,
    isolation: "isolate",
    overflowY: { base: "auto", md: "clip" },
    position: { base: "fixed", md: "sticky" },
    textAlign: "center",
    transitionDuration: "normal",
    transitionProperty: "translate",
    zIndex: 9999,
  });

  const navTranslateClosed = css({
    _starting: {
      translate: { base: "-100% 0", md: "0 0" },
    },
    translate: { base: "-100% 0", md: "0 0" },
  });

  const navTranslateOpen = css({
    _starting: {
      translate: { base: "-100% 0", md: "0 0" },
    },
    translate: { base: "0 0", md: "0 0" },
  });

  const handleKeypress = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      nav.off();
    }
  };
</script>

<svelte:window onkeydown={handleKeypress} />

<header class={cx(gridItem({ colSpan: { md: 3 }, zIndex: 20 }), cq())}>
  <!-- mobile nav control -->
  <button
    aria-controls="primary-navigation"
    aria-expanded={nav.isOn}
    class={cx(
      "group",
      css({
        position: "fixed",
        insetInlineEnd: 6,
        insetBlockStart: 6,
        zIndex: 10_000,
        cursor: "pointer",
        transitionProperty: "colors",
        transitionDuration: "normal",
        display: { md: "none" },
        color: nav.isOn ? "goldenFizz" : "daisyBush",
        blockSize: 12,
        padding: 2,
      })
    )}
    onclick={nav.toggle}
    type="button"
  >
    <span class={css({ srOnly: true })}>Menu</span>
    <div
      class={css({
        "&::after,&::before,&": {
          content: "''",
          display: "block",
          blockSize: "5px",
          inlineSize: "32px",
          rounded: "3px",
          transitionProperty: ["rotate", "translate", "opacity"],
          transitionDuration: "normal",
          backgroundColor: "currentColor",
        },
        _before: { translate: "0 -10px" },
        _after: { translate: "0 5px" },
        _groupExpanded: {
          rotate: "45deg",
          _before: { opacity: "0" },
          _after: { translate: "0 -3px", rotate: "-90deg" },
        },
      })}
    ></div>
  </button>
  <nav
    class={cx(
      "group",
      navShell,
      nav.isOn ? navTranslateOpen : navTranslateClosed
    )}
    id="primary-navigation"
  >
    <div class={css({ marginBlock: 10, marginBlockEnd: 24 })}>
      <a href={resolve("/")}>
        <img
          alt="Doller Holla company logo"
          class={css({ marginInline: "auto", zIndex: 0 })}
          src={asset("/images/logo.svg")}
        />
      </a>
    </div>
    <ul
      class={cx(
        "group",
        css({
          listStyle: "none",
          fontSize: { base: "xl", "@/xs": "2xl" },
          fontWeight: { base: "medium", "@/xs": "semibold" },
        })
      )}
      style:--active-nav-left={`url(${asset("/images/active-nav--left.svg")})`}
      style:--active-nav-right={`url(${asset("/images/active-nav--right.svg")})`}
    >
      {#each navItems as { href, title } (title)}
        <NavbarItem {href} isActive={isActive(href, path)} {title} />
      {/each}
    </ul>
  </nav>
</header>
