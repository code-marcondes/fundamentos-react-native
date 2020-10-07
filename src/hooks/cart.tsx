import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const itens = await AsyncStorage.getItem('@GoMarketplace:proucts');

      if (itens) {
        setProducts(JSON.parse(itens));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        const newArrayProduct = products.map(p =>
          p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        );

        setProducts(newArrayProduct);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:proucts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newArrayProduct = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );

      setProducts(newArrayProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:proucts',
        JSON.stringify(newArrayProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newArrayProduct = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
      );

      setProducts(newArrayProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:proucts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
