<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import { Button } from '$lib/components/ui/button'
  let email = $state<string>('')
  let password = $state<string>('')
  let message = $state<string>("You've been successfully logged out!")
</script>

<h1 class="auth-heading">Login</h1>

<form class="">
  <Alert {message} />
  <div class="field">
    <label for="email" class="text-goldenFizz">Email</label>
    <input type="email" name="email" bind:value={email} placeholder="john@email.com" />
  </div>
  <div class="field">
    <div class="flex items-center justify-between">
      <label for="password" class="text-goldenFizz">Password</label>
      <a class="text-sm underline hover:no-underline" href="/forgot-password">Forgot Password</a>
    </div>
    <input type="password" name="password" bind:value={password} placeholder="john@email.com" />
  </div>
  <div class="field">
    <Button variant="auth" type="submit">Let's do this!</Button>
    <p class="mt-4 text-center text-sm text-white">
      <a href="/signup" class="underline hover:no-underline">Don't have an account yet?</a>
    </p>
  </div>
</form>
