import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Product,
  ProductTag,
  Order,
  CartItem,
  ProductCategory,
} from '../types';


import { INITIAL_PRODUCTS, INITIAL_TAGS, INITIAL_ORDERS, INITIAL_CART } from '../data/mockData';

interface AppContextType {
  // State
  products: Product[];
  tags: ProductTag[];
  orders: Order[];
  cart: CartItem[];
  currentRole: 'farmer' | 'buyer';
  viewMode: 'single' | 'split';
  activeFarmerTab: 'home' | 'products' | 'orders' | 'delivery' | 'more';
  activeBuyerTab: 'home' | 'browse' | 'orders' | 'more';
  selectedCategory: ProductCategory;
  selectedTags: string[];
  searchQuery: string;
  isCartOpen: boolean;
  activeOrderForTracking: Order | null;
  activeFarmerOrderForReview: Order | null;
  activeProductForDetail: Product | null;
  activeProductForEdit: Product | null;
  isAddProductOpen: boolean;
  farmerProductsTab: 'available' | 'soldOut';
  cartFlowStateOverride: 'cart' | 'validating' | 'insufficient_stock' | 'confirmation' | null;

  // Setters
  setCurrentRole: (role: 'farmer' | 'buyer') => void;
  setViewMode: (mode: 'single' | 'split') => void;
  setActiveFarmerTab: (tab: 'home' | 'products' | 'orders' | 'delivery' | 'more') => void;
  setActiveBuyerTab: (tab: 'home' | 'browse' | 'orders' | 'more') => void;
  setSelectedCategory: (cat: ProductCategory) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTagFilter: (tagId: string) => void;
  setSearchQuery: (query: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setCartFlowStateOverride: (state: 'cart' | 'validating' | 'insufficient_stock' | 'confirmation' | null) => void;
  setActiveOrderForTracking: (order: Order | null) => void;
  setActiveFarmerOrderForReview: (order: Order | null) => void;
  setActiveProductForDetail: (product: Product | null) => void;
  setActiveProductForEdit: (product: Product | null) => void;
  setIsAddProductOpen: (open: boolean) => void;
  setFarmerProductsTab: (tab: 'available' | 'soldOut') => void;

  // Actions
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'isSoldOut'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomTag: (name: string, icon: string) => ProductTag;
  confirmOrder: (orderId: string) => { success: boolean; message: string };
  declineOrder: (orderId: string) => void;
  advanceDeliveryStatus: (orderId: string) => void;
  addToCart: (product: Product, quantity: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  adjustCartItemToStock: (productId: string) => void;
  setupOversellingScenario: () => void;
  loadUpdatedCartScenario: () => void;
  placeOrder: (buyerInfo: { name: string; address: string; phone: string }) => {
    success: boolean;
    orderId?: string;
    error?: string;
    failedItem?: {
      productId: string;
      productName: string;
      requestedQty: number;
      availableStock: number;
      unit: string;
    };
  };
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'local_bites_products_v1',
  TAGS: 'local_bites_tags_v1',
  ORDERS: 'local_bites_orders_v1',
  CART: 'local_bites_cart_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted states
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [tags, setTags] = useState<ProductTag[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAGS);
    return saved ? JSON.parse(saved) : INITIAL_TAGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : INITIAL_CART;
  });

