import React, { useState } from 'react';
import {
  Leaf,
  ShoppingBag,
  User,
  Search,
  X,
  Tractor,
  Package,
  Plus,
  ShoppingCart,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Product } from '../../types';

interface DisplayProduct extends Product {
  subBadge?: { text: string; bg: string };
  distanceText?: string;
  badgeType?: 'GRADE A' | 'HYDRO' | 'ORGANIC';
}

export const BrowseProducts: React.FC = () => {
  const {
    products,
    cart,
    setIsCartOpen,
    addToCart,
    setActiveProductForDetail,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('Roma');
  const [selectedCropFilter, setSelectedCropFilter] = useState<'all' | 'tomatoes' | 'greens'>('tomatoes');

  const totalCartQty = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Curated list matching exact screenshot items
  const catalogItems: DisplayProduct[] = [
    {
      id: 'prod-1',
      name: 'Tomatoes (Grade A Roma)',
      category: 'Vegetables',
      farmName: "Juan's Sungrown Farm",
      distanceText: '3.2 km',
      location: 'Brgy. Kapatagan, Digos City',
      price: 60,
      unit: 'kg',
      stock: 30,
      initialStock: 30,
      image: '/roma-tomatoes-basket.jpg',
      description: 'Plump and juicy vine-ripened Roma tomatoes. High brix sweetness, firm flesh, uniform size.',
      tags: ['organic', 'grade_a', 'fresh_harvest'],
      isSoldOut: false,
      badgeType: 'GRADE A',
      createdAt: '2026-09-08T06:00:00Z',
    },
    {
      id: 'prod-2',
      name: 'Crisp Green Oak Lettuce',
      category: 'Vegetables',
      farmName: "Elena's Hydro Harvest",
      distanceText: '5.8 km',
      location: 'Bansalan, Davao del Sur',
      price: 80,
      unit: 'kg',
      stock: 25,
      initialStock: 25,
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80',
      description: 'Hydroponic green oak leaf lettuce. Sweet tender leaves, thoroughly washed in mountain spring water.',
      tags: ['hydroponic', 'locally_grown'],
      isSoldOut: false,
      badgeType: 'HYDRO',
      createdAt: '2026-09-08T06:15:00Z',
    },
    {
      id: 'prod-3',
      name: 'Sweet Imperator Carrots',
      category: 'Vegetables',
      farmName: 'San Pedro Organic Farm',
      distanceText: '7.1 km',
      location: 'Mt. Apo Foothills, Digos City',
      price: 50,
      unit: 'kg',
      stock: 18,
      initialStock: 18,
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
      description: 'Crisp sweet high-altitude carrots. Vibrant orange core, freshly pulled and bundled this morning.',
      tags: ['organic', 'locally_grown'],
      isSoldOut: false,
      badgeType: 'ORGANIC',
      createdAt: '2026-09-07T14:00:00Z',
    },
    {
      id: 'prod-5',
      name: 'Native Red Bell Peppers',
      category: 'Vegetables',
      farmName: 'Highlands Cooperative',
      distanceText: '12.4 km',
      location: 'Matanao, Davao del Sur',
      price: 110,
      unit: 'kg',
      stock: 0,
      initialStock: 20,
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
      description: 'Thick-walled bell peppers with bright colors and crisp sweetness. All current lots committed.',
      tags: ['locally_grown'],
      isSoldOut: true,
      createdAt: '2026-09-05T08:00:00Z',
    },
  ];

  // Merge live stocks from AppContext if user adjusted or ordered
  const mergedItems = catalogItems.map((catItem) => {
    const live = products.find(
      (p) =>
        p.id === catItem.id ||
        p.name.toLowerCase().includes(catItem.name.split(' ')[0].toLowerCase())
    );
    if (live) {
      return {
        ...catItem,
        stock: live.stock,
        isSoldOut: live.stock <= 0,
      };
    }
    return catItem;
  });

  // Filter items by query and crop pill
  const filteredList = mergedItems.filter((item) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesFarm = item.farmName.toLowerCase().includes(q);
      if (!matchesName && !matchesFarm) return false;
    }

    // Crop category pills filter
    if (selectedCropFilter === 'tomatoes') {
      return item.name.toLowerCase().includes('tomato');
    }
    if (selectedCropFilter === 'greens') {
      return item.name.toLowerCase().includes('lettuce') || item.name.toLowerCase().includes('green');
    }

    return true;
  });

  const handleQuickAdd = (e: React.MouseEvent, item: DisplayProduct) => {
    e.stopPropagation();
    const liveProd = products.find((p) => p.id === item.id) || item;
    const res = addToCart(liveProd, 1);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

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
              title="Chef Makiboi"
            >
              <User className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Title & Direct from Hub Pill */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#166534] stroke-[2.2]" />
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
                Vegetables
              </h1>
            </div>

            <span className="bg-[#4ADE80]/30 text-[#166534] font-black text-xs px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>Direct from Hub</span>
            </span>
          </div>

          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            Procure fresh crates logged straight from regional harvest dispatches.
          </p>
        </div>

        {/* Search Bar with "Roma" prefilled and Clear X button */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search produce..."
            className="w-full bg-white border border-stone-200/90 rounded-2xl pl-10 pr-9 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#166534] shadow-2xs font-semibold"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Crop Filter Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCropFilter('all');
              setSearchQuery('');
            }}
            className={`text-xs font-black px-3.5 py-1.5 rounded-full shrink-0 border transition-all cursor-pointer ${
              selectedCropFilter === 'all' && !searchQuery
                ? 'bg-[#0B4A2A] text-white border-[#0B4A2A] shadow-xs'
                : 'bg-[#EEF2FF] text-stone-700 border-[#DBEAFE] hover:border-blue-300'
            }`}
          >
            All Crops <span className="text-[10px] opacity-70 font-normal">(42)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCropFilter('tomatoes');
              setSearchQuery('Roma');
            }}
            className={`text-xs font-black px-3.5 py-1.5 rounded-full shrink-0 border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCropFilter === 'tomatoes' || searchQuery.toLowerCase().includes('roma')
                ? 'bg-[#0B4A2A] text-white border-[#0B4A2A] shadow-xs'
                : 'bg-[#EEF2FF] text-stone-700 border-[#DBEAFE] hover:border-blue-300'
            }`}
          >
            <span>🍅</span>
            <span>Tomatoes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCropFilter('greens');
              setSearchQuery('Lettuce');
            }}
            className={`text-xs font-black px-3.5 py-1.5 rounded-full shrink-0 border transition-all cursor-pointer ${
              selectedCropFilter === 'greens'
                ? 'bg-[#0B4A2A] text-white border-[#0B4A2A] shadow-xs'
                : 'bg-[#EEF2FF] text-stone-700 border-[#DBEAFE] hover:border-blue-300'
            }`}
          >
            Leafy Greens <span className="text-[10px] opacity-70 font-normal">(18)</span>
          </button>
        </div>

        {/* Cooperative Live Inventory Notice Banner */}
        <div className="p-2.5 bg-[#F0F4FF] rounded-xl border border-[#DBEAFE] flex items-center gap-2 text-[11px] text-stone-600 shadow-2xs">
          <FileCheck className="w-4 h-4 text-[#166534] shrink-0" />
          <span className="font-medium leading-snug">
            Live inventory updated automatically upon farmer harvest confirmation.
          </span>
        </div>

        {/* Product Cards List */}
        <div className="space-y-3 pb-2">
          {filteredList.map((item) => {
            const isSoldOut = item.isSoldOut || item.stock <= 0;

            return (
              <div
                key={item.id}
                onClick={() => {
                  const target = products.find((p) => p.id === item.id) || item;
                  setActiveProductForDetail(target);
                }}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-3 hover:border-[#166534] transition-all cursor-pointer group"
              >
                {/* Upper Section: Thumbnail with badge + details */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail with overlay badge */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${
                        isSoldOut ? 'opacity-50 grayscale' : ''
                      }`}
                    />

                    {/* Corner Badge */}
                    {item.badgeType && !isSoldOut && (
                      <span
                        className={`absolute top-1.5 left-1.5 text-[8.5px] font-black px-1.5 py-0.5 rounded text-white shadow-xs ${
                          item.badgeType === 'GRADE A'
                            ? 'bg-[#0B4A2A]/90'
                            : item.badgeType === 'HYDRO'
                            ? 'bg-[#0F4C3A]/90'
                            : 'bg-[#78350F]/90'
                        }`}
                      >
                        {item.badgeType}
                      </span>
                    )}

                    {/* Slashed circle on sold out */}
                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-stone-500/80 flex items-center justify-center relative">
                          <div className="w-8 h-0.5 bg-stone-500/80 rotate-45 absolute"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title, Farm & Distance, Price */}
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-black text-sm leading-tight truncate ${
                      isSoldOut ? 'text-stone-600' : 'text-[#0F172A]'
                    }`}>
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1 truncate">
                      <Tractor className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{item.farmName}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-400 shrink-0">{item.distanceText}</span>
                    </div>

                    <div className="mt-1.5">
                      <span className={`text-base font-black ${
                        isSoldOut ? 'text-stone-600' : 'text-[#0F172A]'
                      }`}>
                        ₱{item.price}
                      </span>
                      <span className="text-xs text-stone-500 font-medium ml-1">
                        / {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock Pill & Add / Sold Out Button */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  {/* Available Stock Pill */}
                  {isSoldOut ? (
                    <div className="bg-[#FEE2E2] text-rose-700 font-black text-[10.5px] px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>0 kg available (SOLD OUT)</span>
                    </div>
                  ) : (
                    <div className="bg-[#4ADE80]/30 text-[#166534] font-black text-xs px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                      <Package className="w-3.5 h-3.5 text-[#166534]" />
                      <span>{item.stock} kg available</span>
                    </div>
                  )}

                  {/* Button */}
                  {isSoldOut ? (
                    <button
                      type="button"
                      disabled
                      className="bg-[#EFF6FF] text-stone-400 font-black text-xs py-2 px-4 rounded-xl border border-stone-200 cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-stone-300" />
                      <span>Sold Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, item)}
                      className="bg-[#0B4A2A] hover:bg-[#08381e] active:scale-95 text-white font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
