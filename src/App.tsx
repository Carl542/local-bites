import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoToolbar } from './components/DemoToolbar';
import { MobileFrame } from './components/common/MobileFrame';

// Farmer Components
import { FarmerNav } from './components/farmer/FarmerNav';
import { FarmerHome } from './components/farmer/FarmerHome';
import { MyProducts } from './components/farmer/MyProducts';
import { IncomingOrders } from './components/farmer/IncomingOrders';
import { DeliveryTracking } from './components/farmer/DeliveryTracking';
import { AddEditProductModal } from './components/farmer/AddEditProductModal';
import { FarmerOrderDetailsModal } from './components/farmer/FarmerOrderDetailsModal';

// Buyer Components
import { BuyerNav } from './components/buyer/BuyerNav';
import { BuyerHome } from './components/buyer/BuyerHome';
import { BrowseProducts } from './components/buyer/BrowseProducts';
import { ProductDetailsModal } from './components/buyer/ProductDetailsModal';
import { CartModal } from './components/buyer/CartModal';
import { OrderTrackingModal } from './components/buyer/OrderTrackingModal';
import { BuyerOrders } from './components/buyer/BuyerOrders';

// Icons
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  ClipboardList,
  Building2,
  ChevronRight,
  Award,
  Package,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Utensils,
  History,
} from 'lucide-react';

const FarmerMoreView: React.FC = () => {
  const { setActiveFarmerTab } = useApp();
  return (
    <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-emerald-300/60">
            Farmer Profile
          </span>
          <h2 className="text-lg font-black text-[#0F172A] mt-1 tracking-tight">
            Account &amp; Settings
          </h2>
          <p className="text-[11px] text-stone-500 font-medium -mt-0.5">
            Digos City Farm-to-Table Cooperative
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#166534] text-white flex items-center justify-center font-black text-xs shadow-xs ring-2 ring-[#DCFCE7]">
          CA
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-2">
        <div className="relative inline-block">
          <div className="w-16 h-16 rounded-full bg-[#166534] text-white mx-auto flex items-center justify-center text-xl font-black shadow-xs ring-4 ring-[#DCFCE7]">
            CA
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white p-1 rounded-full ring-2 ring-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h3 className="font-black text-base text-[#0F172A]">
            Carl Vincent S. Amil
          </h3>
          <p className="text-stone-500 text-xs font-medium flex items-center justify-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#166534]" />
            <span>Carl Amil &amp; Juan's Farms • Digos City</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
          <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300/50">
            <ShieldCheck className="w-3 h-3" />
            Verified Organic Producer
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            <Award className="w-3 h-3 text-amber-600" />
            Grade A Certified
          </span>
        </div>

        {/* 3 Metric Mini Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 mt-2">
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-stone-100 text-center">
            <span className="text-[9px] text-stone-400 font-bold uppercase block">Field Reserve</span>
            <span className="text-sm font-black text-[#0F172A]">42 kg</span>
          </div>
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-stone-100 text-center">
            <span className="text-[9px] text-stone-400 font-bold uppercase block">Gross Sales</span>
            <span className="text-sm font-black text-[#166534]">₱2,850</span>
          </div>
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-stone-100 text-center">
            <span className="text-[9px] text-stone-400 font-bold uppercase block">Rating</span>
            <span className="text-sm font-black text-amber-600">4.9 ★</span>
          </div>
        </div>
      </div>

      {/* Cooperative Accreditation Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#166534]" />
            <h4 className="font-bold text-xs uppercase text-stone-700 tracking-wide">
              Cooperative Details
            </h4>
          </div>
          <span className="text-[9px] font-black text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#DCFCE7]">
            Active Member
          </span>
        </div>

        <div className="space-y-2 text-stone-600">
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Member ID</span>
            <span className="font-mono font-bold text-stone-800 text-[11px] bg-stone-100 px-2 py-0.5 rounded-md">
              #LB-FARM-8821
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Farm Location</span>
            <span className="font-semibold text-stone-800 text-[11px] text-right">
              Brgy. Kapatagan, Mt. Apo
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Coordinator</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              Elena Rostova (Digos Hub)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Logistics Van</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              Digos Co-op Courier Van 4
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Menu Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs divide-y divide-stone-100 overflow-hidden">
        <button
          onClick={() => setActiveFarmerTab('products')}
          className="w-full p-3 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#166534] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-xs">My Produce Inventory</div>
              <div className="text-[10px] text-stone-400">View batches, edit prices &amp; field reserves</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => setActiveFarmerTab('orders')}
          className="w-full p-3 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#166534] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-xs">Incoming Orders</div>
              <div className="text-[10px] text-stone-400">Review restaurant orders (#ORD-1026)</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => setActiveFarmerTab('delivery')}
          className="w-full p-3 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#166534] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-xs">Deliveries &amp; Cold Chain</div>
              <div className="text-[10px] text-stone-400">Track Co-op delivery van &amp; 12°C temperature</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Manage My Harvest CTA Button */}
      <button
        onClick={() => setActiveFarmerTab('products')}
        className="w-full bg-[#166534] hover:bg-[#14532D] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
      >
        <span>Manage My Harvest</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Support Hotline Info */}
      <div className="text-center pt-1 pb-2">
        <a
          href="tel:09208887766"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#166534] hover:underline"
        >
          <PhoneCall className="w-3 h-3" />
          <span>Co-op Hotline: 0920 888 7766</span>
        </a>
      </div>
    </div>
  );
};

