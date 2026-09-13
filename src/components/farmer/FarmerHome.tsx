import React, { useState } from 'react';
import {
  Leaf,
  User,
  PlusCircle,
  Package,
  ClipboardList,
  Truck,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Banknote,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';

export const FarmerHome: React.FC = () => {
  const {
    orders,
    setActiveFarmerTab,
    setIsAddProductOpen,
  } = useApp();

  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const newOrdersCount = orders.filter((o) => o.status === 'New').length;

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3.5 overflow-y-auto bg-[#F8FAF9]">
      {/* Top Header: Local Bites FARMER CO-OP | Farmer Portal & User Avatar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {/* Logo Badge */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-2xs">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-extrabold text-[#166534] tracking-tight">
                LocalBites
              </div>
              <div className="text-[7.5px] font-bold text-[#166534]/90 uppercase tracking-wider -mt-0.5">
                FARMER CO-OP
              </div>
            </div>
          </div>

          {/* Portal Title */}
          <div className="border-l border-stone-200 pl-2.5 leading-tight">
            <div className="text-sm font-extrabold text-[#166534] tracking-tight">
              Local Bites
            </div>
            <div className="text-[10px] text-stone-500 font-medium">
              Farmer Portal
            </div>
          </div>
        </div>

        {/* User Circular Avatar Button */}
        <button className="w-8 h-8 rounded-full bg-[#0B4A2A] flex items-center justify-center text-white shadow-2xs hover:opacity-90 transition-opacity">
          <User className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Farm Dashboard Chip */}
      <div className="pt-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] text-[#1E293B] text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          <span>Farm Dashboard</span>
        </div>
      </div>

      {/* Greeting Heading */}
      <div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
          Good morning, Carl Amil!
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
          Let's share your harvest today.
        </p>
      </div>

      {/* Primary Action Button: + Add Product */}
      <button
        onClick={() => setIsAddProductOpen(true)}
        className="w-full bg-[#136B3B] hover:bg-[#0E5830] active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-sm"
      >
        <PlusCircle className="w-5 h-5 stroke-[2.2]" />
        <span>+ Add Product</span>
      </button>

      {/* 4 Action Menu Cards */}
      <div className="space-y-2.5">
        {/* 1. My Products */}
        <button
          onClick={() => setActiveFarmerTab('products')}
          className="w-full bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between hover:border-[#166534]/40 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] border border-[#DBEAFE] flex items-center justify-center text-[#0D8244] shrink-0">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">
              My Products
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 2. Incoming Orders with notification badge */}
        <button
          onClick={() => setActiveFarmerTab('orders')}
          className="w-full bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between hover:border-[#166534]/40 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
              <ClipboardList className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">
              Incoming Orders
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#B91C1C] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
              {newOrdersCount > 0 ? newOrdersCount : 3}
            </span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 3. Deliveries */}
        <button
          onClick={() => setActiveFarmerTab('delivery')}
          className="w-full bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between hover:border-[#166534]/40 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">
              Deliveries
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 4. Messages */}
        <button
          onClick={() => setShowMessagesModal(true)}
          className="w-full bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between hover:border-[#166534]/40 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
              <MessageSquare className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm">
              Messages
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Banner Card: LOCAL COOPERATIVE Fresh Harvest, Brighter Tomorrows */}
      <div className="rounded-2xl p-3.5 bg-gradient-to-r from-[#EEF2FF] via-[#F0FDF4] to-[#DCFCE7]/70 border border-[#DBEAFE] shadow-2xs flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-extrabold tracking-wider text-[#2563EB] uppercase block">
            LOCAL COOPERATIVE
          </span>
          <h3 className="text-sm font-extrabold text-[#1E3A8A] leading-snug mt-0.5">
            Fresh Harvest, Brighter Tomorrows
          </h3>
          <p className="text-[11px] text-[#64748B] mt-1 leading-normal">
            Direct from your soil to local tables across the city.
          </p>
        </div>
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white shadow-xs">
          <img
            src="/sprout-seedling.jpg"
            alt="Sprout seedling in soil"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2 Stat Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 pt-0.5">
        {/* Dispatched Today */}
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-semibold text-[#64748B]">
              Dispatched Today
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-xl font-black text-[#0F172A]">
            42 <span className="text-xs font-normal text-[#64748B]">kg</span>
          </div>
        </div>

        {/* Gross Earnings */}
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-semibold text-[#64748B]">
              Gross Earnings
            </span>
            <Banknote className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-xl font-black text-[#0D8244]">
            ₱2,850
          </div>
        </div>
      </div>

      {/* Interactive Messages Modal */}
      {showMessagesModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full h-[80%] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl border-t border-stone-200">
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  👩‍🍳
                </div>
                <div>
                  <h3 className="font-bold text-xs text-stone-900">Chef Maria Santos</h3>
                  <p className="text-[10px] text-stone-500">Green Leaf Bistro • Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessagesModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#F8FAF9]">
              <div className="flex flex-col items-start max-w-[80%]">
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-stone-200 text-stone-800 shadow-2xs">
                  Good morning Carl! Can you dispatch 10 kg ripe tomatoes to Green Leaf Bistro before 11:30 AM today?
                </div>
                <span className="text-[9px] text-stone-400 mt-1 pl-1">9:28 AM</span>
              </div>

              <div className="flex flex-col items-end max-w-[80%] ml-auto">
                <div className="bg-[#0D8244] p-3 rounded-2xl rounded-tr-xs text-white shadow-2xs">
                  Maayong buntag Chef Maria! Yes, just packed them freshly picked from Mt. Apo foothills.
                </div>
                <span className="text-[9px] text-stone-400 mt-1 pr-1">9:31 AM</span>
              </div>

              <div className="flex flex-col items-start max-w-[80%]">
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-stone-200 text-stone-800 shadow-2xs">
                  Thank you! Placed the order now via Local Bites (#ORD-1023).
                </div>
                <span className="text-[9px] text-stone-400 mt-1 pl-1">9:32 AM</span>
              </div>
            </div>

            {/* Quick Reply Footer */}
            <div className="p-3 bg-white border-t border-stone-200 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0D8244]"
              />
              <button
                onClick={() => alert('Message sent to Chef Maria!')}
                className="bg-[#0D8244] text-white px-4 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

