<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<div class="relative isolate">
  <div
    class="client-table client-row shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  >
    <!-- status: badge-shaped pill ~54px wide -->
    <div class="status justify-self-end lg:justify-self-start">
      <Skeleton class="bg-prim/40 rounded-full block-6 inline-15" />
    </div>

    <!-- clientname: ~160px -->
    <div class="clientName">
      <Skeleton class="bg-prim/40 block-5 inline-20" />
    </div>

    <!-- received: right-aligned, ~80px -->
    <div class="received">
      <Skeleton class="bg-prim/40 block-4 inline-20" />
    </div>

    <!-- balance: right-aligned, ~80px -->
    <div class="balance flex justify-end lg:justify-end">
      <Skeleton class="bg-prim/40 block-4 inline-20" />
    </div>

    <!-- view button: 32px circle, hidden on mobile -->
    <div class="view hidden place-self-center lg:block">
      <Skeleton class="bg-prim/40 size-8 rounded-full" />
    </div>

    <!-- three dots: 32px circle, hidden on mobile -->
    <div class="threeDots hidden place-self-center lg:block">
      <Skeleton class="bg-prim/40 size-8 rounded-full" />
    </div>
  </div>
</div>
