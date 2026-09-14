import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Camera,
  CheckCircle2,
  Package,
  Truck,
  Clock,
  Minus,
  Plus,
  AlertCircle,
  MessageSquare,
  ShoppingBag,
  User,
  Check,
  Tractor,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductDetailsModal: React.FC = () => {
  const {
    activeProductForDetail,
    setActiveProductForDetail,
    addToCart,
    setIsCartOpen,
    setActiveBuyerTab,
  } = useApp();

  const product = activeProductForDetail;

  const minOrder = product?.minOrder || 5;
  const [quantity, setQuantity] = useState(15);
  const [isLiked, setIsLiked] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (product) {
      // Default to 15 kg (as in reference screenshot) or capped within min and stock
      const initialQty = Math.min(product.stock, Math.max(minOrder, 15));
      setQuantity(initialQty > 0 ? initialQty : 1);
      setErrorMessage('');
      setAddedNotice(false);
      setIsLiked(false);
    }
  }, [product, minOrder]);

  if (!activeProductForDetail || !product) return null;

  const isSoldOut = product.isSoldOut || product.stock <= 0;
  const unitLabel = product.unit === 'kg' ? 'kilogram' : product.unit;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => Math.min(product.stock, prev + 1));
      setErrorMessage('');
    } else {
      setErrorMessage(`Maximum available: ${product.stock} ${product.unit} (Prevents overselling beyond farmer batch).`);
    }
  };

  const handleDecrement = () => {
    if (quantity > minOrder) {
      setQuantity((prev) => prev - 1);
      setErrorMessage('');
    } else {
      setErrorMessage(`Minimum bulk order for commercial buyer dispatch is ${minOrder} ${product.unit}.`);
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) {
      setErrorMessage('This batch is currently sold out!');
      return;
    }

    const res = addToCart(product, quantity);
    if (res.success) {
      setAddedNotice(true);
      setErrorMessage('');
      setTimeout(() => {
        setAddedNotice(false);
        setActiveProductForDetail(null);
        setIsCartOpen(true);
      }, 700);
    } else {
      setErrorMessage(res.message || 'Cannot add requested quantity to cart.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} - Local Bites Co-op`,
        text: `Fresh ${product.name} directly from ${product.farmName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      setToastMessage('Link copied to clipboard!');
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#FAFBFB] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 text-stone-900">
        
        {/* Top Header Bar */}
        <header className="px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveProductForDetail(null)}
              className="p-1 -ml-1 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-stone-900 leading-tight">Produce Detail</h1>
              <p className="text-[9px] font-extrabold text-stone-400 tracking-wider uppercase">
                RESTAURANT &amp; BUYER CO-OP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveProductForDetail(null);
              setActiveBuyerTab('more');
            }}
            className="w-8 h-8 rounded-full bg-[#0A4A29] ring-2 ring-emerald-200 flex items-center justify-center text-white shadow-xs cursor-pointer hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            title="Open Chef Makiboi Account & Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFB]">
          
          {/* Hero Image Area */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 bg-stone-100 shadow-xs border border-stone-200/80 shrink-0">
            <img
              src={product.image || '/roma-tomatoes-basket.jpg'}
              alt={product.name}
              className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-125' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none"></div>

            {/* Top Floating Buttons over image */}
            <div className="absolute top-3 left-3 z-10">
              <button
                type="button"
                onClick={() => setActiveProductForDetail(null)}
                className="w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-stone-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-stone-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500 stroke-rose-500' : 'stroke-[2.2]'}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-stone-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
                title="Share"
              >
                <Share2 className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Bottom Floating Badges over image */}
            <div className="absolute bottom-3 left-3 z-10">
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full shadow-md text-[10.5px] font-black text-[#0B4A2A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block animate-pulse"></span>
                <span>PICKED {product.harvestDate || '5:30 AM TODAY'}</span>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 z-10">
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs">
                <Camera className="w-3 h-3" />
                <span>1/4</span>
              </div>
            </div>

            {isSoldOut && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-20">
                <span className="bg-rose-600 text-white font-black text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-rose-400">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Product Title & Price Header */}
          <div className="flex items-start justify-between px-0.5 pt-0.5">
            <div>
              <p className="text-[11px] font-black text-[#15803D] tracking-wider uppercase">
                {product.subGrade || 'GRADE A ROMA'}
              </p>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-[#15803D] tracking-tight">
                ₱{product.price}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                per {unitLabel}
              </div>
            </div>
          </div>

          {/* Farm Information Card (Soft Blue / Lavender) */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#166534] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Tractor className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
                <span className="truncate">{product.farmName}</span>
                <CheckCircle2 className="w-4 h-4 fill-[#16A34A] text-white shrink-0" />
              </div>
              <p className="text-[11px] text-stone-500 font-medium truncate">
                {product.location || 'Digos Valley • Mindanao Grower Hub #14'}
              </p>
            </div>
          </div>

          {/* Today's Batch Card (Mint Light Green) */}
          <div className="bg-[#E8F8F0] border border-[#C6F0DB] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#0B4A2A] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-black text-[#0B4A2A] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block"></span>
                <span>TODAY'S BATCH</span>
              </div>
              <p className="text-xs text-stone-700 font-medium">
                <strong className="text-base font-black text-stone-900">{product.stock} {product.unit}</strong>{' '}
                available in field reserve
              </p>
            </div>
          </div>

          {/* Tag Pills Row (Organic, Locally Grown, No Pesticides, Same-Day Harvest) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-[#22C55E] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
              🌱 Organic
            </span>
            <span className="bg-[#EFF6FF] text-[#1E40AF] border border-[#DBEAFE] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              📍 Locally Grown
            </span>
            <span className="bg-[#EEF2FF] text-[#312E81] border border-[#C7D2FE] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              🛡️ No Pesticides
            </span>
            <span className="bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              ⏰ Same-Day Harvest
            </span>
          </div>

          {/* PRODUCE PROFILE Section */}
          <div className="space-y-1 pt-1">
            <h3 className="text-xs font-black text-stone-900 tracking-wider uppercase">
              PRODUCE PROFILE
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              {product.description ||
                'Firm, vine-ripened Roma tomatoes ideal for rich sauces, fresh salads, and culinary reductions. Handpicked this morning at 5:30 AM to preserve full sugar content and firm texture during transport.'}
            </p>
          </div>

          {/* Express Buyer Dispatch Card */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#15803D]">
                <Truck className="w-4 h-4 text-[#15803D] stroke-[2.2]" />
                <span>EXPRESS BUYER DISPATCH</span>
              </div>
              <span className="bg-white text-stone-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-stone-200/90 shadow-2xs">
                {product.dispatchVan || 'Co-op Van 4'}
              </span>
            </div>
            <p className="text-xs text-stone-700 font-medium">
              Estimated arrival at Green Leaf Bistro:
            </p>
            <div className="text-xs font-black text-[#0B4A2A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0B4A2A] stroke-[2.4]" />
              <span>{product.deliveryEstimate || 'Today, 2:00 PM – 4:00 PM'}</span>
            </div>
          </div>

          {/* Harvest Freshness Score Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900">Harvest Freshness Score</span>
              <span className="text-xs font-black text-[#15803D]">
                {product.peakMoisture || '98% Peak Moisture'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <div className="w-28 h-12 bg-[#F0FDF4] rounded-lg border border-emerald-100/90 relative flex items-center justify-center overflow-hidden shrink-0">
                <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" aria-hidden="true">
                  <path
                    d="M 6 34 Q 40 28 65 14 T 94 8"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 6 34 Q 40 28 65 14 T 94 8 L 94 40 L 6 40 Z"
                    fill="rgba(22, 163, 74, 0.14)"
                  />
                </svg>
              </div>

              <div className="space-y-1 text-[11px] text-stone-600 font-medium">
                <div>
                  Brix Sweetness Index:{' '}
                  <strong className="text-stone-800 font-bold">{product.brixIndex || '5.8°'}</strong>
                </div>
                <div>
                  Acidity Balance:{' '}
                  <strong className="text-stone-800 font-bold">{product.acidityBalance || 'Optimal pH 4.4'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Order Quantity Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900">Order Quantity</span>
              <span className="text-[11px] text-stone-500 font-medium">
                Min: {minOrder} {product.unit}
              </span>
            </div>

            {/* Quantity Selector Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= minOrder || isSoldOut}
                className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-stone-700 flex items-center justify-center font-bold text-xl hover:bg-blue-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="flex-1 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-base font-black text-[#0B4A2A]">
                {quantity} {product.unit}
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= product.stock || isSoldOut}
                className="w-12 h-12 rounded-xl bg-[#0B4A2A] text-white flex items-center justify-center font-bold text-xl hover:bg-[#083820] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                title="Increase quantity"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Overselling Prevention Notice */}
            <div className="text-[11px] text-amber-800 flex items-start gap-1.5 pt-0.5 font-normal">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>Maximum available: {product.stock} {product.unit} (Prevents overselling beyond farmer batch).</span>
            </div>
          </div>

          {/* Subtotal Estimate Bar */}
          <div className="bg-[#EFF6FF] rounded-2xl px-4 py-3 flex items-center justify-between border border-[#DBEAFE]/70 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium">Subtotal estimate:</span>
            <div className="text-xs">
              <span className="font-bold text-stone-800">
                {quantity} {product.unit} × ₱{product.price} ={' '}
              </span>
              <span className="font-black text-[#0B4A2A] text-sm">
                ₱{(quantity * product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Interactive Alerts */}
          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {toastMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs flex items-center gap-2 shadow-2xs">
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {addedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 shadow-2xs font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Added {quantity} {product.unit} to cart! Opening checkout...</span>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <footer className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2.5 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setShowChatModal(true)}
            className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-stone-700 border border-[#DBEAFE] flex items-center justify-center hover:bg-blue-100 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Message Farmer / Dispatch"
          >
            <MessageSquare className="w-5 h-5 text-stone-700" />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`flex-1 h-12 rounded-2xl font-black flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
              isSoldOut
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#0B4A2A] hover:bg-[#083820] active:scale-[0.99] text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.4]" />
            <span>
              {isSoldOut
                ? 'Sold Out'
                : `Add to Cart (₱${(quantity * product.price).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                  })})`}
            </span>
          </button>
        </footer>

        {/* Co-op Farmer Dispatch Direct Chat Modal */}
        {showChatModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs z-30 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-stone-200 animate-in slide-in-from-bottom duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#166534] text-white flex items-center justify-center text-sm font-bold">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900">{product.farmName}</h4>
                    <p className="text-[10px] text-emerald-700 font-bold">● Active on Field Dispatch</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#EFF6FF] p-3 rounded-xl border border-[#DBEAFE] text-xs text-stone-700 space-y-1">
                <div className="font-bold text-[#1E40AF]">Grower Dispatch Line:</div>
                <p>
                  Direct co-op logistics support for <strong>{product.name} ({product.subGrade || 'Grade A'})</strong>.
                  Van 4 departs grower hub at 1:30 PM for Green Leaf Bistro.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Quick Question or Special Cut/Prep Note
                </label>
                <textarea
                  placeholder="e.g. Please pick slightly firmer crate for culinary reduction..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#0B4A2A] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChatModal(false);
                    setToastMessage('Message transmitted to Juan’s Sungrown Farm!');
                    setTimeout(() => setToastMessage(''), 2500);
                  }}
                  className="flex-1 py-2.5 bg-[#0B4A2A] hover:bg-[#083820] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
