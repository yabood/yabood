import katex from 'katex';
import { htmlToHast } from 'satteri';
import type { HastContent, HastPluginDefinition, HastVisitorContext } from 'satteri';
import type { Element } from 'hast';

/**
 * Renders the math Sätteri parses (`features.math`) with KaTeX.
 *
 * Sätteri emits math as `code.language-math.math-inline` and
 * `pre > code.language-math.math-display`, and Astro leaves `math` out of
 * syntax highlighting by default, so this plugin sees the raw TeX.
 *
 * KaTeX only renders to an HTML string, so the result is parsed back into hast
 * nodes: the hast phase takes declarative nodes only, and raw HTML cannot be
 * compiled to the JSX that `.mdx` files build into.
 */

const XMLNS_ATTR = / xmlns="[^"]*"/g;

function isMath(node: Element, mode: 'math-inline' | 'math-display'): boolean {
  const classes = node.properties?.className ?? [];
  return classes.includes('language-math') && classes.includes(mode);
}

function render(tex: string, displayMode: boolean): HastContent[] {
  const html = katex
    .renderToString(tex.replace(/\n$/, ''), {
      displayMode,
      throwOnError: false,
      strict: false,
    })
    // KaTeX declares the namespace on the `<math>` and `<svg>` roots it emits.
    // `htmlToHast` records that as an invalid `:xmlns` attribute, and an HTML
    // parser puts both elements in the right namespace on its own.
    .replace(XMLNS_ATTR, '');
  const root = htmlToHast(html, { fragment: true });
  return 'children' in root ? (root.children as HastContent[]) : [];
}

export const katexPlugin: HastPluginDefinition = {
  name: 'katex',
  element: [
    {
      // Inline `$...$`
      filter: ['code'],
      visit(node: Readonly<Element>, ctx: HastVisitorContext) {
        if (!isMath(node, 'math-inline')) return;
        ctx.replaceNode(node, render(ctx.textContent(node), false));
      },
    },
    {
      // Display `$$...$$`, which Sätteri wraps in a `pre`
      filter: ['pre'],
      visit(node: Readonly<Element>, ctx: HastVisitorContext) {
        const code = node.children.find(
          (child): child is Element => child.type === 'element' && child.tagName === 'code'
        );
        if (!code || !isMath(code, 'math-display')) return;
        ctx.replaceNode(node, render(ctx.textContent(code), true));
      },
    },
  ],
};
