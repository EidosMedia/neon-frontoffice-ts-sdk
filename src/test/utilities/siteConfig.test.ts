import { describe, expect, test } from '@jest/globals';
import { DEFAULT_REDACTED_SITE_CONFIG_KEYS, redactSiteConfig } from '../../utilities/siteConfig';

const siteConfig = () => ({
  status: 'ENABLED',
  theme: 'sportsarena',
  naturalSearchEnabled: 'true',
  invalidateNextJsTimeoutMs: '10000',
  invalidateNextJsHeaderName: 'invalidate-secret',
  invalidateNextJsHeaderValue: 'secret-value',
});

describe('redactSiteConfig', () => {
  test('removes the default secret keys from every staticAttributes, keeping the rest', () => {
    const sites = [
      { root: { staticAttributes: siteConfig(), items: [{ staticAttributes: siteConfig() }] } },
      { root: { staticAttributes: siteConfig() } },
    ];
    const out = redactSiteConfig(sites);
    expect(out).toBe(sites);
    for (const attrs of [sites[0].root.staticAttributes, sites[0].root.items![0].staticAttributes, sites[1].root.staticAttributes]) {
      expect(attrs).toEqual({
        status: 'ENABLED',
        theme: 'sportsarena',
        naturalSearchEnabled: 'true',
        invalidateNextJsTimeoutMs: '10000',
      });
    }
  });

  test('redacts page data siteNode', () => {
    const page = { model: { data: { id: 'x' } }, siteNode: { staticAttributes: siteConfig() } };
    redactSiteConfig(page);
    expect(page.siteNode.staticAttributes).not.toHaveProperty('invalidateNextJsHeaderValue');
    expect(page.siteNode.staticAttributes).toHaveProperty('theme', 'sportsarena');
  });

  test('redacts page data siteData.custom', () => {
    const page = { siteData: { siteName: 'Web', custom: siteConfig() } };
    redactSiteConfig(page);
    expect(page.siteData.custom).not.toHaveProperty('invalidateNextJsHeaderValue');
    expect(page.siteData.custom).not.toHaveProperty('invalidateNextJsHeaderName');
    expect(page.siteData.custom).toHaveProperty('naturalSearchEnabled', 'true');
  });

  test('keeps everything when exposed (debug)', () => {
    const page = { siteNode: { staticAttributes: siteConfig() } };
    redactSiteConfig(page, { expose: true, keys: DEFAULT_REDACTED_SITE_CONFIG_KEYS });
    expect(page.siteNode.staticAttributes).toEqual(siteConfig());
  });

  test('custom keys replace the defaults; a trailing * matches a prefix', () => {
    const page = { siteNode: { staticAttributes: siteConfig() } };
    redactSiteConfig(page, { expose: false, keys: ['invalidateNextJs*', ' ', '*'] });
    expect(page.siteNode.staticAttributes).toEqual({ status: 'ENABLED', theme: 'sportsarena', naturalSearchEnabled: 'true' });
  });

  test('only touches staticAttributes and survives cycles and non-objects', () => {
    const node: Record<string, unknown> = { attributes: { invalidateNextJsHeaderValue: 'kept' } };
    node.self = node;
    expect(() => redactSiteConfig(node)).not.toThrow();
    expect(node.attributes).toEqual({ invalidateNextJsHeaderValue: 'kept' });
    expect(redactSiteConfig(null)).toBeNull();
    expect(redactSiteConfig('x')).toBe('x');
  });
});
