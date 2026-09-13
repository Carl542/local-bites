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
import { ArrowRight } from 'lucide-react';


const FarmerMoreView: React.FC = () => {
  const { setActiveFarmerTab } = useApp();
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-2xl font-bold mb-2">
          👨‍🌾
        </div>
        <h3 className="font-bold text-base text-stone-900 dark:text-white">
          Carl Amil
        </h3>
        <p className="text-stone-500 text-xs">Carl Amil Farm • Digos City</p>
        <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          Verified Organic Producer
        </span>
      </div>

      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
        <h4 className="font-bold text-xs uppercase text-stone-400">Cooperative Details</h4>
        <div className="space-y-1 text-stone-600 dark:text-stone-300">
          <p><strong>Member ID:</strong> #LB-FARM-8821</p>
          <p><strong>Region:</strong> Brgy. Kapatagan, Mt. Apo Foothills</p>
          <p><strong>Director:</strong> Elena Rostova (Local Bites Coop)</p>
          <p><strong>Hotline:</strong> 0920 888 7766</p>
        </div>
      </div>

      <button
        onClick={() => setActiveFarmerTab('products')}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Manage My Harvest</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const BuyerMoreView: React.FC = () => {
  const { setActiveBuyerTab } = useApp();
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center text-2xl font-bold mb-2">
          👩‍🍳
        </div>
        <h3 className="font-bold text-base text-stone-900 dark:text-white">
          Chef Maria Santos
        </h3>
        <p className="text-stone-500 text-xs">Green Leaf Bistro • Digos City</p>
        <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          Certified Farm-to-Table Restaurant
        </span>
      </div>

      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
        <h4 className="font-bold text-xs uppercase text-stone-400">Restaurant Profile</h4>
        <div className="space-y-1 text-stone-600 dark:text-stone-300">
          <p><strong>Business:</strong> Green Leaf Bistro Digos</p>
          <p><strong>Location:</strong> Rizal St. Downtown, Digos City</p>
          <p><strong>Preferred Crops:</strong> Organic Tomatoes, Lettuce, Herbs</p>
          <p><strong>Contact:</strong> 0917 123 4567</p>
        </div>
      </div>

      <button
        onClick={() => setActiveBuyerTab('browse')}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
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
        text: 'Buyer App (Chef Maria)',
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
                👩‍🍳 Restaurant View • Chef Maria
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
