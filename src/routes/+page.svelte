<script lang="ts">
  import { resolve } from "$app/paths";
  import LandingNav from "$lib/components/LandingNav.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    FileTextIcon,
    ShieldCheckIcon,
    StarIcon,
    UsersIcon,
    ZapIcon,
  } from "@lucide/svelte";

  let { data } = $props();

  const features = [
    {
      icon: ZapIcon,
      title: "Lightning Fast Invoicing",
      description:
        "Create and send professional invoices in under 60 seconds. Templates, line items, taxes — all handled.",
      accent: "bg-goldenFizz/15",
      iconBg: "bg-goldenFizz/30",
      iconColor: "text-goldenFizz",
      border: "border-goldenFizz/20",
    },
    {
      icon: ShieldCheckIcon,
      title: "Bank-Grade Security",
      description:
        "Your data is encrypted end-to-end. Secure infrastructure you can trust with your business.",
      accent: "bg-robinEggBlue/15",
      iconBg: "bg-robinEggBlue/30",
      iconColor: "text-robinEggBlue",
      border: "border-robinEggBlue/20",
    },
    {
      icon: UsersIcon,
      title: "Manage Your Clients",
      description:
        "Keep all client details, history, and contacts in one place. Never lose track of who owes what.",
      accent: "bg-caribbeanGreen/15",
      iconBg: "bg-caribbeanGreen/30",
      iconColor: "text-caribbeanGreen",
      border: "border-caribbeanGreen/20",
    },
    {
      icon: FileTextIcon,
      title: "Professional Invoices",
      description:
        "Polished, branded invoices that impress clients and make your business look its best.",
      accent: "bg-lavenderIndigo/10",
      iconBg: "bg-lavenderIndigo/20",
      iconColor: "text-lavenderIndigo",
      border: "border-lavenderIndigo/20",
    },
  ] as const;

  const reviews = [
    {
      quote:
        "Dollar Holler cut my invoicing time in half. I used to spend hours on spreadsheets — now it takes minutes.",
      name: "Sarah Chen",
      role: "Freelance Designer",
      avatar: "https://i.pravatar.cc/64?u=sarah-chen-dh",
      rotate: "-rotate-1",
    },
    {
      quote:
        "Finally an invoicing tool that doesn't make me want to pull my hair out. Clean, fast, and reliable.",
      name: "Marcus Johnson",
      role: "Web Developer",
      avatar: "https://i.pravatar.cc/64?u=marcus-johnson-dh",
      rotate: "rotate-1",
    },
    {
      quote:
        "The client management features alone are worth it. I can see everything at a glance — love it.",
      name: "Emily Rodriguez",
      role: "Marketing Consultant",
      avatar: "https://i.pravatar.cc/64?u=emily-rodriguez-dh",
      rotate: "rotate-1",
    },
    {
      quote:
        "I got paid 3x faster after switching. My clients love the professional look of the invoices.",
      name: "James Wu",
      role: "Videographer",
      avatar: "https://i.pravatar.cc/64?u=james-wu-dh",
      rotate: "-rotate-1",
    },
  ] as const;
</script>

<svelte:head>
  <title>Dollar Holler — Invoice Management Made Simple</title>
  <meta
    name="description"
    content="Create professional invoices, track payments, and manage clients — all from one beautiful dashboard."
  />
</svelte:head>

