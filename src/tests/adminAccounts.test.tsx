import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfitAnalysis from '../components/ProfitAnalysis';
import { findMatchingAdminRecord, resolveAdminAccess } from '../utils/adminRole';

describe('ProfitAnalysis / Accounts Tab', () => {
  it('ProfitAnalysis component should be defined and be a function/component', () => {
    expect(ProfitAnalysis).toBeDefined();
    expect(typeof ProfitAnalysis).toBe('function');
  });

  it('ProfitAnalysis renders properly without crashing when mounted', () => {
    const { container } = render(
      <ProfitAnalysis
        orderHistory={[]}
        products={[]}
        expenses={[]}
      />
    );
    expect(container).toBeTruthy();
  });
});

describe('Admin Role Resolution (Full Admin vs Moderator)', () => {
  const masterEmails = ['ifilmbd2025@gmail.com'];

  it('never downgrades owner role to support_only moderator mode', () => {
    const access = resolveAdminAccess({
      user: { uid: 'FirebaseMixedUid99', email: 'owner2@ishopbd.com' },
      myAdminDoc: { id: 'FirebaseMixedUid99', email: 'owner2@ishopbd.com', role: 'owner' },
      adminList: [{ id: 'FirebaseMixedUid99', email: 'owner2@ishopbd.com', role: 'owner' }],
      masterEmails,
    });

    expect(access.isMasterAdmin).toBe(true);
    expect(access.isAdmin).toBe(true);
    expect(access.adminViewMode).toBe('full');
    expect(access.effectiveRole).toBe('owner');
  });

  it('matches mixed-case Firebase UID against adminList without lowercasing UID lookup', () => {
    const matched = findMatchingAdminRecord(
      [
        { id: 'SomeoneElse', email: 'other@test.com', role: 'moderator' },
        { id: 'MixedCaseUidAbc123', email: '', role: 'admin' },
      ],
      { uid: 'MixedCaseUidAbc123', email: null },
    );

    expect(matched?.role).toBe('admin');

    const access = resolveAdminAccess({
      user: { uid: 'MixedCaseUidAbc123', email: null },
      myAdminDoc: null,
      adminList: [{ id: 'MixedCaseUidAbc123', email: '', role: 'admin' }],
      masterEmails,
    });

    expect(access.isMasterAdmin).toBe(true);
    expect(access.isAdmin).toBe(true);
    expect(access.adminViewMode).toBe('full');
  });

  it('always keeps masterEmails user in full admin mode even if stale list has moderator', () => {
    const access = resolveAdminAccess({
      user: { uid: 'MasterUid1', email: 'ifilmbd2025@gmail.com' },
      myAdminDoc: null,
      adminList: [{ id: 'MasterUid1', email: 'ifilmbd2025@gmail.com', role: 'moderator' }],
      masterEmails,
    });

    expect(access.isMasterEmail).toBe(true);
    expect(access.isMasterAdmin).toBe(true);
    expect(access.adminViewMode).toBe('full');
  });

  it('assigns support_only view mode strictly to legitimate moderators', () => {
    const access = resolveAdminAccess({
      user: { uid: 'ModUid1', email: 'support@ishopbd.com' },
      myAdminDoc: { id: 'ModUid1', email: 'support@ishopbd.com', role: 'moderator' },
      adminList: [{ id: 'ModUid1', email: 'support@ishopbd.com', role: 'moderator' }],
      masterEmails,
    });

    expect(access.isMasterAdmin).toBe(false);
    expect(access.isAdmin).toBe(true);
    expect(access.adminViewMode).toBe('support_only');
    expect(access.effectiveRole).toBe('moderator');
  });
});
