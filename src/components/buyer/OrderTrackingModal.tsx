import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Copy,
  Clock,
  Truck,
  Check,
  Package,
  Phone,
  Navigation,
  MapPin,
  Snowflake,
  UtensilsCrossed,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Order } from '../../types';

interface OrderTrackingModalProps {
  onBack?: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ onBack }) => {
  const {
    orders,
    activeOrderForTracking,
    setActiveOrderForTracking,
    setActiveBuyerTab,
  } = useApp();

  const [copied, setCopied] = useState(false);

  // Default to #ORD-1026 if tracking, or active order, or first order
  const selectedOrder: Order =
    activeOrderForTracking ||
    orders.find((o) => o.id === '#ORD-1026') ||
    orders[0];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveOrderForTracking(null);
      setActiveBuyerTab('orders');
    }
  };

  const handleCopyId = () => {
    if (selectedOrder?.id) {
      navigator.clipboard?.writeText(selectedOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackToHome = () => {
    setActiveOrderForTracking(null);
    setActiveBuyerTab('home');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFBFB] text-stone-900">
      
      {/* Top Header Bar matching Reference Screenshot ("Live Dispatch Trac") */}
      <header className="px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-stone-900 leading-tight">
              Live Dispatch Trac
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-8">
        
        {/* Card 1: Order Header & Map Route Preview */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-stone-900">
                {selectedOrder?.id || '#ORD-1026'}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
                title="Copy Order ID"
              >
                <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
              {copied && (
                <span className="text-[9px] font-bold text-[#16A34A]">Copied!</span>
              )}
            </div>

            <span className="bg-[#4ADE80] text-[#064E3B] px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#064E3B]" />
              <span>Confirmed by Farmer</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-stone-500">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Placed Today, Sep 8, 2026 • 10:15 AM</span>
          </div>

          {/* Map Route Preview Visualization Box */}
          <div className="h-28 rounded-2xl bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-[#64748B] relative overflow-hidden border border-stone-200/80 p-2.5 flex flex-col justify-end shadow-inner mt-1">
            {/* Subtle Road / Map Vector Grid Lines */}
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute top-4 left-6 right-10 h-0.5 border-t-2 border-dashed border-white/60 -rotate-6" />
            <div className="absolute top-10 left-12 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-black">
              🚜
            </div>

            {/* Floating Destination Pill at Bottom */}
            <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-xl p-1.5 px-2.5 flex items-center justify-between border border-white/80 shadow-md">
              <div className="flex items-center gap-1.5 text-xs text-stone-800 font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span className="truncate">Green Leaf Bistro • Rizal St.</span>
              </div>
              <span className="bg-[#1E293B] text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                Digos City
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Transit Timeline */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-stone-700 stroke-[2.2]" />
              <h3 className="font-black text-xs text-stone-900">Transit Timeline</h3>
            </div>
            <span className="bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#DBEAFE]">
              Live Dispatch
            </span>
          </div>

          {/* Stepper Steps */}
          <div className="space-y-0 pt-1">
            
            {/* Step 1: Order Placed */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#0B4A2A] text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="w-0.5 h-7 bg-[#0B4A2A]" />
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-stone-900">Order Placed</h4>
                  <span className="text-[10px] font-bold text-stone-400">10:15 AM</span>
                </div>
                <p className="text-[10.5px] text-stone-500 font-medium leading-tight mt-0.5">
                  Broadcasted to verified regional co-op growers
                </p>
              </div>
            </div>

            {/* Step 2: Confirmed by Farmer */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#0B4A2A] text-white flex items-center justify-center shadow-2xs">
                  <Package className="w-3.5 h-3.5 stroke-[2.4]" />
                </div>
                <div className="w-0.5 h-7 bg-[#0B4A2A]" />
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-stone-900">Confirmed by Farmer</h4>
                  <span className="text-[10px] font-bold text-stone-400">10:20 AM</span>
                </div>
                <p className="text-[10.5px] text-stone-500 font-medium leading-tight mt-0.5">
                  Harvest crated • Stock automatically locked
                </p>
              </div>
            </div>

            {/* Step 3: Out for Delivery (ACTIVE STEP) */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#DBEAFE] text-[#0B4A2A] flex items-center justify-center shadow-2xs border border-[#BFDBFE]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B4A2A] animate-pulse" />
                </div>
                <div className="w-0.5 h-8 bg-stone-200" />
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="bg-[#F0F4FF] rounded-xl p-2.5 border border-[#DBEAFE]/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-stone-900">Out for Delivery</h4>
                    <span className="text-[10px] font-black text-[#0B4A2A]">ETA: 2:45 PM</span>
                  </div>
                  <p className="text-[10.5px] text-stone-600 font-medium leading-tight">
                    Assigned to Driver Carlos • En route to Rizal St.
                  </p>
                  
                  {/* Driver Action Buttons: Call & Live GPS */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      className="bg-[#0B4A2A] hover:bg-[#07361E] active:scale-95 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                    >
                      <Phone className="w-3 h-3 stroke-[2.5]" />
                      <span>Call Carlos</span>
                    </button>

                    <button
                      type="button"
                      className="bg-white hover:bg-stone-50 active:scale-95 border border-stone-200/90 text-stone-700 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                    >
                      <Navigation className="w-3 h-3 stroke-[2.5] text-[#1E40AF]" />
                      <span>Live GPS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Delivered (Pending) */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-stone-400 flex items-center justify-center border border-stone-200">
                  <MapPin className="w-3 h-3 stroke-[2.2]" />
                </div>
              </div>
              <div className="pt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-400">Delivered</h4>
                  <span className="text-[10px] font-medium text-stone-400">Pending</span>
                </div>
                <p className="text-[10.5px] text-stone-400 font-medium leading-tight mt-0.5">
                  Inspection &amp; digital signature upon handoff
                </p>
              </div>
            </div>

          </div>

          {/* Sub-Card: Co-op Van #2 • Cold-Chain */}
          <div className="bg-[#EFF6FF] rounded-2xl p-2.5 sm:p-3 border border-[#DBEAFE] flex items-center justify-between shadow-2xs mt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#86EFAC] text-[#166534] flex items-center justify-center shrink-0 shadow-2xs">
                <Snowflake className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div>
                <h5 className="text-xs font-black text-stone-900 leading-tight">
                  Co-op Van #2 • Cold-Chain
                </h5>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                  Refrigerated transport. Temperature actively monitored.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <span className="text-xs font-bold text-[#16A34A] block">
                12°C
              </span>
              <span className="text-[10px] font-black text-[#0B4A2A] block">
                Nominal
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Harvest Breakdown */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-stone-900">Harvest Breakdown</h3>
            <span className="text-[10px] text-stone-400 font-medium">
              2 distinct farms
            </span>
          </div>

          {/* Items */}
          <div className="space-y-2.5">
            {/* Item 1: Tomatoes (Grade A Roma) */}
            <div className="bg-[#F0F4FF] rounded-xl p-2.5 border border-[#DBEAFE]/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/roma-tomatoes-basket.jpg"
                  alt="Tomatoes"
                  className="w-11 h-11 rounded-lg object-cover bg-stone-100 border border-stone-200/80 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <h5 className="font-black text-xs text-stone-900 leading-tight">
                    Tomatoes (Grade A Roma)
                  </h5>
                  <p className="text-[10px] text-stone-500 font-medium">
                    Juan&apos;s Sungrown Farm
                  </p>
                  <span className="text-[10px] font-bold text-stone-700 block mt-0.5">
                    10 kg • ₱60/kg
                  </span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="font-black text-xs text-stone-900 block">
                  ₱600.00
                </span>
                <span className="bg-[#4ADE80] text-[#064E3B] text-[9.5px] font-black px-2 py-0.5 rounded-full inline-block">
                  Field Inspected
                </span>
              </div>
            </div>

            {/* Item 2: Crisp Green Oak Lettuce */}
            <div className="bg-[#F0F4FF] rounded-xl p-2.5 border border-[#DBEAFE]/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80"
                  alt="Lettuce"
                  className="w-11 h-11 rounded-lg object-cover bg-stone-100 border border-stone-200/80 shrink-0"
                />
                <div>
                  <h5 className="font-black text-xs text-stone-900 leading-tight">
                    Crisp Green Oak Lettuce
                  </h5>
                  <p className="text-[10px] text-stone-500 font-medium">
                    Elena&apos;s Hydro Harvest
                  </p>
                  <span className="text-[10px] font-bold text-stone-700 block mt-0.5">
                    5 kg • ₱80/kg
                  </span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="font-black text-xs text-stone-900 block">
                  ₱400.00
                </span>
                <span className="bg-[#4ADE80] text-[#064E3B] text-[9.5px] font-black px-2 py-0.5 rounded-full inline-block">
                  Hydroponic
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-2 space-y-1 text-xs">
            <div className="flex items-center justify-between text-stone-600 font-medium">
              <span>Produce Subtotal</span>
              <span className="font-black text-stone-900">₱1,000.00</span>
            </div>

            <div className="flex items-center justify-between text-stone-600 font-medium">
              <span>Co-op Delivery Fee</span>
              <span className="font-bold text-[#16A34A]">FREE (Co-op Pool)</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs font-black text-stone-900">Total Amount</span>
              <span className="text-base font-black text-[#0B4A2A]">₱1,000.00</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10.5px] text-stone-500 font-medium pt-1">
              <FileText className="w-3 h-3 text-stone-400" />
              <span>Payment Method: Cash on Delivery (COD)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Delivery Destination */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
            DELIVERY DESTINATION
          </span>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-black text-xs text-stone-900 leading-tight">
                Green Leaf Bistro
              </h4>
              <p className="text-[10.5px] text-stone-500 font-medium mt-0.5">
                Rizal St., Digos City, Davao del Sur
              </p>
            </div>

            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#1E40AF] shrink-0">
              <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          <p className="text-[10px] text-stone-500 font-medium leading-snug pt-1 flex items-start gap-1.5">
            <span className="text-stone-400">📝</span>
            <span>Gate code #4412. Unload directly at rear kitchen receiving dock.</span>
          </p>
        </div>

        {/* Card 5: Need Support? */}
        <div className="bg-[#EFF6FF] rounded-2xl p-3 border border-[#DBEAFE] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0B4A2A] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900 leading-tight">
                Need Support?
              </h4>
              <p className="text-[10px] text-stone-500 font-medium">
                Contact Co-op Dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            className="bg-white hover:bg-stone-50 active:scale-95 border border-stone-200 text-[#0B4A2A] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <span>💬</span>
            <span>Help Desk</span>
          </button>
        </div>

        {/* Bottom Action: Back to Home */}
        <div className="pt-2 pb-2">
          <button
            type="button"
            onClick={handleBackToHome}
            className="w-full bg-[#0B4A2A] hover:bg-[#07361E] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
            <span>Back to Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};
