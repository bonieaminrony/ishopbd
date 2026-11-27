import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const updateDoc = vi.fn().mockResolvedValue(undefined);
vi.mock('firebase/firestore', () => ({
  doc: (_db: any, col: string, id: string) => ({ path: `${col}/${id}` }),
  updateDoc: (...args: any[]) => updateDoc(...args),
  arrayUnion: (v: any) => ({ union: v }),
  arrayRemove: (v: any) => ({ remove: v }),
}));
vi.mock('../lib/firebase', () => ({ db: {} }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';

const categories = [
  { id: 'c1', name: 'Winter Collection', subcategories: ['Jackets', 'Fashionable Koti'] },
  { id: 'c2', name: 'Gadgets', subcategories: [] },
];
const products = [
  { id: 'p1', category: 'Winter Collection', subcategory: 'Jackets' },
  { id: 'p2', category: 'winter collection', subcategory: 'jackets' },
  { id: 'p3', category: 'Winter Collection', subcategory: 'Fashionable Koti' },
  { id: 'p4', category: 'Gadgets' },
  { id: 'p5', category: 'Gadgets', deleted: true },
];

const renderTab = () =>
  render(
    <AdminCategoriesTab
      categories={categories}
      products={products}
      editingCategory={null}
      setEditingCategory={vi.fn()}
      saveCategory={vi.fn()}
      copyCategoryLink={vi.fn()}
      deleteCategory={vi.fn()}
      deletingCatId={null}
    />,
  );

beforeEach(() => updateDoc.mockClear());

describe('Categories page', () => {
  it('shows product counts per category (ignoring deleted products and letter case)', () => {
    renderTab();
    expect(screen.getByText('3 products')).toBeTruthy();
    expect(screen.getByText('1 product')).toBeTruthy();
  });

  it('adds a subcategory, but refuses a duplicate name', async () => {
    renderTab();
    const input = screen.getByLabelText('Add subcategory to Winter Collection');
    fireEvent.change(input, { target: { value: 'jackets' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(updateDoc).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Hoodies' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(updateDoc).toHaveBeenCalledWith({ path: 'categories/c1' }, { subcategories: { union: 'Hoodies' } });
  });

  it('asks before removing a subcategory', async () => {
    renderTab();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const remove = screen.getByTitle('Remove "Jackets"');
    await act(async () => {
      fireEvent.click(remove);
    });
    expect(updateDoc).not.toHaveBeenCalled();
    expect(confirm.mock.calls[0][0]).toContain('2টি প্রোডাক্ট');
    await act(async () => {
      fireEvent.click(remove);
    });
    expect(updateDoc).toHaveBeenCalledWith({ path: 'categories/c1' }, { subcategories: { remove: 'Jackets' } });
    confirm.mockRestore();
  });
});