<main class="px-4 pbs-4 md:pbs-10">
  <LandingNav user={data?.user} />
  <!-- ═══════════════════════════════════════════════════ HERO -->
  <section class="relative flex items-center pbs-20 pbe-16 min-block-dvh">
    <!-- Aurora background blobs -->
    <div
      class="pointer-events-none absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 rounded-full bg-lavenderIndigo opacity-15 blur-3xl block-[600px] inline-[600px]"
    ></div>
    <div
      class="pointer-events-none absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/3 rounded-full bg-daisyBush opacity-10 blur-3xl block-[400px] inline-[400px]"
    ></div>

    <div
      class="relative mx-auto grid grid-cols-1 items-center gap-12 px-6 inline-full max-inline-6xl lg:grid-cols-2 lg:gap-16"
    >
      <!-- Left: Copy -->
      <div class="flex flex-col items-start gap-6">
        <!-- Eyebrow badge -->
        <span
          class="inline-flex items-center gap-2 rounded-full border border-lavenderIndigo/20 bg-lavenderIndigo/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-lavenderIndigo"
        >
          ✨ Invoice management, simplified
        </span>

        <h1
          class="font-sansserif text-5xl leading-[1.1] font-black tracking-tight text-daisyBush sm:text-6xl lg:text-7xl"
        >
          Get Paid,<br />Faster Than<br />Ever Before.
        </h1>

        <p class="max-w-lg text-lg leading-relaxed text-stone-600">
          Stop chasing payments. Create professional invoices, track payments,
          and manage clients — all from one beautiful dashboard.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          {#if data?.user}
            <Button
              href={resolve("/invoices")}
              variant="default"
              size="lg"
              class="text-base"
            >
              Go to Dashboard →
            </Button>
          {:else}
            <Button
              href={resolve("/signup")}
              variant="default"
              size="lg"
              class="text-base"
            >
              Start for Free →
            </Button>
            <Button
              href={resolve("/login")}
              variant="outline"
              size="lg"
              class="text-base"
            >
              Log in
            </Button>
          {/if}
        </div>

        <p class="text-stone-400 text-sm">
          No credit card required · Cancel anytime
        </p>
      </div>

      <!-- Right: Mock Invoice Card -->
      <div class="relative flex justify-center lg:justify-end">
        <!-- Floating badge: Payment -->
        <div
          class="absolute -top-6 -left-4 z-10 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-lg lg:-left-8"
        >
          <div
            class="bg-green-100 flex aspect-square items-center justify-center rounded-full text-sm inline-8"
          >
            💰
          </div>
          <div>
            <p class="text-green-700 text-xs font-semibold">Payment Received</p>
            <p class="text-green-600 text-xs">$4,200.00</p>
          </div>
        </div>

        <!-- Floating badge: Rating -->
        <div
          class="absolute right-0 -bottom-4 z-10 flex items-center gap-2 rounded-xl bg-goldenFizz/90 px-4 py-2.5 shadow-lg lg:-right-4"
        >
          <StarIcon size={16} class="text-daisyBush" />
          <p class="text-sm font-bold text-daisyBush">4.9 Client Rating</p>
        </div>

        <!-- Mock Invoice Card -->
        <div
          class="border-gray-200 rounded-2xl border bg-whisper shadow-2xl inline-full max-inline-md"
          style="box-shadow: 0 25px 60px oklch(38.26% 0.202 288.17 / 0.18), 0 8px 20px oklch(0% 0 0 / 0.08);"
        >
          <!-- Invoice Header -->
          <div class="rounded-t-2xl bg-daisyBush px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="font-sansserif text-xs font-bold tracking-widest text-goldenFizz uppercase"
                >
                  Dollar Holler
                </p>
                <p class="mbs-0.5 text-xs text-white/60">Invoice</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-white/70">Invoice No.</p>
                <p class="font-sansserif text-sm font-bold text-white">
                  #INV-0042
                </p>
              </div>
            </div>
          </div>

          <!-- Invoice Body -->
          <div class="p-6">
            <!-- Billing info -->
            <div class="mbe-5 flex items-start justify-between">
              <div>
                <p
                  class="mbe-1 text-xs font-semibold tracking-wide text-gray-400 uppercase"
                >
                  Bill To
                </p>
                <p class="text-sm font-bold text-daisyBush">Acme Design Co.</p>
                <p class="text-gray-500 text-xs">sarah@acme.com</p>
              </div>
              <div class="text-right">
                <p
                  class="mbe-1 text-xs font-semibold tracking-wide text-gray-400 uppercase"
                >
                  Due Date
                </p>
                <p class="text-sm font-semibold text-daisyBush">Mar 30, 2026</p>
              </div>
            </div>

            <!-- Line items -->
            <div
              class="border-gray-100 mbe-5 overflow-hidden rounded-xl border"
            >
              <div
                class="border-gray-100 bg-gray-50 grid grid-cols-[1fr_auto] border-b px-4 py-2 text-xs font-semibold tracking-wide text-gray-400 uppercase"
              >
                <span>Description</span>
                <span class="text-right">Amount</span>
              </div>
              <div class="divide-gray-50 divide-y">
                <div class="grid grid-cols-[1fr_auto] px-4 py-3 text-sm">
                  <div>
                    <p class="text-gray-800 font-medium">
                      Brand Identity Package
                    </p>
                    <p class="text-xs text-gray-400">20 hrs × $150/hr</p>
                  </div>
                  <span class="self-center font-semibold text-daisyBush"
                    >$3,000.00</span
                  >
                </div>
                <div class="grid grid-cols-[1fr_auto] px-4 py-3 text-sm">
                  <div>
                    <p class="text-gray-800 font-medium">Website Redesign</p>
                    <p class="text-xs text-gray-400">8 hrs × $150/hr</p>
                  </div>
                  <span class="self-center font-semibold text-daisyBush"
                    >$1,200.00</span
                  >
                </div>
              </div>
            </div>

            <!-- Total + Status -->
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-xs font-semibold tracking-wide text-gray-400 uppercase"
                >
                  Total
                </p>
                <p class="font-sansserif text-2xl font-black text-daisyBush">
                  $4,200.00
                </p>
              </div>
              <span
                class="bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
              >
                ✓ Paid
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════ FEATURES -->
  <section class="bg-white py-24">
    <div class="mx-auto px-6 max-inline-6xl">
      <!-- Section header -->
      <div class="mbe-16 text-center">
        <p
          class="mbe-3 text-sm font-bold tracking-widest text-lavenderIndigo uppercase"
        >
          Why Dollar Holler?
        </p>
        <h2
          class="font-sansserif text-4xl font-black text-daisyBush sm:text-5xl"
        >
          Everything you need<br class="hidden sm:block" /> to get paid on time
        </h2>
      </div>

      <!-- Feature Cards Grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {#each features as feature}
          {@const Icon = feature.icon}
          <div
            class={[
              "group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
              feature.accent,
              feature.border,
            ].join(" ")}
          >
            <div
              class={[
                "flex aspect-square items-center justify-center rounded-xl inline-12",
                feature.iconBg,
              ].join(" ")}
            >
              <Icon size={24} class={feature.iconColor} />
            </div>
            <div>
              <h3 class="mbe-2 text-lg font-black text-daisyBush">
                {feature.title}
              </h3>
              <p class="text-sm leading-relaxed text-stone-600">
                {feature.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════ REVIEWS -->
  <section class="relative overflow-hidden bg-daisyBush py-24">
    <!-- Subtle aurora blob -->
    <div
      class="pointer-events-none absolute top-0 right-0 rounded-full bg-lavenderIndigo opacity-20 blur-3xl block-96 inline-96"
    ></div>
    <div
      class="bg-black/20 pointer-events-none absolute bottom-0 left-0 rounded-full blur-3xl block-64 inline-64"
    ></div>

    <div class="relative mx-auto px-6 max-inline-6xl">
      <!-- Section header -->
      <div class="mbe-16 text-center">
        <p
          class="mbe-3 text-sm font-bold tracking-widest text-goldenFizz uppercase"
        >
          Real People, Real Results
        </p>
        <h2 class="font-sansserif text-4xl font-black text-white sm:text-5xl">
          What our customers say
        </h2>
        <p class="mbs-3 text-base text-pastelPurple">
          Trusted by freelancers and small businesses worldwide
        </p>
      </div>

      <!-- Review Cards -->
      <div class="grid gap-6 sm:grid-cols-2">
        {#each reviews as review (review.name)}
          <div
            class={[
              "flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]",
              review.rotate,
            ].join(" ")}
          >
            <!-- Stars -->
            <div class="flex gap-1">
              {#each { length: 5 } as _}
                <StarIcon size={16} class="fill-goldenFizz text-goldenFizz" />
              {/each}
            </div>

            <!-- Quote -->
            <p class="flex-1 text-base leading-relaxed text-white/90">
              "{review.quote}"
            </p>

            <!-- Reviewer -->
            <div class="flex items-center gap-3">
              <img
                src={review.avatar}
                alt={review.name}
                class="aspect-square rounded-full object-cover ring-2 ring-white/20 block-11"
                width="44"
                height="44"
              />
              <div>
                <p class="font-sansserif text-sm font-bold text-white">
                  {review.name}
                </p>
                <p class="text-xs text-pastelPurple">{review.role}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════ CTA -->
  <section class="relative overflow-hidden bg-lavenderIndigo py-28">
    <!-- Aurora blobs -->
    <div
      class="pointer-events-none absolute top-0 left-1/2 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-daisyBush opacity-40 blur-3xl inline-96"
    ></div>
    <div
      class="pointer-events-none absolute right-0 bottom-0 h-72 translate-x-1/3 translate-y-1/3 rounded-full bg-robinEggBlue opacity-20 blur-3xl inline-72"
    ></div>

    <div class="relative mx-auto px-6 text-center max-inline-3xl">
      <h2
        class="mbe-5 font-sansserif text-5xl leading-tight font-black text-goldenFizz sm:text-6xl"
      >
        Ready to get paid faster?
      </h2>
      <p class="mbe-10 text-lg leading-relaxed text-white/80">
        Join thousands of freelancers and small businesses who use Dollar Holler
        to streamline their invoicing.
      </p>
      <div class="flex flex-col items-center gap-4">
        <Button
          href={resolve("/signup")}
          variant="auth"
          size="lg"
          class="text-lg min-inline-56"
        >
          Create Free Account
        </Button>
        <a
          href={resolve("/login")}
          class="text-sm text-white/60 underline underline-offset-4 transition-colors hover:text-white/90"
        >
          Already have an account? Log in
        </a>
      </div>
    </div>
  </section>
</main>
<!-- ══════════════════════════════════════════════ FOOTER -->
<footer class="col-span-full border-t border-white/10 bg-daisyBush py-10">
  <div
    class="mx-auto flex flex-col items-center justify-between gap-4 px-6 max-inline-6xl sm:flex-row"
  >
    <p class="text-sm text-pastelPurple">
      © 2026 Dollar Holler. All rights reserved.
    </p>
    <nav class="flex items-center gap-6 text-sm">
      <a
        href={resolve("/invoices")}
        class="text-pastelPurple transition-colors duration-150 hover:text-white"
        >Invoices</a
      >
      <a
        href={resolve("/clients")}
        class="text-pastelPurple transition-colors duration-150 hover:text-white"
        >Clients</a
      >
      <a
        href={resolve("/login")}
        class="text-pastelPurple transition-colors duration-150 hover:text-white"
        >Login</a
      >
      <a
        href={resolve("/signup")}
        class="font-semibold text-goldenFizz transition-colors duration-150 hover:text-white"
        >Sign Up</a
      >
    </nav>
  </div>
</footer>
