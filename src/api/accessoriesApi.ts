import { API_BASE_URL } from "@/config/env";

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

export interface AccessoryQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  code?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const accessoriesApi = {
  // Get all accessories products
  async getProducts(params?: AccessoryQueryParams): Promise<AccessoryProduct[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.code) query.append("code", params.code);
      if (params?.name) query.append("name", params.name);
      if (params?.minPrice) query.append("minPrice", String(params.minPrice));
      if (params?.maxPrice) query.append("maxPrice", String(params.maxPrice));

      const response = await fetch(`${API_BASE_URL}/accessories?${query.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch accessories");
      }

      return result.data?.accessories || result.data || [];
    } catch (error) {
      console.error("Error fetching accessories:", error);
      throw error;
    }
  },

  // Get single accessory by ID
  async getProductById(id: string): Promise<AccessoryProduct> {
    try {
      const response = await fetch(`${API_BASE_URL}/accessories/${id}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch accessory");
      }

      return result.data?.accessory || result.data;
    } catch (error) {
      console.error("Error fetching accessory:", error);
      throw error;
    }
  },

  // Calculate total stock across all sizes
  getTotalStock(product: AccessoryProduct): number {
    if (!product.sizes || !Array.isArray(product.sizes)) return 0;
    return product.sizes.reduce((sum, s) => sum + (s.stockQuantity || 0), 0);
  },

  // Get stock for specific size
  getStockForSize(product: AccessoryProduct, targetSize: string): number {
    if (!product.sizes || !Array.isArray(product.sizes)) return 0;
    const match = product.sizes.find((s) => s.size === targetSize);
    return match ? match.stockQuantity : 0;
  },

  // Create or update accessory product
  async saveProduct(product: Partial<AccessoryProduct>): Promise<AccessoryProduct> {
    try {
      if (product.id) {
        // Update existing product
        const response = await fetch(`${API_BASE_URL}/accessories/${product.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || "Failed to update accessory");
        }

        return result.data?.accessory || result.data;
      } else {
        // Create new product
        const response = await fetch(`${API_BASE_URL}/accessories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || "Failed to create accessory");
        }

        return result.data?.accessory || result.data;
      }
    } catch (error) {
      console.error("Error saving accessory:", error);
      throw error;
    }
  },

  // Adjust stock for a specific size
  async adjustStock(id: string, size: string, delta: number): Promise<AccessoryProduct> {
    try {
      const response = await fetch(`${API_BASE_URL}/accessories/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ size, delta }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to adjust stock");
      }

      return result.data?.accessory || result.data;
    } catch (error) {
      console.error("Error adjusting stock:", error);
      throw error;
    }
  },

  // Delete accessory product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/accessories/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete accessory");
      }

      return true;
    } catch (error) {
      console.error("Error deleting accessory:", error);
      throw error;
    }
  },

  // Bulk import accessories
  async importAccessories(accessories: Partial<AccessoryProduct>[]): Promise<{
    totalRecords: number;
    insertedCount: number;
    skippedCount: number;
    errors: string[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/accessories/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessories }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to import accessories");
      }

      return result.data;
    } catch (error) {
      console.error("Error importing accessories:", error);
      throw error;
    }
  },
};
