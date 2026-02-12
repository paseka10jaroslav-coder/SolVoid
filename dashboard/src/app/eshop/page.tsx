"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  X, 
  Plus, 
  Minus, 
  Shield, 
  Lock,
  Zap,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Product type definition
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  featured?: boolean;
}

// Cart item type
interface CartItem extends Product {
  quantity: number;
}

// Sample products - Privacy/Security themed
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "ZK-Proof Shield Pro",
    description: "Advanced zero-knowledge proof generation for maximum transaction privacy",
    price: 0.5,
    category: "Privacy Tools",
    image: "🛡️",
    stock: 15,
    featured: true
  },
  {
    id: "2",
    name: "Stealth Wallet Premium",
    description: "Hardware wallet with military-grade encryption and privacy features",
    price: 1.2,
    category: "Hardware",
    image: "🔐",
    stock: 8,
    featured: true
  },
  {
    id: "3",
    name: "Privacy Mixer Credits",
    description: "10,000 credits for transaction mixing and anonymization",
    price: 0.25,
    category: "Credits",
    image: "💎",
    stock: 100,
    featured: false
  },
  {
    id: "4",
    name: "Forensic Scanner License",
    description: "1-year license for advanced blockchain forensic analysis",
    price: 2.0,
    category: "Software",
    image: "🔍",
    stock: 50,
    featured: true
  },
  {
    id: "5",
    name: "Anonymous VPN Service",
    description: "Premium VPN with no-log policy and Tor integration",
    price: 0.15,
    category: "Services",
    image: "🌐",
    stock: 200,
    featured: false
  },
  {
    id: "6",
    name: "Encrypted Storage Drive",
    description: "1TB hardware-encrypted storage for sensitive data",
    price: 0.8,
    category: "Hardware",
    image: "💾",
    stock: 12,
    featured: false
  },
  {
    id: "7",
    name: "Tactical Training Course",
    description: "Complete privacy operations training (20 hours)",
    price: 3.5,
    category: "Education",
    image: "📚",
    stock: 30,
    featured: false
  },
  {
    id: "8",
    name: "Shadow Network Access",
    description: "3-month access to decentralized shadow network",
    price: 1.5,
    category: "Services",
    image: "⚡",
    stock: 25,
    featured: true
  },
  {
    id: "9",
    name: "Privacy Audit Kit",
    description: "Complete toolkit for conducting privacy audits",
    price: 0.65,
    category: "Privacy Tools",
    image: "🔬",
    stock: 40,
    featured: false
  },
  {
    id: "10",
    name: "Secure Communication Suite",
    description: "End-to-end encrypted messaging and file sharing",
    price: 0.45,
    category: "Software",
    image: "📱",
    stock: 75,
    featured: false
  },
  {
    id: "11",
    name: "Crypto Tumbler Service",
    description: "50 transaction privacy enhancement credits",
    price: 0.35,
    category: "Credits",
    image: "🌀",
    stock: 150,
    featured: false
  },
  {
    id: "12",
    name: "Privacy Passport Premium",
    description: "Lifetime access to privacy scoring and monitoring",
    price: 5.0,
    category: "Services",
    image: "🎫",
    stock: 10,
    featured: true
  }
];

const CATEGORIES = ["All", "Privacy Tools", "Hardware", "Software", "Services", "Credits", "Education"];

export default function EShopPage() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high" | "featured">("featured");
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          return prev; // Don't add if at stock limit
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, Math.min(item.stock, item.quantity + delta));
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-tactical-cyan/20">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30 z-0" />
      <div className="fixed inset-0 bg-radial pointer-events-none z-0" />
      <div className="scanner-overlay z-0" />

      {/* Header */}
      <header className="tactical-glass m-3 sm:m-4 p-3 sm:p-4 flex justify-between items-center bg-black/40 relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-tactical-cyan/10 rounded-lg border border-tactical-cyan/20">
            <ShoppingCart className="text-tactical-cyan w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-glow-cyan">SolVoid Store</h1>
            <p className="text-[10px] text-white/40">Privacy Tools & Services</p>
          </div>
        </div>

        {/* Cart Button */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative flex items-center gap-2 px-4 py-2 bg-tactical-cyan/10 rounded-lg border border-tactical-cyan/20 hover:bg-tactical-cyan/20 transition-all"
        >
          <ShoppingCart className="w-5 h-5 text-tactical-cyan" />
          <span className="text-white font-mono">{cartItemCount}</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-tactical-cyan rounded-full flex items-center justify-center text-xs font-bold text-black">
              {cartItemCount}
            </span>
          )}
        </button>
      </header>

      <div className="flex-1 flex flex-col px-3 sm:px-4 pt-4 pb-6 relative z-10 max-w-screen-2xl mx-auto w-full">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-tactical-cyan/50 transition-colors"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan/30"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products by"
              className="ml-auto px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-tactical-cyan/50"
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="tactical-glass p-4 overflow-hidden"
              >
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/40 font-bold uppercase mb-2">
                      Price Range: {priceRange[0]} - {priceRange[1]} SOL
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = parseFloat(e.target.value);
                          setPriceRange([newMin, Math.max(newMin, priceRange[1])]);
                        }}
                        aria-label="Minimum price"
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = parseFloat(e.target.value);
                          setPriceRange([Math.min(priceRange[0], newMax), newMax]);
                        }}
                        aria-label="Maximum price"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="tactical-glass p-4 space-y-3 relative group"
              >
                {product.featured && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-tactical-cyan/20 border border-tactical-cyan/30 rounded text-[10px] font-bold text-tactical-cyan">
                    FEATURED
                  </div>
                )}

                {/* Product Image */}
                <div className="w-full aspect-square bg-white/5 rounded-lg flex items-center justify-center text-6xl">
                  {product.image}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-sm">{product.name}</h3>
                  <p className="text-xs text-white/60 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-lg font-bold text-tactical-cyan">{product.price} SOL</div>
                      <div className="text-[10px] text-white/40">
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="px-4 py-2 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded-lg text-tactical-cyan hover:bg-tactical-cyan/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="tactical-glass p-12 text-center">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60 mb-2">No Products Found</h3>
            <p className="text-white/40">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 tactical-glass border-l border-white/10 z-50 flex flex-col"
            >
              {/* Cart Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-tactical-cyan" />
                  <h2 className="text-lg font-bold">Shopping Cart</h2>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-white/60">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white/5 p-3 rounded-lg border border-white/10"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center text-2xl flex-shrink-0">
                          {item.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-white truncate">{item.name}</h4>
                          <p className="text-xs text-white/60">{item.price} SOL</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-mono w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto p-1 bg-red-500/10 rounded hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-tactical-cyan">{cartTotal.toFixed(2)} SOL</span>
                  </div>
                  <button className="w-full py-3 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded-lg text-tactical-cyan font-bold hover:bg-tactical-cyan/20 transition-all flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Secure Checkout
                  </button>
                  <p className="text-xs text-white/40 text-center">
                    All transactions are secured with zero-knowledge proofs
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