  // UI Navigation states
  const [currentRole, setCurrentRole] = useState<'farmer' | 'buyer'>('farmer');
  const [viewMode, setViewMode] = useState<'single' | 'split'>('single');
  const [activeFarmerTab, setActiveFarmerTab] = useState<'home' | 'products' | 'orders' | 'delivery' | 'more'>('home');
  const [activeBuyerTab, setActiveBuyerTab] = useState<'home' | 'browse' | 'orders' | 'more'>('home');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All Products');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeOrderForTracking, setActiveOrderForTracking] = useState<Order | null>(null);
  const [activeFarmerOrderForReview, setActiveFarmerOrderForReview] = useState<Order | null>(null);
  const [activeProductForDetail, setActiveProductForDetail] = useState<Product | null>(null);
  const [activeProductForEdit, setActiveProductForEdit] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [farmerProductsTab, setFarmerProductsTab] = useState<'available' | 'soldOut'>('available');
  const [cartFlowStateOverride, setCartFlowStateOverride] = useState<'cart' | 'validating' | 'insufficient_stock' | 'confirmation' | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Toggle tag in filter
  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  // US1-AC01: Add Product
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'isSoldOut'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      isSoldOut: productData.stock <= 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  // US1-AC02: Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedStock = updates.stock !== undefined ? updates.stock : item.stock;
          const isSoldOut = updatedStock <= 0;
          return { ...item, ...updates, isSoldOut };
        }
        return item;
      })
    );
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Add custom tag
  const addCustomTag = (name: string, icon: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = tags.find((t) => t.id === id);
    if (existing) return existing;

    const newTag: ProductTag = {
      id,
      name,
      icon: icon || '🏷️',
      color: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      description: `Custom attribute: ${name}`,
    };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  // US1-AC03 & US1-AC04: Confirm Order & Automatic Stock Deduction
  const confirmOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, message: 'Order not found.' };

    // Stock check before deducting
    for (const item of targetOrder.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${item.productName}. Available: ${prod ? prod.stock : 0} ${item.unit}.`,
        };
      }
    }

    // Deduct stock and mark as sold out if stock reaches 0 (AC3 & AC4)
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const orderItem = targetOrder.items.find((i) => i.productId === p.id);
        if (orderItem) {
          const newStock = Math.max(0, p.stock - orderItem.quantity);
          return {
            ...p,
            stock: newStock,
            isSoldOut: newStock === 0,
          };
        }
        return p;
      })
    );

    // Update order status to Confirmed & update timeline
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'Confirmed',
            timeline: [
              { title: 'Order Confirmed', time: 'Just now', status: 'completed' },
              { title: 'Preparing Products', time: 'Pending', status: 'current' },
              { title: 'Out for Delivery', time: 'Pending', status: 'pending' },
              { title: 'Delivered', time: 'Pending', status: 'pending' },
            ],
          };
        }
        return o;
      })
    );

    return {
      success: true,
      message: `Order ${orderId} confirmed! Stock was automatically deducted.`,
    };
  };

  // Decline Order
  const declineOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Declined' } : o))
    );
  };

  // Advance Delivery Status
  const advanceDeliveryStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === 'Confirmed') {
          return {
            ...o,
            status: 'Preparing Products',
            timeline: [
              { title: 'Order Confirmed', time: 'Completed', status: 'completed' },
              { title: 'Preparing Products', time: 'Just now', status: 'completed' },
              { title: 'Out for Delivery', time: 'Estimated 20 mins', status: 'current' },
              { title: 'Delivered', time: 'Pending', status: 'pending' },
            ],
          };
        }
        if (o.status === 'Preparing Products') {
          return {
            ...o,
            status: 'Out for Delivery',
            timeline: [
              { title: 'Order Confirmed', time: 'Completed', status: 'completed' },
              { title: 'Preparing Products', time: 'Completed', status: 'completed' },
              { title: 'Out for Delivery', time: 'Just now (Driver on route)', status: 'completed' },
              { title: 'Delivered', time: 'Arriving shortly', status: 'current' },
            ],
          };
        }
        if (o.status === 'Out for Delivery') {
          return {
            ...o,
            status: 'Delivered',
            timeline: [
              { title: 'Order Confirmed', time: 'Completed', status: 'completed' },
              { title: 'Preparing Products', time: 'Completed', status: 'completed' },
              { title: 'Out for Delivery', time: 'Completed', status: 'completed' },
              { title: 'Delivered', time: 'Delivered & Received', status: 'completed' },
            ],
          };
        }
        return o;
      })
    );
  };

  // US2-AC02 & US2-AC03: Add to Cart with live stock check & overselling prevention
  const addToCart = (product: Product, quantity: number) => {
    const liveProduct = products.find((p) => p.id === product.id) || product;

    if (liveProduct.isSoldOut || liveProduct.stock <= 0) {
      return {
        success: false,
        message: `${liveProduct.name} is Sold Out!`,
      };
    }

    const existingIndex = cart.findIndex((i) => i.product.id === product.id);
    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > liveProduct.stock) {
      const remainingAllowed = liveProduct.stock - currentQtyInCart;
      return {
        success: false,
        message:
          remainingAllowed > 0
            ? `Only ${remainingAllowed} ${liveProduct.unit} more available in stock (Total: ${liveProduct.stock} ${liveProduct.unit}).`
            : `You already have all available ${liveProduct.stock} ${liveProduct.unit} in your cart!`,
      };
    }

    if (existingIndex >= 0) {
      setCart((prev) => {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: requestedTotal,
        };
        return next;
      });
    } else {
      setCart((prev) => [...prev, { product: liveProduct, quantity }]);
    }

    return { success: true };
  };

  // Update Cart Quantity
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const liveProduct = products.find((p) => p.id === productId);
    if (!liveProduct) return { success: false, message: 'Product not found.' };

    if (quantity > liveProduct.stock) {
      return {
        success: false,
        message: `Cannot exceed available stock of ${liveProduct.stock} ${liveProduct.unit}.`,
      };
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Clamp item in cart to current available stock
  const adjustCartItemToStock = (productId: string) => {
    const liveProduct = products.find((p) => p.id === productId);
    if (!liveProduct) return;
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.quantity, Math.max(0, liveProduct.stock)) }
          : item
      )
    );
  };

  // US2-AC03 Preset: 30 kg initial -> 20 kg ordered -> 10 kg remaining -> Attempt 15 kg
  const setupOversellingScenario = () => {
    // 1. Set Tomatoes stock to 10 kg (with initialStock 30 kg, noting 20 kg confirmed)
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === 'prod-1' || p.name.toLowerCase().includes('tomato')) {
          return {
            ...p,
            name: 'Tomatoes (Grade A Roma)',
            farmName: "Juan's Sungrown Farm",
            initialStock: 30,
            stock: 10,
            isSoldOut: false,
            price: 60,
            unit: 'kg',
            image: '/roma-tomatoes-basket.jpg',
          };
        }
        return p;
      })
    );

    const tomatoProd = products.find(
      (p) => p.id === 'prod-1' || p.name.toLowerCase().includes('tomato')
    ) || products[0];

    const scenarioTomato: Product = {
      ...tomatoProd,
      id: 'prod-1',
      name: 'Tomatoes (Grade A Roma)',
      farmName: "Juan's Sungrown Farm",
      initialStock: 30,
      stock: 10,
      isSoldOut: false,
      price: 60,
      unit: 'kg',
      image: '/roma-tomatoes-basket.jpg',
    };

    // 2. Put 15 kg of Tomatoes + 5 kg Lettuce into Chef Maria's cart
    setCart([
      {
        product: scenarioTomato,
        quantity: 15,
      },
      {
        product: products.find((p) => p.id === 'prod-2') || {
          id: 'prod-2',
          name: 'Crisp Green Oak Lettuce',
          category: 'Vegetables',
          farmName: "Elena's Hydro Harvest",
          location: 'Bansalan, Davao del Sur',
          price: 80,
          unit: 'kg',
          stock: 25,
          initialStock: 25,
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
          description: 'Hydroponically grown crisp green oak leaf lettuce.',
          tags: ['hydroponic', 'locally_grown'],
          isSoldOut: false,
          harvestDate: '6:00 AM TODAY',
          createdAt: new Date().toISOString(),
        },
        quantity: 5,
      },
    ]);

    // 3. Switch to Buyer View, open cart
    setCurrentRole('buyer');
    setActiveBuyerTab('browse');
    setActiveProductForDetail(null);
    setCartFlowStateOverride(null);
    setIsCartOpen(true);
  };

  // US2-AC04 Preset: Updated Cart with 10 kg Tomatoes & 5 kg Lettuce (₱1,000.00)
  const loadUpdatedCartScenario = () => {
    const tomatoProd = products.find(
      (p) => p.id === 'prod-1' || p.name.toLowerCase().includes('tomato')
    ) || INITIAL_PRODUCTS[0];

    const lettuceProd = products.find(
      (p) => p.id === 'prod-2' || p.name.toLowerCase().includes('lettuce')
    ) || INITIAL_PRODUCTS[1];

    setCart([
      {
        product: { ...tomatoProd, stock: 10 },
        quantity: 10,
      },
      {
        product: lettuceProd,
        quantity: 5,
      },
    ]);

    setCurrentRole('buyer');
    setActiveBuyerTab('browse');
    setActiveProductForDetail(null);
    setCartFlowStateOverride('cart');
    setIsCartOpen(true);
  };

  // US2-AC03 & US2-AC04: Place Order with Stock Validation & Overselling Prevention
  const placeOrder = (buyerInfo: { name: string; address: string; phone: string }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // Strict validation against current stock (US2-AC03)
    for (const item of cart) {
      const liveProduct = products.find((p) => p.id === item.product.id);
      if (!liveProduct) {
        return {
          success: false,
          error: `Product ${item.product.name} is no longer available.`,
        };
      }
      if (liveProduct.stock < item.quantity) {
        return {
          success: false,
          error: `Only ${liveProduct.stock} ${liveProduct.unit} of ${liveProduct.name} is currently available.`,
          failedItem: {
            productId: liveProduct.id,
            productName: liveProduct.name,
            requestedQty: item.quantity,
            availableStock: liveProduct.stock,
            unit: liveProduct.unit,
          },
        };
      }
    }

    const newOrderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

    const newOrder: Order = {
      id: newOrderId,
      buyerName: buyerInfo.name || 'Green Leaf Bistro (Chef Maria)',
      buyerAddress: buyerInfo.address || 'Rizal St., Digos City',
      phone: buyerInfo.phone || '0917 123 4567',
      distance: '2.4 km',
      paymentMethod: 'COD',
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        farmName: c.product.farmName,
        quantity: c.quantity,
        unit: c.product.unit,
        price: c.product.price,
        image: c.product.image,
      })),
      total,
      status: 'Confirmed',
      orderDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      timeline: [
        { title: 'Order Placed', time: 'Just now', status: 'completed' },
        { title: 'Confirmed by Farmer', time: 'Just now', status: 'completed' },
        { title: 'Out for Delivery', time: 'Estimated in ~15 mins', status: 'current' },
        { title: 'Delivered', time: 'Pending buyer signature', status: 'pending' },
      ],
    };

    // Deduct stock upon successful placement
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((c) => c.product.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.stock - cartItem.quantity);
          return {
            ...p,
            stock: newStock,
            isSoldOut: newStock === 0,
          };
        }
        return p;
      })
    );

    // Add to orders
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart
    clearCart();

    return { success: true, orderId: newOrderId };
  };

  // Reset to initial demo data
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    setProducts(INITIAL_PRODUCTS);
    setTags(INITIAL_TAGS);
    setOrders(INITIAL_ORDERS);
    setCart(INITIAL_CART);
    setSelectedCategory('All Products');
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        tags,
        orders,
        cart,
        currentRole,
        viewMode,
        activeFarmerTab,
        activeBuyerTab,
        selectedCategory,
        selectedTags,
        searchQuery,
        isCartOpen,
        activeOrderForTracking,
        activeFarmerOrderForReview,
        activeProductForDetail,
        activeProductForEdit,
        isAddProductOpen,
        farmerProductsTab,
        cartFlowStateOverride,

        setCurrentRole,
        setViewMode,
        setActiveFarmerTab,
        setActiveBuyerTab,
        setSelectedCategory,
        setSelectedTags,
        toggleTagFilter,
        setSearchQuery,
        setIsCartOpen,
        setCartFlowStateOverride,
        setActiveOrderForTracking,
        setActiveFarmerOrderForReview,
        setActiveProductForDetail,
        setActiveProductForEdit,
        setIsAddProductOpen,
        setFarmerProductsTab,

        addProduct,
        updateProduct,
        deleteProduct,
        addCustomTag,
        confirmOrder,
        declineOrder,
        advanceDeliveryStatus,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        adjustCartItemToStock,
        setupOversellingScenario,
        loadUpdatedCartScenario,
        placeOrder,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
