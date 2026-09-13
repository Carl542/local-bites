export type ProductCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Herbs'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'All Products';

export interface ProductTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Herbs' | 'Dairy & Eggs' | 'Meat & Seafood';
  farmName: string;
  location: string;
  price: number;
  unit: string;
  stock: number;
  initialStock: number;
  image: string;
  description: string;
  tags: string[]; // Tag IDs
  isSoldOut: boolean;
  harvestDate?: string;
  createdAt: string;
  subGrade?: string;
  dispatchVan?: string;
  peakMoisture?: string;
  brixIndex?: string;
  acidityBalance?: string;
  minOrder?: number;
  deliveryEstimate?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  farmName: string;
  quantity: number;
  unit: string;
  price: number;
  image: string;
  subVariant?: string;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing Products'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Declined';

export interface OrderTimelineStep {
  title: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
}

export interface Order {
  id: string; // e.g. '#ORD-1023'
  buyerName: string;
  buyerAddress: string;
  phone: string;
  distance?: string;
  paymentMethod?: 'COD' | 'Bank Transfer' | string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  timeline: OrderTimelineStep[];
  isNew?: boolean;
  cratesSummary?: string;
  driverName?: string;
  driverEst?: string;
  batchTag?: string;
  paymentLabel?: string;
  farmSummary?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
