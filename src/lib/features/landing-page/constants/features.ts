import {
  FileTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon,
} from "@lucide/svelte";
import { css } from "styled-system/css";
export const features = [
  {
    accent: css({ backgroundColor: "goldenFizz/15" }),
    border: css({ borderColor: "goldenFizz/20" }),
    description:
      "Create and send professional invoices in under 60 seconds. Templates, line items, taxes — all handled.",
    icon: ZapIcon,
    iconBg: css({ backgroundColor: "goldenFizz/30" }),
    iconColor: css({ color: "goldenFizz" }),
    title: "Lightning Fast Invoicing",
  },
  {
    accent: css({ backgroundColor: "robinEggBlue/15" }),
    border: css({ borderColor: "robinEggBlue/20" }),
    description:
      "Your data is encrypted end-to-end. Secure infrastructure you can trust with your business.",
    icon: ShieldCheckIcon,
    iconBg: css({ backgroundColor: "robinEggBlue/30" }),
    iconColor: css({ color: "robinEggBlue" }),
    title: "Bank-Grade Security",
  },
  {
    accent: css({ backgroundColor: "caribbeanGreen/15" }),
    border: css({ borderColor: "caribbeanGreen/20" }),
    description:
      "Keep all client details, history, and contacts in one place. Never lose track of who owes what.",
    icon: UsersIcon,
    iconBg: css({ backgroundColor: "caribbeanGreen/30" }),
    iconColor: css({ color: "caribbeanGreen" }),
    title: "Manage Your Clients",
  },
  {
    accent: css({ backgroundColor: "lavenderIndigo/10" }),
    border: css({ borderColor: "lavenderIndigo/20" }),
    description:
      "Polished, branded invoices that impress clients and make your business look its best.",
    icon: FileTextIcon,
    iconBg: css({ backgroundColor: "lavenderIndigo/20" }),
    iconColor: css({ color: "lavenderIndigo" }),
    title: "Professional Invoices",
  },
] as const;
