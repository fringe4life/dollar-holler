<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { cq, flex, gridItem, vstack } from "styled-system/patterns";
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
    }),
  )}
    onclick={nav.toggle}
    type="button"
    aria-controls="primary-navigation"
    aria-expanded={nav.isOn}
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
        rotate: "45deg" ,
        _before: { opacity: "0" },
        _after: { translate: "0 -3px", rotate: "-90deg" },
      },
    })}
    ></div>
  </button>
  <nav
    id="primary-navigation"
    class={cx("group", vstack({
    backgroundColor: "daisyBush",
    position: { base: "fixed", md: "sticky" },
    inset: 0,
    zIndex: 9999,
    translate: { base: nav.isOn ? "0 0" : "-100% 0", md: "0 0" },
    _starting: {
      translate: { base: "-100% 0", md: "0 0" },
    },
    overflowY: "clip",
    textAlign: "center",
    isolation: "isolate",
    transitionProperty: "translate",
    transitionDuration: "normal",
    inlineSize: "full",
    blockSize: { md: "100dvh" },
  }))}
  >
    <div class={css({ marginBlock: 10, marginBlockEnd: 24 })}>
      <a href={resolve("/")}>
        <img
          class={css({ marginInline: "auto" })}
          src={asset("/images/logo.svg")}
          alt="Doller Holla company logo"
        >
      </a>
    </div>
    <ul
      style:--active-nav-left={`url(${asset('/images/active-nav--left.svg')})`}
      style:--active-nav-right={`url(${asset('/images/active-nav--right.svg')})`}
      class={cx("group", css({
      listStyle: "none",
      fontSize: { base: "xl", "@/xs": "2xl" },
      fontWeight: { base: "medium", "@/xs": "semibold" },
    }))}
    >
      {#each navItems as { href, title } (title)}
        <NavbarItem {href} {title} isActive={isActive(href, path)} />
      {/each}
    </ul>
  </nav>
</header>
