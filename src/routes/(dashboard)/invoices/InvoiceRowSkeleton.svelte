<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<div class="relative isolate">
  <div
    class="invoice-table invoice-row relative z-5 items-center rounded-lg bg-white py-3 shadow-tableRow lg:py-6"
  >
    <!-- status: badge-shaped pill ~54px wide -->
    <div class="status justify-self-end lg:justify-self-start">
      <Skeleton class="rounded-full bg-prim/40 block-6 inline-[54px]" />
    </div>

    <!-- duedate: fits 100px col on desktop -->
    <div class="duedate">
      <Skeleton class="bg-prim/40 block-4 inline-20" />
    </div>

    <!-- invoicenumber: spans full width on mobile, 80px col on desktop -->
    <div class="invoicenumber">
      <Skeleton class="bg-prim/40 block-4 inline-24" />
    </div>

    <!-- clientname: ~160px as specified -->
    <div class="clientName">
      <Skeleton class="bg-prim/40 block-5 inline-40" />
    </div>

    <!-- amount: right-aligned, ~80px -->
    <div class="amount flex justify-end">
      <Skeleton class="bg-prim/40 block-4 inline-20" />
    </div>

    <!-- viewbutton: 32px circle, hidden on mobile -->
    <div class="viewbutton hidden place-self-center lg:block">
      <Skeleton class="size-8 rounded-full bg-prim/40" />
    </div>

    <!-- morebutton: 32px circle, hidden on mobile -->
    <div class="morebutton hidden place-self-center lg:block">
      <Skeleton class="size-8 rounded-full bg-prim/40" />
    </div>
  </div>
</div>
