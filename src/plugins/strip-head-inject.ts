/**
 * Strips the dead `"use astro:head-inject"` directive from the modules Astro's
 * `astro:content-asset-propagation` plugin generates for `?astroPropagatedAssets`.
 *
 * Rolldown warns `MODULE_LEVEL_DIRECTIVE` once per content file per environment
 * because it cannot know whether a custom module-level directive survives
 * bundling. Nothing reads this one: Astro emits it in a single template literal
 * (`astro/dist/content/vite-plugin-content-assets.js`) and detects propagation
 * through the `__astroPropagation` property on the module's default export
 * instead (`astro/dist/content/runtime.js`). The directive is a leftover from
 * the older head-propagation design, so dropping it removes the warning without
 * changing what the module means.
 *
 * Remove this plugin once Astro stops emitting the directive.
 */

const PROPAGATED_ASSETS = /(?:\?|&)astroPropagatedAssets(?:&|=|$)/;
const HEAD_INJECT_DIRECTIVE = /^\s*(["'])use astro:head-inject\1;?/;

export const stripHeadInjectDirective = {
  name: 'strip-astro-head-inject-directive',
  // Astro generates the module in an `enforce: 'pre'` transform, so this has to
  // run after it.
  enforce: 'post' as const,
  transform: {
    filter: { id: PROPAGATED_ASSETS },
    handler(code: string) {
      if (!HEAD_INJECT_DIRECTIVE.test(code)) return;
      return {
        code: code.replace(HEAD_INJECT_DIRECTIVE, ''),
        // The module is generated, so it has no meaningful source map; Astro
        // hands back an empty one for the same reason.
        map: { mappings: '' },
      };
    },
  },
};
