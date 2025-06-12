<script lang="ts">
  import { goto } from '$app/navigation'
  import { supabase } from '$lib/utils/supabase'
  import { onMount } from 'svelte'

  let { children } = $props()

  onMount(async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      goto('/login')
      return
    }
  })
</script>

{@render children()}
