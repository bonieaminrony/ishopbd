import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Expense } from '../types';

interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  userProfile: any;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  likedProducts: string[];
  setLikedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  likedProductsRef: React.MutableRefObject<string[]>;
  likeInProgressRef: React.MutableRefObject<Set<string>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ishopbd_liked_products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const likedProductsRef = useRef<string[]>([]);
  likedProductsRef.current = likedProducts;
  const likeInProgressRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("ishopbd_liked_products", JSON.stringify(likedProducts));
  }, [likedProducts]);

  useEffect(() => {
    if (userProfile && Array.isArray(userProfile.likedProducts)) {
      setLikedProducts(prev => {
        const merged = Array.from(new Set([...prev, ...userProfile.likedProducts]));
        if (merged.length !== prev.length || !merged.every(val => prev.includes(val))) {
          return merged;
        }
        return prev;
      });
    }
  }, [userProfile]);

  return (
    <AuthContext.Provider value={{
      user, setUser,
      userProfile, setUserProfile,
      expenses, setExpenses,
      likedProducts, setLikedProducts,
      likedProductsRef, likeInProgressRef
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
