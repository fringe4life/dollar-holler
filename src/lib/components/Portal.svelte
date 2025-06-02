<script lang="ts">
  import type { Attachment } from 'svelte/attachments'

  let { children } = $props()

  const attachment: Attachment<HTMLElement> = (element: HTMLElement) => {
    const body = document.querySelector('body')

    body?.appendChild(element)
    element.hidden = false

    return () => {
      body?.removeChild(element)
    }
  }
</script>

<div hidden {@attach attachment}>
  {@render children()}
</div>

<!-- <div hidden use:portal>
  {@render children()}
</div> -->

<!-- const portal = (node: HTMLElement) => {
    let target: HTMLBodyElement | null
    function update() {
      target = document.querySelector('body')
      target?.appendChild(node)
      node.hidden = false
    }

    function destroy() {
      node.parentNode?.removeChild(node)
    }

    update()

    return { update, destroy }
  } -->
