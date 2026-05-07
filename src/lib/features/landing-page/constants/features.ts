import {
  FileTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon,
} from "@lucide/svelte";
import { css } from "styled-system/css";
export const features = [
  {
    icon: ZapIcon,
    title: "Lightning Fast Invoicing",
    description:
      "Create and send professional invoices in under 60 seconds. Templates, line items, taxes — all handled.",
    accent: css({ backgroundColor: "goldenFizz/15" }),
    iconBg: css({ backgroundColor: "goldenFizz/30" }),
    iconColor: css({ color: "goldenFizz" }),
    border: css({ borderColor: "goldenFizz/20" }),
  },
  {
    icon: ShieldCheckIcon,
    title: "Bank-Grade Security",
    description:
      "Your data is encrypted end-to-end. Secure infrastructure you can trust with your business.",
    accent: css({ backgroundColor: "robinEggBlue/15" }),
    iconBg: css({ backgroundColor: "robinEggBlue/30" }),
    iconColor: css({ color: "robinEggBlue" }),
    border: css({ borderColor: "robinEggBlue/20" }),
  },
  {
    icon: UsersIcon,
    title: "Manage Your Clients",
    description:
      "Keep all client details, history, and contacts in one place. Never lose track of who owes what.",
    accent: css({ backgroundColor: "caribbeanGreen/15" }),
    iconBg: css({ backgroundColor: "caribbeanGreen/30" }),
    iconColor: css({ color: "caribbeanGreen" }),
    border: css({ borderColor: "caribbeanGreen/20" }),
  },
  {
    icon: FileTextIcon,
    title: "Professional Invoices",
    description:
      "Polished, branded invoices that impress clients and make your business look its best.",
    accent: css({ backgroundColor: "lavenderIndigo/10" }),
    iconBg: css({ backgroundColor: "lavenderIndigo/20" }),
    iconColor: css({ color: "lavenderIndigo" }),
    border: css({ borderColor: "lavenderIndigo/20" }),
  },
] as const;
