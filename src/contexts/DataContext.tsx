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

    // Shoe fields
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

    // AI Check
    isAuthentic?: boolean;
    certificationUrl?: string;

    bidsCount?: number;
    bids?: Bid[];
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


    //================================================================================================================================================================================
//     useEffect(() => {
//         const storedProducts = localStorage.getItem('auction_products');
//         const storedBids = localStorage.getItem('auction_bids');
//         const storedOrders = localStorage.getItem('auction_orders');

//         if (storedProducts) setProducts(JSON.parse(storedProducts));
//         if (storedBids) setBids(JSON.parse(storedBids));
//         if (storedOrders) setOrders(JSON.parse(storedOrders));

//         // Seed initial products if no products exist
//         if (!storedProducts || JSON.parse(storedProducts).length === 0) {
//             const seedProducts: Product[] = [
//                 {
//                     id: crypto.randomUUID(),
//                     sellerId: 'seller_1',
//                     title: 'Prada - Prada Green & Black Striped Canvas Crossbody/Shoulder Bag with Leather Trim - Shoulder bag',
//                     description: 'Prada Green & Black Striped Canvas Crossbody/Shoulder Bag with Leather Trim\n\nThis chic Prada shoulder bag perfectly balances casual functionality with timeless luxury. Crafted in Italy, the piece is made from durable green and black striped canvas, accented with natural tan leather trim and gold-tone hardware for a refined contrast. The structured flap is secured with a magnetic snap closure and features a distinctive front leather tab embossed with the Prada logo. The back is adorned with Prada’s signature triangular leather logo plaque, further emphasizing authenticity and prestige.\n\nThe bag comes with a detachable and adjustable black fabric shoulder strap (not original strap), allowing versatile wear as a crossbody or shoulder bag. Its compact rectangular silhouette is ideal for carrying everyday essentials in style. Inside, the beige suede-lined interior reveals a well-organized layout with a zipped pocket and slip compartment, finished with leather detailing and the Prada Milano logo plaque.\n\nCondition:\nThis bag remains in good vintage condition, showing minor, natural signs of gentle use. The canvas body is clean and vibrant, with only light surface wear. The leather trim has developed a warm patina and marks on the interior flap, adding character without detracting from its appeal. The gold-tone hardware is bright and functional, with slight hairline scratches consistent with careful handling. Interior suede lining is well-preserved, with light signs of use, maintaining overall cleanliness. Corners and edges show minimal rubbing, as seen in the detailed photos.\n\nDetails:\n\nBrand: Prada\n\nMaterial: Canvas with leather trim\n\nColor: Green/black stripes with tan leather and gold-tone hardware\n\nInterior: Beige suede lining with zip and slip compartments\n\nStrap: Detachable/adjustable fabric shoulder strap (not original strap)\n\nClosure: Magnetic snap flap\n\nMade in Italy\n\nIncludes: Original dust bag, authenticity card, and detachable strap (not original strap)\n\nMeasurements (approx.):\n\nWidth: 20 cm\n\nHeight: 14 cm\n\nDepth: 5 cm\n\nStrap drop: Adjustable 35 to 70 cm\n\nEstimated era: Early 2000s\n\nA versatile piece that blends casual elegance with signature Prada craftsmanship, this bag is perfect for everyday wear yet sophisticated enough to elevate any outfit.\n\n\n\nShipping: 25 Euro Worldwide Shipping with FedEx will include tracking number.\nExtra charges such as taxes or service fees may be added in the receiving country, the buyer will be responsible to pay those additional fees. Please check your import and custom fees before bidding.'.trim(),
//                     category: 'handbags',
//                     images: ['/public/demo/prada_green/prada_green1.png'],
//                     evidenceImages: [
//                         // '/public/demo/prada_green/prada_green2.png', '/public/demo/prada_green/prada_green3.png', '/public/demo/prada_green/prada_green4.png', '/public/demo/prada_green/prada_green5.png', 
//                         // '/public/demo/prada_green/prada_green6.png', '/public/demo/prada_green/prada_green7.png', '/public/demo/prada_green/prada_green8.png', '/public/demo/prada_green/prada_green9.png',
//                         // '/public/demo/prada_green/prada_green10.png', '/public/demo/prada_green/prada_green11.png', '/public/demo/prada_green/prada_green12.png', '/public/demo/prada_green/prada_green13.png',
//                         // '/public/demo/prada_green/prada_green14.png', '/public/demo/prada_green/prada_green15.png', '/public/demo/prada_green/prada_green16.png', '/public/demo/prada_green/prada_green17.png',
//                         // '/public/demo/prada_green/prada_green18.png', '/public/demo/prada_green/prada_green19.png', '/public/demo/prada_green/prada_green20.png', '/public/demo/prada_green/prada_green21.png',
//                         // '/public/demo/prada_green/prada_green22.png', '/public/demo/prada_green/prada_green23.png'
//                     ],
//                     startPrice: 100,
//                     bidStep: 10,
//                     buyNowPrice: 500,
//                     duration: 1440, // 24 hours in minutes
//                     status: 'active',
//                     currentPrice: 100,
//                     startTime: Date.now(),
//                     endTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
//                     createdAt: Date.now(),
//                     isAuthentic: true,

