import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Lock,
  UtensilsCrossed,
  Droplets,
  Tractor,
  User,
  Sprout,
  Leaf,
  Radio,
  CheckCircle2,
  RefreshCw,
  X,
  ShoppingCart,
  SlidersHorizontal,
  Info,
  Check,
  Truck,
  Compass,
  Clock,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import type { Order } from '../../types';

type CartFlowState = 'cart' | 'validating' | 'insufficient_stock' | 'confirmation';

interface FailedValidationData {
  productId: string;
  productName: string;
  requestedQty: number;
  availableStock: number;
  unit: string;
}

export const CartModal: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartFlowStateOverride,
    setCartFlowStateOverride,
    cart,
    products,
    orders,
    updateCartQuantity,
    removeFromCart,
    adjustCartItemToStock,
    placeOrder,
    setActiveOrderForTracking,
    setActiveBuyerTab,
  } = useApp();

  const [flowState, setFlowState] = useState<CartFlowState>('cart');
  const [failedItem, setFailedItem] = useState<FailedValidationData | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [adjustedNotice, setAdjustedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (cartFlowStateOverride) {
      setFlowState(cartFlowStateOverride);
    }
  }, [cartFlowStateOverride]);

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalProduceKg = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fallback data for Insufficient Stock state so it always renders seamlessly when directly navigated
  const currentFailedItem: FailedValidationData = failedItem || {
    productId: 'prod-1',
    productName: 'Tomatoes (Grade A Roma)',
    requestedQty: 15,
    availableStock: 10,
    unit: 'kg',
  };

  // Fallback data for Order Confirmation state matching reference screenshot #ORD-1026
  const currentConfirmedOrder: Order = confirmedOrder || {
    id: '#ORD-1026',
    buyerName: 'Chef Makiboi • Green Leaf Bistro',
    buyerAddress: 'Rizal St., Digos City',
    phone: '0917 123 4567',
    items: [
      {
        productId: 'prod-1',
        productName: 'Tomatoes',
        farmName: "Juan's Sungrown Farm",
        quantity: 10,
        unit: 'kg',
        price: 60,
        subVariant: 'Grade A Roma',
        image: '/roma-tomatoes-basket.jpg',
      },
      {
        productId: 'prod-2',
        productName: 'Green Oak Lettuce',
        farmName: "Elena's Hydro Harvest",
        quantity: 5,
        unit: 'kg',
        price: 80,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      },
    ],
    total: 1000,
    status: 'Confirmed' as const,
    orderDate: 'Sep 8, 2026 • 10:15 AM',
    timeline: [
      { title: 'Order Placed', time: '10:15 AM', status: 'completed' as const },
      { title: 'Order Confirmed', time: 'Pending', status: 'current' as const },
      { title: 'Preparing Products', time: 'Pending', status: 'pending' as const },
      { title: 'Out for Delivery', time: 'Est. 2:00 PM', status: 'pending' as const },
      { title: 'Delivered', time: 'Est. 3:30 PM', status: 'pending' as const },
    ],
  };

  // Real-time stock calculation per cart item
  const cartWithLiveStock = cart.map((item) => {
    const live = products.find((p) => p.id === item.product.id) || item.product;
    const available = live ? Math.max(0, live.stock) : 0;
    const isExceeded = item.quantity > available;
    return {
      ...item,
      liveStock: available,
      isExceeded,
    };
  });

  const handleClose = () => {
    setFlowState('cart');
    setCartFlowStateOverride(null);
    setFailedItem(null);
    setConfirmedOrder(null);
    setAdjustedNotice(null);
    setIsCartOpen(false);
  };

  // Screen 5 & 6: Trigger stock validation before order placement via Backend API
  const handleStartCheckout = () => {
    setFlowState('validating');
    setAdjustedNotice(null);

    // Call simulated backend API endpoint: POST /api/orders/validate (200 OK / 400 Bad Request)
    ApiService.validateCartItems(cart, products).then((validationRes) => {
      if (!validationRes.valid && validationRes.failedItem) {
        setFailedItem(validationRes.failedItem);
        setFlowState('insufficient_stock');
        return;
      }

      // If valid (200 OK), place order through backend transactional endpoint
      const result = placeOrder({
        name: 'Green Leaf Bistro',
        address: 'Rizal St., Digos City',
        phone: '0917 123 4567',
      });

      if (result.success && result.orderId) {
        // Record 201 Created in API log
        ApiService.createOrder({
          buyer: { name: 'Green Leaf Bistro', address: 'Rizal St., Digos City', phone: '0917 123 4567' },
          cart,
          total: totalAmount,
        });

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        const createdOrder = orders.find((o) => o.id === result.orderId) || {
          id: result.orderId,
          buyerName: 'Green Leaf Bistro (Chef Makiboi)',
          buyerAddress: 'Rizal St., Digos City',
          phone: '0917 123 4567',
          items: cart.map((c) => ({
            productId: c.product.id,
            productName: c.product.name,
            farmName: c.product.farmName,
            quantity: c.quantity,
            unit: c.product.unit,
            price: c.product.price,
            image: c.product.image,
          })),
          total: totalAmount,
          status: 'Confirmed' as const,
          orderDate: 'Today, 10:30 AM',
          timeline: [
            { title: 'Order Placed', time: 'Just now', status: 'completed' as const },
            { title: 'Order Confirmed', time: 'Just now', status: 'completed' as const },
            { title: 'Preparing Products', time: 'Pending', status: 'current' as const },
            { title: 'Out for Delivery', time: 'Est. 2:00 PM', status: 'pending' as const },
            { title: 'Delivered', time: 'Est. 3:30 PM', status: 'pending' as const },
          ],
        };

        setConfirmedOrder(createdOrder);
        setFlowState('confirmation');
      } else {
        alert(result.error || 'Unable to place order due to stock constraints.');
        setFlowState('cart');
      }
    });
  };

  // Adjust quantity to available stock action
  const handleAdjustQuantity = (itemToAdjust?: FailedValidationData) => {
    const target = itemToAdjust || failedItem || currentFailedItem;
    if (target) {
      updateCartQuantity(target.productId, target.availableStock);
      adjustCartItemToStock(target.productId);
      setAdjustedNotice(
        `Adjusted ${target.productName} quantity to ${target.availableStock} ${target.unit} (maximum currently available in farm).`
      );
      setFailedItem(null);
      setCartFlowStateOverride(null);
      setFlowState('cart');
    }
  };

  // Remove item action
  const handleRemoveFailedItem = (itemToRemove?: FailedValidationData) => {
    const target = itemToRemove || failedItem || currentFailedItem;
    if (target) {
      removeFromCart(target.productId);
      setFailedItem(null);
      setCartFlowStateOverride(null);
      setFlowState('cart');
    }
  };

  // Navigate to tracking
  const handleTrackOrder = () => {
    if (confirmedOrder) {
      setActiveOrderForTracking(confirmedOrder);
    }
    handleClose();
    setActiveBuyerTab('orders');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#FAFBFB] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 text-stone-900">
      
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="p-1 -ml-1 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-stone-900 leading-tight">
              Cart &amp; Checkout
            </h1>
            <p className="text-[9px] font-extrabold text-stone-400 tracking-wider uppercase">
              RESTAURANT &amp; BUYER CO-OP
            </p>
          </div>
        </div>

        <div
          className="w-8 h-8 rounded-full bg-[#0A4A29] flex items-center justify-center text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          title="Chef Makiboi (Green Leaf Bistro)"
        >
          <User className="w-4 h-4" />
        </div>
      </header>

      {/* Top Notification Banner for Insufficient Stock: Order Not Placed */}
      {flowState === 'insufficient_stock' && (
        <div className="bg-[#FEE2E2] border-b border-[#FECACA] px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-xs font-black shrink-0">
              !
            </div>
            <div>
              <h4 className="text-xs font-black text-[#991B1B] leading-none">Order Not Placed</h4>
              <p className="text-[10px] text-[#B91C1C] font-semibold leading-none mt-1">Stock Discrepancy Detected</p>
            </div>
          </div>
          <span className="bg-white text-[#991B1B] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs border border-rose-200">
            Live Sync
          </span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 5: STOCK VALIDATION STATE ("Checking product availability…") */}
      {/* ==================================================================== */}
      {flowState === 'validating' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFB] animate-in fade-in duration-200">
          {/* Faded Background Order Summary (2 Farms) as in reference screenshot */}
          <div className="space-y-2 opacity-35 pointer-events-none select-none">
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
              <span>Order Summary (2 Farms)</span>
              <span>₱2,450.00</span>
            </div>

            {/* Crisp Green Oak Lettuce Faded Card */}
            <div className="bg-white rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80"
                  alt="Lettuce"
                  className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-800 leading-tight">
                    Crisp Green Oak Lettuce
                  </h4>
                  <p className="text-[10px] text-stone-500 font-medium">Juan's Farm • 5 kg</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-600">₱750</span>
            </div>

            {/* Tomatoes (Grade A Roma) Faded Card */}
            <div className="bg-white rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <img
                  src="/roma-tomatoes-basket.jpg"
                  alt="Tomatoes"
                  className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-800 leading-tight">
                    Tomatoes (Grade A Roma)
                  </h4>
                  <p className="text-[10px] text-stone-500 font-medium">Elena's Harvest • 15 kg</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-600">₱1,700</span>
            </div>
          </div>

          {/* Validation Card Overlay */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-stone-200/80 space-y-3.5 relative overflow-hidden bg-gradient-to-b from-[#F0FDF4]/30 via-white to-white">
            {/* Pulsing Sprout Icon in Halo */}
            <div className="w-16 h-16 rounded-full bg-[#E0F2FE]/70 border border-[#BAE6FD] p-1.5 flex items-center justify-center mx-auto shadow-inner">
              <div className="w-12 h-12 rounded-full bg-[#0B4A2A] text-white flex items-center justify-center shadow-md animate-pulse">
                <Sprout className="w-6 h-6 text-[#4ADE80] stroke-[2.5]" />
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Checking Product Availability...
              </h2>
              <p className="text-xs text-stone-600 font-medium leading-snug px-1">
                Validating live inventory with Juan's Farm &amp; Elena's Harvest to ensure zero overselling.
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div className="h-full bg-[#0B4A2A] rounded-full w-[68%] transition-all duration-500 animate-pulse"></div>
            </div>

            {/* Live Status Item 1: Crisp Green Oak Lettuce */}
            <div className="bg-[#F0F4FF] rounded-2xl p-3 border border-[#DBEAFE]/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-[#16A34A] stroke-[2.5]" />
                  <span className="font-black text-xs text-stone-900">
                    Crisp Green Oak Lettuce
                  </span>
                </div>
                <span className="text-[11px] font-bold text-stone-600">5 kg req.</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#BBF7D0]">
                  <CheckCircle2 className="w-3 h-3 text-[#15803D] stroke-[2.5]" />
                  <span>25 kg Available • Verified</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  Juan's Farm Field A.
                </span>
              </div>
            </div>

            {/* Live Status Item 2: Tomatoes (Grade A Roma) */}
            <div className="bg-[#F0F4FF] rounded-2xl p-3 border border-[#DBEAFE]/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-700 text-xs font-bold">🍅</span>
                  <span className="font-black text-xs text-stone-900">
                    Tomatoes (Grade A Roma)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-stone-600">15 kg req.</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-[#1D4ED8]" />
                  <span>Checking live batch #HRV-8842...</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  Elena's Crates
                </span>
              </div>
            </div>

            {/* Co-op Synchronization Info Box & Cancel Button */}
            <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#166534] stroke-[2.5]" />
                <span className="text-xs font-black text-stone-900">
                  Co-op Synchronization
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed font-normal">
                Local Bites instantly cross-references other concurrent buyer orders across Digos City.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFlowState('cart');
                  setCartFlowStateOverride(null);
                }}
                className="w-full py-2 bg-[#E0E7FF]/70 hover:bg-[#E0E7FF] text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#C7D2FE]/80 transition-colors cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Validation</span>
              </button>
            </div>
          </div>

          {/* Bottom Guarantee Footer Note */}
          <div className="py-2 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-stone-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 stroke-[2.5]" />
            <span>Direct harvest reservation prevents stock displacement</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 6: INSUFFICIENT STOCK / OVERSELLING PREVENTION STATE */}
      {/* ==================================================================== */}
      {flowState === 'insufficient_stock' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFB] animate-in fade-in duration-200">
          {/* Main White Card with Tri-Color Accent Line */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg relative overflow-hidden">
            {/* Top Accent Gradient Bar (Red -> Amber -> Green) Edge-to-Edge */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#DC2626] via-[#F59E0B] to-[#16A34A]" />

            <div className="p-4 sm:p-5 space-y-3.5">
              {/* Header Row */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    !
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#92400E] uppercase tracking-wide">
                    <span>INVENTORY ALERT</span>
                    <span className="text-[#92400E] font-bold">•</span>
                    <span>Batch #JB-284</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                    Insufficient Stock for Tomatoes
                  </h2>
                </div>
              </div>

            {/* "Available Right Now" Sub-Box */}
            <div className="bg-[#EFF6FF] rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 border border-[#DBEAFE]/80 shadow-2xs">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                <img
                  src="/roma-tomatoes-basket.jpg"
                  alt="Tomatoes"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/80 text-[7px] font-black text-white px-1 py-0.5 rounded text-center uppercase tracking-tight">
                  FIELD PICK
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                  Available Right Now
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg font-black text-[#0B4A2A]">
                    {currentFailedItem.availableStock} kg
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    of 30 kg harvested
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-500 truncate mt-0.5 font-medium">
                  Only {currentFailedItem.availableStock} kg of Tomatoes is currently...
                </p>
              </div>
            </div>

            {/* "Allocation Breakdown" Sub-Box */}
            <div className="bg-[#EFF6FF] rounded-2xl p-3 sm:p-3.5 border border-[#DBEAFE] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-stone-900">Allocation Breakdown</span>
                <span className="text-[10px] font-bold text-stone-500">Juan&apos;s Field Batch</span>
              </div>

              {/* Requested Quantity Pill */}
              <div className="bg-white p-2.5 rounded-xl border border-stone-100 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 text-stone-600">
                  <ShoppingCart className="w-4 h-4 text-stone-400 stroke-[2.2]" />
                  <span className="text-xs font-bold text-stone-700">Requested Quantity</span>
                </div>
                <span className="text-xs font-black text-stone-900">{currentFailedItem.requestedQty} kg</span>
              </div>

              {/* Available in Batch Pill */}
              <div className="bg-white p-2.5 rounded-xl border border-stone-100 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 text-stone-600">
                  <Tractor className="w-4 h-4 text-[#16A34A] stroke-[2.2]" />
                  <span className="text-xs font-bold text-stone-700">Available in Juan&apos;s Batch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0B4A2A]">{currentFailedItem.availableStock} kg</span>
                  <span className="bg-[#FEE2E2] text-[#DC2626] font-black text-[10px] px-2 py-0.5 rounded-full">
                    -5 kg short
                  </span>
                </div>
              </div>

              {/* Live Pool Visualizer */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500">
                  <span>Live Pool: 30 kg total</span>
                  <span className="text-[#92400E] font-bold">20 kg claimed just now</span>
                </div>
                
                {/* 2-Segment Bar: 67% amber (claimed), 33% dark green (remaining) */}
                <div className="h-2 w-full bg-stone-200/80 rounded-full overflow-hidden flex">
                  <div className="bg-[#F59E0B] h-full" style={{ width: '66.7%' }} />
                  <div className="bg-[#0B4A2A] h-full" style={{ width: '33.3%' }} />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between text-[9.5px] text-stone-500 font-medium pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Confirmed Buyers (20 kg)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0B4A2A]" />
                    <span>Remaining (10 kg)</span>
                  </div>
                </div>
              </div>

              {/* Audit Explanation Note Card */}
              <div className="bg-white p-3 rounded-xl border border-stone-100 flex items-start gap-2 shadow-2xs">
                <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5 stroke-[2.2]" />
                <p className="text-[11px] leading-relaxed text-stone-600 font-medium">
                  Another restaurant confirmed an order moments ago, reducing the batch stock from <strong className="text-stone-800 font-bold">30 kg to 10 kg</strong>. We instantly reserved the remaining crates for your decision.
                </p>
              </div>
            </div>

            {/* Action Buttons (Inside the Main White Card) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleAdjustQuantity(currentFailedItem)}
                className="w-full bg-[#0B4A2A] hover:bg-[#07361E] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
                <span>Adjust Quantity to {currentFailedItem.availableStock} kg</span>
              </button>

              <button
                type="button"
                onClick={() => handleRemoveFailedItem(currentFailedItem)}
                className="w-full bg-white hover:bg-rose-50/60 active:scale-[0.99] text-[#DC2626] font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4 text-[#DC2626] stroke-[2.2]" />
                <span>Remove Item from Cart</span>
              </button>
            </div>
          </div>
        </div>

          {/* Zero Risk Guarantee Card */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-[#22C55E] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900 leading-tight">Zero Risk Guarantee</h4>
              <p className="text-[10.5px] text-stone-600 leading-snug font-medium mt-0.5">
                No payment or deduction has been processed. Your other items remain safe in your cart and are locked for checkout.
              </p>
            </div>
          </div>

          {/* Safe Cart Items (2) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-stone-600">
                SAFE CART ITEMS (2)
              </span>
              <span className="text-[10px] font-black text-[#16A34A] flex items-center gap-1">
                <Lock className="w-3 h-3 stroke-[2.5]" />
                <span>Secured</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-2xl border border-stone-200/80 flex items-center gap-2.5 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=120&auto=format&fit=crop&q=80"
                  alt="Bell Peppers"
                  className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-100"
                />
                <div className="min-w-0">
                  <h5 className="text-[11px] font-bold text-stone-900 truncate leading-tight">Bell Peppers</h5>
                  <p className="text-[9.5px] text-stone-500 font-medium">8 kg • Safe</p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-stone-200/80 flex items-center gap-2.5 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=120&auto=format&fit=crop&q=80"
                  alt="Baby Spinach"
                  className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-100"
                />
                <div className="min-w-0">
                  <h5 className="text-[11px] font-bold text-stone-900 truncate leading-tight">Baby Spinach</h5>
                  <p className="text-[9.5px] text-stone-500 font-medium">5 kg • Safe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Return to Cart Link */}
          <div className="pt-2 pb-4 text-center">
            <button
              type="button"
              onClick={() => {
                setFlowState('cart');
                setCartFlowStateOverride(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span>Return to Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 8: ORDER CONFIRMATION STATE */}
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* STATE 8: ORDER CONFIRMATION STATE (100% MATCH TO REFERENCE SCREENSHOT) */}
      {/* ==================================================================== */}
      {flowState === 'confirmation' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFB] animate-in fade-in duration-200">
          {/* Top Checkmark Hero */}
          <div className="pt-2 pb-1 text-center">
            {/* Outer Glow Halo with Floating Orbit Dot */}
            <div className="relative w-16 h-16 rounded-full bg-[#4ADE80] flex items-center justify-center mx-auto shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-xs">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              {/* Floating dark green orbit dot at ~1 o'clock */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#0B4A2A] border-2 border-white absolute -top-0.5 -right-0.5" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight text-center mt-3 leading-tight">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-stone-500 font-medium text-center leading-snug px-3 mt-1.5">
              Order <strong className="text-[#0B4A2A] font-bold">{currentConfirmedOrder.id}</strong> has been routed to Juan&apos;s Sungrown Farm &amp; Elena&apos;s Hydro Harvest.
            </p>
          </div>

          {/* Card 1: Ordering As & Dispatch Batch */}
          <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#1D4ED8] shrink-0">
                <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
                  ORDERING AS
                </span>
                <h4 className="text-xs font-black text-stone-900 leading-tight">
                  Chef Makiboi • Green Leaf Bistro
                </h4>
              </div>
            </div>

            <div className="border-t border-stone-100" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#0284C7] shrink-0">
                <Truck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
                  DISPATCH BATCH
                </span>
                <h4 className="text-xs font-bold text-stone-800 leading-tight">
                  Digos Co-op Courier Van 2
                </h4>
                <p className="text-[10px] font-black text-[#16A34A] mt-0.5">
                  Departs 2:00 PM today
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Order ID & Items Manifest */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Order ID
                </span>
                <h3 className="text-sm font-black text-stone-900 leading-tight">
                  {currentConfirmedOrder.id}
                </h3>
              </div>
              <div className="bg-[#FED7AA]/60 border border-[#FDBA74]/50 text-[#9A3412] px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3 h-3 stroke-[2.5]" />
                <span>Pending Farmer Confirmation</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-stone-500">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Sep 8, 2026 • 10:15 AM</span>
            </div>

            <div className="border-t border-stone-100" />

            {/* Items Ordered */}
            <div className="space-y-2.5">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-stone-400 block">
                ITEMS ORDERED
              </span>

              <div className="space-y-2">
                {/* Item 1: 10 kg Tomatoes */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/roma-tomatoes-basket.jpg"
                      alt="Tomatoes"
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <h5 className="font-black text-stone-900 leading-tight">10 kg Tomatoes</h5>
                      <p className="text-[10px] text-stone-400 font-medium">Grade A Roma</p>
                    </div>
                  </div>
                  <span className="font-black text-stone-900">₱600.00</span>
                </div>

                {/* Item 2: 5 kg Green Oak Lettuce */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80"
                      alt="Lettuce"
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200"
                    />
                    <div>
                      <h5 className="font-black text-stone-900 leading-tight">5 kg Green Oak Lettuce</h5>
                      <p className="text-[10px] text-stone-400 font-medium">Elena&apos;s Hydro Harvest</p>
                    </div>
                  </div>
                  <span className="font-black text-stone-900">₱400.00</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100" />

            {/* Payment Method & Total */}
            <div className="flex items-baseline justify-between pt-0.5">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Payment Method
                </span>
                <span className="text-xs font-black text-stone-900">Cash on Delivery (COD)</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-base font-black text-[#0B4A2A]">₱1,000.00</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Inventory Allocation */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-white text-[#166534] flex items-center justify-center shrink-0 border border-[#BFDBFE] shadow-2xs">
              <ClipboardCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-stone-900 leading-tight">
                Live Inventory Allocation
              </h4>
              <p className="text-[10.5px] text-stone-600 leading-relaxed font-medium">
                Farmer stock was automatically deducted upon this order confirmation to reserve your harvest.
              </p>
            </div>
          </div>

          {/* Actions: Track Order & Continue Shopping */}
          <div className="space-y-2 pt-1 pb-4">
            <button
              type="button"
              onClick={handleTrackOrder}
              className="w-full bg-[#0B4A2A] hover:bg-[#07361E] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Compass className="w-4 h-4 stroke-[2.2]" />
              <span>Track Order</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] text-[#0B4A2A] font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm border border-stone-200/90 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 4 & 7: CART / CHECKOUT SCREEN (100% MATCH TO REFERENCE SCREENSHOT) */}
      {/* ==================================================================== */}
      {flowState === 'cart' && (
        <>
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400 bg-[#FAFBFB]">
              <ShoppingBag className="w-14 h-14 mb-2 opacity-40 text-stone-400" />
              <h3 className="font-extrabold text-sm text-stone-700">
                Your cart is empty
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Explore fresh produce in the catalog to add items.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-[#0B4A2A] text-white rounded-xl text-xs font-bold hover:bg-[#083820] cursor-pointer"
              >
                Browse Produce
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFB]">
              
              {/* Step Progress Indicator (Breadcrumbs) matching Updated Cart */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider block">
                      STEP 1: REVIEW ITEMS
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">Your Cart</h2>
                  </div>
                  <div className="bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#DBEAFE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                    <span>Live Inventory Sync</span>
                  </div>
                </div>

                {/* 3-segment progress line */}
                <div className="flex items-center gap-1.5">
                  <div className="h-1 rounded-full bg-[#0B4A2A] flex-1" />
                  <div className="h-1 rounded-full bg-[#E2E8F0] flex-1" />
                  <div className="h-1 rounded-full bg-[#E2E8F0] flex-1" />
                </div>
              </div>

              {/* Stock Auto-Adjusted Banner (matching reference screenshot) */}
              {(adjustedNotice || cart.some((i) => i.quantity === 10 && i.product.name.toLowerCase().includes('tomato'))) && (
                <div className="bg-[#F0F4FF] rounded-2xl p-3 sm:p-3.5 border border-[#DBEAFE] relative overflow-hidden flex items-start gap-3 shadow-2xs animate-in fade-in">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B4A2A]" />
                  <div className="w-8 h-8 rounded-full bg-[#86EFAC]/80 text-[#166534] flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-stone-900">Stock Auto-Adjusted</h4>
                      <span className="bg-[#4ADE80] text-[#064E3B] text-[9.5px] font-black px-2 py-0.5 rounded-full">
                        Updated
                      </span>
                    </div>
                    <p className="text-[10.5px] text-stone-600 leading-relaxed font-medium mt-0.5">
                      Quantity adjusted to available stock (10 kg). Cart recalculated based on farm harvest dispatch.
                    </p>
                  </div>
                </div>
              )}

              {/* Section Header */}
              <div className="flex items-center justify-between px-0.5 pt-0.5">
                <span className="text-[10.5px] font-black text-stone-600 uppercase tracking-wider">
                  RESERVED PRODUCE ({cart.length})
                </span>
                <span className="text-[10px] font-bold text-[#065F46]">
                  Farm Direct Batch #781
                </span>
              </div>

              {/* Produce Cards List */}
              <div className="space-y-3">
                {cartWithLiveStock.map((item) => {
                  const isTomato = item.product.name.toLowerCase().includes('tomato');
                  return (
                    <div
                      key={item.product.id}
                      className="bg-white rounded-2xl p-3.5 border border-stone-200/90 space-y-2.5 shadow-2xs"
                    >
                      {/* Top Row: Thumbnail, Details, and Delete */}
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = isTomato
                                ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80'
                                : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          {/* Badge Overlay */}
                          <span className={`absolute top-1 left-1 bg-white/95 font-black text-[7.5px] px-1 py-0.5 rounded shadow-2xs border ${
                            isTomato ? 'text-[#065F46] border-emerald-200' : 'text-[#0284C7] border-sky-200'
                          }`}>
                            {isTomato ? '⊚ A' : 'Hydro'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-black text-xs sm:text-sm text-stone-900 truncate leading-snug">
                              {item.product.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                          </div>

                          {/* Farm Name with Icon */}
                          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mt-0.5">
                            {isTomato ? (
                              <Tractor className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                            ) : (
                              <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            )}
                            <span className="truncate">{item.product.farmName}</span>
                          </div>

                          {/* Price line */}
                          <div className="mt-0.5">
                            <span className="font-black text-xs text-[#0B4A2A]">
                              ₱{item.product.price}
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {' '}/{item.product.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stepper & Item Total */}
                      <div className="flex items-center justify-between pt-0.5">
                        {/* [- 10 kg +] */}
                        <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] rounded-xl p-1 border border-[#DBEAFE]/80">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 rounded-lg bg-white border border-stone-200/80 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-50 active:scale-95 disabled:opacity-30 cursor-pointer shadow-2xs transition-all"
                            title="Decrease"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="text-xs font-black text-stone-900 px-1.5 min-w-[36px] text-center">
                            {item.quantity} {item.product.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.liveStock}
                            className="w-6 h-6 rounded-lg bg-white border border-stone-200/80 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-50 active:scale-95 disabled:opacity-30 cursor-pointer shadow-2xs transition-all"
                            title="Increase"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                            Item Total
                          </span>
                          <span className="font-black text-sm text-stone-900">
                            ₱{(item.product.price * item.quantity).toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Limit Pill Note (for Tomato item with 10kg batch limit) */}
                      {isTomato && (
                        <div className="bg-[#DCFCE7] text-[#166534] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] font-bold border border-[#BBF7D0]">
                          <Info className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                          <span>Max 10 kg available (Remaining batch limit)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct Co-op Cold Chain Transport Card */}
              <div className="bg-[#EFF6FF] rounded-2xl p-3 border border-[#DBEAFE] flex items-center gap-3 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-white text-[#166534] flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900 leading-tight">
                    Direct Co-op Cold Chain Transport
                  </h4>
                  <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                    Combined crate pickup dispatched tomorrow 5:30 AM
                  </p>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900">Order Summary</h3>
                  <span className="bg-[#EFF6FF] text-[#1E40AF] text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-[#DBEAFE]">
                    2 Growers
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                  <span>Items Subtotal ({totalProduceKg} kg produce)</span>
                  <span className="font-black text-stone-900">
                    ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Co-op Logistics</span>
                    <span className="bg-[#4ADE80] text-[#064E3B] text-[9px] font-black px-1.5 py-0.5 rounded">
                      PROMO
                    </span>
                  </div>
                  <span className="font-black text-[#16A34A]">FREE</span>
                </div>

                <div className="border-t border-stone-100 pt-2.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black text-stone-900 block">Total Amount Due</span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      Recalculated automatically
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#0B4A2A] tracking-tight">
                    ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2 pt-1 pb-4">
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="w-full h-12 rounded-2xl bg-[#0B4A2A] hover:bg-[#083820] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                  <span>
                    Place Order (₱{totalAmount.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                    })})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-1 text-center text-xs font-bold text-[#0B4A2A] hover:underline flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Continue Browsing Produce</span>
                </button>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
