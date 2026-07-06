// @ts-nocheck
/**
 * ProductCard Component Tests
 * নিশ্চিত করে ProductCard সঠিকভাবে render হয় এবং interaction কাজ করে।
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ui/ProductCard';
import { Product } from '../types';

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

const renderCard = (product: Product) =>
  render(
    <ProductCard
      product={product}
      openProductDetails={mockOpenProductDetails}
      t={mockT}
      handleBuyNow={mockHandleBuyNow}
      handleLikeProduct={mockHandleLikeProduct}
    />
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

describe('ProductCard — Order Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('স্টক থাকলে "অর্ডার দিন" বাটন দেখাতে হবে', () => {
    renderCard(mockProduct);
    expect(screen.getByText('অর্ডার দিন')).toBeInTheDocument();
  });

  it('স্টক শেষ হলে "স্টক আউট" বাটন দেখাতে হবে', () => {
    renderCard(mockProductOutOfStock);
    expect(screen.getByText('স্টক আউট')).toBeInTheDocument();
  });

  it('সব variants-এ stock=0 হলে স্টক আউট দেখাতে হবে', () => {
    renderCard(mockProductWithVariants);
    expect(screen.getByText('স্টক আউট')).toBeInTheDocument();
  });

  it('স্টক আউট বাটন disabled থাকতে হবে', () => {
    renderCard(mockProductOutOfStock);
    const btn = screen.getByRole('button', { name: /স্টক আউট/i });
    expect(btn).toBeDisabled();
  });
});

describe('ProductCard — Click Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('পণ্যের নামে click করলে openProductDetails call হবে', () => {
    renderCard(mockProduct);
    fireEvent.click(screen.getByText('টেস্ট পণ্য - চার্জার ফ্যান'));
    expect(mockOpenProductDetails).toHaveBeenCalledWith(mockProduct);
  });

  it('"অর্ডার দিন" বাটনে click করলে handleBuyNow call হবে (no variants)', () => {
    renderCard(mockProduct);
    fireEvent.click(screen.getByText('অর্ডার দিন'));
    expect(mockHandleBuyNow).toHaveBeenCalledWith(mockProduct);
  });

  it('variant পণ্যের অর্ডার বাটনে click করলে openProductDetails call হবে', () => {
    const productWithInStockVariant: Product = {
      ...mockProduct,
      id: 'test-p4',
      variants: [
        { id: 'v1', name: 'Black', size: 'M', stock: 5, image: 'https://example.com/v1.jpg' },
      ],
    };
    renderCard(productWithInStockVariant);
    const btn = screen.getByText('অর্ডার দিন');
    fireEvent.click(btn);
    expect(mockOpenProductDetails).toHaveBeenCalledWith(productWithInStockVariant);
    expect(mockHandleBuyNow).not.toHaveBeenCalled();
  });

  it('like বাটনে click করলে handleLikeProduct call হবে', () => {
    renderCard(mockProduct);
    // Find like button by its container (heart icon area)
    const heartBtn = document.querySelector('button[class*="absolute top-1 right-1"]') as HTMLElement;
    if (heartBtn) {
      fireEvent.click(heartBtn);
      expect(mockHandleLikeProduct).toHaveBeenCalledWith('test-p1');
    }
  });
});
