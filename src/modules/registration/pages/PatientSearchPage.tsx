import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, FileEdit, Trash2, Filter, FileSpreadsheet, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPatients, deletePatient, PatientData } from "@/api/patientApi";
import ImportPatientsModal from "../components/ImportPatientsModal";
import PatientLedgerView from "../components/PatientLedgerView";

export default function PatientSearchPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);

  const handleDeletePatient = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;

    try {
      await deletePatient(id);
      toast.success("Patient Deleted Successfully", "The patient record has been removed.");
      fetchPatients();
    } catch (err: any) {
      toast.error("Failed to Delete Patient", err.message || "Something went wrong.");
    }
  };

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPatients({
        search: searchTerm,
        limit: 50,
      });
      setPatients(data.patients || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setPatients([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const filteredPatients = patients.filter((p) => {
    if (statusFilter !== "all" && p.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (genderFilter !== "all" && p.gender?.toLowerCase() !== genderFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-50/60 p-5 space-y-4 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patient Search</h2>
          <p className="text-sm text-slate-500 mt-0.5">Search and manage registered patients in database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Data
          </Button>
          <Button size="sm" className="gap-2" onClick={() => (window.location.href = "/registration/demographics")}>
            <UserPlus className="h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Search by Name / UHID / Mobile / Aadhaar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Enter search term..."
                  className="pl-9 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full lg:w-48 space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-48 space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Gender</label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-9 gap-2" onClick={fetchPatients}>
              <Filter className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results & Detail split layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Results Table */}
        <Card className={`flex flex-col overflow-hidden transition-all duration-300 ${selectedPatient ? "w-full lg:w-5/12" : "w-full"}`}>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">UHID</th>
                  <th className="px-4 py-3 font-semibold">Patient Name</th>
                  {!selectedPatient && <th className="px-4 py-3 font-semibold">Age/Gender</th>}
                  {!selectedPatient && <th className="px-4 py-3 font-semibold">Mobile</th>}
                  {!selectedPatient && <th className="px-4 py-3 font-semibold">Address / State</th>}
                  {!selectedPatient && <th className="px-4 py-3 font-semibold">Reg. Date</th>}
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={selectedPatient ? 4 : 8} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <p className="text-sm font-medium">Loading patients from database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id || patient.uhid}
                      className={`border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id ? "bg-blue-50/40 hover:bg-blue-50/60" : ""
                      }`}
                      onClick={() => {
                        setSelectedPatient(patient);
                      }}
                    >
                      <td className="px-4 py-3 font-medium font-mono text-[10px] text-primary">{patient.uhid}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {patient.title} {patient.fullName || `${patient.firstName} ${patient.lastName || ""}`}
                      </td>
                      {!selectedPatient && (
                        <td className="px-4 py-3 text-slate-600">
                          {patient.age ? `${patient.age} Y` : "N/A"} / {patient.gender}
                        </td>
                      )}
                      {!selectedPatient && <td className="px-4 py-3 text-slate-600">{patient.mobile}</td>}
                      {!selectedPatient && (
                        <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[200px]">
                          {patient.address}, {patient.state}
                        </td>
                      )}
                      {!selectedPatient && (
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {patient.regDate ? new Date(patient.regDate).toLocaleDateString() : "N/A"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            patient.status === "Active"
                              ? "success"
                              : patient.status === "Inactive"
                              ? "secondary"
                              : "warning"
                          }
                          className="text-[9px] px-1.5"
                        >
                          {patient.status || "Active"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                            onClick={() => navigate(`/registration/demographics?edit=${patient.id}`)}
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              handleDeletePatient(patient.id);
                              if (selectedPatient?.id === patient.id) {
                                setSelectedPatient(null);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedPatient ? 4 : 8} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-base font-medium text-slate-600">No patients found in database</p>
                        <p className="text-sm mt-1">Try adjusting your search query or import existing data.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 p-3 flex items-center justify-between bg-slate-50 text-xs text-slate-500">
            <div>Showing {filteredPatients.length} of {totalCount} total entries</div>
          </div>
        </Card>

        {/* Right Side: Ledger View */}
        {selectedPatient && (
          <Card className="w-full lg:w-7/12 flex flex-col overflow-hidden animate-slide-in-right bg-white border border-slate-200 shadow-sm rounded-xl">
            <PatientLedgerView
              patient={selectedPatient}
              onClose={() => setSelectedPatient(null)}
            />
          </Card>
        )}
      </div>

      <ImportPatientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchPatients}
      />
    </div>
  );
}
