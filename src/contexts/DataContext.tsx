import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  evidenceImages: string[];
  startPrice: number;
  bidStep: number;
  buyNowPrice?: number;
  duration: number;
  status: 'pending' | 'active' | 'rejected' | 'ended';
  currentPrice: number;
  startTime?: number;
  endTime?: number;
  rejectionReason?: string;
  createdAt: number;
  // Handbag-specific fields
  era?: string;
  brand?: string;
  numberOfItems?: string;
  colour?: string;
  material?: string;
  condition?: string;
  size?: string;
  height?: string;
  width?: string;
  depth?: string;
  // Shoe-specific fields
  shoeEra?: string;
  shoeBrand?: string;
  shoeSize?: string;
  shoeNewInBox?: string;
  shoeColour?: string;
  shoeGender?: string;
  shoeMaterial?: string;
  shoeVintage?: string;
  shoeCondition?: string;
  shoeMadeIn?: string;
}

export interface Bid {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  timestamp: number;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerName: string;
  productTitle: string;
  productImage: string;
  finalPrice: number;
  shippingAddress: string;
  depositPaid: boolean;
  type: 'bid' | 'buynow';
  createdAt: number;
}

interface DataContextType {
  products: Product[];
  bids: Bid[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id' | 'status' | 'currentPrice' | 'createdAt'>) => void;
  updateProductStatus: (id: string, status: Product['status'], rejectionReason?: string, startTime?: number) => void;
  addBid: (bid: Omit<Bid, 'id' | 'timestamp'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderDeposit: (orderId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem('auction_products');
    const storedBids = localStorage.getItem('auction_bids');
    const storedOrders = localStorage.getItem('auction_orders');

    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedBids) setBids(JSON.parse(storedBids));
    if (storedOrders) setOrders(JSON.parse(storedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('auction_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('auction_bids', JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem('auction_orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (product: Omit<Product, 'id' | 'status' | 'currentPrice' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}`,
      status: 'pending',
      currentPrice: product.startPrice,
      createdAt: Date.now(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProductStatus = (id: string, status: Product['status'], rejectionReason?: string, startTime?: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              rejectionReason,
              startTime,
              endTime: startTime ? startTime + p.duration * 60 * 1000 : undefined,
            }
          : p
      )
    );
  };

  const addBid = (bid: Omit<Bid, 'id' | 'timestamp'>) => {
    const newBid: Bid = {
      ...bid,
      id: `bid_${Date.now()}`,
      timestamp: Date.now(),
    };
    setBids((prev) => [...prev, newBid]);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === bid.productId ? { ...p, currentPrice: bid.amount } : p
      )
    );
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}`,
      createdAt: Date.now(),
    };
    setOrders((prev) => [...prev, newOrder]);
    
    // Mark product as ended when order is created
    setProducts((prev) =>
      prev.map((p) => (p.id === order.productId ? { ...p, status: 'ended' } : p))
    );
  };

  const updateOrderDeposit = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, depositPaid: true } : o))
    );
  };

  return (
    <DataContext.Provider
      value={{
        products,
        bids,
        orders,
        addProduct,
        updateProductStatus,
        addBid,
        addOrder,
        updateOrderDeposit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
