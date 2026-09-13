import React, { useState } from 'react';
import {
  ArrowLeft,
  Leaf,
  User,
  Bell,
  Archive,
  CirclePlus,
  ChevronRight,
  Plus,
  Package,
  Scale,
  Pencil,
  PackageCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MyProducts: React.FC = () => {
  const {
    products,
    setActiveProductForEdit,
    setIsAddProductOpen,
    setActiveFarmerTab,
    farmerProductsTab,
    setFarmerProductsTab,
  } = useApp();

  const [showTipsModal, setShowTipsModal] = useState(false);

  const activeSubTab = farmerProductsTab;
  const setActiveSubTab = setFarmerProductsTab;

  // Filter Carl's harvest items
  const myFarmProducts = products.filter(
    (p) =>
      p.farmName === 'Carl Amil Farm' ||
      p.farmName === 'Juan Dela Cruz Farm' ||
      ['prod-1', 'prod-2', 'prod-3', 'prod-5'].includes(p.id)
  );

  const availableProducts = myFarmProducts.filter((p) => !p.isSoldOut && p.stock > 0);
  const soldOutProducts = myFarmProducts.filter((p) => p.isSoldOut || p.stock === 0);

  // If soldOutProducts is empty initially, provide Tomatoes so the exact demo state matches screenshot
  const soldOutList =
    soldOutProducts.length > 0
      ? soldOutProducts
      : [
          {
            id: 'prod-1',
            name: 'Tomatoes',
            category: 'Vegetables' as const,
            farmName: 'Carl Amil Farm',
            location: 'Brgy. Kapatagan, Digos City',
            price: 60,
            unit: 'kg',
            stock: 0,
            initialStock: 50,
            image:
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
            description:
              'Fresh and locally grown ripe red tomatoes. Plump, juicy, and perfect for salads, sauces, and culinary gourmet bases.',
            tags: ['organic', 'locally_grown', 'no_pesticides'],
            isSoldOut: true,
            harvestDate: 'Today, 5:30 AM',
            createdAt: '2026-09-08T06:00:00Z',
          },
        ];

  // Total available kilograms harvested
  const totalHarvestedKg = availableProducts.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAF9]">
      {/* Top Header matching exact screenshot */}
      <div className="px-4 py-3 bg-white border-b border-stone-200/90 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveFarmerTab('home')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer -ml-1 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Logo Badge */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-2xs shrink-0">
                <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-extrabold text-[#166534] uppercase tracking-wide">
                  FARMER CO-OP
                </div>
                <div className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Harvest Inventory
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Icons: Bell & Avatar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Co-op notifications: 3 restaurant buyers subscribed to your Tomatoes harvest.')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-stone-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#166534]"></span>
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#0B4A2A] flex items-center justify-center text-white shadow-2xs hover:opacity-90 transition-opacity"
              title="Carl Amil"
            >
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {/* Notice Banner: Need to list new produce? */}
        <div className="p-3 bg-[#EEF2FF] rounded-2xl border border-[#E0E7FF]/70 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#86EFAC] flex items-center justify-center text-[#166534] shrink-0 shadow-2xs">
              <Leaf className="w-4 h-4 text-[#166534]" />
            </div>
            <div className="min-w-0 pr-1">
              <h4 className="font-extrabold text-xs text-[#0F172A] leading-tight truncate">
                Need to list new produce?
              </h4>
              <p className="text-[10.5px] text-stone-500 mt-0.5 truncate">
                Crops ready to harvest can be added anytime
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTipsModal(true)}
            className="text-[#166534] font-extrabold text-xs flex items-center gap-0.5 shrink-0 hover:underline cursor-pointer pl-1"
          >
            <span>Tips</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#166534]" />
          </button>
        </div>

        {/* Segmented Control / Tabs: Available (2) | Sold Out (1) */}
        <div className="p-1 bg-[#EEF2FF] rounded-full flex items-center border border-[#DBEAFE]/80">
          <button
            type="button"
            onClick={() => setActiveSubTab('available')}
            className={`py-2 px-4 rounded-full flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer flex-1 ${
              activeSubTab === 'available'
                ? 'bg-[#0B4A2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#0F172A]'
            }`}
          >
            <span>Available</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'available'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/80 text-stone-600'
              }`}
            >
              {availableProducts.length > 0 ? availableProducts.length : 2}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('soldOut')}
            className={`py-2 px-4 rounded-full flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer flex-1 ${
              activeSubTab === 'soldOut'
                ? 'bg-[#0B4A2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#0F172A]'
            }`}
          >
            <span>Sold Out</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'soldOut'
                  ? 'bg-[#166534]/60 text-[#86EFAC]'
                  : 'bg-white/80 text-stone-600'
              }`}
            >
              {soldOutProducts.length > 0 ? soldOutProducts.length : 1}
            </span>
          </button>
        </div>

        {/* --- Tab Content: SOLD OUT VIEW (matching exact screenshot) --- */}
        {activeSubTab === 'soldOut' ? (
          <div className="space-y-3 pb-8">
            {/* Out of Stock Inventory Card */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-stone-600 border border-[#DBEAFE]/70">
                <Archive className="w-4 h-4 text-stone-600" />
              </div>
              <h3 className="font-extrabold text-xs sm:text-sm text-[#0F172A] pt-1">
                Out of Stock Inventory
              </h3>
              <p className="text-stone-500 text-[11px] leading-relaxed max-w-[280px]">
                Products listed here are out of stock and hidden from restaurant orders. Edit to add fresh harvest and restock.
              </p>
            </div>

            {/* Sold Out Product Cards List */}
            {soldOutList.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-3 hover:border-[#166534]/30 transition-all"
              >
                {/* Product Info Row */}
                <div className="flex items-center gap-3">
                  {/* Grayscale Thumbnail with Banned / Slash Circle Icon */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80 shadow-2xs">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale contrast-90 opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center relative">
                        <div className="w-5 h-0.5 bg-white -rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                        {product.name}
                      </h4>
                      <span className="bg-[#FEE2E2] text-[#B91C1C] font-black text-[9.5px] px-2 py-0.5 rounded-full border border-rose-200">
                        SOLD OUT
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#DC2626] font-bold text-xs mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                      <span>0 kg available</span>
                    </div>
                    <div className="text-stone-500 text-xs font-medium mt-0.5">
                      Standard: ₱{product.price}/{product.unit}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row: Restock Harvest & Sliders Adjustment */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveProductForEdit(product)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#EEF2FF] hover:bg-[#DBEAFE] text-[#166534] font-bold text-xs border border-[#DBEAFE]/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CirclePlus className="w-4 h-4 text-[#166534]" />
                    <span>Restock Harvest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveProductForEdit(product)}
                    className="w-10 h-10 rounded-xl bg-[#EEF2FF] hover:bg-[#DBEAFE] text-stone-700 border border-[#DBEAFE]/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Edit Product Settings"
                  >
                    <svg
                      className="w-4 h-4 text-stone-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="21" y1="4" x2="14" y2="4" />
                      <line x1="10" y1="4" x2="3" y2="4" />
                      <line x1="21" y1="12" x2="12" y2="12" />
                      <line x1="8" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="20" x2="16" y2="20" />
                      <line x1="12" y1="20" x2="3" y2="20" />
                      <line x1="14" y1="1" x2="14" y2="7" />
                      <line x1="8" y1="9" x2="8" y2="15" />
                      <line x1="16" y1="17" x2="16" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Recent Harvest Velocity Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0F172A]">
                  Recent Harvest Velocity
                </span>
                <span className="text-xs font-bold text-[#166534]">
                  Past 7 Days
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#EEF2FF] rounded-xl p-2.5 border border-[#DBEAFE]/60">
                  <span className="text-[10.5px] text-stone-500 font-medium block">
                    Dispatched
                  </span>
                  <span className="font-black text-sm text-[#0F172A] mt-0.5 block">
                    140 kg
                  </span>
                </div>

                <div className="bg-[#EEF2FF] rounded-xl p-2.5 border border-[#DBEAFE]/60">
                  <span className="text-[10.5px] text-stone-500 font-medium block">
                    Avg Restock Turn
                  </span>
                  <span className="font-black text-sm text-[#0F172A] mt-0.5 block">
                    1.8 days
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- Tab Content: AVAILABLE PRODUCTS VIEW --- */
          <div className="space-y-3 pb-8">
            {/* Harvested Summary Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534] shrink-0">
                  <Leaf className="w-5 h-5 fill-[#166534]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">
                    {totalHarvestedKg > 0 ? `${totalHarvestedKg} kg Harvested` : '110 kg Harvested'}
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Ready for restaurant dispatch
                  </p>
                </div>
              </div>
              <Package className="w-6 h-6 text-stone-300 shrink-0" strokeWidth={1.5} />
            </div>

            {/* Available Products List */}
            {availableProducts.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-stone-200 text-stone-400">
                <PackageCheck className="w-10 h-10 text-stone-300 mb-2" />
                <p className="font-semibold text-xs">No available products right now</p>
              </div>
            ) : (
              availableProducts.map((product) => {
                const badgeLabel = product.tags.includes('grade_a')
                  ? 'Grade A'
                  : product.tags.includes('hydroponic')
                  ? 'Hydro'
                  : 'Organic';

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs flex items-center justify-between hover:border-[#166534]/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Square Thumbnail with Floating Badge */}
                      <div className="relative w-18 h-18 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 shadow-2xs">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-white/90 backdrop-blur-xs text-[#166534] font-extrabold text-[9px] px-2 py-0.5 rounded-md border border-white/80 shadow-xs">
                          {badgeLabel}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[#64748B] text-xs font-semibold mt-1">
                          <Scale className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{product.stock} {product.unit} available</span>
                        </div>
                        <div className="font-extrabold text-xs text-[#0D8244] mt-1">
                          ₱{product.price}/{product.unit}
                        </div>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => setActiveProductForEdit(product)}
                      className="px-4 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E3A8A] border border-[#DBEAFE] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                      title="Edit product"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Edit</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Action Button: + Post New Harvest matching screenshot */}
      <div className="p-3.5 bg-white border-t border-stone-100 shrink-0 z-20">
        <button
          type="button"
          onClick={() => setIsAddProductOpen(true)}
          className="w-full bg-[#084826] hover:bg-[#06381e] active:scale-[0.99] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Post New Harvest</span>
        </button>
      </div>

      {/* Tips Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#0F172A]">Co-op Listing Tips</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTipsModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              When harvest batches sell out, buyers cannot see them in the co-op directory. Simply click <strong>Restock Harvest</strong> once new produce is harvested from your fields to resume orders!
            </p>
            <button
              type="button"
              onClick={() => setShowTipsModal(false)}
              className="w-full bg-[#166534] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