const BuyerMoreView: React.FC = () => {
  const { setActiveBuyerTab } = useApp();
  return (
    <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
            Restaurant Buyer Profile
          </span>
          <h2 className="text-lg font-black text-[#0F172A] mt-1 tracking-tight">
            Account &amp; Procurement
          </h2>
          <p className="text-[11px] text-stone-500 font-medium -mt-0.5">
            Digos City Certified Farm-to-Table
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs ring-2 ring-blue-200">
          MB
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-2">
        <div className="relative inline-block">
          <div className="w-16 h-16 rounded-full bg-blue-700 text-white mx-auto flex items-center justify-center text-xl font-black shadow-xs ring-4 ring-blue-100">
            MB
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full ring-2 ring-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h3 className="font-black text-base text-[#0F172A]">
            Chef Makiboi
          </h3>
          <p className="text-stone-500 text-xs font-medium flex items-center justify-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>Green Leaf Bistro • Rizal St., Digos City</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            <Utensils className="w-3 h-3" />
            Certified Farm-to-Table Restaurant
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            <Award className="w-3 h-3 text-amber-600" />
            Priority Wholesale Partner
          </span>
        </div>

        {/* 3 Metric Mini Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 mt-2">
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-stone-100 text-center">
            <span className="text-[9px] text-stone-400 font-bold uppercase block">Monthly Sourced</span>
            <span className="text-sm font-black text-[#0F172A]">85 kg</span>
          </div>
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-stone-100 text-center">
            <span className="text-[9px] text-stone-400 font-bold uppercase block">Active Orders</span>
            <span className="text-sm font-black text-blue-600">1 Live</span>
          </div>
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-stone-100 text-center">
            <span className="text-[9px] text-stone-400 font-bold uppercase block">Tier</span>
            <span className="text-sm font-black text-amber-600">Gold</span>
          </div>
        </div>
      </div>

      {/* Restaurant Profile Details */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-xs uppercase text-stone-700 tracking-wide">
              Procurement Profile
            </h4>
          </div>
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Co-op Verified
          </span>
        </div>

        <div className="space-y-2 text-stone-600">
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Business</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              Green Leaf Bistro Digos
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Delivery Drop-off</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              Rizal St. Downtown, Digos City
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Preferred Crops</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              Roma Tomatoes, Lettuce, Herbs
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 text-[11px]">Contact Hotline</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              0917 123 4567
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Menu Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs divide-y divide-stone-100 overflow-hidden">
        <button
          onClick={() => setActiveBuyerTab('browse')}
          className="w-full p-3 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-xs">Browse Fresh Harvest</div>
              <div className="text-[10px] text-stone-400">Order from local accredited farmers</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => setActiveBuyerTab('orders')}
          className="w-full p-3 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800 text-xs">Order History &amp; Tracking</div>
              <div className="text-[10px] text-stone-400">Track active deliveries &amp; past receipts</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Browse Fresh Produce CTA Button */}
      <button
        onClick={() => setActiveBuyerTab('browse')}
        className="w-full bg-[#166534] hover:bg-[#14532D] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
      >
        <span>Browse Fresh Produce</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const FarmerAppView: React.FC = () => {
  const { activeFarmerTab } = useApp();

  return (
    <MobileFrame
      roleBadge={{
        text: 'Farmer App (Carl Amil)',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      }}
    >
      {activeFarmerTab === 'home' && <FarmerHome />}
      {activeFarmerTab === 'products' && <MyProducts />}
      {activeFarmerTab === 'orders' && <IncomingOrders />}
      {activeFarmerTab === 'delivery' && <DeliveryTracking />}
      {activeFarmerTab === 'more' && <FarmerMoreView />}

      <FarmerNav />
      <AddEditProductModal />
      <FarmerOrderDetailsModal />
    </MobileFrame>
  );
};

const BuyerAppView: React.FC = () => {
  const { activeBuyerTab, activeOrderForTracking, setActiveOrderForTracking } = useApp();

  return (
    <MobileFrame
      roleBadge={{
        text: 'Buyer App (Chef Makiboi)',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
      }}
    >
      {activeBuyerTab === 'home' && <BuyerHome />}
      {activeBuyerTab === 'browse' && <BrowseProducts />}
      {activeBuyerTab === 'orders' && (
        activeOrderForTracking ? (
          <OrderTrackingModal onBack={() => setActiveOrderForTracking(null)} />
        ) : (
          <BuyerOrders onSelectOrder={(ord) => setActiveOrderForTracking(ord)} />
        )
      )}
      {activeBuyerTab === 'more' && <BuyerMoreView />}

      <BuyerNav />
      <ProductDetailsModal />
      <CartModal />
    </MobileFrame>
  );
};

const MainContent: React.FC = () => {
  const { currentRole, viewMode } = useApp();

  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto flex items-center justify-center min-h-[calc(100vh-60px)]">
      {viewMode === 'single' ? (
        <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
          {currentRole === 'farmer' ? <FarmerAppView /> : <BuyerAppView />}
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center">
            <div className="mb-2 text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                👨‍🌾 Farmer View • Carl Amil
              </span>
            </div>
            <FarmerAppView />
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-2 text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-500/30">
                👩‍🍳 Restaurant View • Chef Makiboi
              </span>
            </div>
            <BuyerAppView />
          </div>
        </div>
      )}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-emerald-500 selection:text-white">
        <DemoToolbar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
