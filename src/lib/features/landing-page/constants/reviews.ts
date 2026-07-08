import { css } from "styled-system/css";
export const reviews = [
  {
    avatar: "https://i.pravatar.cc/64?u=sarah-chen-dh",
    name: "Sarah Chen",
    quote:
      "Dollar Holler cut my invoicing time in half. I used to spend hours on spreadsheets — now it takes minutes.",
    role: "Freelance Designer",
    rotate: css({ rotate: "-1deg" }),
  },
  {
    avatar: "https://i.pravatar.cc/64?u=marcus-johnson-dh",
    name: "Marcus Johnson",
    quote:
      "Finally an invoicing tool that doesn't make me want to pull my hair out. Clean, fast, and reliable.",
    role: "Web Developer",
    rotate: css({ rotate: "1deg" }),
  },
  {
    avatar: "https://i.pravatar.cc/64?u=emily-rodriguez-dh",
    name: "Emily Rodriguez",
    quote:
      "The client management features alone are worth it. I can see everything at a glance — love it.",
    role: "Marketing Consultant",
    rotate: css({ rotate: "1deg" }),
  },
  {
    avatar: "https://i.pravatar.cc/64?u=james-wu-dh",
    name: "James Wu",
    quote:
      "I got paid 3x faster after switching. My clients love the professional look of the invoices.",
    role: "Videographer",
    rotate: css({ rotate: "-1deg" }),
  },
] as const;
