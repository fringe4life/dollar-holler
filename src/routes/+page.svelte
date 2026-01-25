<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { dummyClients, dummyInvoices } from "$lib/data";
  import ClientRow from "./(dashboard)/clients/ClientRow.svelte";
  import ClientRowHeader from "./(dashboard)/clients/ClientRowHeader.svelte";
  import InvoiceRow from "./(dashboard)/invoices/InvoiceRow.svelte";
  import InvoiceRowHeader from "./(dashboard)/invoices/InvoiceRowHeader.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Dollar Holler - Invoice Management Made Simple</title>
</svelte:head>

<div class="bg-whisper grid min-h-dvh grid-cols-12 md:gap-x-16">
  <Navbar user={data.user} />
  <main class="col-span-12 px-4 pt-4 md:col-span-8 md:pt-10">
    <!-- Header Section -->
    <div class="mt-16 grid gap-y-16">
      <header
        class=" grid grid-cols-[10rem_1fr] grid-rows-[5rem_5rem] items-center justify-items-start text-center"
      >
        <div class="row-span-2 flex justify-center">
          <img
            src="/images/logo.svg"
            alt="Dollar Holler Logo"
            class="aspect-square"
          />
        </div>
        <h1
          class="font-sansserif text-daisyBush row-span-2 text-4xl font-bold sm:row-span-1 sm:self-end lg:text-5xl"
        >
          Dollar Holler
        </h1>
        <p class="hidden text-left text-gray-600 sm:block lg:text-xl">
          Streamline your invoicing and client management with our intuitive
          platform. Create professional invoices, track payments, and manage
          your client relationships all in one place. Get paid faster with
          Dollar Holler.
        </p>
      </header>

      <!-- Invoices Section -->
      <div class="grid gap-y-16 px-4 sm:px-8">
        <section>
          <h2 class="font-sansserif text-daisyBush mb-8 text-3xl font-bold">
            Recent Invoices
          </h2>
          <InvoiceRowHeader />
          <div class="flex flex-col-reverse gap-4">
            {#each dummyInvoices as invoice (invoice.id)}
              <InvoiceRow {invoice} />
            {/each}
          </div>
        </section>

        <!-- Clients Section -->
        <section>
          <h2 class="font-sansserif text-daisyBush mb-8 text-3xl font-bold">
            Active Clients
          </h2>
          <ClientRowHeader />
          <div class="flex flex-col-reverse gap-4">
            {#each dummyClients as client, index (client.id)}
              <ClientRow bind:client={dummyClients[index]} />
            {/each}
          </div>
        </section>

        <!-- need to add links for sign in/up -->
      </div>
    </div>
  </main>
</div>
