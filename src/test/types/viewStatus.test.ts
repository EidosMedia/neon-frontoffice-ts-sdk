import { describe, expect, test } from '@jest/globals';
import {
  getSwitchTargetViewStatus,
  normalizeViewStatus,
  parseViewStatus,
  toSiteViewStatus,
  ViewStatus,
} from '../../types/viewStatus';

describe('view status contract', () => {
  test('normalizes case-insensitive values and uses the provided fallback', () => {
    expect(normalizeViewStatus('live')).toBe(ViewStatus.LIVE);
    expect(normalizeViewStatus('Preview')).toBe(ViewStatus.PREVIEW);
    expect(normalizeViewStatus('unknown', ViewStatus.PREVIEW)).toBe(ViewStatus.PREVIEW);
  });

  test('parses valid values without accepting invalid input', () => {
    expect(parseViewStatus('LIVE')).toBe(ViewStatus.LIVE);
    expect(parseViewStatus('preview')).toBe(ViewStatus.PREVIEW);
    expect(parseViewStatus('unknown')).toBeUndefined();
  });

  test('maps canonical values to site values and selects the opposite view', () => {
    expect(toSiteViewStatus(ViewStatus.LIVE)).toBe('live');
    expect(toSiteViewStatus(ViewStatus.PREVIEW)).toBe('preview');
    expect(getSwitchTargetViewStatus(ViewStatus.LIVE)).toBe(ViewStatus.PREVIEW);
    expect(getSwitchTargetViewStatus(ViewStatus.PREVIEW)).toBe(ViewStatus.LIVE);
  });
});