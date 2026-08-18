import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus, Trash2, Loader2, AlertCircle, RefreshCw, Save, X, Edit2
} from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";
import {
  getBedCategories,
  createBedCategory,
  updateBedCategory,
  deleteBedCategory,
  type BedCategoryData,
} from "@/api/bedCategoryApi";

export default function BedCategoriesPanel() {
  const toast = useToast();

  const [categories, setCategories] = useState<BedCategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Form State for new category
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [newWard, setNewWard] = useState("");
  const [newTariff, setNewTariff] = useState("");
  const [newTotalBeds, setNewTotalBeds] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTariff, setEditTariff] = useState("");
  const [editTotalBeds, setEditTotalBeds] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<BedCategoryData | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBedCategories();
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load bed categories";
      setError(msg);
      toast.error("Load Failed", msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrefix.trim() || !newWard.trim() || !newTariff || !newTotalBeds) {
      toast.error("Validation Error", "Please fill in all fields.");
      return;
    }

    setAdding(true);
    try {
      const created = await createBedCategory({
        name: newName,
        prefix: newPrefix,
        ward: newWard,
        tariffRate: Number(newTariff),
        totalBeds: Number(newTotalBeds),
      });
      // reload fully to get the beds data attached
      await loadCategories();
      
      setNewName("");
      setNewPrefix("");
      setNewWard("");
      setNewTariff("");
      setNewTotalBeds("");
      setIsAddModalOpen(false);
      toast.success("Category Added", `"${created.name}" created with ${created.totalBeds} beds.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add bed category";
      toast.error("Add Failed", msg);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat: BedCategoryData) => {
    setEditingId(cat.id);
    setEditTariff(String(cat.tariffRate));
    setEditTotalBeds(String(cat.totalBeds));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    setSavingId(id);
    try {
      await updateBedCategory(id, {
        tariffRate: Number(editTariff),
        totalBeds: Number(editTotalBeds),
      });
      await loadCategories();
      setEditingId(null);
      toast.success("Category Updated", "Bed category updated successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      toast.error("Update Failed", msg);
    } finally {
      setSavingId(null);
    }
  };

  const handleTrashClick = (cat: BedCategoryData) => {
    if (cat.bedsOccupied && cat.bedsOccupied > 0) {
      toast.error("Cannot Delete", `${cat.bedsOccupied} bed(s) are currently occupied.`);
      return;
    }
    setCategoryToDelete(cat);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeletingId(categoryToDelete.id);
    try {
      await deleteBedCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((i) => i.id !== categoryToDelete.id));
      toast.success("Category Removed", `"${categoryToDelete.name}" has been deleted.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete bed category";
      toast.error("Delete Failed", msg);
    } finally {
      setDeletingId(null);
      setCategoryToDelete(null);
    }
  };

  return (
    <Card className="border border-slate-150 shadow-sm rounded-xl w-full">
      <CardHeader className="p-6 pb-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Bed Categories</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Manage ward types, daily tariffs, and auto-generate beds for the ATD module.
          </CardDescription>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 text-xs gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 flex-1">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCategories}
              className="h-8 text-xs text-red-600 hover:bg-red-100 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* ── Data Table ── */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prefix</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ward</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tariff ₹</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Total Beds</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Occupied</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-200 rounded w-10" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-200 rounded w-32" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-200 rounded w-12" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-200 rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-200 rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3 text-right pr-6"><div className="h-7 w-14 bg-slate-200 rounded-lg ml-auto" /></td>
                  </tr>
                ))}

              {!loading &&
                categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">{cat.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{cat.prefix}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{cat.ward}</td>
                      
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            className="h-7 w-20 text-xs px-2" 
                            value={editTariff} 
                            onChange={(e) => setEditTariff(e.target.value)} 
                          />
                        ) : (
                          `₹${cat.tariffRate}`
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-center">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            className="h-7 w-16 text-xs px-2 mx-auto text-center" 
                            value={editTotalBeds} 
                            onChange={(e) => setEditTotalBeds(e.target.value)} 
                          />
                        ) : (
                          <span className="bg-slate-100 px-2 py-1 rounded-md">{cat.totalBeds}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs font-semibold text-center">
                        <span className={cat.bedsOccupied && cat.bedsOccupied > 0 ? "text-amber-600 bg-amber-50 px-2 py-1 rounded-md" : "text-slate-400"}>
                          {cat.bedsOccupied || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right pr-4">
                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => saveEdit(cat.id)}
                                disabled={savingId === cat.id}
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                              >
                                {savingId === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={cancelEdit}
                                disabled={savingId === cat.id}
                                className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(cat)}
                                className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTrashClick(cat)}
                                disabled={deletingId === cat.id}
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                              >
                                {deletingId === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

      </CardContent>

      {/* ── Add Form Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Add New Bed Category</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Category Name</label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. ICU2" className="h-9 text-xs shadow-sm" disabled={adding} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Bed Prefix</label>
                  <Input value={newPrefix} onChange={(e) => setNewPrefix(e.target.value)} placeholder="e.g. ICU2-" className="h-9 text-xs shadow-sm" disabled={adding} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Ward / Location</label>
                  <Input value={newWard} onChange={(e) => setNewWard(e.target.value)} placeholder="e.g. Floor 1 - Critical Care Unit" className="h-9 text-xs shadow-sm" disabled={adding} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Daily Tariff (₹)</label>
                  <Input type="number" value={newTariff} onChange={(e) => setNewTariff(e.target.value)} placeholder="e.g. 6500" className="h-9 text-xs shadow-sm" disabled={adding} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Total Beds</label>
                  <Input type="number" value={newTotalBeds} onChange={(e) => setNewTotalBeds(e.target.value)} placeholder="e.g. 10" className="h-9 text-xs shadow-sm" disabled={adding} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={adding} className="h-9 text-xs cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={adding} className="h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white">
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {adding ? "Generating..." : "Generate Beds"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Delete Category?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This will also delete all its beds.</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 my-4">
              <p className="text-sm font-semibold text-slate-700 text-center">"{categoryToDelete.name}"</p>
              <p className="text-[11px] text-slate-500 text-center mt-1">Beds: {categoryToDelete.totalBeds}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={deletingId === categoryToDelete.id} className="text-xs h-9 cursor-pointer">
                Cancel
              </Button>
              <Button onClick={confirmDelete} disabled={deletingId === categoryToDelete.id} className="text-xs h-9 gap-1.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                {deletingId === categoryToDelete.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