//                     brand: 'Designer Brand',
//                     era: '2000s',
//                     numberOfItems: '1',
//                     colour: 'Black, Brown, Green',
//                     material: 'Leather',
//                     condition: 'Good condition, used with some signs of wear',
//                     size: 'Bags & Accessories / Mini, One size',
//                     height: '14',
//                     width: '20',
//                     depth: '5',
//                 },
//                 {
//                     id: crypto.randomUUID(),
//                     sellerId: 'seller_1',
//                     title: 'Burberry - Tote bag',
//                     description: `
// Product Title: Burberry Tote bag

// Condition: This item is new and comes without original tags. While it has minor imperfections like slight stitching irregularities, light discoloration, or small marks, these shoes still retain their overall quality and style. Please review the pictures for more details on their condition.

// Note: Please take the time to carefully review the detailed images provided, as they highlight the unique features and condition of this exquisite item. Each photograph offers valuable insights into the craftsmanship, subtle details, and character that make this piece truly exceptional.

// Description:
// Elevate your style with the timeless sophistication of the Tote bag by Burberry. Meticulously crafted from the finest materials, this luxury bag effortlessly combines elegance and functionality, making it the perfect accessory for any discerning wardrobe.

// Key Features:
// Material: Expertly made from premium Leather, ensuring both durability and a sumptuous, luxurious finish.
// Color: Presented in a refined Red tone, designed to complement and enhance any ensemble with effortless grace.
// Design: Thoughtfully structured with an elegant silhouette, offering ample space for your essentials while maintaining a sleek, polished look.
// Details: Exquisite craftsmanship with high-end hardware, impeccable stitching, and signature touches that reflect the brand's dedication to luxury.
// `.trim(),

