import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('firebase/firestore', () => ({ doc: vi.fn(), updateDoc: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../lib/firebase', () => ({ db: {} }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));

import { normalizeCampaignSlug, suggestCampaignSlug, prepareCampaignForSave } from '../utils/campaign';
import AdminCampaignsTab from '../components/admin/AdminCampaignsTab';

describe('campaign links', () => {
  it('cleans up the link name', () => {
    expect(normalizeCampaignSlug('  Winter Koti OFFER! 2026 ')).toBe('winter-koti-offer-2026');
    expect(normalizeCampaignSlug('eid--dhamaka')).toBe('eid-dhamaka');
    expect(normalizeCampaignSlug('শীতের অফার')).toBe('');
  });
  it('gives Bengali names a working link', () => {
    expect(suggestCampaignSlug('শীতের অফার', () => 0.5)).toMatch(/^offer-[a-z0-9]{4}$/);
    expect(suggestCampaignSlug('Eid Sale')).toBe('eid-sale');
  });
  it('checks name, products and duplicate links, and stores only the campaign fields', () => {
    expect(prepareCampaignForSave({ name: '', productIds: ['a'] })).toMatchObject({ ok: false });
    expect(prepareCampaignForSave({ name: 'Eid', productIds: [] })).toMatchObject({ ok: false });
    expect(prepareCampaignForSave({ id: 'new', name: 'Eid', slug: 'eid', productIds: ['a'] }, [{ id: 'other', slug: 'EID' }])).toMatchObject({ ok: false });
    const r: any = prepareCampaignForSave({ id: 'c1', name: ' Eid Sale ', slug: 'Eid Sale', productIds: ['a', 'a', 'b'], isActive: undefined } as any, [{ id: 'c1', slug: 'eid-sale' }]);
    expect(r.ok).toBe(true);
    expect(r.data).toMatchObject({ name: 'Eid Sale', slug: 'eid-sale', productIds: ['a', 'b'], isActive: true });
    expect('id' in r.data).toBe(false);
  });
});

describe('Campaigns page', () => {
  const products = [
    { id: 'p1', name: 'Premium Koti - Black', code: 'FK-44', price: 1380, image: '/a.png' },
    { id: 'p2', name: 'Mini Fan', code: 'MF-2', price: 290, image: '/b.png' },
  ];
  const Harness = ({ onSave }: { onSave: (c: any) => void }) => {
    const [editing, setEditing] = React.useState<any>(null);
    return (
      <AdminCampaignsTab
        campaigns={[{ id: 'old', name: 'Old', slug: 'old-offer', isActive: true, productIds: ['p2'] }]}
        products={products}
        editingCampaign={editing}
        setEditingCampaign={setEditing}
        saveCampaign={(e) => {
          e.preventDefault();
          onSave(editing);
        }}
        deleteCampaign={vi.fn()}
        handleAdminImageUpload={vi.fn()}
      />
    );
  };

  it('fills the link from the name, finds products by code, and saves', () => {
    const onSave = vi.fn();
    render(<Harness onSave={onSave} />);
    expect(screen.getByText(/ishopbd|localhost/i, { selector: 'p' })).toBeTruthy(); // existing campaign link shown
    fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));
    fireEvent.change(screen.getByLabelText('Campaign name'), { target: { value: 'Winter Koti Offer' } });
    expect((screen.getByLabelText('Link') as HTMLInputElement).value).toBe('winter-koti-offer');
    fireEvent.change(screen.getByPlaceholderText('নাম বা কোড দিয়ে খুঁজুন...'), { target: { value: 'fk-44' } });
    fireEvent.click(screen.getByRole('button', { name: /Premium Koti - Black/ }));
    fireEvent.click(screen.getByRole('button', { name: /Save & copy link/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Winter Koti Offer', slug: 'winter-koti-offer', productIds: ['p1'] }));
  });

  it('warns when the link is already used by another campaign', () => {
    render(<Harness onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));
    fireEvent.change(screen.getByLabelText('Link'), { target: { value: 'old-offer' } });
    expect(screen.getByText('এই লিংক আরেকটি ক্যাম্পেইনে আছে')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Save & copy link/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
