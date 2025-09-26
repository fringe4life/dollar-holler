<script lang="ts">
  import InvoiceRowHeader from './(dashboard)/invoices/InvoiceRowHeader.svelte'
  import InvoiceRow from './(dashboard)/invoices/InvoiceRow.svelte'
  import ClientRowHeader from './(dashboard)/clients/ClientRowHeader.svelte'
  import ClientRow from './(dashboard)/clients/ClientRow.svelte'
  import { dummyInvoices, dummyClients } from '$lib/data'
</script>

<svelte:head>
  <title>Dollar Holler - Invoice Management Made Simple</title>
</svelte:head>

<!-- Header Section -->
 <div class="grid gap-y-16 mt-16">
<header class=" text-center grid grid-cols-[10rem_1fr] grid-rows-[5rem_5rem] items-center justify-items-start">
  <div class="flex justify-center row-span-2">
    <img src="/images/logo.svg" alt="Dollar Holler Logo" class="aspect-square" />
  </div>
  <h1 class="font-sansserif row-span-2 sm:self-end sm:row-span-1 text-daisyBush text-4xl font-bold lg:text-5xl ">
    Dollar Holler
  </h1>
  <p class="hidden sm:block text-left text-gray-600 lg:text-xl">
    Streamline your invoicing and client management with our intuitive platform. 
    Create professional invoices, track payments, and manage your client relationships 
    all in one place. Get paid faster with Dollar Holler.
  </p>
</header>

<!-- Invoices Section -->
 <main class="grid gap-y-16"> 
<section>
  <h2 class="font-sansserif text-daisyBush mb-8 text-3xl font-bold">Recent Invoices</h2>
  <InvoiceRowHeader />
  <div class="flex flex-col-reverse gap-4">
    {#each dummyInvoices as invoice (invoice.id)}
      <InvoiceRow {invoice} />
    {/each}
  </div>
</section>

<!-- Clients Section -->
<section>
  <h2 class="font-sansserif text-daisyBush mb-8 text-3xl font-bold">Active Clients</h2>
  <ClientRowHeader />
  <div class="flex flex-col-reverse gap-4">
    {#each dummyClients as client, index (client.id)}
      <ClientRow bind:client={dummyClients[index]} />
      {/each}
    </div>
</section>

<!-- need to add links for sign in/up -->
</main>
</div>