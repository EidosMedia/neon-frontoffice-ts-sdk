/*
 * Copyright © 2024 Eidosmedia S.p.a. All rights reserved.
 * Licensed under the terms of the Eidosmedia Software License Agreement.
 * See LICENSE file in project root for terms and conditions.
 */

/**
 * Site configuration values (custom attributes set on the site in Neon) arrive as `staticAttributes`
 * on the site root and on every page's `siteNode`, and again as the page's `siteData.custom`. Some of
 * them are secrets meant for server-to-server calls (the cache invalidation header), so they are
 * removed before the data can reach a browser.
 */

/** Keys removed by default. */
export const DEFAULT_REDACTED_SITE_CONFIG_KEYS: readonly string[] = [
  'invalidateNextJsHeaderName',
  'invalidateNextJsHeaderValue',
];

export type SiteConfigRedaction = {
  /** `true` keeps every value (debugging only: secrets then reach rendered pages). */
  expose: boolean;
  /** Exact key names; an entry ending with `*` matches every key starting with the rest. */
  keys: readonly string[];
};

export const DEFAULT_SITE_CONFIG_REDACTION: SiteConfigRedaction = {
  expose: false,
  keys: DEFAULT_REDACTED_SITE_CONFIG_KEYS,
};

function matcher(keys: readonly string[]): (key: string) => boolean {
  const exact = new Set<string>();
  const prefixes: string[] = [];
  for (const raw of keys) {
    const key = raw.trim();
    if (!key) continue;
    if (key.endsWith('*')) {
      const prefix = key.slice(0, -1);
      if (prefix) prefixes.push(prefix);
    } else {
      exact.add(key);
    }
  }
  return key => exact.has(key) || prefixes.some(prefix => key.startsWith(prefix));
}

const MAX_DEPTH = 64;

/**
 * Removes the configured keys from every `staticAttributes` object and every `siteData.custom` object
 * found in `value` (any depth), in place, and returns `value`. A no-op when `policy.expose` is true or
 * no keys are configured.
 */
export function redactSiteConfig<T>(value: T, policy: SiteConfigRedaction = DEFAULT_SITE_CONFIG_REDACTION): T {
  if (policy.expose || policy.keys.length === 0) return value;
  const isRedacted = matcher(policy.keys);
  const seen = new WeakSet<object>();
  const strip = (attrs: unknown) => {
    if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return;
    for (const key of Object.keys(attrs)) {
      if (isRedacted(key)) delete (attrs as Record<string, unknown>)[key];
    }
  };
  const walk = (node: unknown, depth: number) => {
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const record = node as Record<string, unknown>;
    strip(record.staticAttributes);
    // Page data repeats the site configuration in `siteData.custom`.
    const siteData = record.siteData;
    if (siteData && typeof siteData === 'object') strip((siteData as Record<string, unknown>).custom);
    for (const child of Object.values(record)) walk(child, depth + 1);
  };
  walk(value, 0);
  return value;
}
