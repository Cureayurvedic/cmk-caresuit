import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus, Trash2, Shield, User, Settings2, Search,
  MapPin, Users, HeartHandshake, Loader2, AlertCircle, RefreshCw,
  BedDouble, X
} from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";
import {
  getSettingsItems,
  addSettingsItem,
  deleteSettingsItem,
  type SettingsCategory,
  type MasterOption,
} from "@/api/settingsApi";
import BedCategoriesPanel from "../components/BedCategoriesPanel";

// ─── Category Configuration ────────────────────────────────────────────────────
const CONFIGS: Record<
  SettingsCategory,
  { title: string; description: string; placeholder: string; icon: React.ReactNode }
> = {
  providers: {
    title: "Quick Referral Providers",
    description: "Manage doctor names and source categories displayed in the quick referral provider dropdown.",
    placeholder: "Enter Doctor Name (e.g. Dr. Jane Doe) or Category",
    icon: <User className="h-4 w-4" />,
  },
  leadSources: {
    title: "Lead Sources",
    description: "Manage patient lead sources for marketing and analytics tracking.",
    placeholder: "Enter Lead Source name",
    icon: <HeartHandshake className="h-4 w-4" />,
  },
  religions: {
    title: "Religions Master List",
    description: "Manage religion categories available in demographics dropdown.",
    placeholder: "Enter Religion name",
    icon: <Users className="h-4 w-4" />,
  },
  occupations: {
    title: "Occupations Master List",
    description: "Manage patient occupation categories in demographics.",
    placeholder: "Enter Occupation name",
    icon: <Users className="h-4 w-4" />,
  },
  branches: {
    title: "HCF Branches",
    description: "Manage Healthcare Facility (HCF) locations & main branches.",
    placeholder: "Enter Branch name",
    icon: <MapPin className="h-4 w-4" />,
  },
  companies: {
    title: "Payer Corporate Companies",
    description: "Manage Corporate/Company list for corporate payers configuration.",
    placeholder: "Enter Company name",
    icon: <User className="h-4 w-4" />,
  },
  insurances: {
    title: "Payer Insurance Providers",
    description: "Manage Health Insurance companies for insurance payer configuration.",
    placeholder: "Enter Insurance Provider name",
    icon: <Shield className="h-4 w-4" />,
  },
};

// ─── Sidebar Nav Items ──────────────────────────────────────────────────────────
const MASTER_TABS: SettingsCategory[] = [
  "providers",
  "leadSources",
  "religions",
  "occupations",
  "branches",
  "companies",
  "insurances",
];

const SIDEBAR_LABELS: Record<SettingsCategory, string> = {
  providers: "Providers / Doctors",
  leadSources: "Lead Sources",
  religions: "Religions",
  occupations: "Occupations",
  branches: "HCF Branches",
  companies: "Payer Companies",
  insurances: "Payer Insurances",
};

type TabKey = SettingsCategory | "bedCategories";

