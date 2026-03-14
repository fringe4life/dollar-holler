<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<div class="relative isolate">
  <div
    class="invoice-table invoice-row shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  >
    <!-- status: badge-shaped pill ~54px wide -->
    <div class="status justify-self-end lg:justify-self-start">
      <Skeleton class="bg-prim/40 h-6 w-[54px] rounded-full" />
    </div>

    <!-- duedate: fits 100px col on desktop -->
    <div class="duedate">
      <Skeleton class="bg-prim/40 h-4 w-20" />
    </div>

    <!-- invoicenumber: spans full width on mobile, 80px col on desktop -->
    <div class="invoicenumber">
      <Skeleton class="bg-prim/40 h-4 w-24" />
    </div>

    <!-- clientname: ~160px as specified -->
    <div class="clientname">
      <Skeleton class="bg-prim/40 h-5 w-40" />
    </div>

    <!-- amount: right-aligned, ~80px -->
    <div class="amount flex justify-end">
      <Skeleton class="bg-prim/40 h-4 w-20" />
    </div>

    <!-- viewbutton: 32px circle, hidden on mobile -->
    <div class="viewbutton hidden place-self-center lg:block">
      <Skeleton class="bg-prim/40 size-8 rounded-full" />
    </div>

    <!-- morebutton: 32px circle, hidden on mobile -->
    <div class="morebutton hidden place-self-center lg:block">
      <Skeleton class="bg-prim/40 size-8 rounded-full" />
    </div>
  </div>
</div>

<style>
  @reference "../../../app.css";

  .invoice-row {
    grid-template-areas:
      "invoicenumber invoicenumber"
      "clientname    amount"
      "duedate       status";

    @media screen and (width > 1024px) {
      grid-template-areas: "status duedate invoicenumber clientname amount viewbutton morebutton";
    }
  }

  .status {
    grid-area: status;
  }
  .duedate {
    grid-area: duedate;
  }
  .invoicenumber {
    grid-area: invoicenumber;
  }
  .clientname {
    grid-area: clientname;
  }
  .amount {
    grid-area: amount;
  }
  .viewbutton {
    grid-area: viewbutton;
  }
  .morebutton {
    grid-area: morebutton;
  }
</style>
