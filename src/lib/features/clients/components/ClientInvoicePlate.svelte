<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import InitialsAvatar from "#lib/components/primitives/avatar/InitialsAvatar.svelte";
  import Badge from "#lib/components/primitives/badge/badge.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import Edit from "#lib/components/primitives/icons/Edit.svelte";
  import { money } from "#lib/components/primitives/money/money.ts";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
  import type { BitsButton } from "#lib/types.ts";
  import { centsToDollars } from "#lib/utils/moneyHelpers.ts";
  import type { ClientSelect } from "#features/clients/types.ts";
  import {
    clientSummaryAddress,
    clientSummaryAvatar,
    clientSummaryBadge,
    clientSummaryEditButton,
    clientSummaryEmail,
    clientSummaryFields,
    clientSummaryHead,
    clientSummaryIdentity,
    clientSummaryMeta,
    clientSummaryName,
    clientSummaryPlate,
    clientSummaryReadout,
    clientSummaryReadoutAmount,
    clientSummaryReadoutItem,
    clientSummaryReadoutLabel,
    clientSummarySince,
    clientSummarySkeletonLine,
    clientTotalsKey,
  } from "#features/invoices/styles/invoice-summary-styles.ts";
  import type { ClientInvoiceSummaryFinal } from "#features/invoices/utils/client-invoice-summary.ts";
  import type { SummaryBucket } from "#features/invoices/utils/gauge-arcs.ts";

  interface BucketEntry {
    amount: string | undefined;
    bucket: SummaryBucket;
    count: number | undefined;
    label: string;
  }

  interface Props {
    buckets: BucketEntry[];
    client: Pick<ClientSelect, "email" | "name"> & {
      address: { city: string; state: string; street: string; zip: string };
    };
    isArchived: boolean;
    isEmpty: boolean;
    onEdit: BitsButton;
    since: string;
    /** `undefined` while the summary query is pending. */
    summary?: ClientInvoiceSummaryFinal;
  }

  let { buckets, client, isArchived, isEmpty, onEdit, since, summary }: Props =
    $props();
</script>

<div class={clientSummaryPlate}>
  <div class={clientSummaryIdentity}>
    <div class={clientSummaryAvatar} data-role="avatar">
      <InitialsAvatar name={client.name} size="md" />
    </div>
    <div class={clientSummaryHead}>
      <h1 class={clientSummaryName} data-role="name" title={client.name}>
        {client.name}
      </h1>
      <Button
        class={clientSummaryEditButton}
        onclick={onEdit}
        size="sm"
        variant="ghost"
      >
        <Edit height={16} width={16} />
        Edit
      </Button>
    </div>
    <div class={clientSummaryMeta}>
      <a
        class={clientSummaryEmail}
        data-role="email"
        href="mailto:{client.email}"
        title={client.email}
      >
        {client.email}
      </a>
      <Badge
        class={clientSummaryBadge}
        size="small"
        variant={isArchived ? "archive" : "active"}
      >
        {isArchived ? "Archived" : "Active"}
      </Badge>
    </div>
  </div>

  <div class={clientSummaryFields}>
    <div class={clientSummaryAddress} data-role="address">
      <p title={client.address.street}>{client.address.street}</p>
      <p>
        {client.address.city}, {client.address.state}
        {client.address.zip}
      </p>
    </div>
    <p class={clientSummarySince} data-role="since">
      <span>Client since</span>
      <strong>{since}</strong>
    </p>
  </div>

  {#if !isEmpty}
    <div class={clientSummaryReadout}>
      <div class={clientSummaryReadoutItem} data-readout="total">
        <span class={clientSummaryReadoutLabel}>Invoice totals</span>
        {#if summary}
          <span class={cx(money(), clientSummaryReadoutAmount)}>
            {centsToDollars(summary.grandTotal)}
          </span>
        {:else}
          <Skeleton
            class={clientSummarySkeletonLine}
            style="inline-size: 5.5rem"
          />
        {/if}
      </div>
      {#each buckets as entry (entry.bucket)}
        {#if entry.amount}
          <div class={clientSummaryReadoutItem} data-readout={entry.bucket}>
            <span class={clientSummaryReadoutLabel}>
              <span
                aria-hidden="true"
                class={clientTotalsKey({ bucket: entry.bucket })}
              ></span>
              {entry.label}
            </span>
            <span class={cx(money(), clientSummaryReadoutAmount)}
              >{entry.amount}</span
            >
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
