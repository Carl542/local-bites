import React, { useState } from 'react';
import {
  ArrowLeft,
  Leaf,
  User,
  Hourglass,
  Calendar,
  Utensils,
  Coffee,
  Store,
  Navigation,
  Banknote,
  Landmark,
  Check,
  X,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Order } from '../../types';

export const IncomingOrders: React.FC = () => {
  const {
    orders,
    products,
    confirmOrder,
    declineOrder,
    setActiveFarmerTab,
    setActiveOrderForTracking,
    setActiveFarmerOrderForReview,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'New' | 'Confirmed' | 'Completed'>('New');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const newOrders = orders.filter((o) => o.status === 'New');
  const confirmedOrders = orders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Preparing Products' || o.status === 'Out for Delivery'
  );
  const completedOrders = orders.filter((o) => o.status === 'Delivered' || o.status === 'Declined');

  const displayedOrders =
    activeTab === 'New'
      ? newOrders
      : activeTab === 'Confirmed'
      ? confirmedOrders
      : completedOrders;

  const handleConfirm = (orderId: string) => {
    const res = confirmOrder(orderId);
    if (res.success) {
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const handleDecline = (orderId: string) => {
    if (window.confirm(`Are you sure you want to decline order ${orderId}?`)) {
      declineOrder(orderId);
    }
  };

  const getBuyerIcon = (buyerName: string) => {
    if (buyerName.toLowerCase().includes('café') || buyerName.toLowerCase().includes('cafe')) {
      return <Coffee className="w-4 h-4 text-teal-700" />;
    }
    if (buyerName.toLowerCase().includes('bistro') || buyerName.toLowerCase().includes('dining')) {
      return <Utensils className="w-4 h-4 text-teal-700" />;
    }
    return <Store className="w-4 h-4 text-teal-700" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAF9]">
      {/* Top Header matching exact LocalBites Farmer screen */}
      <div className="px-4 py-3 bg-white border-b border-stone-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFarmerTab('home')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer -ml-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Logo Badge */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div className="leading-tight">
              <div className="text-[9.5px] font-extrabold text-[#166534] tracking-tight">
                LocalBites
              </div>
              <div className="text-[7px] font-bold text-[#166534]/90 uppercase tracking-wider -mt-0.5">
                FARMER CO-OP
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-base font-extrabold text-[#0F172A] ml-2">
            Incoming Orders
          </h1>
        </div>

        {/* User Circular Avatar Button */}
        <button className="w-8 h-8 rounded-full bg-[#0B4A2A] flex items-center justify-center text-white shadow-2xs hover:opacity-90 transition-opacity">
          <User className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Segmented Control Tabs: [New (3)] | [Confirmed 2] | [Completed] */}
        <div className="p-1 bg-[#EEF2FF] rounded-2xl flex items-center border border-[#E0E7FF] text-xs">
          <button
            onClick={() => setActiveTab('New')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer flex-1 ${
              activeTab === 'New'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <span>New</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'New'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-200/70 text-stone-600'
              }`}
            >
              {newOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Confirmed')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer flex-1 ${
              activeTab === 'Confirmed'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <span>Confirmed</span>
            <span className="text-[10px] font-medium text-[#64748B]">
              {confirmedOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Completed')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex-1 ${
              activeTab === 'Completed'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <span>Completed</span>
          </button>
        </div>

        {/* 3 Buyers Waiting Notice Banner matching screenshot */}
        {activeTab === 'New' && (
          <div className="p-3 bg-[#EEF2FF] rounded-2xl border border-[#E0E7FF] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-teal-700 shadow-2xs shrink-0 border border-teal-100">
              <Hourglass className="w-4 h-4 text-teal-700 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-[#0F172A]">
                {newOrders.length} buyers waiting
              </h4>
              <p className="text-[10.5px] text-[#64748B] leading-tight mt-0.5">
                Confirm harvest batch dispatch within 2 hours to hold pickup slots.
              </p>
            </div>
          </div>
        )}

        {/* Action Notification Alert */}
        {actionNotice && (
          <div className="bg-emerald-50 border border-[#166534]/40 p-2.5 rounded-xl text-xs text-[#166534] flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
        )}

        {/* Orders Cards List */}
        <div className="space-y-3 pb-8">
          {displayedOrders.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-stone-200 text-stone-400">
              <Hourglass className="w-10 h-10 text-stone-300 mb-2" />
              <p className="font-semibold text-xs">No orders in this section</p>
            </div>
          ) : (
            displayedOrders.map((order: Order) => {
              const stockChecks = order.items.map((item) => {
                const liveProd = products.find((p) => p.id === item.productId);
                const available = liveProd ? liveProd.stock : 0;
                const hasEnough = available >= item.quantity;
                return { ...item, available, hasEnough };
              });

              const hasShortage = order.status === 'New' && stockChecks.some((c) => !c.hasEnough);

              return (
                <div
                  key={order.id}
                  onClick={() => setActiveFarmerOrderForReview(order)}
                  className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3 hover:border-[#166534]/40 transition-all cursor-pointer group"
                >
                  {/* Top Row: #ORD-1023 [NEW] • [📅 Sep 8, 2026] */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#0F172A] group-hover:text-[#166534] transition-colors">
                        {order.id}
                      </span>
                      {order.status === 'New' ? (
                        <span className="bg-[#FFEDD5] text-[#9A3412] px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide border border-orange-200/60">
                          NEW
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-[#166534] px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-200">
                          {order.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-stone-400 text-[11px] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{order.orderDate.split(',')[0]}</span>
                    </div>
                  </div>

                  {/* Buyer Box with Icon, Name, Address & Distance */}
                  <div className="bg-[#EEF4FF] rounded-xl p-2.5 flex items-center justify-between border border-[#DBEAFE]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                        {getBuyerIcon(order.buyerName)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-xs text-[#0F172A] truncate">
                          {order.buyerName}
                        </h3>
                        <p className="text-[10px] text-stone-500 truncate">
                          {order.buyerAddress}
                        </p>
                      </div>
                    </div>

                    {/* Distance Pill */}
                    <div className="text-[#16A34A] text-[10.5px] font-extrabold flex items-center gap-0.5 shrink-0 pl-2">
                      <Navigation className="w-3 h-3 rotate-45 stroke-[2.5]" />
                      <span>{order.distance || '3.2 km'}</span>
                    </div>
                  </div>

                  {/* Items list with thumbnail, quantity & subVariant, and price */}
                  <div className="space-y-2.5 pt-0.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-11 h-11 rounded-xl object-cover bg-stone-100 border border-stone-200/80 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-[#0F172A] truncate">
                              {item.quantity} {item.unit} {item.productName}
                            </h4>
                            <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                              {item.subVariant || (idx === 0 ? 'Grade A Roma' : 'Fresh Standard')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-xs text-[#166534]">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payout Row with Total and Payment Method Pill */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-medium block">
                        Payout Amount Total
                      </span>
                      <span className="text-lg font-black text-[#0F172A]">
                        ₱{order.total.toLocaleString()}
                      </span>
                    </div>

                    {/* Payment Badge */}
                    {order.paymentMethod === 'Bank Transfer' ? (
                      <span className="bg-[#F1F5F9] text-[#475569] border border-stone-200 rounded-full px-2.5 py-1 text-[10.5px] font-bold flex items-center gap-1 shadow-2xs">
                        <Landmark className="w-3 h-3 text-[#475569]" />
                        <span>Bank Transfer</span>
                      </span>
                    ) : (
                      <span className="bg-[#DCFCE7] text-[#166534] border border-emerald-200 rounded-full px-2.5 py-1 text-[10.5px] font-bold flex items-center gap-1 shadow-2xs">
                        <Banknote className="w-3 h-3 text-[#166534]" />
                        <span>COD</span>
                      </span>
                    )}
                  </div>

                  {/* Shortage Alert */}
                  {hasShortage && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Insufficient stock for this order!</span>
                    </div>
                  )}

                  {/* Actions: Decline & Confirm Buttons matching screenshot */}
                  {order.status === 'New' && (
                    <div
                      className="grid grid-cols-2 gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleDecline(order.id)}
                        className="py-2.5 px-3 rounded-xl bg-[#FFF1F2] hover:bg-rose-100 text-[#E11D48] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-100 shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Decline</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirm(order.id)}
                        disabled={hasShortage}
                        className="py-2.5 px-3 rounded-xl bg-[#166534] hover:bg-[#13572c] active:scale-[0.99] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Confirm</span>
                      </button>
                    </div>
                  )}

                  {/* Confirmed State: Track Delivery */}
                  {(order.status === 'Confirmed' ||
                    order.status === 'Preparing Products' ||
                    order.status === 'Out for Delivery') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOrderForTracking(order);
                        setActiveFarmerTab('delivery');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#166534]" />
                      <span>Track Delivery</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
