import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Shield, User, Settings2, Search, 
  MapPin, Users, HeartHandshake, Eye, EyeOff 
} from "lucide-react";

// Default configuration keys and fallback lists
const CONFIGS = {
  providers: {
    title: "Quick Referral Providers",
    description: "Manage doctor names and source categories displayed in the quick referral provider dropdown.",
    storageKey: "cmk_providers",
    defaultList: ["Self", "Referral", "Camp", "OPD", "Emergency"],
    placeholder: "Enter Doctor Name (e.g. Dr. Jane Doe) or Category",
  },
  leadSources: {
    title: "Lead Sources",
    description: "Manage patient lead sources options for marketing and analytics tracking.",
    storageKey: "cmk_lead_sources",
    defaultList: ["Walk-in", "Online", "Phone", "Camp", "Doctor Referral", "Insurance"],
    placeholder: "Enter Lead Source name",
  },
  religions: {
    title: "Religions Master List",
    description: "Manage religion categories available in demographics dropdown.",
    storageKey: "cmk_religions",
    defaultList: ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"],
    placeholder: "Enter Religion name",
  },
  occupations: {
    title: "Occupations Master List",
    description: "Manage patient occupation categories in demographics.",
    storageKey: "cmk_occupations",
    defaultList: [
      "Astrologer",
      "Banker",
      "Business",
      "Carpenter",
      "Doctor",
      "Driver",
      "Engineer",
      "Farmer",
      "Fisherman",
      "Hairdresser",
      "Housewife",
      "Labor",
      "Lawyer",
      "Mechanic",
      "Nil",
      "raf",
      "Retired",
      "Service",
      "Student"
    ],
    placeholder: "Enter Occupation name",
  },
  branches: {
    title: "HCF Branches",
    description: "Manage Healthcare Facility (HCF) locations & main branches.",
    storageKey: "cmk_hcf_branches",
    defaultList: ["CMK Main", "CMK Branch 1", "CMK Branch 2"],
    placeholder: "Enter Branch name",
  },
  companies: {
    title: "Payer Corporate Companies",
    description: "Manage Corporate/Company list for corporate payers configuration.",
    storageKey: "cmk_payer_companies",
    defaultList: ["TATA Consultancy Services", "Reliance Industries", "Infosys Ltd", "Wipro", "HDFC Bank"],
    placeholder: "Enter Company name",
  },
  insurances: {
    title: "Payer Insurance Providers",
    description: "Manage Health Insurance companies for insurance payer configuration.",
    storageKey: "cmk_payer_insurances",
    defaultList: ["Star Health Insurance", "Niva Bupa Health Insurance", "Care Health Insurance", "HDFC ERGO", "ICICI Lombard", "Aditya Birla Health", "LIC of India"],
    placeholder: "Enter Insurance Provider name",
  }
};

type ConfigTab = keyof typeof CONFIGS;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("providers");
  const [list, setList] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load selected list from localStorage when active tab changes
  useEffect(() => {
    const config = CONFIGS[activeTab];
    const stored = localStorage.getItem(config.storageKey);
    let parsedList: string[] | null = null;
    if (stored) {
      try {
        parsedList = JSON.parse(stored);
      } catch (e) {}
    }

    // Migration/auto-update check to match user's default occupations list
    if (activeTab === "occupations" && parsedList && !parsedList.includes("Astrologer")) {
      parsedList = null;
    }

    if (parsedList) {
      setList(parsedList);
    } else {
      setList(config.defaultList);
      localStorage.setItem(config.storageKey, JSON.stringify(config.defaultList));
    }
    setNewItem("");
    setSearchTerm("");
  }, [activeTab]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (list.includes(trimmed)) {
      alert("This entry already exists!");
      return;
    }
    const updated = [...list, trimmed];
    setList(updated);
    localStorage.setItem(CONFIGS[activeTab].storageKey, JSON.stringify(updated));
    setNewItem("");
  };

  const handleDelete = (itemToDelete: string) => {
    const updated = list.filter((item) => item !== itemToDelete);
    setList(updated);
    localStorage.setItem(CONFIGS[activeTab].storageKey, JSON.stringify(updated));
  };

  const filteredList = list.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-sm border border-blue-100">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Application Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure CMK CareSuite master values, dropdown list options, and system parameters</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Master Settings</p>
          
          <button 
            onClick={() => setActiveTab("providers")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "providers" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <User className="h-4 w-4" />
            Providers / Doctors
          </button>

          <button 
            onClick={() => setActiveTab("leadSources")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "leadSources" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            Lead Sources
          </button>

          <button 
            onClick={() => setActiveTab("religions")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "religions" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            Religions
          </button>

          <button 
            onClick={() => setActiveTab("occupations")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "occupations" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            Occupations
          </button>

          <button 
            onClick={() => setActiveTab("branches")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "branches" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <MapPin className="h-4 w-4" />
            HCF Branches
          </button>

          <button 
            onClick={() => setActiveTab("companies")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "companies" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <User className="h-4 w-4" />
            Payer Companies
          </button>

          <button 
            onClick={() => setActiveTab("insurances")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === "insurances" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Shield className="h-4 w-4" />
            Payer Insurances
          </button>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Access Control</p>
            <button 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-slate-400 cursor-not-allowed"
              disabled
            >
              <Shield className="h-4 w-4" />
              Role Permissions
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <Card className="border border-slate-150 shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl">
              <CardTitle className="text-base font-bold text-slate-800">{CONFIGS[activeTab].title}</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                {CONFIGS[activeTab].description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Form & Search Tools */}
              <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleAdd} className="flex flex-1 gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={CONFIGS[activeTab].placeholder}
                    className="h-9 text-xs flex-1 shadow-sm border-slate-200"
                  />
                  <Button type="submit" size="sm" className="h-9 text-xs gap-1.5 px-4 shadow-sm bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                </form>

                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-9 text-xs shadow-sm border-slate-200"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">#</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Option Value</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((item, idx) => (
                      <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-700">{item}</td>
                        <td className="px-4 py-3 text-right pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50/60 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center">
                          <div className="max-w-[240px] mx-auto space-y-2">
                            <p className="text-xs font-bold text-slate-600">No parameters found</p>
                            <p className="text-[11px] text-slate-400">
                              Try checking your search keyword or add a new custom parameter option above.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Bottom statistics panel */}
              <div className="bg-blue-50/30 border border-blue-50/50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Total configured parameters: <strong className="text-slate-800 font-bold">{list.length}</strong>
                </span>
                <span className="text-[10px] text-primary bg-blue-50 font-bold px-2 py-1 rounded-md">
                  Active Configurations
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
