import React from 'react';
import {
  Leaf,
  Search,
  ShoppingBag,
  User,
  SlidersHorizontal,
  Truck,
  ChevronRight,
  ArrowRight,
  Egg,
  Fish,
  LayoutGrid,
  Star,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ProductCategory } from '../../types';

export const BuyerHome: React.FC = () => {
  const {
    setActiveBuyerTab,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    products,
    cart,
    addToCart,
    setActiveProductForDetail,
  } = useApp();

  const handleSelectCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setActiveBuyerTab('browse');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveBuyerTab('browse');
  };

  const totalCartQty = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAF9]">
      {/* Top Header matching exact screenshot */}
      <div className="px-4 py-3 bg-white border-b border-stone-200/90 shrink-0">
        <div className="flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-2xs shrink-0">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-black text-[#166534] tracking-tight">
                  Local Bites
                </span>
                <span className="bg-[#E0F2FE] text-[#0284C7] text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider">
                  BUYER
                </span>
              </div>
              <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-wider block mt-0.5">
                RESTAURANT & BUYER CO-OP
              </span>
            </div>
          </div>

          {/* Right Action Icons: Shopping Bag with '3' badge + Profile Icon */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 text-stone-700 hover:text-[#166534] cursor-pointer transition-colors"
              title="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 bg-[#166534] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {totalCartQty > 0 ? totalCartQty : 3}
              </span>
            </button>

            <button
              type="button"
              className="w-7 h-7 rounded-full bg-[#0B4A2A] flex items-center justify-center text-white shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              title="Chef Maria"
            >
              <User className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Chef Maria Greeting with Pill Badge */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-[#E6F4EA] px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            <span className="text-[10px] font-black text-[#166534]">
              Chef Maria • Green Leaf Bistro
            </span>
          </div>

          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Good morning, Chef Maria!
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5 leading-snug">
              Fresh and local harvest directly from partner farms in Digos City.
            </p>
          </div>
        </div>

        {/* Search Bar matching screenshot */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh vegetables, fruits, herbs..."
              className="w-full bg-white border border-stone-200/90 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#166534] shadow-2xs font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveBuyerTab('browse')}
            className="w-8 h-8 rounded-xl bg-[#F1F5F9] border border-stone-200/90 flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer shadow-2xs shrink-0 transition-colors"
            title="Filter produce"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-600" />
          </button>
        </form>

        {/* Route Dispatch Card */}
        <div
          onClick={() => setActiveBuyerTab('orders')}
          className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3 flex items-center justify-between shadow-2xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                <span>ROUTE DISPATCH</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-700 font-extrabold">2:00 PM today</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                8 farms currently harvesting for this cycle
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </div>

        {/* Direct Harvest Hub Promotional Banner */}
        <div className="bg-[#0E5830] rounded-3xl p-4 text-white shadow-sm space-y-2.5 relative overflow-hidden">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-1 bg-[#4ADE80]/30 text-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/30">
            <Leaf className="w-3 h-3 text-emerald-300" />
            <span>Direct Harvest Hub</span>
          </div>

          <div>
            <h3 className="text-lg font-black leading-tight text-white">
              Support Local, Serve Fresh
            </h3>
            <p className="text-emerald-100/90 text-xs leading-relaxed font-normal mt-1 max-w-[290px]">
              Direct from coop growers like Juan & Elena with zero middleman markup, straight to your kitchen prep table.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Products');
                setActiveBuyerTab('browse');
              }}
              className="bg-white hover:bg-stone-50 text-[#0E5830] font-black text-xs py-2 px-3.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>Explore Digos Coop Batch</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0E5830]" />
            </button>
          </div>
        </div>

        {/* Categories Section matching exact screenshot */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#0F172A]">
              Categories
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Products');
                setActiveBuyerTab('browse');
              }}
              className="text-xs font-bold text-stone-500 hover:text-[#166534] cursor-pointer"
            >
              View catalog
            </button>
          </div>

          {/* 6 Category Cards (2 rows x 3 cols) */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Vegetables */}
            <button
              type="button"
              onClick={() => handleSelectCategory('Vegetables')}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#166534] transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-xl overflow-hidden bg-stone-100 mb-1.5 border border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80"
                  alt="Vegetables"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xs font-black text-[#0F172A] leading-tight">
                Vegetables
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                34 items
              </span>
            </button>

            {/* 2. Fruits */}
            <button
              type="button"
              onClick={() => handleSelectCategory('Fruits')}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#166534] transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-xl overflow-hidden bg-stone-100 mb-1.5 border border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&auto=format&fit=crop&q=80"
                  alt="Fruits"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xs font-black text-[#0F172A] leading-tight">
                Fruits
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                18 items
              </span>
            </button>

            {/* 3. Herbs */}
            <button
              type="button"
              onClick={() => handleSelectCategory('Herbs')}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#166534] transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-xl overflow-hidden bg-stone-100 mb-1.5 border border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=300&auto=format&fit=crop&q=80"
                  alt="Herbs"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xs font-black text-[#0F172A] leading-tight">
                Herbs
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                12 items
              </span>
            </button>

            {/* 4. Dairy & Eggs */}
            <button
              type="button"
              onClick={() => handleSelectCategory('Dairy & Eggs')}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#166534] transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-xl bg-[#FFEDD5] text-[#EA580C] mb-1.5 flex items-center justify-center border border-orange-100">
                <Egg className="w-6 h-6 text-[#EA580C] stroke-[1.8]" />
              </div>
              <span className="text-xs font-black text-[#0F172A] leading-tight">
                Dairy & Eggs
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                9 items
              </span>
            </button>

            {/* 5. Meat & Sea */}
            <button
              type="button"
              onClick={() => handleSelectCategory('Meat & Seafood')}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#166534] transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-xl bg-[#EFF6FF] text-[#2563EB] mb-1.5 flex items-center justify-center border border-blue-100">
                <Fish className="w-6 h-6 text-[#2563EB] stroke-[1.8]" />
              </div>
              <span className="text-xs font-black text-[#0F172A] leading-tight">
                Meat & Sea
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                15 items
              </span>
            </button>

            {/* 6. All Items (Solid dark green card) */}
            <button
              type="button"
              onClick={() => handleSelectCategory('All Products')}
              className="bg-[#0B4A2A] hover:bg-[#08381e] p-2.5 rounded-2xl border border-[#0B4A2A] shadow-2xs transition-all flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-xl bg-[#166534]/50 text-[#4ADE80] mb-1.5 flex items-center justify-center border border-emerald-600/30">
                <LayoutGrid className="w-6 h-6 text-[#4ADE80] stroke-[2]" />
              </div>
              <span className="text-xs font-black text-white leading-tight">
                All Items
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">
                88 total
              </span>
            </button>
          </div>
        </div>

        {/* Farmer Spotlight Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-2xs">
                <Star className="w-2.5 h-2.5 text-white fill-white" />
              </div>
              <h2 className="text-sm font-black text-[#0F172A]">
                Farmer Spotlight
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              Digos Valley
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-13 h-13 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=300&auto=format&fit=crop&q=80"
                  alt="Juan's Farm"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm text-[#0F172A]">
                    Juan's Sungrown Farm
                  </h3>
                  <span className="bg-[#DCFCE7] text-[#166534] text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Organic
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium leading-tight mt-1">
                  Tomatoes & Crisp Butterhead Lettuce freshly picked this morning at 6:00 AM.
                </p>
              </div>
            </div>

            {/* Bottom Lot Container */}
            <div className="bg-[#F0F4FF] border border-[#DBEAFE] rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-stone-400 block">
                  CURRENT LOT AVAILABLE
                </span>
                <span className="font-black text-xs text-[#0F172A] mt-0.5 block">
                  45 kg Roma • 25 kg Butterhead
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Vegetables');
                  setActiveBuyerTab('browse');
                }}
                className="bg-[#084826] hover:bg-[#06381e] active:scale-95 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fresh Out of Field Section */}
        <div className="space-y-2 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#0F172A]">
              Fresh Out of Field
            </h2>
            <span className="text-[11px] text-stone-400 font-medium">
              Updated 15m ago
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 1. Roma Tomatoes */}
            <div
              onClick={() => {
                const target = products.find((p) => p.name.toLowerCase().includes('tomato')) || products[0];
                setActiveProductForDetail(target);
              }}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 hover:border-[#166534] transition-all cursor-pointer group"
            >
              <div className="h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                <img
                  src={products[0]?.image || '/roma-tomatoes-basket.jpg'}
                  alt="Roma Tomatoes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div>
                <h4 className="font-black text-xs text-[#0F172A] truncate">
                  Roma Tomatoes
                </h4>
                <p className="text-[10.5px] text-stone-400 font-medium truncate">
                  Juan's Sungrown
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-black text-xs text-[#166534]">
                  ₱{products[0]?.price || 60}<span className="text-[10px] text-stone-400 font-normal">/kg</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const target = products.find((p) => p.name.toLowerCase().includes('tomato')) || products[0];
                    addToCart(target, 1);
                  }}
                  className="w-6 h-6 rounded-full bg-[#166534] hover:bg-[#14532D] text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90 transition-transform"
                  title="Add to cart"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* 2. Butterhead Lettuce */}
            <div
              onClick={() => {
                const target = products.find((p) => p.name.toLowerCase().includes('lettuce')) || products[1];
                setActiveProductForDetail(target);
              }}
              className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 hover:border-[#166534] transition-all cursor-pointer group"
            >
              <div className="h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80"
                  alt="Butterhead Lettuce"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div>
                <h4 className="font-black text-xs text-[#0F172A] truncate">
                  Butterhead Lettuce
                </h4>
                <p className="text-[10.5px] text-stone-400 font-medium truncate">
                  Elena Highland Farm
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-black text-xs text-[#166534]">
                  ₱110<span className="text-[10px] text-stone-400 font-normal">/kg</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const target = products.find((p) => p.name.toLowerCase().includes('lettuce')) || products[1];
                    addToCart(target, 1);
                  }}
                  className="w-6 h-6 rounded-full bg-[#166534] hover:bg-[#14532D] text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90 transition-transform"
                  title="Add to cart"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
