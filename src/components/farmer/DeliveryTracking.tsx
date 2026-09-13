import React, { useState } from 'react';
import {
  ArrowLeft,
  Leaf,
  User,
  Store,
  MapPin,
  Phone,
  Navigation,
  Check,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Order } from '../../types';

export const DeliveryTracking: React.FC = () => {
  const {
    orders,
    activeOrderForTracking,
    setActiveOrderForTracking,
    setActiveFarmerTab,
    advanceDeliveryStatus,
  } = useApp();

  const [showMapModal, setShowMapModal] = useState(false);

  // Active delivery candidates
  const activeOrders = orders.filter(
    (o) =>
      o.status === 'Confirmed' ||
      o.status === 'Preparing Products' ||
      o.status === 'Out for Delivery' ||
      o.status === 'Delivered'
  );

  // Default to #ORD-1023 to match screenshot, or selected tracking order
  const selectedOrder: Order | undefined =
    activeOrderForTracking ||
    orders.find((o) => o.id === '#ORD-1023') ||
    activeOrders[0] ||
    orders[0];

  const handleAdvance = () => {
    if (!selectedOrder) return;
    advanceDeliveryStatus(selectedOrder.id);
  };

  const isOrd1023 = selectedOrder?.id === '#ORD-1023';

  // Order summary details
  const summaryTitle = isOrd1023
    ? '10 kg Tomatoes & 5 kg Lettuce'
    : selectedOrder?.items
        .map((i) => `${i.quantity} ${i.unit} ${i.productName}`)
        .join(' & ') || '10 kg Tomatoes & 5 kg Lettuce';

  const dispatchNumber = isOrd1023 ? 'Dispatch #829' : 'Dispatch #884';
  const totalDisplay = isOrd1023 ? 900 : selectedOrder?.total || 900;
  const buyerName = selectedOrder?.buyerName || 'Green Leaf Bistro';
  const buyerAddress = selectedOrder?.buyerAddress || 'Rizal St., Digos City';
  const phone = selectedOrder?.phone || '0917 123 4567';
  const distance = selectedOrder?.distance || '2.4 km';

  const isDelivered = selectedOrder?.status === 'Delivered';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAF9]">
      {/* Top Header matching exact screenshot */}
      <div className="px-4 py-3 bg-white border-b border-stone-200/90 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveFarmerTab('orders')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer -ml-1 transition-colors"
              title="Back to Orders"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Logo Badge */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-2xs shrink-0">
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

            {/* Screen Title */}
            <h1 className="text-base font-extrabold text-[#0F172A] ml-1">
              Delivery
            </h1>
          </div>

          {/* User Circular Avatar Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#0B4A2A] flex items-center justify-center text-white shadow-2xs hover:opacity-90 transition-opacity"
            title="Carl Amil"
          >
            <User className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Order Selector Chips if multiple orders */}
        {activeOrders.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
            {activeOrders.map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => setActiveOrderForTracking(ord)}
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 border transition-all cursor-pointer ${
                  selectedOrder?.id === ord.id
                    ? 'bg-[#166534] text-white border-[#166534]'
                    : 'bg-[#EEF2FF] text-stone-600 border-[#DBEAFE]'
                }`}
              >
                {ord.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {/* 1. ORDER REFERENCE Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-500 block">
              ORDER REFERENCE
            </span>
            <span className="font-black text-base text-[#0F172A] tracking-tight block mt-0.5">
              {selectedOrder?.id || '#ORD-1023'}
            </span>
          </div>

          <span className="bg-[#DCFCE7] text-[#166534] font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            <span>Confirmed</span>
          </span>
        </div>

        {/* 2. RESTAURANT BUYER Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
          {/* Header Row: RESTAURANT BUYER + Dispatch #829 pill */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#166534]">
              RESTAURANT BUYER
            </span>

            <span className="bg-[#EEF2FF] text-[#1E40AF] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#DBEAFE] flex items-center gap-1 shadow-2xs">
              <Truck className="w-3 h-3 text-[#1E40AF]" />
              <span>{dispatchNumber}</span>
            </span>
          </div>

          {/* Store Name with Icon */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EA] border border-[#DCFCE7] flex items-center justify-center text-[#166534] shrink-0">
              <Store className="w-4 h-4 text-[#166534] stroke-[1.8]" />
            </div>
            <h3 className="font-black text-sm sm:text-base text-[#0F172A]">
              {buyerName}
            </h3>
          </div>

          {/* Address & Phone */}
          <div className="space-y-1 text-xs text-stone-600 pl-0.5">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{buyerAddress}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{phone}</span>
            </div>
          </div>

          {/* Stylized Coastal Map View with Top-Left Distance and Bottom Button */}
          <div className="h-32 rounded-2xl overflow-hidden relative border border-stone-200/80 shadow-inner bg-[#BAE6FD]">
            {/* SVG Coastline & Topography Illustration */}
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 320 130"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Water Bay Area (right side) */}
              <rect width="320" height="130" fill="#67E8F9" opacity="0.8" />
              {/* Land / Coastline (left & bottom side) */}
              <path
                d="M0 0 H180 Q210 35 195 70 Q180 105 140 130 H0 Z"
                fill="#DCFCE7"
              />
              {/* Secondary Land Contour */}
              <path
                d="M0 0 H140 Q170 35 155 75 Q140 110 90 130 H0 Z"
                fill="#BBF7D0"
              />
              {/* Roads / Routes */}
              <path
                d="M20 130 Q60 85 120 75 T210 35"
                stroke="#CBD5E1"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M90 0 Q110 55 150 75 T280 95"
                stroke="#E2E8F0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="3 3"
              />
              {/* Small labels on map */}
              <text x="45" y="45" fill="#6B7280" fontSize="7" fontWeight="bold">
                Digos River Park
              </text>
              <text x="140" y="85" fill="#6B7280" fontSize="7" fontWeight="bold">
                Santa Cruz
              </text>
              <circle cx="120" cy="75" r="3" fill="#A855F7" />
              <circle cx="50" cy="90" r="3" fill="#3B82F6" />
            </svg>

            {/* Floating Distance Badge Pill in Top-Left matching screenshot */}
            <div className="absolute top-2.5 left-2.5">
              <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-sm border border-stone-200/80 flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#0F172A]">
                <Navigation className="w-3 h-3 text-[#166534] rotate-45 stroke-[2.5]" />
                <span>{distance} away</span>
              </div>
            </div>

            {/* Floating Open Navigation Map Button over bottom of map */}
            <div className="absolute bottom-2.5 inset-x-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="w-full bg-white/95 hover:bg-white active:scale-[0.99] text-[#166534] font-extrabold text-xs py-2 px-4 rounded-xl border border-stone-200/80 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {/* Compass / Target icon */}
                <svg
                  className="w-4 h-4 text-[#166534]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>Open Navigation Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. HARVEST MANIFEST Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs flex items-center gap-3">
          {/* Thumbnail with "2 Items" overlay pill */}
          <div className="relative w-15 h-15 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80 shadow-2xs">
            <img
              src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
              alt="Harvest manifest produce"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 inset-x-1.5 bg-white/95 text-[#0F172A] text-[8.5px] font-black py-0.5 rounded text-center shadow-xs border border-stone-200/60 leading-none">
              2 Items
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">
              HARVEST MANIFEST
            </span>
            <h4 className="font-black text-xs sm:text-sm text-[#0F172A] leading-tight mt-0.5 truncate">
              {summaryTitle}
            </h4>
            <div className="flex items-center justify-between bg-[#F8FAFC] border border-stone-200/60 px-2.5 py-1.5 rounded-xl mt-1.5">
              <span className="text-xs text-stone-500 font-medium">Order Total</span>
              <span className="font-black text-sm sm:text-base text-[#166534]">
                ₱{totalDisplay.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Delivery Status Stepper Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#0F172A]">
              Delivery Status
            </h3>
            {/* Peach / Light Orange "● In Transit" badge matching screenshot */}
            <span className="bg-[#FFEDD5] text-[#9A3412] font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-orange-200/80 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
              <span>In Transit</span>
            </span>
          </div>

          {/* Vertical Stepper Timeline */}
          <div className="space-y-0 pt-1">
            {/* Step 1: Order Confirmed */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="w-0.5 h-7 bg-[#166534]"></div>
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-[#0F172A]">
                    Order Confirmed
                  </h5>
                  <span className="text-[11px] text-stone-500 font-medium">
                    9:30 AM
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Payment pre-authorized by buyer
                </p>
              </div>
            </div>

            {/* Step 2: Preparing Products */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="w-0.5 h-7 bg-[#166534]"></div>
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-[#0F172A]">
                    Preparing Products
                  </h5>
                  <span className="text-[11px] text-stone-500 font-medium">
                    10:00 AM
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Harvested, packed & quality inspected
                </p>
              </div>
            </div>

            {/* Step 3: Out for Delivery (Active) */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-2xs">
                  <Truck className="w-3.5 h-3.5 text-white" />
                </div>
                <div
                  className={`w-0.5 h-7 ${
                    isDelivered ? 'bg-[#166534]' : 'bg-[#E0E7FF]'
                  }`}
                ></div>
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs text-[#166534] flex items-center gap-1.5">
                    <span>Out for Delivery</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
                  </h5>
                  <span className="text-[11px] font-bold text-[#166534]">
                    In progress
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                  Driver en route • Arriving in ~12 mins
                </p>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isDelivered
                      ? 'bg-[#166534] text-white shadow-2xs'
                      : 'bg-[#EEF2FF] border border-[#C7D2FE] text-indigo-400'
                  }`}
                >
                  {isDelivered ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    /* Double checkmark in pending node matching screenshot */
                    <svg
                      className="w-3.5 h-3.5 text-[#818CF8]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                      <polyline points="22 10 13 19 11 17" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <h5
                  className={`text-xs ${
                    isDelivered
                      ? 'font-bold text-[#0F172A]'
                      : 'font-medium text-stone-600'
                  }`}
                >
                  Delivered
                </h5>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {isDelivered
                    ? 'Accepted and signed off by buyer'
                    : 'Pending restaurant acceptance & signature'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Need Delivery Support? Card */}
        <div className="p-3.5 bg-[#EEF2FF] rounded-2xl border border-[#DBEAFE]/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#166534] border border-stone-200/60 shadow-2xs shrink-0">
              {/* Headset / Support Icon */}
              <svg
                className="w-4 h-4 text-[#166534]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="min-w-0 pr-1">
              <h4 className="font-extrabold text-xs text-[#0F172A] leading-tight truncate">
                Need Delivery Support?
              </h4>
              <p className="text-[10.5px] text-stone-500 mt-0.5 truncate">
                Dispatch hotline ready 24/7
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Calling Co-op Dispatch Hotline: (082) 553-0199...')}
            className="bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs px-4 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            Call
          </button>
        </div>
      </div>

      {/* Fixed Bottom Action Button: Mark as Delivered */}
      <div className="p-3.5 bg-white border-t border-stone-100 shrink-0 z-20">
        <button
          type="button"
          onClick={handleAdvance}
          className="w-full bg-[#166534] hover:bg-[#14532D] active:scale-[0.99] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {/* Circular checkmark icon matching screenshot */}
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11.5 14.5 15.5 9.5" />
          </svg>
          <span>
            {isDelivered ? 'Delivery Completed' : 'Mark as Delivered'}
          </span>
        </button>
      </div>

      {/* Map Preview Modal */}
      {showMapModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-4 w-full max-w-sm shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="font-extrabold text-sm text-[#0F172A]">
                Digos City Delivery Route
              </span>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Simulated Map Visual */}
            <div className="h-44 rounded-2xl bg-[#BAE6FD] relative overflow-hidden border border-stone-200 flex items-center justify-center">
              <svg
                className="w-full h-full object-cover"
                viewBox="0 0 320 160"
                preserveAspectRatio="none"
                fill="none"
              >
                <rect width="320" height="160" fill="#67E8F9" opacity="0.8" />
                <path d="M0 0 H200 Q230 40 210 90 Q190 130 150 160 H0 Z" fill="#DCFCE7" />
                <path d="M30 160 Q80 100 150 80 T260 40" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="absolute top-4 left-6 bg-white/95 px-2.5 py-1 rounded-lg shadow-sm text-[10px] font-bold text-stone-700">
                🌱 Carl Amil Farm
              </div>
              <div className="absolute bottom-6 right-6 bg-[#084826] text-white px-2.5 py-1 rounded-lg shadow-sm text-[10px] font-bold">
                🏬 {buyerName}
              </div>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              Transport scheduled along <strong>Rizal St. Cor. Magsaysay Ave</strong>. Direct handover to <strong>{buyerName}</strong> ({distance} total dispatch route).
            </p>

            <button
              type="button"
              onClick={() => setShowMapModal(false)}
              className="w-full bg-[#084826] text-white py-2.5 rounded-xl font-bold hover:bg-[#06381e] cursor-pointer"
            >
              Close Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


