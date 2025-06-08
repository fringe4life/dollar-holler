<script>
  import { Button } from '$lib/components/ui/button'
</script>

<h1 class="auth-heading">Reset my Password</h1>

<form>
  <div class="field">
    <label for="newPassword">New Password</label>
    <input type="password" name="newPassword" id="newPassword" />
  </div>
  <div class="field">
    <label for="confirmPassword">Confirm Password</label>
    <input type="password" name="confirmPassword" id="confirmPassword" />
  </div>
  <Button variant="auth">Update my password!</Button>
  <p class="mt-4 text-center text-sm text-white">
    <a href="/login" class="underline hover:no-underline">I'm ready to login</a>
  </p>
</form>
