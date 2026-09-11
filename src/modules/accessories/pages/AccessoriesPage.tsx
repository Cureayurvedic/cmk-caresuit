import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsAdmin } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-notification";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Boxes,
  IndianRupee,
  Layers,
  MoreVertical,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  accessoriesApi,
  AccessoryProduct,
  SizeStock,
} from "@/api/accessoriesApi";
import { Textarea } from "@/components/ui/textarea";

const AVAILABLE_SIZES = ["Universal", "S", "M", "L", "XL", "XXL"];

export default function AccessoriesPage() {
  const isAdmin = useIsAdmin();
  const toast = useToast();

  const [products, setProducts] = useState<AccessoryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AccessoryProduct | null>(null);

  // Form State for multi-size product
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    price: string;
    sizes: Record<string, string>;
    minStockWarning: string;
    description: string;
  }>({
    code: "",
    name: "",
    price: "",
    sizes: {
      Universal: "10",
      S: "0",
      M: "0",
      L: "0",
      XL: "0",
      XXL: "0",
    },
    minStockWarning: "5",
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const data = accessoriesApi.getProducts();
    setProducts(data);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      code: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      price: "",
      sizes: {
        Universal: "10",
        S: "0",
        M: "0",
        L: "0",
        XL: "0",
        XXL: "0",
      },
      minStockWarning: "5",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: AccessoryProduct) => {
    setEditingProduct(product);
    const sizeMap: Record<string, string> = {
      Universal: "0",
      S: "0",
      M: "0",
      L: "0",
      XL: "0",
      XXL: "0",
    };
    (product.sizes || []).forEach((s) => {
      sizeMap[s.size] = s.stockQuantity.toString();
    });

    setFormData({
      code: product.code,
      name: product.name,
      price: product.price.toString(),
      sizes: sizeMap,
      minStockWarning: product.minStockWarning.toString(),
      description: product.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Validation Error", "Accessories name and price are required.");
      return;
    }

    const compiledSizes: SizeStock[] = AVAILABLE_SIZES.map((sz) => ({
      size: sz,
      stockQuantity: parseInt(formData.sizes[sz] || "0", 10) || 0,
    })).filter((s) => s.stockQuantity > 0 || s.size === "Universal");

    try {
      const saved = accessoriesApi.saveProduct({
        id: editingProduct ? editingProduct.id : undefined,
        code: formData.code,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        sizes: compiledSizes.length > 0 ? compiledSizes : [{ size: "Universal", stockQuantity: 0 }],
        minStockWarning: parseInt(formData.minStockWarning, 10) || 5,
        description: formData.description,
      });

      toast.success(
        editingProduct ? "Accessory Updated" : "Accessory Added",
        `${saved.name} saved with size stock levels.`
      );
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to save accessory.");
    }
  };

  const handleStockAdjustment = (product: AccessoryProduct, size: string, delta: number) => {
    const currentQty = accessoriesApi.getStockForSize(product, size);
    if (currentQty + delta < 0) {
      toast.error("Stock Warning", `Stock quantity for size ${size} cannot be negative.`);
      return;
    }
    const updated = accessoriesApi.adjustStock(product.id, size, delta);
    if (updated) {
      toast.success(
        "Stock Adjusted",
        `${product.name} (${size}) stock updated.`
      );
      loadProducts();
    }
  };

  const handleDelete = (product: AccessoryProduct) => {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;

    const success = accessoriesApi.deleteProduct(product.id);
    if (success) {
      toast.success("Accessory Deleted", `${product.name} removed from list.`);
      loadProducts();
    } else {
      toast.error("Error", "Could not delete accessory.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const totalStock = accessoriesApi.getTotalStock(product);
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sizes || []).some((s) => s.size.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (selectedStatus === "instock") {
      matchesStatus = totalStock > product.minStockWarning;
    } else if (selectedStatus === "lowstock") {
      matchesStatus = totalStock > 0 && totalStock <= product.minStockWarning;
    } else if (selectedStatus === "outofstock") {
      matchesStatus = totalStock === 0;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + accessoriesApi.getTotalStock(p), 0);
  const lowStockCount = products.filter((p) => {
    const st = accessoriesApi.getTotalStock(p);
    return st > 0 && st <= p.minStockWarning;
  }).length;
  const outOfStockCount = products.filter((p) => accessoriesApi.getTotalStock(p) === 0).length;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Package className="h-6 w-6" />
            </div>
            Accessories & Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage accessories with multi-size stock inventory levels.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-xl h-11 px-5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Accessory
        </Button>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Items
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalProducts}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Stock Units
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalStockUnits}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/80 shadow-xs rounded-2xl bg-amber-50/40">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Low Stock Alert
              </p>
              <h3 className="text-2xl font-black text-amber-900 mt-0.5">{lowStockCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-rose-200/80 shadow-xs rounded-2xl bg-rose-50/40">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Out of Stock
              </p>
              <h3 className="text-2xl font-black text-rose-900 mt-0.5">{outOfStockCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Catalog Table ── */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl flex-1 flex flex-col overflow-hidden bg-white">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search accessory name or size..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-slate-200 focus-visible:ring-blue-500 rounded-xl bg-slate-50/50 text-xs"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-10 border-slate-200 rounded-xl w-full sm:w-[180px] bg-slate-50/50 text-xs font-medium">
                <SelectValue placeholder="All Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Status</SelectItem>
                <SelectItem value="instock">In Stock</SelectItem>
                <SelectItem value="lowstock">Low Stock</SelectItem>
                <SelectItem value="outofstock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Accessories Name</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Available Sizes & Stock</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Price (₹)</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Total Stock</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Stock Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-10 w-10 text-slate-200 mb-3" />
                      <p className="font-medium text-slate-600">No accessories found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search query.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = accessoriesApi.getTotalStock(product);
                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= product.minStockWarning;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Accessories Name & Description */}
                      <td className="px-5 py-4 max-w-xs">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Available Sizes Breakdown with Quick Adjusters */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(product.sizes || []).map((sz) => (
                            <div
                              key={sz.size}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold ${
                                sz.stockQuantity === 0
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : sz.stockQuantity <= 5
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-slate-100 text-slate-800 border-slate-200"
                              }`}
                            >
                              <span>{sz.size}:</span>
                              <button
                                type="button"
                                title={`Decrease ${sz.size} stock`}
                                onClick={() => handleStockAdjustment(product, sz.size, -1)}
                                className="text-slate-400 hover:text-slate-700 px-0.5 font-bold"
                              >
                                -
                              </button>
                              <span className="font-black">{sz.stockQuantity}</span>
                              <button
                                type="button"
                                title={`Increase ${sz.size} stock`}
                                onClick={() => handleStockAdjustment(product, sz.size, 1)}
                                className="text-slate-400 hover:text-slate-700 px-0.5 font-bold"
                              >
                                +
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-slate-900 text-sm flex items-center">
                          <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-slate-400" />
                          {product.price.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Total Stock Qty */}
                      <td className="px-5 py-4">
                        <span
                          className={`font-black text-sm ${
                            isOutOfStock
                              ? "text-rose-600"
                              : isLowStock
                              ? "text-amber-600"
                              : "text-slate-800"
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isOutOfStock ? (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 font-bold flex items-center w-fit gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 font-bold flex items-center w-fit gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock (&le; {product.minStockWarning})
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold flex items-center w-fit gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            In Stock
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="More options"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === product.id ? null : product.id);
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {activeMenuId === product.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1 text-left animate-in fade-in duration-150">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    openEditModal(product);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                  <span>Edit</span>
                                </button>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleDelete(product);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add / Edit Accessory Modal (Multi-Size Stock) ── */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingProduct ? "Edit Accessory Product" : "Add New Accessory Product"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify product details and inventory stock levels for each size.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Code / SKU</label>
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. KB-101"
                    className="h-10 rounded-xl shadow-sm border-slate-200 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Unit Price (₹)</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1850"
                    className="h-10 rounded-xl shadow-sm border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Accessories Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hinged Knee Brace, Elastic Knee Cap..."
                  className="h-10 rounded-xl shadow-sm border-slate-200 text-xs font-semibold"
                />
              </div>

              {/* Multi-Size Stock Input Grid */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b pb-1">
                  Stock Quantity Per Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_SIZES.map((sz) => (
                    <div key={sz} className="space-y-1 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <label className="text-[11px] font-bold text-blue-900">{sz} Size Stock</label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.sizes[sz] || "0"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sizes: {
                              ...formData.sizes,
                              [sz]: e.target.value,
                            },
                          })
                        }
                        placeholder="0"
                        className="h-8 text-center text-xs font-bold rounded-md border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Minimum Warning Stock Threshold
                </label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.minStockWarning}
                  onChange={(e) => setFormData({ ...formData, minStockWarning: e.target.value })}
                  placeholder="5"
                  className="h-10 rounded-xl shadow-sm border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description / Usage Notes</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical usage instructions, material details..."
                  className="rounded-xl shadow-sm border-slate-200 text-xs min-h-[70px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-5 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs"
                >
                  {editingProduct ? "Save Changes" : "Add Accessory"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
