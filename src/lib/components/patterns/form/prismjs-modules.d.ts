declare module "prismjs/components/prism-core.js" {
  type Grammar = object;

  export interface PrismToken {
    alias?: string | string[];
    content: string | PrismToken | Array<string | PrismToken>;
    type: string;
  }

  export type PrismTokenStream = Array<string | PrismToken>;

  const Prism: {
    languages: Record<string, Grammar | undefined>;
    tokenize: (text: string, grammar: Grammar) => PrismTokenStream;
  };

  export default Prism;
}

declare module "prismjs/components/prism-markup.js";
declare module "prismjs/components/prism-markdown.js";