//                     category: 'handbags',
//                     images: ['/public/demo/tote_bag/tote_bag1.png'],
//                     evidenceImages: [
//                         // '/public/demo/tote_bag/tote_bag2.png', '/public/demo/tote_bag/tote_bag3.png', '/public/demo/tote_bag/tote_bag4.png', '/public/demo/tote_bag/tote_bag5.png', 
//                         // '/public/demo/tote_bag/tote_bag6.png', '/public/demo/tote_bag/tote_bag7.png', '/public/demo/tote_bag/tote_bag8.png', '/public/demo/tote_bag/tote_bag9.png',
//                         // '/public/demo/tote_bag/tote_bag10.png', '/public/demo/tote_bag/tote_bag11.png', '/public/demo/tote_bag/tote_bag12.png', '/public/demo/tote_bag/tote_bag13.png',
//                         // '/public/demo/tote_bag/tote_bag14.png', '/public/demo/tote_bag/tote_bag15.png', '/public/demo/tote_bag/tote_bag16.png', '/public/demo/tote_bag/tote_bag17.png',
//                         // '/public/demo/tote_bag/tote_bag18.png', '/public/demo/tote_bag/tote_bag19.png', '/public/demo/tote_bag/tote_bag20.png', '/public/demo/tote_bag/tote_bag21.png',
//                         // '/public/demo/tote_bag/tote_bag22.png', '/public/demo/tote_bag/tote_bag23.png'
//                     ],
//                     startPrice: 100,
//                     bidStep: 10,
//                     buyNowPrice: 500,
//                     duration: 1440, // 24 hours in minutes
//                     status: 'active',
//                     currentPrice: 100,
//                     startTime: Date.now(),
//                     endTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
//                     createdAt: Date.now(),
//                     isAuthentic: true,

//                     brand: 'Burberry',
//                     era: 'After 2000s',
//                     numberOfItems: '1',
//                     colour: 'Red',
//                     material: 'Leather',
//                     condition: 'New or as new, unused with or without original packaging',
//                     size: 'One size',
//                     height: '30',
//                     width: '33'
//                 },
//                 {
//                     id: crypto.randomUUID(),
//                     sellerId: 'seller_1',
//                     title: 'Valentino - Black Leather Top Handle Bag - Handbag',
//                     description: `
// Valentino Garavani – Black Leather Top Handle Bag

// Elegant and structured, this Valentino Garavani top handle bag combines classic design with signature house elements. Crafted in finely textured black leather, the bag is adorned with gold-tone hardware.

// The interior opens to one main compartment and an additional internal zip pocket. It is lined in black fabric and stamped with the gold Valentino Garavani logo. The bag closes securely with a folding buckle.

// Features:

// Brand: Valentino Garavani

// Model: Structured Top Handle Bag

// Material: Black textured leather

// Hardware: Gold-tone

// Closure: Folding buckle

// Interior: 1 compartments, 1 zip pocket

// Accessories: Original dust bag

// Origin: Italy

// Measurements (approx.):

// Height: 25 cm

// Width: 31 cm

// Depth: 10 cm

// Handle drop: 12 cm

// A timeless Valentino piece ideal for both formal occasions and elegant everyday wear.

// Condition:
// The Valentino Hand Bag is still in very good, used condition. The exterior black leather look great with only very light signs of previous use. The corners have almost no rubbing and look good. The handle is still firm. The interior is nice and clean with no damage.
// The zipper works well. The gold-tone hardware still looks good and still has shine.
// Overall still in great condition with plenty of life left.
// Comes with a dust-bag from Valentino Garavani. This item has no shoulder strap.
// Please see the photos carefully for more details.


// Shipping: 30 Euro Worldwide Shipping with FedEx will include tracking number.
// Extra charges such as taxes or service fees may be added in the receiving country, the buyer will be responsible to pay those additional fees. Please check your import and custom fees before bidding.
// `.trim(),

