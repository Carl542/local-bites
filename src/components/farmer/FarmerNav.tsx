import React from 'react';
import { Home, Leaf, ClipboardList, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerNav: React.FC = () => {
  const { activeFarmerTab, setActiveFarmerTab, orders } = useApp();

  const newOrdersCount = orders.filter((o) => o.status === 'New').length;

  interface NavItem {
    id: 'home' | 'products' | 'orders' | 'more';
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Leaf },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      badge: newOrdersCount > 0 ? newOrdersCount : 3,
    },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="bg-white border-t border-stone-200 px-3 py-2 flex justify-around items-center shrink-0 z-30">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeFarmerTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveFarmerTab(item.id)}
            className={`flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-all relative cursor-pointer ${
              isActive
                ? 'text-[#0D8244] font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );

};
