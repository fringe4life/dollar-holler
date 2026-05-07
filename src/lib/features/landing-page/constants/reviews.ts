import { css } from "styled-system/css";
export const reviews = [
  {
    quote:
      "Dollar Holler cut my invoicing time in half. I used to spend hours on spreadsheets — now it takes minutes.",
    name: "Sarah Chen",
    role: "Freelance Designer",
    avatar: "https://i.pravatar.cc/64?u=sarah-chen-dh",
    rotate: css({ rotate: "-1deg" }),
  },
  {
    quote:
      "Finally an invoicing tool that doesn't make me want to pull my hair out. Clean, fast, and reliable.",
    name: "Marcus Johnson",
    role: "Web Developer",
    avatar: "https://i.pravatar.cc/64?u=marcus-johnson-dh",
    rotate: css({ rotate: "1deg" }),
  },
  {
    quote:
      "The client management features alone are worth it. I can see everything at a glance — love it.",
    name: "Emily Rodriguez",
    role: "Marketing Consultant",
    avatar: "https://i.pravatar.cc/64?u=emily-rodriguez-dh",
    rotate: css({ rotate: "1deg" }),
  },
  {
    quote:
      "I got paid 3x faster after switching. My clients love the professional look of the invoices.",
    name: "James Wu",
    role: "Videographer",
    avatar: "https://i.pravatar.cc/64?u=james-wu-dh",
    rotate: css({ rotate: "-1deg" }),
  },
] as const;
