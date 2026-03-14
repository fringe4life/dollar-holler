/**
 * Generic per-instance boolean toggle using Svelte 5 runes.
 * Use one instance per component/row that needs its own open/close state.
 *
 * Example (menu):
 *   const menu = new Toggle();
 *   {@attach menu.isOn && clickOutside(menu.off)}
 *   <button onclick={menu.toggle}>...</button>
 *   {#if menu.isOn}<AdditionalOptions ... />{/if}
 *
 * Example (nav):
 *   const nav = new Toggle();
 *   <button onclick={nav.toggle}>...</button>
 *   <header class:translate-x-0={nav.isOn}>...</header>
 */
export class Toggle {
  isOn = $state(false);

  toggle = () => {
    this.isOn = !this.isOn;
  };

  on = () => {
    this.isOn = true;
  };

  off = () => {
    this.isOn = false;
  };
}
