import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Leaf,
  User,
  Camera,
  Upload,
  ChevronDown,
  Lightbulb,
  CheckCircle2,
  Ban,
  AlertCircle,
  Check,
  RefreshCw,
  Package,
  Clock,
  Hourglass,
  Banknote,
  Tag,
  LayoutGrid,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ProductCategory } from '../../types';

const PRESET_PHOTOS = [
  { label: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' },
  { label: 'Lettuce', url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&auto=format&fit=crop&q=80' },
  { label: 'Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80' },
  { label: 'Onions', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bell Peppers', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80' },
  { label: 'Fresh Herbs', url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mangoes', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80' },
  { label: 'Organic Eggs', url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop&q=80' },
];

export const AddEditProductModal: React.FC = () => {
  const {
    isAddProductOpen,
    setIsAddProductOpen,
    activeProductForEdit,
    setActiveProductForEdit,
    addProduct,
    updateProduct,
    setActiveFarmerTab,
    setCurrentRole,
    setActiveBuyerTab,
    setFarmerProductsTab,
  } = useApp();

  const isEditing = Boolean(activeProductForEdit);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'All Products'>>('Vegetables');
  const [farmName, setFarmName] = useState('Carl Amil Farm');
  const [location, setLocation] = useState('Brgy. Kapatagan, Digos City');
  const [price, setPrice] = useState<number | ''>(60);
  const [quantity, setQuantity] = useState<number | ''>(50);
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(['organic', 'locally_grown', 'fresh_harvest']);
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [successState, setSuccessState] = useState<'added' | 'updated' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate estimated total (quantity * price)
  const estTotal = (typeof price === 'number' && typeof quantity === 'number') ? price * quantity : 0;

  // Populate form if editing or prefill tomatoes
  useEffect(() => {
    if (activeProductForEdit) {
      setName(activeProductForEdit.name);
      setCategory(activeProductForEdit.category);
      setFarmName(activeProductForEdit.farmName);
      setLocation(activeProductForEdit.location);
      setPrice(activeProductForEdit.price);
      setQuantity(activeProductForEdit.stock);
      setUnit(activeProductForEdit.unit);
      setDescription(activeProductForEdit.description);
      setSelectedTagIds(activeProductForEdit.tags);
      setImageUrl(activeProductForEdit.image);
    } else {
      // Pre-fill Tomatoes per screenshot
      setName('Tomatoes');
      setCategory('Vegetables');
      setFarmName('Carl Amil Farm');
      setLocation('Brgy. Kapatagan, Digos City');
      setPrice(60);
      setQuantity(50);
      setUnit('kg');
      setDescription('Fresh and locally grown ripe red tomatoes.');
      setSelectedTagIds(['organic', 'locally_grown', 'no_pesticides']);
      setImageUrl(PRESET_PHOTOS[0].url);
    }
    setSuccessState(null);
    setErrorMsg('');
    setShowPhotoPicker(false);
  }, [activeProductForEdit, isAddProductOpen]);

  if (!isAddProductOpen && !activeProductForEdit) return null;

  const handleClose = () => {
    setIsAddProductOpen(false);
    setActiveProductForEdit(null);
    setSuccessState(null);
    setShowPhotoPicker(false);
  };

  const handleMarkAsSoldOut = () => {
    if (activeProductForEdit) {
      updateProduct(activeProductForEdit.id, {
        stock: 0,
        isSoldOut: true,
      });
      setQuantity(0);
      setSuccessState('updated');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a product name');
      return;
    }
    if (price === '' || price <= 0) {
      setErrorMsg('Please enter a valid price');
      return;
    }
    if (quantity === '' || quantity < 0) {
      setErrorMsg('Please enter a valid quantity');
      return;
    }

    if (isEditing && activeProductForEdit) {
      updateProduct(activeProductForEdit.id, {
        name: name.trim(),
        category,
        farmName,
        location,
        price: Number(price),
        stock: Number(quantity),
        unit,
        description: description.trim() || `Fresh harvest from ${farmName}.`,
        tags: selectedTagIds,
        image: imageUrl,
        isSoldOut: Number(quantity) <= 0,
      });
      setSuccessState('updated');
    } else {
      addProduct({
        name: name.trim(),
        category,
        farmName,
        location,
        price: Number(price),
        stock: Number(quantity),
        initialStock: Number(quantity),
        unit,
        description: description.trim() || `Fresh harvest from ${farmName}.`,
        tags: selectedTagIds,
        image: imageUrl,
        harvestDate: 'Fresh Today',
      });
      setSuccessState('added');
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      {/* Top Header matching exact screenshot */}
      <div className="px-4 py-3 bg-white border-b border-stone-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer -ml-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {successState === 'updated' ? (
            <h2 className="text-sm font-extrabold text-[#0F172A] ml-1">
              Add Harvest Batch
            </h2>
          ) : (
            <>
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
              <h2 className="text-base font-extrabold text-[#0F172A] ml-2">
                {isEditing ? 'Edit Product' : 'Add Product'}
              </h2>
            </>
          )}
        </div>

        {/* User Circular Avatar Button */}
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-[#0B4A2A] flex items-center justify-center text-white shadow-2xs hover:opacity-90 transition-opacity"
        >
          <User className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Success State: Product Added Successfully (Req 2) */}
      {successState === 'added' ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in bg-[#F8FAF9]">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mb-1 shadow-2xs">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
              Inventory Added (US1-AC01)
            </span>
            <h3 className="text-xl font-black text-[#0F172A] pt-1">
              Product added successfully.
            </h3>
            <p className="text-xs text-[#64748B] max-w-[280px] mx-auto leading-relaxed pt-1">
              <strong>{name}</strong> ({quantity} {unit} at ₱{price}/{unit}) is saved and displayed in the available product list.
            </p>
          </div>

          <div className="w-full pt-4 max-w-xs">
            <button
              type="button"
              onClick={() => {
                setActiveFarmerTab('products');
                handleClose();
              }}
              className="w-full bg-[#166534] hover:bg-[#13572c] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              View My Products
            </button>
          </div>
        </div>
      ) : successState === 'updated' ? (
        /* --- Product Updated Successfully State matching exact user screenshot --- */
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 animate-in fade-in bg-white flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Circular Green Badge with Sync Icon */}
            <div className="flex justify-center pt-2">
              <div className="relative w-16 h-16 rounded-full bg-[#0D6832] flex items-center justify-center text-white shadow-md">
                <Check className="w-9 h-9 stroke-[3]" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4ADE80] text-stone-900 flex items-center justify-center border-2 border-white shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.8]" />
                </div>
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="text-center space-y-1 px-2">
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight">
                Product Updated Successfully!
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[290px] mx-auto">
                Changes to your product details and stock have been saved and synced to the buyer marketplace.
              </p>
            </div>

            {/* Marketplace Sync Status Pill */}
            <div className="bg-[#EEF2FF] rounded-2xl px-3.5 py-2.5 flex items-center justify-between border border-[#E0E7FF]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span>Marketplace Sync Status</span>
              </div>
              <span className="bg-white text-[#16A34A] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 shadow-2xs">
                Live & Instant
              </span>
            </div>

            {/* Summary of Changes White Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-3">
              {/* Header inside summary card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shrink-0">
                    <Package className="w-5 h-5 text-[#2563EB] stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                      Summary of Changes
                    </span>
                    <h4 className="text-base font-extrabold text-[#0F172A] -mt-0.5">
                      {name || 'Tomatoes'}
                    </h4>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    Number(quantity) === 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-[#DCFCE7] text-[#16A34A]'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{Number(quantity) === 0 ? 'Sold Out' : 'Active'}</span>
                </span>
              </div>

              {/* Thumbnail + Category Sub-box */}
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-stone-200/70 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 font-medium block">
                    Category
                  </span>
                  <div className="font-extrabold text-xs text-[#0F172A] leading-tight">
                    Vine-Ripened Produce
                  </div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-1 font-medium">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Just now</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Updated Stock & Current Price */}
              <div className="grid grid-cols-2 gap-2">
                {/* Updated Stock */}
                <div className="bg-[#EEF2FF] rounded-xl p-3 border border-[#E0E7FF] space-y-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[11px] font-bold text-stone-700">
                      Updated Stock
                    </span>
                    <Hourglass className="w-3.5 h-3.5 text-teal-600 stroke-[2.2]" />
                  </div>
                  <div className="text-xl font-black text-[#0F172A]">
                    {quantity} <span className="text-xs font-normal text-stone-500">{unit}</span>
                  </div>
                  <div className="text-[10.5px] font-bold text-[#16A34A] flex items-center gap-0.5 pt-0.5">
                    <span>↑ +15 {unit} added</span>
                  </div>
                </div>

                {/* Current Price */}
                <div className="bg-[#EEF2FF] rounded-xl p-3 border border-[#E0E7FF] space-y-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[11px] font-bold text-stone-700">
                      Current Price
                    </span>
                    <Banknote className="w-3.5 h-3.5 text-amber-600 stroke-[2.2]" />
                  </div>
                  <div className="text-xl font-black text-[#0D8244]">
                    ₱{price} <span className="text-xs font-normal text-stone-500">/{unit}</span>
                  </div>
                  <div className="text-[10.5px] font-medium text-stone-500 flex items-center gap-1 pt-0.5">
                    <Tag className="w-3 h-3 text-stone-400" />
                    <span>Market standard</span>
                  </div>
                </div>
              </div>

              {/* Available for Immediate Orders Banner */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-stone-200/70 flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-[#0F172A]">
                    Available for Immediate Orders
                  </h5>
                  <p className="text-[10.5px] text-[#64748B] mt-0.5 leading-tight">
                    Retailers and dining co-ops in your route can now request baskets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Back to My Products & Preview Public Marketplace Listing */}
          <div className="pt-2 pb-2 space-y-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (Number(quantity) === 0) {
                  setFarmerProductsTab('soldOut');
                } else {
                  setFarmerProductsTab('available');
                }
                setActiveFarmerTab('products');
                handleClose();
              }}
              className="w-full bg-[#0B4A2A] hover:bg-[#083820] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Back to My Products</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentRole('buyer');
                setActiveBuyerTab('browse');
                handleClose();
              }}
              className="w-full bg-white hover:bg-stone-50 text-[#0F172A] font-bold py-3 px-4 rounded-xl text-xs border border-stone-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-[#166534]" />
              <span>Preview Public Marketplace Listing</span>
            </button>

            {/* Footer Hint */}
            <div className="text-center pt-1 text-[11px] text-stone-400 font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Auto-notifying 12 subscribed local restaurants</span>
            </div>
          </div>
        </div>
      ) : (
        /* Scrollable Form Content matching screenshot */
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2.5 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Photo Card with Farm Fresh Badge & Change Photo Button */}
            <div>
              <div className="relative rounded-2xl overflow-hidden h-52 bg-stone-100 border border-stone-200/80 shadow-2xs">
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />

                {/* Farm Fresh pill badge (top-left) */}
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#166534] font-extrabold text-[10.5px] px-2.5 py-1 rounded-full border border-stone-200/60 shadow-2xs flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Farm Fresh</span>
                </div>

                {/* Change Photo button (bottom-right) */}
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                  className="absolute bottom-2.5 right-2.5 bg-white text-[#0F172A] text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md border border-stone-200/80 hover:bg-stone-50 cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4 text-[#166534]" />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Photo presets selector drawer */}
              {showPhotoPicker && (
                <div className="mt-2.5 p-2.5 bg-stone-50 rounded-2xl border border-stone-200 animate-in fade-in">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Select Fresh Harvest Photo:
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {PRESET_PHOTOS.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => {
                          setImageUrl(preset.url);
                          setShowPhotoPicker(false);
                        }}
                        className={`text-[11px] px-3 py-1 rounded-full shrink-0 font-semibold border transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? 'bg-[#166534] text-white border-[#166534] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Name with placeholder hint & clear X button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-extrabold text-[#0F172A] text-xs">
                  Product Name
                </label>
                <span className="text-[11px] text-stone-400 font-normal">
                  e.g. Tomatoes, Carrots
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tomatoes"
                  className="w-full p-3.5 pr-9 rounded-2xl border border-stone-200/90 bg-white text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-[#166534] outline-none shadow-2xs"
                  required
                />
                {name && (
                  <button
                    type="button"
                    onClick={() => setName('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 font-bold text-sm cursor-pointer p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="font-extrabold text-[#0F172A] block mb-1.5 text-xs">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Exclude<ProductCategory, 'All Products'>)}
                  className="w-full p-3.5 pr-9 rounded-2xl border border-stone-200/90 bg-white text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-[#166534] outline-none appearance-none shadow-2xs cursor-pointer"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600" />
              </div>
            </div>

            {/* Quantity Available with Unit Dropdown (e.g. [50] [kg (Kilos) v]) */}
            <div>
              <label className="font-extrabold text-[#0F172A] block mb-1.5 text-xs">
                Quantity Available
              </label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7">
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="50"
                    className="w-full p-3.5 rounded-2xl border border-stone-200/90 bg-white text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-[#166534] outline-none shadow-2xs"
                    required
                  />
                </div>
                <div className="col-span-5 relative">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3.5 pr-8 rounded-2xl border border-stone-200/90 bg-white text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-[#166534] outline-none appearance-none shadow-2xs cursor-pointer"
                  >
                    <option value="kg">kg (Kilos)</option>
                    <option value="bundle">bundle</option>
                    <option value="tray">tray</option>
                    <option value="box">box</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600" />
                </div>
              </div>
            </div>

            {/* Price per kg (P) with Est. Total: P3,000 on right */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-extrabold text-[#0F172A] text-xs">
                  Price per {unit} (₱)
                </label>
                <span className="font-extrabold text-xs text-[#0D8244]">
                  Est. Total: ₱{estTotal.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-sm text-[#0D8244]">
                  ₱
                </span>
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="60"
                  className="w-full p-3.5 pl-8 rounded-2xl border border-stone-200/90 bg-white text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-[#166534] outline-none shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Market Pricing Insight Card */}
            <div className="p-3.5 bg-[#EEF2FF] rounded-2xl border border-[#E0E7FF] flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-2xs shrink-0 border border-teal-100">
                <Lightbulb className="w-4 h-4 text-teal-600 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-[#1E293B]">
                  Market Pricing Insight
                </h4>
                <p className="text-[10.5px] text-[#64748B] leading-relaxed mt-0.5">
                  {name || 'Tomatoes'} in your region are selling between ₱55 – ₱68/{unit} today. Your price point is competitive!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons (Post Product / Save Changes & Mark as Sold Out) */}
          <div className="p-3.5 bg-white border-t border-stone-100 shrink-0 space-y-2">
            <button
              type="submit"
              className="w-full bg-[#166534] hover:bg-[#13572c] active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-sm cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Save Changes' : 'Post Product'}</span>
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleMarkAsSoldOut}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-stone-200 transition-all cursor-pointer shadow-2xs"
              >
                <Ban className="w-3.5 h-3.5 text-stone-500" />
                <span>Mark as Sold Out</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
