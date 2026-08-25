import { describe, expect, it } from 'vitest';
import { buildTableUrlSearch, parseTableUrlQuery } from './useTableUrlQuery';

type Filters = {
  category?: string;
  deletedStatus?: string;
  roleId?: number;
};

const fields = {
  category: { type: 'string' as const },
  deletedStatus: { type: 'string' as const },
  roleId: { type: 'number' as const },
};

describe('parseTableUrlQuery', () => {
  it('parses pagination and typed filters', () => {
    expect(
      parseTableUrlQuery<Filters>(
        '?current=2&pageSize=20&category=Market&deletedStatus=deleted&roleId=2',
        { fields },
      ),
    ).toEqual({
      current: 2,
      pageSize: 20,
      category: 'Market',
      deletedStatus: 'deleted',
      roleId: 2,
    });
  });

  it('falls back to defaults when params missing or invalid', () => {
    expect(parseTableUrlQuery('', { defaultPageSize: 10, fields })).toEqual({
      current: 1,
      pageSize: 10,
    });
  });
});

describe('buildTableUrlSearch', () => {
  it('omits default pagination and falsey filters', () => {
    expect(
      buildTableUrlSearch<Filters>(
        {
          current: 3,
          pageSize: 10,
          category: 'Tech',
          deletedStatus: '',
          roleId: 2,
        },
        { defaultPageSize: 10, fields },
      ),
    ).toBe('?current=3&category=Tech&roleId=2');
  });

  it('returns empty string when everything is default', () => {
    expect(
      buildTableUrlSearch<Filters>(
        { current: 1, pageSize: 10, deletedStatus: '' },
        { defaultPageSize: 10, fields },
      ),
    ).toBe('');
  });
});
