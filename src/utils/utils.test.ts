import { describe, it, expect } from 'vitest';
import { fuzzySearch } from '@/utils/utils.ts';


describe('fuzzySearch', () => {
    const data = [
        { title: '火影忍者', platform: 'Bilibili', info: '动画' },
        { title: '海贼王', platform: '腾讯', info: '漫画改' },
        { title: 'One Piece', platform: 'Mikanani', info: 'one-piece' },
        { title: '鬼灭之刃', platform: 'Bilibili', info: '鬼灭' },
        // include some null/undefined fields
        { title: null , platform: 'UNKNOWN', info: undefined  },
    ];

    it('returns original array when query is empty / null / undefined', () => {
        expect(fuzzySearch(data, '')).toEqual(data);
        expect(fuzzySearch(data, null)).toEqual(data);
        expect(fuzzySearch(data, undefined)).toEqual(data);
    });

    it('matches chinese by title', () => {
        const r = fuzzySearch(data, '火影', ['title']);
        expect(r).toHaveLength(1);
        expect(r[0].title).toBe('火影忍者');
    });

    it('matches english ignoring case', () => {
        const r = fuzzySearch(data, 'one', ['title']);
        expect(r).toHaveLength(1);
        expect(r[0].title).toBe('One Piece');

        const r2 = fuzzySearch(data, 'ONE', ['title']);
        expect(r2).toHaveLength(1);
        expect(r2[0].title).toBe('One Piece');
    });

    it('matches platform or title when multiple fields provided', () => {
        const r = fuzzySearch(data, 'bilibili', ['title', 'platform']);
        // two items on Bilibili
        expect(r.map(x => x.platform).filter(Boolean)).toContain('Bilibili');
        expect(r.length).toBeGreaterThanOrEqual(2);
    });

    it('skips null/undefined fields safely', () => {
        const r = fuzzySearch(data, 'UNKNOWN', ['platform']);
        expect(r).toHaveLength(1);
        expect(r[0].platform).toBe('UNKNOWN');
    });

    it('escapes regex special chars correctly', () => {
        const special = [{ name: 'a+b(c)' }, { name: 'normal' }];
        const out = fuzzySearch(special, 'a+b(c)', ['name']);
        expect(out).toHaveLength(1);
        expect(out[0].name).toBe('a+b(c)');
    });

    it('when fields not provided searches across all fields', () => {
        const r = fuzzySearch(data, '动画');
        expect(r).toHaveLength(1);
        expect(r[0].title).toBe('火影忍者');
    });
});

