import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether';
import { Product } from '../types';

describe('Frequently Bought Together (Combo / Bundle) Feature', () => {
  const mockMainProduct: Product = {
    id: 'prod-main',
    name: 'Wireless Gaming Mouse',
    price: 1500,
    originalPrice: 1800,
    discount: 17,
    image: '/mouse.jpg',
    category: 'Accessories',
    bundleProductIds: ['prod-addon-1', 'prod-addon-2'],
    bundleDiscount: 10,
    bundleDiscountType: 'percentage',
    stock: 25,
    isPublished: true,
    deleted: false
  };

  const mockAddon1: Product = {
    id: 'prod-addon-1',
    name: 'RGB Gaming Mousepad',
    price: 500,
    originalPrice: 600,
    discount: 17,
    image: '/mousepad.jpg',
    category: 'Accessories',
    stock: 50,
    isPublished: true,
    deleted: false
  };

  const mockAddon2: Product = {
    id: 'prod-addon-2',
    name: 'Bungee Cord Holder',
    price: 300,
    originalPrice: 350,
    discount: 14,
    image: '/bungee.jpg',
    category: 'Accessories',
    stock: 10,
    isPublished: true,
    deleted: false
  };

  const mockAddonOutOfStock: Product = {
    id: 'prod-addon-oos',
    name: 'Mouse Skates (Out of Stock)',
    price: 200,
    originalPrice: 250,
    discount: 20,
    image: '/skates.jpg',
    category: 'Accessories',
    stock: 0,
    isPublished: true,
    deleted: false
  };

  const mockAddonUnpublished: Product = {
    id: 'prod-addon-unpub',
    name: 'Secret Prototype Grip',
    price: 400,
    originalPrice: 500,
    discount: 20,
    image: '/grip.jpg',
    category: 'Accessories',
    stock: 20,
    isPublished: false,
    deleted: false
  };

  const mockAllProducts: Product[] = [
    mockMainProduct,
    mockAddon1,
    mockAddon2,
    mockAddonOutOfStock,
    mockAddonUnpublished
  ];

  it('renders bundle section with main product and active complementary products', () => {
    const addToCartMock = vi.fn();

    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        allProducts={mockAllProducts}
        addToCartInternal={addToCartMock}
      />
    );

    expect(screen.getByText('Frequently Bought Together')).toBeInTheDocument();
    expect(screen.getByText('Wireless Gaming Mouse')).toBeInTheDocument();
    expect(screen.getByText('RGB Gaming Mousepad')).toBeInTheDocument();
    expect(screen.getByText('Bungee Cord Holder')).toBeInTheDocument();
  });

  it('calculates bundle pricing and discount savings correctly', () => {
    const addToCartMock = vi.fn();

    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        allProducts={mockAllProducts}
        addToCartInternal={addToCartMock}
      />
    );

    // Regular Total: 1500 + 500 + 300 = 2300
    // Bundle Discount: 10% of 2300 = 230
    // Final Bundle Price: 2300 - 230 = 2070
    expect(screen.getByText('Regular Total:')).toBeInTheDocument();
    expect(screen.getByText('৳2,300')).toBeInTheDocument();
    expect(screen.getByText('-৳230')).toBeInTheDocument();
    expect(screen.getByText('৳2,070')).toBeInTheDocument();
    expect(screen.getByText(/Save ৳230/)).toBeInTheDocument();
  });

  it('handles fixed discount amount correctly', () => {
    const mainWithFixedDiscount: Product = {
      ...mockMainProduct,
      bundleDiscount: 300,
      bundleDiscountType: 'fixed'
    };

    render(
      <FrequentlyBoughtTogether
        mainProduct={mainWithFixedDiscount}
        allProducts={mockAllProducts}
        addToCartInternal={vi.fn()}
      />
    );

    // Total: 2300, Discount: 300 => 2000
    expect(screen.getByText('-৳300')).toBeInTheDocument();
    expect(screen.getByText('৳2,000')).toBeInTheDocument();
  });

  it('does not display fake discounts when bundle discount is 0 or unconfigured', () => {
    const mainWithNoDiscount: Product = {
      ...mockMainProduct,
      bundleDiscount: 0
    };

    render(
      <FrequentlyBoughtTogether
        mainProduct={mainWithNoDiscount}
        allProducts={mockAllProducts}
        addToCartInternal={vi.fn()}
      />
    );

    expect(screen.queryByText('Bundle Savings:')).not.toBeInTheDocument();
    expect(screen.getByText('Total Combined Price:')).toBeInTheDocument();
    expect(screen.getByText('৳2,300')).toBeInTheDocument();
  });

  it('allows deselecting products and updates total price dynamically', () => {
    const addToCartMock = vi.fn();

    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        allProducts={mockAllProducts}
        addToCartInternal={addToCartMock}
      />
    );

    // Deselect Addon 2 (Bungee Cord Holder ৳300)
    const deselectButtons = screen.getAllByTitle('Deselect item');
    expect(deselectButtons.length).toBe(3);

    fireEvent.click(deselectButtons[2]); // Deselect Addon 2

    // Now items = Mouse (1500) + Mousepad (500) = 2000
    // 10% discount of 2000 = 200
    // Final = 1800
    expect(screen.getByText('৳2,000')).toBeInTheDocument();
    expect(screen.getAllByText('৳1,800').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('-৳200')).toBeInTheDocument();
  });

  it('adds all selected products to cart when "Add Selected to Cart" is clicked', () => {
    const addToCartMock = vi.fn();

    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        allProducts={mockAllProducts}
        addToCartInternal={addToCartMock}
        tempSelectedColor="Matte Black"
      />
    );

    const addBtn = screen.getByRole('button', { name: /Add 3 Items to Cart/i });
    fireEvent.click(addBtn);

    expect(addToCartMock).toHaveBeenCalledTimes(3);
    // Main product added with its selected color
    expect(addToCartMock).toHaveBeenCalledWith(mockMainProduct, 'Matte Black', undefined, 1);
    expect(addToCartMock).toHaveBeenCalledWith(mockAddon1, undefined, undefined, 1);
    expect(addToCartMock).toHaveBeenCalledWith(mockAddon2, undefined, undefined, 1);
  });

  it('does not render bundle section if product has no bundle configured', () => {
    const loneProduct: Product = {
      ...mockMainProduct,
      bundleProductIds: []
    };

    const { container } = render(
      <FrequentlyBoughtTogether
        mainProduct={loneProduct}
        allProducts={mockAllProducts}
        addToCartInternal={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('filters out unpublished and deleted products from bundle', () => {
    const productWithUnpublishedBundle: Product = {
      ...mockMainProduct,
      bundleProductIds: ['prod-addon-1', 'prod-addon-unpub']
    };

    render(
      <FrequentlyBoughtTogether
        mainProduct={productWithUnpublishedBundle}
        allProducts={mockAllProducts}
        addToCartInternal={vi.fn()}
      />
    );

    expect(screen.getByText('RGB Gaming Mousepad')).toBeInTheDocument();
    expect(screen.queryByText('Secret Prototype Grip')).not.toBeInTheDocument();
  });

  it('handles out of stock products by marking them and preventing selection', () => {
    const productWithOosBundle: Product = {
      ...mockMainProduct,
      bundleProductIds: ['prod-addon-oos']
    };

    render(
      <FrequentlyBoughtTogether
        mainProduct={productWithOosBundle}
        allProducts={mockAllProducts}
        addToCartInternal={vi.fn()}
      />
    );

    expect(screen.getByText('Mouse Skates (Out of Stock)')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});