//                     category: 'handbags',
//                     images: ['/public/demo/valentino/valentino1.png'],
//                     evidenceImages: [
//                         // '/public/demo/valentino/valentino2.png', '/public/demo/valentino/valentino3.png', '/public/demo/valentino/valentino4.png', '/public/demo/valentino/valentino5.png', 
//                         // '/public/demo/valentino/valentino6.png', '/public/demo/valentino/valentino7.png', '/public/demo/valentino/valentino8.png', '/public/demo/valentino/valentino9.png',
//                         // '/public/demo/valentino/valentino10.png', '/public/demo/valentino/valentino11.png', '/public/demo/valentino/valentino12.png', '/public/demo/valentino/valentino13.png',
//                         // '/public/demo/valentino/valentino14.png', '/public/demo/valentino/valentino15.png', '/public/demo/valentino/valentino16.png', '/public/demo/valentino/valentino17.png',
//                         // '/public/demo/valentino/valentino18.png', '/public/demo/valentino/valentino19.png', '/public/demo/valentino/valentino20.png', '/public/demo/valentino/valentino21.png',
//                         // '/public/demo/valentino/valentino22.png', '/public/demo/valentino/valentino23.png', '/public/demo/valentino/valentino24.png', '/public/demo/valentino/valentino25.png',
//                         // '/public/demo/valentino/valentino26.png', '/public/demo/valentino/valentino27.png', '/public/demo/valentino/valentino28.png', '/public/demo/valentino/valentino29.png',
//                     ],
//                     startPrice: 100,
//                     bidStep: 10,
//                     buyNowPrice: 500,
//                     duration: 1440, // 24 hours in minutes
//                     status: 'active',
//                     currentPrice: 100,
//                     startTime: Date.now(),
//                     endTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
//                     createdAt: Date.now(),
//                     isAuthentic: true,

//                     brand: 'Valentino',
//                     era: 'After 2000s',
//                     numberOfItems: '1',
//                     colour: 'Black',
//                     material: 'Leather',
//                     condition: 'Good condition, used with some signs of wear',
//                     size: 'Bags & Accessories / Medium',
//                     height: '25',
//                     width: '31',
//                     depth: '10',
//                 }
//             ];
            
//             setProducts(seedProducts);
//         }
//     }, []);

//     // Save vào localStorage
//     useEffect(() => {
//         localStorage.setItem('auction_products', JSON.stringify(products));
//     }, [products]);

//     useEffect(() => {
//         localStorage.setItem('auction_bids', JSON.stringify(bids));
//     }, [bids]);

//     useEffect(() => {
//         localStorage.setItem('auction_orders', JSON.stringify(orders));
//     }, [orders]);


    //=====================================================================================================================================================

    // ---------------------------------------------------------------
    // LOAD DEMO DATA FROM STATIC JSON FILES IN /public/data
    // ---------------------------------------------------------------
    useEffect(() => {
  const fetchJsonArray = async <T,>(url: string): Promise<T[]> => {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Failed to fetch ${url}:`, res.status);
      return [];
    }

    const text = await res.text();

    // Nếu file rỗng hoặc chỉ là khoảng trắng → trả về []
    if (!text.trim()) {
      return [];
    }

    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data as T[];
      }
      console.warn(`Data from ${url} is not an array, returning []`);
      return [];
    } catch (e) {
      console.error(`Error parsing JSON from ${url}:`, e);
      return [];
    }
  };

  const loadStaticData = async () => {
    try {
      const [prodData, bidsData, ordersData] = await Promise.all([
        fetchJsonArray<Product>("/data/auction_products.json"),
        fetchJsonArray<Bid>("/data/auction_bids.json"),
        fetchJsonArray<Order>("/data/auction_orders.json"),
      ]);

      setProducts(prodData);
      setBids(bidsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading static JSON data:", error);
    }
  };

  loadStaticData();
}, []);


    // NOTE: Removed all localStorage saving (quota issue)

    const addProduct = (
        product: Omit<Product, 'id' | 'status' | 'currentPrice' | 'createdAt'>
    ) => {
        const payload = product as Product;

        const newProduct: Product = {
            ...payload,
            id: `product_${Date.now()}`,
            status: 'pending',
            currentPrice: Number(payload.startPrice),
            createdAt: Date.now(),
            startPrice: Number(payload.startPrice),
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
                p.id === bid.productId
                    ? { ...p, currentPrice: bid.amount }
                    : p
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

        setProducts((prev) =>
            prev.map((p) =>
                p.id === order.productId ? { ...p, status: 'ended' } : p
            )
        );
    };

    const updateOrderDeposit = (orderId: string) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId ? { ...o, depositPaid: true } : o
            )
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
        