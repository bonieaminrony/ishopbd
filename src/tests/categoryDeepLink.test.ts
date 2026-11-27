import { describe, it, expect } from 'vitest';
import { resolveCategoryFromLocation, getCategorySlugsFromLocation } from '../utils/helpers';

const products = [
  { id: '1', category: 'Winter Collection', subcategory: 'Fashionable Koti' },
  { id: '2', category: 'Winter Collection', subcategory: 'Jackets' },
  { id: '3', category: 'Gadgets' },
];

describe('category links (ads) open the category on the first render', () => {
  it('reads /category/<cat>/<sub>, /c/<cat> and ?category=', () => {
    expect(getCategorySlugsFromLocation('/category/winter-collection/jackets', '')).toEqual({ categorySlug: 'winter-collection', subcategorySlug: 'jackets' });
    expect(getCategorySlugsFromLocation('/c/gadgets', '')).toEqual({ categorySlug: 'gadgets', subcategorySlug: '' });
    expect(getCategorySlugsFromLocation('/', '?category=Gadgets&sub=Power')).toEqual({ categorySlug: 'Gadgets', subcategorySlug: 'Power' });
    expect(getCategorySlugsFromLocation('/p/some-product', '')).toBeNull();
  });

  it('works for a first-time visitor (no saved category list) using the products on the page', () => {
    expect(resolveCategoryFromLocation('/category/winter-collection/fashionable-koti', '', [], products)).toEqual({
      category: 'Winter Collection',
      subcategory: 'Fashionable Koti',
    });
    expect(resolveCategoryFromLocation('/category/gadgets', '', [], products)).toEqual({ category: 'Gadgets', subcategory: 'all' });
  });

  it('uses the saved category list when there is one, and ignores unknown categories', () => {
    const cats = [{ name: 'Winter Collection', subcategories: ['Fashionable Koti', 'Jackets'] }];
    expect(resolveCategoryFromLocation('/category/winter-collection/jackets', '', cats, [])).toEqual({ category: 'Winter Collection', subcategory: 'Jackets' });
    expect(resolveCategoryFromLocation('/category/no-such-thing', '', cats, products)).toBeNull();
    expect(resolveCategoryFromLocation('/', '', cats, products)).toBeNull();
  });
});
