import React, { useState } from 'react';
import {
  Smartphone,
  Columns,
  RotateCcw,
  Info,
  CheckCircle2,
  Server,
} from 'lucide-react';
import { ApiStatusModal } from './ApiStatusModal';

import { useApp } from '../context/AppContext';

export const DemoToolbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    viewMode,
    setViewMode,
    resetToDefaults,
    setActiveFarmerTab,
    setActiveBuyerTab,
    setIsAddProductOpen,
    setIsCartOpen,
    setCartFlowStateOverride,
    setActiveProductForDetail,
    setActiveOrderForTracking,
    setActiveProductForEdit,
    setActiveFarmerOrderForReview,
    setFarmerProductsTab,
    products,
    orders,
    setupOversellingScenario,
    loadUpdatedCartScenario,
  } = useApp();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  return (
    <>
      <header className="bg-stone-900 text-stone-200 border-b border-stone-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  Local Bites
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Tag System Active
                </span>
              </div>
              <span className="text-[11px] text-stone-400 block -mt-0.5">
                BSIT-4 Capstone Prototype • Digos City Farm-to-Table
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Role Switcher */}
          <div className="bg-stone-800 p-1 rounded-xl flex items-center border border-stone-700">
            <button
              onClick={() => {
                setCurrentRole('farmer');
                setIsAddProductOpen(false);
                setIsCartOpen(false);
                setActiveProductForDetail(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRole === 'farmer'
                  ? 'bg-[#0D8244] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>👨‍🌾</span>
              <span>Farmer (Carl Amil)</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('buyer');
                setIsAddProductOpen(false);
                setIsCartOpen(false);
                setActiveProductForDetail(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRole === 'buyer'
                  ? 'bg-[#0D8244] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>👩‍🍳</span>
              <span>Buyer (Chef Maria)</span>
            </button>
          </div>

          {/* Quick Screen Jump to 10 Mockup Screens */}
          <div className="bg-stone-800 px-2 py-1 rounded-xl border border-stone-700 flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400 hidden lg:inline">Wireframe:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                if (val === 'f-home') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('home');
                  setIsAddProductOpen(false);
                  setActiveProductForEdit(null);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'f-add') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('products');
                  setActiveProductForEdit(null);
                  setIsAddProductOpen(true);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'f-products') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('products');
                  setFarmerProductsTab('available');
                  setIsAddProductOpen(false);
                  setActiveProductForEdit(null);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'f-soldout') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('products');
                  setFarmerProductsTab('soldOut');
                  setIsAddProductOpen(false);
                  setActiveProductForEdit(null);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'f-edit') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('products');
                  const tomatoes = products.find((p) => p.name.toLowerCase().includes('tomato')) || products[0];
                  setActiveProductForEdit(tomatoes);
                  setIsAddProductOpen(false);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'f-orders') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('orders');
                  setIsAddProductOpen(false);
                  setActiveProductForEdit(null);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'f-orderdetails') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('orders');
                  const ord = orders.find((o) => o.id === '#ORD-1024') || orders[0];
                  if (ord) setActiveFarmerOrderForReview(ord);
                  setIsAddProductOpen(false);
                  setActiveProductForEdit(null);
                } else if (val === 'f-delivery') {
                  setCurrentRole('farmer');
                  setActiveFarmerTab('delivery');
                  setIsAddProductOpen(false);
                  setActiveProductForEdit(null);
                  setActiveFarmerOrderForReview(null);
                } else if (val === 'b-home') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('home');
                  setIsCartOpen(false);
                  setActiveProductForDetail(null);
                  setActiveOrderForTracking(null);
                } else if (val === 'b-browse') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('browse');
                  setIsCartOpen(false);
                  setActiveProductForDetail(null);
                  setActiveOrderForTracking(null);
                } else if (val === 'b-detail') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('browse');
                  setIsCartOpen(false);
                  const tomato = products.find((p) => p.name.toLowerCase().includes('tomato')) || products[0];
                  if (tomato) setActiveProductForDetail(tomato);
                } else if (val === 'b-cart') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('browse');
                  setActiveProductForDetail(null);
                  setCartFlowStateOverride('cart');
                  setIsCartOpen(true);
                } else if (val === 'b-validating') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('browse');
                  setActiveProductForDetail(null);
                  setCartFlowStateOverride('validating');
                  setIsCartOpen(true);
                } else if (val === 'b-insufficient') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('browse');
                  setActiveProductForDetail(null);
                  setCartFlowStateOverride('insufficient_stock');
                  setIsCartOpen(true);
                } else if (val === 'b-cart-updated') {
                  loadUpdatedCartScenario();
                } else if (val === 'b-confirmation') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('browse');
                  setActiveProductForDetail(null);
                  setCartFlowStateOverride('confirmation');
                  setIsCartOpen(true);
                } else if (val === 'b-scenario') {
                  setupOversellingScenario();
                } else if (val === 'b-orders') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('orders');
                  setIsCartOpen(false);
                  setActiveProductForDetail(null);
                  setActiveOrderForTracking(null);
                } else if (val === 'b-track') {
                  setCurrentRole('buyer');
                  setActiveBuyerTab('orders');
                  setIsCartOpen(false);
                  setActiveProductForDetail(null);
                  const ord1026 = orders.find((o) => o.id === '#ORD-1026') || orders[0];
                  if (ord1026) setActiveOrderForTracking(ord1026);
                }
              }}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="" disabled>Jump to Screen...</option>
              <optgroup label="👨‍🌾 Farmer App (User Story 1 Flow)">
                <option value="f-home">1. Farmer Home</option>
                <option value="f-add">2. Add Product Screen</option>
                <option value="f-products">3. My Products (Available)</option>
                <option value="f-soldout">4. My Products (Sold Out Tab)</option>
                <option value="f-edit">5. Edit Product (Tomatoes)</option>
                <option value="f-orders">6. Incoming Orders List</option>
                <option value="f-orderdetails">7. Order Details (#ORD-1024)</option>
                <option value="f-delivery">8. Delivery Tracking</option>
              </optgroup>
              <optgroup label="👩‍🍳 Buyer App (User Story 2 Complete Flow)">
                <option value="b-home">1. Buyer Home</option>
                <option value="b-browse">2. Browse Products</option>
                <option value="b-detail">3. Product Details (Grade A Roma Tomatoes)</option>
                <option value="b-cart">4. Cart &amp; Checkout (Initial 15kg Roma - ₱1,300)</option>
                <option value="b-validating">5. Stock Validation (Checking Availability)</option>
                <option value="b-insufficient">6. Insufficient Stock Alert (Overselling Prevention)</option>
                <option value="b-cart-updated">7. Updated Cart (Auto-Adjusted 10kg - ₱1,000)</option>
                <option value="b-confirmation">8. Order Confirmation (#ORD-1026)</option>
                <option value="b-scenario">⚡ Scenario: 30kg → 20kg → 10kg (15kg Reject)</option>
                <option value="b-orders">9. My Orders List</option>
                <option value="b-track">10. Order Details &amp; Tracking</option>
              </optgroup>
            </select>
          </div>

          {/* View Mode (Single Mobile vs Side-by-Side Dual View) */}
          <div className="bg-stone-800 p-1 rounded-xl flex items-center border border-stone-700">
            <button
              onClick={() => setViewMode('single')}
              title="Single Device View"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-stone-700 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Single</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Side-by-Side Dual Live View"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-stone-700 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Side-by-Side</span>
            </button>
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset demo products, orders, and tags to initial seed?')) {
                resetToDefaults();
              }
            }}
            title="Reset to Initial Demo State"
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all cursor-pointer flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Backend API Status & Connectivity Modal (Rubric 1.2 & 1.3) */}
          <button
            onClick={() => setShowApiModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Inspect Live Backend Endpoints & Database Status"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API &amp; DB Status</span>
          </button>

          {/* Team / Spec Info Modal */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Team &amp; Specs</span>
          </button>
        </div>
      </header>

      {/* API & DB Status Modal */}
      <ApiStatusModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />

      {/* Info / Team Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-stone-900 text-stone-100 max-w-lg w-full rounded-3xl p-6 border border-stone-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Group 1 • BSIT – 4
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Local Bites Cooperative System
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-stone-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Team Roles */}
            <div>
              <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block mb-2">
                Development Team & Roles
              </span>
              <div className="grid grid-cols-2 gap-2 text-stone-300">
                <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                  <p className="font-bold text-white">Carl Vincent S. Amil</p>
                  <p className="text-[10px] text-stone-400">Frontend Specialist (React + Tailwind)</p>
                </div>
                <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                  <p className="font-bold text-white">Allen Kenneth G. Alisoso</p>
                  <p className="text-[10px] text-stone-400">Project Manager / Lead Architect</p>
                </div>
                <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                  <p className="font-bold text-white">Mark Anthony L. Algones</p>
                  <p className="text-[10px] text-stone-400">Backend / Database Engineer</p>
                </div>
                <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                  <p className="font-bold text-white">Gem Joush E. Alcover</p>
                  <p className="text-[10px] text-stone-400">QA / DevOps Lead</p>
                </div>
              </div>
            </div>

            {/* Simulated Client & Goal */}
            <div className="bg-stone-800/40 p-3 rounded-2xl border border-stone-800 space-y-1">
              <span className="font-bold text-emerald-400 text-[11px] block">
                Simulated Client: Elena Rostova (Agricultural Director)
              </span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Connects small organic farmers directly with restaurants, cafés, and food businesses in Digos City, cutting out middlemen markups and providing mobile-first simple screens for farmers.
              </p>
            </div>

            {/* Acceptance Criteria Status */}
            <div>
              <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block mb-2">
                Acceptance Criteria Implementation
              </span>
              <div className="space-y-1.5 text-stone-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US1-AC01:</strong> Add Product (Name, price, quantity, photo, tags)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US1-AC02:</strong> Update Product (Price, quantity, tags edit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US1-AC03:</strong> Automatic Stock Deduction upon Farmer confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US1-AC04:</strong> Sold Out Status (0 stock moves to Sold Out)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US2-AC01:</strong> Browse and Order Products by Category & Tags</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US2-AC02:</strong> Check Available Stock before order submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US2-AC03:</strong> Prevent Overselling (e.g. 10 kg left, 15 kg rejected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>US2-AC04:</strong> Order Confirmation & Live Delivery Tracker</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Tag System:</strong> 🌱 Organic, 📍 Locally Grown, 🛡️ No Pesticides, etc.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition-all text-xs"
            >
              Close Overview
            </button>
          </div>
        </div>
      )}
    </>
  );
};
