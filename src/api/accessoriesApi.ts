export interface SizeStock {
  size: string;
  stockQuantity: number;
}

export interface AccessoryProduct {
  id: string;
  code: string;
  name: string;
  price: number;
  sizes: SizeStock[];
  minStockWarning: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "cmk_accessories_products_v3";

const INITIAL_ACCESSORIES: AccessoryProduct[] = [
  {
    id: "acc_1",
    code: "KB-101",
    name: "Hinged Knee Brace (Heavy Duty)",
    price: 1850,
    sizes: [
      { size: "S", stockQuantity: 5 },
      { size: "M", stockQuantity: 10 },
      { size: "L", stockQuantity: 15 },
      { size: "XL", stockQuantity: 8 },
      { size: "Universal", stockQuantity: 24 },
    ],
    minStockWarning: 5,
    description: "Provides maximum medial-lateral support for knee stability post-surgery or ligament injury.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_2",
    code: "KC-201",
    name: "Elastic Knee Cap (Pair)",
    price: 450,
    sizes: [
      { size: "S", stockQuantity: 20 },
      { size: "M", stockQuantity: 30 },
      { size: "L", stockQuantity: 50 },
      { size: "XL", stockQuantity: 15 },
    ],
    minStockWarning: 10,
    description: "Breathable stretch elastic knee support for everyday mild compression and joint warmth.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_3",
    code: "KB-102",
    name: "Patella Knee Support Band",
    price: 650,
    sizes: [
      { size: "Universal", stockQuantity: 35 },
      { size: "M", stockQuantity: 15 },
      { size: "L", stockQuantity: 20 },
    ],
    minStockWarning: 8,
    description: "Targeted patellar tendon strap for jumper's knee and tendonitis support.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_4",
    code: "KI-301",
    name: "Neoprene Knee Immobilizer 19\"",
    price: 1200,
    sizes: [
      { size: "S", stockQuantity: 2 },
      { size: "M", stockQuantity: 4 },
      { size: "L", stockQuantity: 6 },
      { size: "XL", stockQuantity: 1 },
    ],
    minStockWarning: 5,
    description: "Rigid aluminum stay immobilizer for complete knee joint stabilization.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_5",
    code: "KB-103",
    name: "ROM Knee Brace (Range of Motion)",
    price: 3500,
    sizes: [
      { size: "Universal", stockQuantity: 8 },
      { size: "L", stockQuantity: 4 },
    ],
    minStockWarning: 3,
    description: "Adjustable angle range of motion brace for post-op ACL/PCL rehabilitation.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_6",
    code: "KC-202",
    name: "Compression Knee Sleeve (3D Weave)",
    price: 550,
    sizes: [
      { size: "S", stockQuantity: 10 },
      { size: "M", stockQuantity: 0 },
      { size: "L", stockQuantity: 25 },
      { size: "XL", stockQuantity: 0 },
    ],
    minStockWarning: 10,
    description: "Graduated ergonomic 3D knitting sleeve for joint compression and active motion support.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_7",
    code: "KB-104",
    name: "Silicone Ring Knee Support",
    price: 890,
    sizes: [
      { size: "S", stockQuantity: 8 },
      { size: "M", stockQuantity: 18 },
      { size: "L", stockQuantity: 12 },
      { size: "XL", stockQuantity: 5 },
    ],
    minStockWarning: 5,
    description: "Integrated silicone gel pad for patella centering and dual lateral coil spring stays.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc_8",
    code: "KB-105",
    name: "Ligament Knee Stabilizer",
    price: 2100,
    sizes: [
      { size: "M", stockQuantity: 6 },
      { size: "L", stockQuantity: 15 },
      { size: "XL", stockQuantity: 8 },
    ],
    minStockWarning: 4,
    description: "Cross-strap bilateral support for collateral ligament injuries and severe arthritic pain.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const accessoriesApi = {
  getProducts(): AccessoryProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACCESSORIES));
        return INITIAL_ACCESSORIES;
      }
      const parsed: AccessoryProduct[] = JSON.parse(data);
      // Ensure all products have sizes array
      return parsed.map((p) => {
        if (!p.sizes || !Array.isArray(p.sizes)) {
          p.sizes = [{ size: (p as any).size || "Universal", stockQuantity: (p as any).stockQuantity || 0 }];
        }
        return p;
      });
    } catch (e) {
      console.error("Error reading accessories products from localStorage", e);
      return INITIAL_ACCESSORIES;
    }
  },

  getTotalStock(product: AccessoryProduct): number {
    if (!product.sizes || !Array.isArray(product.sizes)) return 0;
    return product.sizes.reduce((sum, s) => sum + (s.stockQuantity || 0), 0);
  },

  getStockForSize(product: AccessoryProduct, targetSize: string): number {
    if (!product.sizes || !Array.isArray(product.sizes)) return 0;
    const match = product.sizes.find((s) => s.size === targetSize);
    return match ? match.stockQuantity : 0;
  },

  saveProduct(product: Partial<AccessoryProduct>): AccessoryProduct {
    const products = this.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      // Update existing
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        const updated: AccessoryProduct = {
          ...products[index],
          ...product,
          updatedAt: now,
        };
        products[index] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return updated;
      }
    }

    // Create new
    const newProduct: AccessoryProduct = {
      id: "acc_" + Date.now(),
      code: product.code || `ACC-${Math.floor(100 + Math.random() * 900)}`,
      name: product.name || "New Accessory",
      price: Number(product.price) || 0,
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : [{ size: "Universal", stockQuantity: 10 }],
      minStockWarning: Number(product.minStockWarning) || 5,
      description: product.description || "",
      createdAt: now,
      updatedAt: now,
    };

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return newProduct;
  },

  adjustStock(id: string, size: string, delta: number): AccessoryProduct | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const prod = products[index];
    if (!prod.sizes) prod.sizes = [];

    const sizeIndex = prod.sizes.findIndex((s) => s.size === size);
    if (sizeIndex !== -1) {
      const currentQty = prod.sizes[sizeIndex].stockQuantity;
      prod.sizes[sizeIndex].stockQuantity = Math.max(0, currentQty + delta);
    } else {
      prod.sizes.push({ size, stockQuantity: Math.max(0, delta) });
    }

    prod.updatedAt = new Date().toISOString();
    products[index] = prod;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return prod;
  },

  deleteProduct(id: string): boolean {
    let products = this.getProducts();
    const initialLength = products.length;
    products = products.filter((p) => p.id !== id);
    if (products.length !== initialLength) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return true;
    }
    return false;
  },
};
