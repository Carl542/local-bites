import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  SlidersHorizontal,
  Sprout,
  ArrowRight,
  RotateCw,
  FileText,
  ShieldCheck,
  User,
  Tractor,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Order } from '../../types';

type OrderFilterTab = 'all' | 'pending' | 'confirmed' | 'delivering' | 'completed';

interface BuyerOrdersProps {
  onSelectOrder: (order: Order) => void;
}

export const BuyerOrders: React.FC<BuyerOrdersProps> = ({ onSelectOrder }) => {
  const { orders, cart, setIsCartOpen } = useApp();
  const [activeFilter, setActiveFilter] = useState<OrderFilterTab>('all');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFBFB] text-stone-900">
      
      {/* Top Header Bar matching Local Bites Buyer standard */}
      <header className="px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          {/* Logo icon */}
          <div className="w-8 h-8 rounded-full bg-[#0A4A29] flex items-center justify-center text-white font-black text-sm shadow-2xs">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-stone-900 leading-none">
                Local Bites
              </h1>
              <span className="bg-[#E0F2FE] text-[#0369A1] text-[9.5px] font-black px-1.5 py-0.5 rounded tracking-wide leading-none">
                BUYER
              </span>
            </div>
            <p className="text-[8.5px] font-extrabold text-stone-400 tracking-wider uppercase mt-1 leading-none">
              RESTAURANT &amp; BUYER CO-OP
            </p>
          </div>
        </div>

        {/* Right Header Controls: Cart & Profile Avatar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
            title="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0A4A29] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {cart.reduce((sum, i) => sum + (i.quantity > 0 ? 1 : 0), 0) || 3}
              </span>
            )}
          </button>

          <div
            className="w-8 h-8 rounded-full bg-[#0A4A29] flex items-center justify-center text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
            title="Chef Maria (Green Leaf Bistro)"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-24">
        
        {/* Title Bar with Subtitle & Filter Button */}
        <div className="flex items-start justify-between pt-0.5">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight leading-tight">
              My Orders
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-0.5">
              <Store className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.2]" />
              <span className="font-bold text-[#0B4A2A]">Green Leaf Bistro</span>
              <span>•</span>
              <span>Buyer Co-op #409</span>
            </div>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#1E40AF] hover:bg-[#DBEAFE] transition-colors cursor-pointer shadow-2xs"
            title="Filter Orders"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Metrics Row: 2 In Flight & 45 kg Yield */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Active Dispatches */}
          <div className="bg-[#F0F4FF] rounded-2xl p-3 border border-[#DBEAFE]/80 flex items-center gap-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-wider block leading-none">
                ACTIVE DISPATCHES
              </span>
              <h4 className="text-xs sm:text-sm font-black text-stone-900 mt-1 leading-tight">
                2 In Flight
              </h4>
            </div>
          </div>

          {/* Card 2: Total Fresh */}
          <div className="bg-[#F0F4FF] rounded-2xl p-3 border border-[#DBEAFE]/80 flex items-center gap-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#86EFAC] text-[#065F46] flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-wider block leading-none">
                TOTAL FRESH
              </span>
              <h4 className="text-xs sm:text-sm font-black text-stone-900 mt-1 leading-tight">
                45 kg Yield
              </h4>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs (Horizontal Pill Bar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeFilter === 'pending' || activeFilter === 'all'
                ? 'bg-[#0B4A2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Pending</span>
            <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('confirmed')}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-full shrink-0 transition-all cursor-pointer ${
              activeFilter === 'confirmed'
                ? 'bg-[#0B4A2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Confirmed (1)
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('delivering')}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-full shrink-0 transition-all cursor-pointer ${
              activeFilter === 'delivering'
                ? 'bg-[#0B4A2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Delivering (1)
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-full shrink-0 transition-all cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-[#0B4A2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Order Cards List matching Reference Screenshot */}
        <div className="space-y-3 pt-0.5">
          
          {/* ============================================================== */}
          {/* Card 1: #ORD-1026 (NEW • Pending Approval)                     */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'pending') && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs relative overflow-hidden space-y-2.5 animate-in fade-in">
              {/* Amber Left Accent Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F59E0B]" />

              {/* Top Row: Order ID + NEW badge + Pending Approval pill */}
              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-stone-900">
                    #ORD-1026
                  </span>
                  <span className="bg-[#DC2626] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                    NEW
                  </span>
                </div>

                <div className="bg-[#FED7AA]/70 border border-[#FDBA74]/50 text-[#9A3412] px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                  <span>Pending Approval</span>
                </div>
              </div>

              {/* Date */}
              <p className="text-[10.5px] text-stone-500 font-medium pl-1 -mt-1">
                Placed Today, 10:15 AM
              </p>

              {/* Inner Produce Box */}
              <div className="bg-[#F0F4FF] rounded-2xl p-2.5 sm:p-3 border border-[#DBEAFE]/60 space-y-2">
                {/* Farm Name with Tractor Icon */}
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <Tractor className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                  <span className="truncate">Juan&apos;s Sungrown Farm &amp; Elena&apos;s Hydro</span>
                </div>

                {/* Thumbnail & Items Manifest */}
                <div className="flex items-center gap-2.5">
                  <img
                    src="/roma-tomatoes-basket.jpg"
                    alt="Tomatoes & Lettuce"
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200/80 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-stone-900 leading-tight">
                      10 kg Tomatoes, 5 kg Lettuce
                    </h5>
                    <p className="text-[10.5px] text-stone-500 font-medium mt-0.5">
                      2 Harvest Crates • Packed Cold
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Total & View Order Details button */}
              <div className="flex items-center justify-between pt-1 pl-1">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-base font-black text-[#0B4A2A] leading-tight">
                    ₱1,000.00
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const ord = orders.find((o) => o.id === '#ORD-1026') || orders[0];
                    onSelectOrder(ord);
                  }}
                  className="bg-[#0B4A2A] hover:bg-[#083820] active:scale-[0.98] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <span>View Order Details</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* Card 2: #ORD-1023 (Confirmed • Driver Assigned)                */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'confirmed' || activeFilter === 'delivering') && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs relative overflow-hidden space-y-2.5 animate-in fade-in">
              {/* Green Left Accent Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16A34A]" />

              {/* Top Row: Order ID + Confirmed pill */}
              <div className="flex items-center justify-between pl-1">
                <span className="font-black text-sm text-stone-900">
                  #ORD-1023
                </span>

                <div className="bg-[#4ADE80] text-[#064E3B] px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>Confirmed</span>
                </div>
              </div>

              {/* Date */}
              <p className="text-[10.5px] text-stone-500 font-medium pl-1 -mt-1">
                Today, 9:15 AM
              </p>

              {/* Inner Produce Box */}
              <div className="bg-[#F0F4FF] rounded-2xl p-2.5 sm:p-3 border border-[#DBEAFE]/60 space-y-2">
                {/* Farm Name with Tractor Icon */}
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <Tractor className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                  <span className="truncate">Juan&apos;s Sungrown Farm</span>
                </div>

                {/* Thumbnail & Items Manifest */}
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80"
                    alt="Produce"
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200/80 shrink-0"
                  />
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-stone-900 leading-tight">
                      10 kg Tomatoes, 5 kg Lettuce
                    </h5>
                    <p className="text-[10px] font-bold text-[#16A34A] mt-0.5">
                      Van en route • Batch #J-88
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Assigned Row */}
              <div className="flex items-center justify-between text-[10.5px] pl-1 font-medium">
                <div className="flex items-center gap-1.5 text-stone-700">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                  <span className="font-bold">Driver assigned: Carlos M.</span>
                </div>
                <span className="text-stone-500 font-medium">
                  Est. 11:45 AM
                </span>
              </div>

              {/* Bottom Row: Total & Track Delivery button */}
              <div className="flex items-center justify-between pt-1 pl-1">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-base font-black text-[#0B4A2A] leading-tight">
                    ₱900.00
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const ord = orders.find((o) => o.id === '#ORD-1023') || orders[0];
                    onSelectOrder(ord);
                  }}
                  className="bg-[#0B4A2A] hover:bg-[#083820] active:scale-[0.98] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Track Delivery</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* Card 3: #ORD-1018 (Completed • Co-op Credit)                   */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'completed') && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-2.5 animate-in fade-in">
              {/* Top Row: Order ID + Completed pill */}
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-stone-900">
                  #ORD-1018
                </span>

                <div className="bg-[#E2E8F0] text-[#475569] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>Completed</span>
                </div>
              </div>

              {/* Date */}
              <p className="text-[10.5px] text-stone-500 font-medium -mt-1">
                Sep 6, 2026
              </p>

              {/* Inner Produce Box */}
              <div className="bg-[#F0F4FF] rounded-2xl p-2.5 sm:p-3 border border-[#DBEAFE]/60 space-y-2">
                {/* Farm Name with Tractor Icon */}
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <Tractor className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                  <span className="truncate">San Pedro Organic Farm</span>
                </div>

                {/* Thumbnail & Items Manifest */}
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&auto=format&fit=crop&q=80"
                    alt="Carrots"
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200/80 shrink-0"
                  />
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-stone-900 leading-tight">
                      20 kg Carrots
                    </h5>
                    <p className="text-[10.5px] text-stone-500 font-medium mt-0.5">
                      Received &amp; Verified
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Paid via Co-op Credit & Actions (Refresh + Invoice) */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                    PAID VIA CO-OP CREDIT
                  </span>
                  <span className="text-base font-black text-stone-900 leading-tight">
                    ₱1,000.00
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E40AF] flex items-center justify-center hover:bg-[#DBEAFE] cursor-pointer shadow-2xs transition-colors"
                    title="Reorder items"
                  >
                    <RotateCw className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>

                  <button
                    type="button"
                    className="bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] text-[#1E40AF] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Cold-Chain Guarantee Card */}
        <div className="bg-[#EFF6FF] rounded-2xl p-3 border border-[#DBEAFE] flex items-start gap-3 shadow-2xs mt-2">
          <div className="w-8 h-8 rounded-full bg-[#0B4A2A] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-stone-900 leading-tight">
              Cold-Chain Guarantee
            </h4>
            <p className="text-[10.5px] text-stone-600 font-medium leading-relaxed mt-0.5">
              Orders are harvested within 12 hours of scheduled delivery.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
