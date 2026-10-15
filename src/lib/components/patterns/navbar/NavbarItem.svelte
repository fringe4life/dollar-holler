<script lang="ts">
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
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a aria-current={isActive} class={navItemControlClass} {href}>
    {title}
  </a>
</li>
