<script>
  import { Button } from '$lib/components/ui/button'
</script>

<h1 class="auth-heading">Forgot Password</h1>

<form action="">
  <div class="field">
    <label for="email" class="text-goldenFizz">Email Address</label>
    <input type="email" name="email" id="email" placeholder="your.email@email.com" />
  </div>

  <Button variant="auth">Send me a reset email!</Button>
  <p class="mt-4 text-center text-sm text-white">
    <a href="/login" class="underline hover:no-underline">Ready to login?</a>
  </p>
</form>
