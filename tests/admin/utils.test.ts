import { describe, expect, it } from 'vitest';
import { isDefined } from '../../src/admin/lib/utils';

describe('isDefined', () => {
  it('returns true for non-null values', () => {
    expect(isDefined('foo')).toBe(true);
  });

  it('returns false for nullish values', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});
