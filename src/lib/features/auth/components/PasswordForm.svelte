<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { grid, gridItem } from "#styled-system/patterns/index.js";
  import { getToast } from "#lib/components/patterns/toast/toaster.svelte.ts";
  import { changePassword } from "#features/auth/auth.remote.ts";
  import Form from "#lib/components/patterns/form/Form.svelte";
  import FormField from "#lib/components/patterns/form/FormField.svelte";
  import Check from "#lib/components/primitives/icons/Check.svelte";
  import LoaderButton from "#lib/components/primitives/button/LoaderButton.svelte";
  import Input from "#lib/components/primitives/input/Input.svelte";
  import { buttonIcon } from "#lib/styles.ts";

  const toast = getToast();

  const handlePasswordSuccess = () => {
    toast.success("Password changed successfully");
  };
</script>

<div>
  <h2
    class={css({
      color: "foreground",
      marginBlockEnd: 1,
      fontSize: "3xl",
      fontWeight: "black",
    })}
  >
    Update Account Information
  </h2>
  <p class={css({ marginBlockEnd: 8 })}>
    This information is used to access your account.
  </p>
</div>
<Form onSuccess={handlePasswordSuccess} remote={changePassword}>
  <div
    class={grid({
      alignItems: "start",
      columns: 6,
      columnGap: 5,
      gridTemplateAreas: {
        base: '"email email email email email email" "currentPassword currentPassword currentPassword currentPassword currentPassword currentPassword" "newPassword newPassword newPassword newPassword newPassword newPassword" "confirmPassword confirmPassword confirmPassword confirmPassword confirmPassword confirmPassword"',
        md: '"email email email currentPassword currentPassword currentPassword" "newPassword newPassword newPassword confirmPassword confirmPassword confirmPassword"',
      },
    })}
  >
    <FormField
      class={gridItem({ gridArea: "email" })}
      forId="email"
      issues={changePassword.fields.email.issues()}
      label="Email"
    >
      {#snippet children({ errorId })}
        <Input
          id="email"
          required
          aria-describedby={errorId}
          {...changePassword.fields.email.as("email")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ gridArea: "currentPassword" })}
      forId="currentPassword"
      issues={changePassword.fields._currentPassword.issues()}
      label="Current Password"
    >
      {#snippet children({ errorId })}
        <Input
          id="currentPassword"
          minlength={6}
          required
          aria-describedby={errorId}
          {...changePassword.fields._currentPassword.as("password")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ gridArea: "newPassword" })}
      forId="newPassword"
      issues={changePassword.fields._newPassword.issues()}
      label="New Password"
    >
      {#snippet children({ errorId })}
        <Input
          id="newPassword"
          minlength={6}
          required
          aria-describedby={errorId}
          {...changePassword.fields._newPassword.as("password")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ gridArea: "confirmPassword" })}
      forId="confirmPassword"
      issues={changePassword.fields._confirmPassword.issues()}
      label="Confirm Password"
    >
      {#snippet children({ errorId })}
        <Input
          id="confirmPassword"
          minlength={6}
          required
          aria-describedby={errorId}
          {...changePassword.fields._confirmPassword.as("password")}
        />
      {/snippet}
    </FormField>
  </div>
  {#snippet submit({ pending })}
    <LoaderButton class="group" {pending}
      ><Check class={buttonIcon({ icon: "check" })} /> Save</LoaderButton
    >
  {/snippet}
</Form>
