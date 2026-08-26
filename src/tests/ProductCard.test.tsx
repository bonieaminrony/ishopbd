// @ts-nocheck
/**
 * ProductCard Component Tests
 * নিশ্চিত করে ProductCard সঠিকভাবে render হয় এবং interaction কাজ করে।
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ui/ProductCard';
import { Product } from '../types';
import { CartProvider } from '../context/CartContext';
import React from 'react';

const mockProduct: Product = {
  id: 'test-p1',
  name: 'টেস্ট পণ্য - চার্জার ফ্যান',
  price: 1250,
  originalPrice: 1800,
  discount: 30,
  image: 'https://example.com/product.jpg',
  category: 'Charger Fan',
  isTrending: true,
  stock: 10,
  colors: ['White', 'Blue'],
  likes: 5,
};

const mockProductOutOfStock: Product = {
  ...mockProduct,
  id: 'test-p2',
  name: 'স্টক আউট পণ্য',
  stock: 0,
};

const mockProductWithVariants: Product = {
  ...mockProduct,
  id: 'test-p3',
  name: 'ভেরিয়েন্ট পণ্য',
  variants: [
    { id: 'v1', name: 'Black', size: 'M', stock: 0, image: 'https://example.com/v1.jpg' },
    { id: 'v2', name: 'White', size: 'L', stock: 0, image: 'https://example.com/v2.jpg' },
  ],
};

const mockT = (bn: string, _en: string) => bn;
const mockOpenProductDetails = vi.fn();
const mockHandleBuyNow = vi.fn();
const mockHandleLikeProduct = vi.fn();

// CartProvider wrapper — context error ঠিক করার জন্য
const renderCard = (product: Product) =>
  render(
    <CartProvider>
      <ProductCard
        product={product}
        openProductDetails={mockOpenProductDetails}
        t={mockT}
        handleBuyNow={mockHandleBuyNow}
        handleLikeProduct={mockHandleLikeProduct}
      />
    </CartProvider>
  );

describe('ProductCard — Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('পণ্যের নাম দেখাতে হবে', () => {
    renderCard(mockProduct);
    expect(screen.getByText('টেস্ট পণ্য - চার্জার ফ্যান')).toBeInTheDocument();
  });

  it('পণ্যের দাম দেখাতে হবে', () => {
    renderCard(mockProduct);
    expect(screen.getByText('৳1250')).toBeInTheDocument();
  });

  it('discount badge দেখাতে হবে', () => {
    renderCard(mockProduct);
    expect(screen.getByText('-30%')).toBeInTheDocument();
  });

  it('মূল দাম (originalPrice) দেখাতে হবে', () => {
    renderCard(mockProduct);
    expect(screen.getByText('৳1800')).toBeInTheDocument();
  });

  it('like count দেখাতে হবে', () => {
    renderCard(mockProduct);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('পণ্যের ছবি দেখাতে হবে', () => {
    renderCard(mockProduct);
    const img = screen.getByAltText('টেস্ট পণ্য - চার্জার ফ্যান');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/product.jpg');
  });
});

describe('ProductCard — Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('পণ্যের নামে click করলে openProductDetails call হবে', () => {
    renderCard(mockProduct);
    fireEvent.click(screen.getByText('টেস্ট পণ্য - চার্জার ফ্যান'));
    expect(mockOpenProductDetails).toHaveBeenCalledWith(mockProduct);
  });

  it('like বাটনে click করলে handleLikeProduct call হবে', () => {
    renderCard(mockProduct);
    const likeBtn = screen.getByRole('button');
    fireEvent.click(likeBtn);
    expect(mockHandleLikeProduct).toHaveBeenCalledWith('test-p1');
  });
});
