import {
  FileTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon,
} from "@lucide/svelte";
import { css } from "#styled-system/css/index.js";
export const features = [
  {
    accent: css({ backgroundColor: "featureFast/15" }),
    border: css({ borderColor: "featureFast/20" }),
    description:
      "Create and send professional invoices in under 60 seconds. Templates, line items, taxes — all handled.",
    icon: ZapIcon,
    iconBg: css({ backgroundColor: "featureFast/30" }),
    iconColor: css({ color: "featureFast" }),
    title: "Lightning Fast Invoicing",
  },
  {
    accent: css({ backgroundColor: "featureInfo/15" }),
    border: css({ borderColor: "featureInfo/20" }),
    description:
      "Your data is encrypted end-to-end. Secure infrastructure you can trust with your business.",
    icon: ShieldCheckIcon,
    iconBg: css({ backgroundColor: "featureInfo/30" }),
    iconColor: css({ color: "featureInfo" }),
    title: "Bank-Grade Security",
  },
  {
    accent: css({ backgroundColor: "featureSuccess/15" }),
    border: css({ borderColor: "featureSuccess/20" }),
    description:
      "Keep all client details, history, and contacts in one place. Never lose track of who owes what.",
    icon: UsersIcon,
    iconBg: css({ backgroundColor: "featureSuccess/30" }),
    iconColor: css({ color: "featureSuccess" }),
    title: "Manage Your Clients",
  },
  {
    accent: css({ backgroundColor: "featurePrimary/10" }),
    border: css({ borderColor: "featurePrimary/20" }),
    description:
      "Polished, branded invoices that impress clients and make your business look its best.",
    icon: FileTextIcon,
    iconBg: css({ backgroundColor: "featurePrimary/20" }),
    iconColor: css({ color: "featurePrimary" }),
    title: "Professional Invoices",
  },
] as const;
