import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProfitAnalysis from '../components/ProfitAnalysis';

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