// ─── Component ──────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("bedCategories");
  const [items, setItems] = useState<MasterOption[]>([]);
  const [newItem, setNewItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MasterOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Load items from API whenever the active tab changes ──
  const loadItems = useCallback(async () => {
    if (activeTab === "bedCategories") return; // Handled by BedCategoriesPanel internally
    setLoading(true);
    setError(null);
    try {
      const data = await getSettingsItems(activeTab as SettingsCategory);
      setItems(data.items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      setError(msg);
      toast.error("Load Failed", msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    if (activeTab === "bedCategories") return;
    setItems([]);
    setNewItem("");
    setSearchTerm("");
    setError(null);
    loadItems();
  }, [activeTab, loadItems]);

  // ── Add item ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "bedCategories") return;
    const trimmed = newItem.trim();
    if (!trimmed) return;

    setAdding(true);
    try {
      const created = await addSettingsItem(activeTab as SettingsCategory, trimmed);
      setItems((prev) => [...prev, created]);
      setNewItem("");
      setIsAddModalOpen(false);
      toast.success("Option Added", `"${created.value}" has been added to ${CONFIGS[activeTab as SettingsCategory].title}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add item";
      toast.error("Add Failed", msg);
    } finally {
      setAdding(false);
    }
  };

  // ── Delete item ──
  const confirmDelete = async () => {
    if (activeTab === "bedCategories" || !itemToDelete) return;
    setDeletingId(itemToDelete.id);
    try {
      await deleteSettingsItem(activeTab as SettingsCategory, itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      toast.success("Option Removed", `"${itemToDelete.value}" has been deleted.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete item";
      toast.error("Delete Failed", msg);
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  const filteredItems = items.filter((item) =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const config = activeTab !== "bedCategories" ? CONFIGS[activeTab as SettingsCategory] : null;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 w-full space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-sm border border-blue-100">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Application Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure CMK CareSuite master values, dropdown list options, and system parameters
            </p>
          </div>
        </div>
      </div>

      {/* ── Two-column Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">

        {/* ── Sidebar Navigation ── */}
        <div className="space-y-1">
          {/* Ward & Bed Management Section */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Ward & Bed Management
          </p>
          <button
            onClick={() => setActiveTab("bedCategories")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "bedCategories"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <BedDouble className="h-4 w-4" />
            Bed Categories
          </button>

          {/* Master Settings Section */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Master Settings
            </p>

            {MASTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {CONFIGS[tab].icon}
                {SIDEBAR_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Access Control Section */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Access Control
            </p>
            <button
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-slate-400 cursor-not-allowed"
              disabled
            >
              <Shield className="h-4 w-4" />
              Role Permissions
            </button>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="min-w-0">
          {activeTab === "bedCategories" ? (
            <BedCategoriesPanel />
          ) : config ? (
            <Card className="border border-slate-150 shadow-sm rounded-xl w-full">
            <CardHeader className="p-6 pb-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">{config.title}</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  {config.description}
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 text-xs gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* ── Search Row ── */}
              <div className="flex">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-9 text-xs shadow-sm border-slate-200"
                  />
                </div>
              </div>

              {/* ── Error State ── */}
              {error && !loading && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 flex-1">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadItems}
                    className="h-8 text-xs text-red-600 hover:bg-red-100 gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {/* ── Data Table ── */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">
                        #
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Option Value
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Loading Skeleton */}
                    {loading &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`skel-${i}`} className="animate-pulse">
                          <td className="px-4 py-3 text-center">
                            <div className="h-3 w-4 bg-slate-200 rounded mx-auto" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-3 bg-slate-200 rounded w-2/3" />
                          </td>
                          <td className="px-4 py-3 text-right pr-6">
                            <div className="h-7 w-7 bg-slate-200 rounded-lg ml-auto" />
                          </td>
                        </tr>
                      ))}

                    {/* Data Rows */}
                    {!loading &&
                      filteredItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                            {item.value}
                          </td>
                          <td className="px-4 py-3 text-right pr-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setItemToDelete(item)}
                              disabled={deletingId === item.id}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}

                    {/* Empty State */}
                    {!loading && filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center">
                          <div className="max-w-[240px] mx-auto space-y-2">
                            <p className="text-xs font-bold text-slate-600">No parameters found</p>
                            <p className="text-[11px] text-slate-400">
                              {searchTerm
                                ? "Try a different search keyword."
                                : "Add a new option using the form above."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Bottom Stats Panel ── */}
              <div className="bg-blue-50/30 border border-blue-50/50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Total configured parameters:{" "}
                  <strong className="text-slate-800 font-bold">{loading ? "—" : items.length}</strong>
                </span>
                <span className="text-[10px] text-primary bg-blue-50 font-bold px-2 py-1 rounded-md">
                  Active Configurations
                </span>
              </div>
            </CardContent>

            {/* ── Add Form Modal ── */}
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Add {config.title}</h3>
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAdd} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Option Value</label>
                      <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={config.placeholder}
                        className="h-9 text-xs shadow-sm"
                        disabled={adding}
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={adding} className="h-9 text-xs cursor-pointer">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={adding || !newItem.trim()} className="h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white">
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        {adding ? "Adding..." : "Add Option"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {itemToDelete && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Delete Option?</h3>
                      <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 my-4">
                    <p className="text-sm font-semibold text-slate-700 text-center">"{itemToDelete.value}"</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={deletingId === itemToDelete.id} className="text-xs h-9 cursor-pointer">
                      Cancel
                    </Button>
                    <Button onClick={confirmDelete} disabled={deletingId === itemToDelete.id} className="text-xs h-9 gap-1.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                      {deletingId === itemToDelete.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
