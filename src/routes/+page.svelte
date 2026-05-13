<script lang="ts">
  import { StarIcon } from "@lucide/svelte";
  import { css, cx } from "styled-system/css";
  import {
    between,
    center,
    circle,
    flex,
    grid,
    hstack,
    stack,
    vstack,
    wrap,
  } from "styled-system/patterns";
  import { resolve } from "$app/paths";
  import AuroraBlob from "$features/landing-page/components/AuroraBlob.svelte";
  import Features from "$features/landing-page/components/Features.svelte";
  import LandingNav from "$features/landing-page/components/LandingNav.svelte";
  import Reviews from "$features/landing-page/components/Reviews.svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Dollar Holler — Invoice Management Made Simple</title>
  <meta
    name="description"
    content="Create professional invoices, track payments, and manage clients — all from one beautiful dashboard."
  >
</svelte:head>
<main
  class={css({
    paddingInline: 4,
    paddingBlockStart: { base: 4, md: 10 },
  })}
>
  <LandingNav user={data?.user} />
  <!-- ═══════════════════════════════════════════════════ HERO -->
  <section
    class={hstack({
      position: "relative",
      paddingBlockStart: 20,
      paddingBlockEnd: 16,
    })}
  >
    <!-- Aurora background blobs -->
    <AuroraBlob
      className={cx(css({ insetInlineStart: 0, insetBlockStart: 0, translate: "25%", opacity: "0.1", backgroundColor: "lavenderIndigo" }),circle({size: 600}))}
    />
    <AuroraBlob
      className={cx(css({ insetInlineStart: 0, insetBlockEnd: 0, translate: "33%", opacity: "0.1", backgroundColor: "daisyBush" }), circle({size: 400}))}
    />
    <div
      class={grid({
        columns: { base: 1, lg: 2 },
        gap: { base: 12, lg: 16 },
        alignItems: "center",
        position: "relative",
        marginInline: "auto",
        paddingInline: 6,
        inlineSize: "full",
        maxInlineSize: "6xl",
        })}
    >
      <!-- Left: Copy -->
      <div class={stack({ gap: 6, align: "start" })}>
        <!-- Eyebrow badge -->
        <span
          class={css({
            display: "inline-flex",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "lavenderIndigo/20",
            backgroundColor: "lavenderIndigo/10",
            color: "lavenderIndigo",
            alignItems: "center",
            gap: 2,
            rounded: "full",
            fontWeight: "semibold",
            paddingInline: 4,
            paddingBlock: 1.5,
          })}
        >
          ✨ Invoice management, simplified
        </span>

        <h1
          class={css({ fontFamily: "sansserif", lineHeight: "1.1", fontWeight: "black", letterSpacing: "tight", fontSize: {base:"5xl", sm: "6xl", lg: "7xl" }, color: "daisyBush" })}
        >
          Get Paid,<br>Faster Than<br>Ever Before.
        </h1>
        <p
          class={css({
            fontSize: "lg",
            lineHeight: "relaxed",
            color: "stone.600",
            maxInlineSize: "lg",
          })}
        >
          Stop chasing payments. Create professional invoices, track payments,
          and manage clients — all from one beautiful dashboard.
        </p>
        <div class={wrap({ align: "center", gap: 3 })}>
          {#if data?.user}
            <Button href={resolve("/invoices")} size="lg">
              Go to Dashboard →
            </Button>
          {:else}
            <Button href={resolve("/signup")} size="lg">
              Start for Free →
            </Button>
            <Button href={resolve("/login")} size="lg"> Log in </Button>
          {/if}
        </div>
        <p
          class={css({
            fontSize: "sm",
            color: "stone.400",
          })}
        >
          No credit card required · Cancel anytime
        </p>
      </div>

      <!-- Right: Mock Invoice Card -->
      <div class={flex({justify: "center", position: "relative" })}>
        <!-- Floating badge: Rating -->
        <div
          class={hstack({
              gap: 2,
              position: "absolute",
              insetInline:"auto",
              insetBlockEnd: -4,
              zIndex: 10,
              rounded: "xl",
              shadow: "lg",
              paddingInline: 4,
              paddingBlock: 2.5,
              backgroundColor: "goldenFizz/90",
              }
          )}
        >
          <StarIcon size={16} class={css({ color: "daisyBush" })} />
          <p
            class={css({
              fontSize: "sm",
              fontWeight: "bold",
              color: "daisyBush",
            })}
          >
            4.9 Client Rating
          </p>
        </div>

        <!-- Mock Invoice Card -->
        <div
          class={css({ backgroundColor: "whisper", position: "relative", rounded: "2xl", borderWidth: 1, borderColor: "gray.200", shadow: "2xl", inlineSize: "full", maxInlineSize: "md" })}
          style="box-shadow: 0 25px 60px oklch(38.26% 0.202 288.17 / 0.18), 0 8px 20px oklch(0% 0 0 / 0.08);"
        >
          <!-- Floating badge: Payment -->
          <div
            class={flex({ align:"center", gap: 2, position: "absolute", insetInlineStart: "50%", insetBlockStart: -6, zIndex: 10, translate: "-50% 0" , rounded: "xl", backgroundColor: "white", paddingInline: 4, paddingBlock: 2.5, shadow: "lg" })}
          >
            <div
              class={cx(circle({size: 8}), center({ backgroundColor: "green.100", fontSize: "sm" }) )}
            >
              💰
            </div>
            <div>
              <p
                class={css({
                  fontSize: "xs",
                  fontWeight: "semibold",
                  color: "green.700",
                })}
              >
                Payment Received
              </p>
              <p
                class={css({
                  fontSize: "xs",
                  color: "green.600",
                })}
              >
                $4,200.00
              </p>
            </div>
          </div>
          <!-- Invoice Header -->
          <div
            class={css({
              backgroundColor: "daisyBush",
              roundedTop: "2xl",
              paddingInline: 6,
              paddingBlock: 4,
            })}
          >
            <div class={between()}>
              <div>
                <p
                  class={css({ fontFamily: "sansserif", fontSize: "xs", fontWeight: "bold", letterSpacing: "widest", textTransform: "uppercase", color: "goldenFizz" })}
                >
                  Dollar Holler
                </p>
                <p
                  class={css({
                    marginBlockStart: 0.5,
                    fontSize: "xs",
                    color: "white/60",
                  })}
                >
                  Invoice
                </p>
              </div>
              <div class={css({ textAlign: "right" })}>
                <p class={css({ fontSize: "xs", color: "white/70" })}>
                  Invoice No.
                </p>
                <p
                  class={css({
                    fontFamily: "sansserif",
                    fontSize: "sm",
                    fontWeight: "bold",
                    color: "white",
                  })}
                >
                  #INV-0042
                </p>
              </div>
            </div>
          </div>

          <!-- Invoice Body -->
          <div class={css({ paddingInline: 6, paddingBlock: 6 })}>
            <!-- Billing info -->
            <div
              class={hstack({
                marginBlockEnd: 5,
                alignItems: "start",
                justifyContent: "space-between",
              })}
            >
              <div>
                <p
                  class={css({
                    marginBlockEnd: 1,
                    fontSize: "xs",
                    fontWeight: "semibold",
                    letterSpacing: "wide",
                    color: "gray.400",
                    textTransform: "uppercase",
                  })}
                >
                  Bill To
                </p>
                <p
                  class={css({
                    fontFamily: "sansserif",
                    fontSize: "sm",
                    fontWeight: "bold",
                    color: "daisyBush",
                  })}
                >
                  Acme Design Co.
                </p>
                <p class={css({ fontSize: "xs", color: "gray.500" })}>
                  sarah@acme.com
                </p>
              </div>
              <div class={css({ textAlign: "right" })}>
                <p
                  class={css({
                    marginBlockEnd: 1,
                    fontSize: "xs",
                    fontWeight: "semibold",
                    letterSpacing: "wide",
                    color: "gray.400",
                    textTransform: "uppercase",
                  })}
                >
                  Due Date
                </p>
                <p
                  class={css({
                    color: "daisyBush",
                    fontSize: "sm",
                    fontWeight: "semibold",
                  })}
                >
                  Mar 30, 2026
                </p>
              </div>
            </div>

            <!-- Line items -->
            <div
              class={css({
                marginBlockEnd: 5,
                overflow: "hidden",
                rounded: "xl",
                border: "gray.100",
              })}
            >
              <div
                class={grid({
                  gridTemplateColumns: "1fr auto",
                  color: "gray.400",
                  borderBottomWidth: 1,
                  borderBottomColor: "gray.100",
                  backgroundColor: "gray.50",
                  paddingInline: 4,
                  paddingBlock: 2,
                  fontSize: "xs",
                  fontWeight: "semibold",
                  textTransform: "uppercase",
                  letterSpacing: "wide"
                })}
              >
                <span>Description</span>
                <span class={css({ textAlign: "right" })}>Amount</span>
              </div>
              <div class={css({ divideY: "gray.50" })}>
                <div
                  class={grid({
                  gridTemplateColumns: "1fr auto",
                  paddingInline: 4,
                  paddingBlock: 3,
                  fontSize: "sm",
                })}
                >
                  <div>
                    <p class={css({ fontSize: "sm", color: "gray.800" })}>
                      Brand Identity Package
                    </p>
                    <p class={css({ fontSize: "xs", color: "gray.400" })}>
                      20 hrs × $150/hr
                    </p>
                  </div>
                  <span
                    class={css({ color: "daisyBush", alignSelf: "center", fontWeight: "semibold" })}
                    >$3,000.00</span
                  >
                </div>
                <div
                  class={grid({
                  gridTemplateColumns: "1fr auto",
                  paddingInline: 4,
                  paddingBlock: 3,
                  fontSize: "sm",
                })}
                >
                  <div>
                    <p class={css({fontWeight: "medium", color: "gray.800" })}>
                      Website Redesign
                    </p>
                    <p class={css({ fontSize: "xs", color: "gray.400" })}>
                      8 hrs × $150/hr
                    </p>
                  </div>
                  <span
                    class={css({ color: "daisyBush", alignSelf: "center", fontWeight: "semibold" })}
                    >$1,200.00</span
                  >
                </div>
              </div>
            </div>

            <!-- Total + Status -->
            <div class={between()}>
              <div>
                <p
                  class={css({
                    fontSize: "xs",
                    fontWeight: "semibold",
                    letterSpacing: "wide",
                    color: "gray.400",
                    textTransform: "uppercase",
                  })}
                >
                  Total
                </p>
                <p
                  class={css({
                    fontFamily: "sansserif",
                    color: "daisyBush",
                    fontSize: "2xl",
                    fontWeight: "black",
                  })}
                >
                  $4,200.00
                </p>
              </div>
              <span
                class={css({
                  rounded: "full",
                  backgroundColor: "green.100",
                  paddingInline: 4,
                  paddingBlock: 1.5,
                  fontSize: "xs",
                  fontWeight: "bold",
                  letterSpacing: "widest",
                  color: "green.700",
                  textTransform: "uppercase",
                })}
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
  <section class={css({ backgroundColor: "white", paddingBlock: 24 })}>
    <div
      class={css({
        marginInline: "auto",
        paddingInline: 6,
        maxInlineSize: "6xl",
      })}
    >
      <!-- Section header -->
      <div class={css({ marginBlockEnd: 16, textAlign: "center" })}>
        <p
          class={css({
            color: "lavenderIndigo",
            marginBlockEnd: 3,
            fontSize: "sm",
            fontWeight: "bold",
            letterSpacing: "widest",
            textTransform: "uppercase",
          })}
        >
          Why Dollar Holler?
        </p>
        <h2
          class={css({
            fontFamily: "sansserif",
            color: "daisyBush",
            fontSize: { base: "4xl", sm: "5xl" },
            fontWeight: "black",
          })}
        >
          Everything you need<br
            class={css({ display: { base: "none", sm: "block" } })}
          >
          to get paid on time
        </h2>
      </div>

      <!-- Feature Cards Grid -->
      <Features />
    </div>
  </section>

  <!-- ══════════════════════════════════════════════ REVIEWS -->
  <section
    class={css({ backgroundColor: "daisyBush", position: "relative", overflow: "hidden", paddingBlock: 24 })}
  >
    <!-- Subtle aurora blob -->
    <AuroraBlob
      className={cx(circle({size: 96}),css({ insetInlineEnd: 0, insetBlockEnd: 0, opacity: "0.1", backgroundColor: "lavenderIndigo"  }))}
    />
    <AuroraBlob
      className={cx(circle({size: 64}),css({ insetInlineStart: 0, insetBlockEnd: 0, backgroundColor: "black/20", opacity: "0.1"  }))}
    />

    <div
      class={css({ position: "relative", marginInline: "auto", paddingInline: 6, maxInlineSize: "6xl" })}
    >
      <!-- Section header -->
      <div class={css({ marginBlockEnd: 16, textAlign: "center" })}>
        <p
          class={css({ color: "goldenFizz", marginBlockEnd: 3, fontSize: "sm", fontWeight: "bold", letterSpacing: "widest", textTransform: "uppercase" })}
        >
          Real People, Real Results
        </p>
        <h2
          class={css({ fontFamily: "sansserif", fontSize: {base:"4xl", sm: "5xl"}, fontWeight: "black", color: "white" })}
        >
          What our customers say
        </h2>
        <p class={css({ color: "pastelPurple", marginBlockStart: 3 })}>
          Trusted by freelancers and small businesses worldwide
        </p>
      </div>

      <!-- Review Cards -->
      <Reviews />
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════ CTA -->
  <section
    class={css({ backgroundColor: "lavenderIndigo", position: "relative", overflow: "hidden", paddingBlock: 28 })}
  >
    <!-- Aurora blobs -->
    <AuroraBlob
      className={cx(circle({size: 96}), css({ insetInlineStart: "1/2", insetBlockStart: 0, translate: "-1/2", backgroundColor: "daisyBush", opacity: "0.4" }))}
    />
    <AuroraBlob
      className={cx(circle({size: 72}), css({ insetInlineEnd: 0, insetBlockEnd: 0, translate: "1/3", backgroundColor: "robinEggBlue", opacity: "0.2" }))}
    />

    <div
      class={css({
        position: "relative",
        marginInline: "auto",
        paddingInline: 6,
        textAlign: "center",
        maxInlineSize: "3xl"
      })}
    >
      <h2
        class={css({
          fontFamily: "sansserif",
          color: "goldenFizz",
          marginBlockEnd: 5,
          letterSpacing: "tight",
          fontWeight: "black",
          fontSize: { base: "5xl", sm: "6xl" },
        })}
      >
        Ready to get paid faster?
      </h2>
      <p
        class={css({
          marginBlockEnd: 10,
          fontSize: "lg",
          letterSpacing: "relaxed",
          color: "white/80",
        })}
      >
        Join thousands of freelancers and small businesses who use Dollar Holler
        to streamline their invoicing.
      </p>
      <div class={vstack({ gap: 4 })}>
        <Button
          href={resolve("/signup")}
          variant="auth"
          size="lg"
          class={css({ fontSize: "lg", minInlineSize: 56 })}
        >
          Create Free Account
        </Button>
        <a
          href={resolve("/login")}
          class={css({
            color: {base:"white/60", _hover: "white/90"},
            fontSize: "sm",
            textDecoration: "underline",
            textUnderlineOffset: 4,
            transitionProperty: "colors",
            transitionDuration: "normal",
          })}
        >
          Already have an account? Log in
        </a>
      </div>
    </div>
  </section>
</main>
<!-- ══════════════════════════════════════════════ FOOTER -->
<footer
  class={css({ backgroundColor: "daisyBush", borderTopWidth: 1, borderColor: "white/10", paddingBlock: 10 })}
>
  <div
    class={between({
      direction: { base: "column", sm: "row" },
      gap: 4,
      maxInlineSize: "6xl",
      paddingInline: 6,
      marginInline: "auto", })}
  >
    <p class={css({ color: "pastelPurple", fontSize: "sm" })}>
      © 2026 Dollar Holler. All rights reserved.
    </p>
    <nav
      class={hstack({
          gap: 6,
          fontSize: "sm"
        })}
    >
      <a
        href={resolve("/invoices")}
        class={css({
          color: {base:"pastelPurple", _hover: "white"},
          transitionProperty: "colors",
          transitionDuration: "normal",
        })}
        >Invoices</a
      >
      <a
        href={resolve("/clients")}
        class={css({
          color: {base:"pastelPurple", _hover: "white"},
          transitionProperty: "colors",
          transitionDuration: "normal",
        })}
        >Clients</a
      >
      <a
        href={resolve("/login")}
        class={css({
          color: { base:"pastelPurple", _hover: "white" },
          transitionProperty: "colors",
          transitionDuration: "normal",
        })}
        >Login</a
      >
      <a
        href={resolve("/signup")}
        class={css({
          color: { base:"goldenFizz", _hover: "white" },
          fontWeight: "semibold",
          transitionProperty: "colors",
          transitionDuration: "normal",
        })}
        >Sign Up</a
      >
    </nav>
  </div>
</footer>
