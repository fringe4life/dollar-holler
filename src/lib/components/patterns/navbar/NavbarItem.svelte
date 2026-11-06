<script lang="ts">
  import { cx } from "#styled-system/css/cx.js";
  import NavbarAccent from "./NavbarAccent.svelte";
  import { navItemControlClass, navItemLiClass } from "./nav-item-styles";

  interface Props {
    href: string;
    isActive: boolean;
    title: string;
  }

  let { href, title, isActive }: Props = $props();
</script>

<li class={navItemLiClass}>
  <!-- href is already resolve()'d by the parent navbar -->
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  <a
    aria-current={isActive ? "page" : undefined}
    class={cx("group", navItemControlClass)}
    {href}
  >
    <NavbarAccent side="start" />
    {title}
    <NavbarAccent side="end" />
  </a>
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
</li>
