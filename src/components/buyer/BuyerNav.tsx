import React from 'react';
import { Store, Package, FileText, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerNav: React.FC = () => {
  const {
    activeBuyerTab,
    setActiveBuyerTab,
    orders,
    setActiveOrderForTracking,
  } = useApp();

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'New' || o.status === 'Confirmed' || o.status === 'Preparing Products' || o.status === 'Out for Delivery'
  ).length;

  const navItems = [
    { id: 'home', label: 'Home', icon: Store },
    { id: 'browse', label: 'Browse', icon: Package },
    { id: 'orders', label: 'Orders', icon: FileText, hasBadge: activeOrdersCount > 0 },
    { id: 'more', label: 'More', icon: Menu },
  ] as const;

  const handleTabClick = (tabId: 'home' | 'browse' | 'orders' | 'more') => {
    if (tabId === 'orders') {
      setActiveOrderForTracking(null);
    }
    setActiveBuyerTab(tabId);
  };

  return (
    <div className="bg-white border-t border-stone-200/90 px-4 py-2 flex justify-around items-center shrink-0 z-30 shadow-xs sticky bottom-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeBuyerTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-[#166534] font-black'
                : 'text-stone-500 hover:text-stone-800 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2] text-[#166534]' : 'stroke-[1.75]'}`} />
              {'hasBadge' in item && item.hasBadge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#16A34A] ring-2 ring-white"></span>
              )}
            </div>
            <span className="text-[10.5px] mt-1 tracking-tight font-extrabold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
