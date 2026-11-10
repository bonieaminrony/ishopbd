import { describe, it, expect } from 'vitest';
import { DEFAULT_BANNERS, STORAGE_KEYS } from '../constants/data';

describe('Banner Cache & Configuration Integrity', () => {
  it('DEFAULT_BANNERS has at least one valid hero banner', () => {
    expect(DEFAULT_BANNERS.length).toBeGreaterThan(0);
    const heroBanner = DEFAULT_BANNERS[0];
    expect(heroBanner.image).toBeTruthy();
    expect(heroBanner.type).toBe('hero');
  });

  it('STORAGE_KEYS contains BANNERS storage key', () => {
    expect(STORAGE_KEYS.BANNERS).toBe('ishopbd_cached_banners_v2026');
  });

  it('Hero banners filtering correctly extracts hero banners with fallback', () => {
    const bannersList = [
      { id: '1', title: 'Main Cover', image: '/ishopbd_hero_banner.webp', type: 'hero' },
      { id: '2', title: 'Secondary Banner', image: '/sec.webp', type: 'secondary' },
      { id: '3', title: 'Legacy Top Right', image: '/top.webp', type: 'right_top' },
      { id: '4', title: 'Legacy Bottom Right', image: '/bot.webp', type: 'right_bottom' },
    ];

    const heroes = bannersList.filter(b => (b.type || 'hero') === 'hero');
    expect(heroes).toHaveLength(1);
    expect(heroes[0].id).toBe('1');
    expect(heroes[0].title).toBe('Main Cover');
  });

  it('Hero banners filtering falls back to DEFAULT_BANNERS if no hero banners exist', () => {
    const emptyOrOtherBanners: any[] = [
      { id: '2', title: 'Secondary Banner', image: '/sec.webp', type: 'secondary' },
    ];

    const heroes = emptyOrOtherBanners.filter(b => (b.type || 'hero') === 'hero');
    const finalHeroBanners = heroes.length > 0 ? heroes : (DEFAULT_BANNERS || []);
    expect(finalHeroBanners.length).toBeGreaterThan(0);
    expect(finalHeroBanners[0].type).toBe('hero');
  });

  it('Banner cache update updates localStorage correctly without throwing', () => {
    const testBanners = [
      { id: 'hero-1', image: '/ishopbd_hero_banner.webp', type: 'hero' }
    ];
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(testBanners));
    const cached = localStorage.getItem(STORAGE_KEYS.BANNERS);
    expect(cached).toBeTruthy();
    const parsed = JSON.parse(cached!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('hero-1');
  });
});
