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

<div class="bg-whisper min-h-dvh overflow-x-hidden">
  <LandingNav user={data.user} />

  <!-- ═══════════════════════════════════════════════════ HERO -->
  <section class="relative flex min-h-dvh items-center pt-20 pb-16">
    <!-- Aurora background blobs -->
    <div
      class="bg-lavenderIndigo pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full opacity-15 blur-3xl"
    ></div>
    <div
      class="bg-daisyBush pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/4 rounded-full opacity-10 blur-3xl"
    ></div>

    <div
      class="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16"
    >
      <!-- Left: Copy -->
      <div class="flex flex-col items-start gap-6">
        <!-- Eyebrow badge -->
        <span
          class="bg-lavenderIndigo/10 text-lavenderIndigo border-lavenderIndigo/20 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide"
        >
          ✨ Invoice management, simplified
        </span>

        <h1
          class="font-sansserif text-daisyBush text-5xl leading-[1.1] font-black tracking-tight sm:text-6xl lg:text-7xl"
        >
          Get Paid,<br />Faster Than<br />Ever Before.
        </h1>

        <p class="text-stone-600 max-w-lg text-lg leading-relaxed">
          Stop chasing payments. Create professional invoices, track payments,
          and manage clients — all from one beautiful dashboard.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          {#if data.user}
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
            class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm"
          >
            💰
          </div>
          <div>
            <p class="text-xs font-semibold text-green-700">Payment Received</p>
            <p class="text-green-600 text-xs">$4,200.00</p>
          </div>
        </div>

        <!-- Floating badge: Rating -->
        <div
          class="bg-goldenFizz/90 absolute right-0 -bottom-4 z-10 flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-lg lg:-right-4"
        >
          <StarIcon size={16} class="text-daisyBush" />
          <p class="text-daisyBush text-sm font-bold">4.9 Client Rating</p>
        </div>

        <!-- Mock Invoice Card -->
        <div
          class="bg-whisper w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl"
          style="box-shadow: 0 25px 60px oklch(38.26% 0.202 288.17 / 0.18), 0 8px 20px oklch(0% 0 0 / 0.08);"
        >
          <!-- Invoice Header -->
          <div class="bg-daisyBush rounded-t-2xl px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="font-sansserif text-goldenFizz text-xs font-bold uppercase tracking-widest"
                >
                  Dollar Holler
                </p>
                <p class="mt-0.5 text-white/60 text-xs">Invoice</p>
              </div>
              <div class="text-right">
                <p class="text-white/70 text-xs">Invoice No.</p>
                <p class="font-sansserif text-sm font-bold text-white">
                  #INV-0042
                </p>
              </div>
            </div>
          </div>

          <!-- Invoice Body -->
          <div class="p-6">
            <!-- Billing info -->
            <div class="mb-5 flex items-start justify-between">
              <div>
                <p
                  class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  Bill To
                </p>
                <p class="text-daisyBush text-sm font-bold">Acme Design Co.</p>
                <p class="text-xs text-gray-500">sarah@acme.com</p>
              </div>
              <div class="text-right">
                <p
                  class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  Due Date
                </p>
                <p class="text-daisyBush text-sm font-semibold">Mar 30, 2026</p>
              </div>
            </div>

            <!-- Line items -->
            <div class="mb-5 overflow-hidden rounded-xl border border-gray-100">
              <div
                class="grid grid-cols-[1fr_auto] border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                <span>Description</span>
                <span class="text-right">Amount</span>
              </div>
              <div class="divide-y divide-gray-50">
                <div class="grid grid-cols-[1fr_auto] px-4 py-3 text-sm">
                  <div>
                    <p class="font-medium text-gray-800">
                      Brand Identity Package
                    </p>
                    <p class="text-xs text-gray-400">20 hrs × $150/hr</p>
                  </div>
                  <span class="text-daisyBush self-center font-semibold"
                    >$3,000.00</span
                  >
                </div>
                <div class="grid grid-cols-[1fr_auto] px-4 py-3 text-sm">
                  <div>
                    <p class="font-medium text-gray-800">Website Redesign</p>
                    <p class="text-xs text-gray-400">8 hrs × $150/hr</p>
                  </div>
                  <span class="text-daisyBush self-center font-semibold"
                    >$1,200.00</span
                  >
                </div>
              </div>
            </div>

            <!-- Total + Status -->
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  Total
                </p>
                <p class="font-sansserif text-daisyBush text-2xl font-black">
                  $4,200.00
                </p>
              </div>
              <span
                class="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700"
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
    <div class="mx-auto max-w-6xl px-6">
      <!-- Section header -->
      <div class="mb-16 text-center">
        <p
          class="text-lavenderIndigo mb-3 text-sm font-bold uppercase tracking-widest"
        >
          Why Dollar Holler?
        </p>
        <h2
          class="font-sansserif text-daisyBush text-4xl font-black sm:text-5xl"
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
                "flex h-12 w-12 items-center justify-center rounded-xl",
                feature.iconBg,
              ].join(" ")}
            >
              <Icon size={24} class={feature.iconColor} />
            </div>
            <div>
              <h3 class="text-daisyBush mb-2 text-lg font-black">
                {feature.title}
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════ REVIEWS -->
  <section class="bg-daisyBush relative overflow-hidden py-24">
    <!-- Subtle aurora blob -->
    <div
      class="bg-lavenderIndigo pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/20 blur-3xl"
    ></div>

    <div class="relative mx-auto max-w-6xl px-6">
      <!-- Section header -->
      <div class="mb-16 text-center">
        <p
          class="text-goldenFizz mb-3 text-sm font-bold uppercase tracking-widest"
        >
          Real People, Real Results
        </p>
        <h2 class="font-sansserif text-4xl font-black text-white sm:text-5xl">
          What our customers say
        </h2>
        <p class="text-pastelPurple mt-3 text-base">
          Trusted by freelancers and small businesses worldwide
        </p>
      </div>

      <!-- Review Cards -->
      <div class="grid gap-6 sm:grid-cols-2">
        {#each reviews as review, i}
          <div
            class={[
              "flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]",
              review.rotate,
            ].join(" ")}
          >
            <!-- Stars -->
            <div class="flex gap-1">
              {#each { length: 5 } as _}
                <StarIcon size={16} class="text-goldenFizz fill-goldenFizz" />
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
                class="h-11 w-11 rounded-full object-cover ring-2 ring-white/20"
                width="44"
                height="44"
              />
              <div>
                <p class="font-sansserif text-sm font-bold text-white">
                  {review.name}
                </p>
                <p class="text-pastelPurple text-xs">{review.role}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════ CTA -->
  <section class="bg-lavenderIndigo relative overflow-hidden py-28">
    <!-- Aurora blobs -->
    <div
      class="bg-daisyBush pointer-events-none absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
    ></div>
    <div
      class="bg-robinEggBlue pointer-events-none absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full opacity-20 blur-3xl"
    ></div>

    <div class="relative mx-auto max-w-3xl px-6 text-center">
      <h2
        class="font-sansserif text-goldenFizz mb-5 text-5xl font-black leading-tight sm:text-6xl"
      >
        Ready to get paid faster?
      </h2>
      <p class="mb-10 text-lg leading-relaxed text-white/80">
        Join thousands of freelancers and small businesses who use Dollar Holler
        to streamline their invoicing.
      </p>
      <div class="flex flex-col items-center gap-4">
        <Button
          href={resolve("/signup")}
          variant="auth"
          size="lg"
          class="min-w-56 text-lg"
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

  <!-- ══════════════════════════════════════════════ FOOTER -->
  <footer class="bg-daisyBush border-t border-white/10 py-10">
    <div
      class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row"
    >
      <p class="text-pastelPurple text-sm">
        © 2026 Dollar Holler. All rights reserved.
      </p>
      <nav class="flex items-center gap-6 text-sm">
        <a
          href={resolve("/invoices")}
          class="text-pastelPurple hover:text-white transition-colors duration-150"
          >Invoices</a
        >
        <a
          href={resolve("/clients")}
          class="text-pastelPurple hover:text-white transition-colors duration-150"
          >Clients</a
        >
        <a
          href={resolve("/login")}
          class="text-pastelPurple hover:text-white transition-colors duration-150"
          >Login</a
        >
        <a
          href={resolve("/signup")}
          class="text-goldenFizz hover:text-white font-semibold transition-colors duration-150"
          >Sign Up</a
        >
      </nav>
    </div>
  </footer>
</div>
