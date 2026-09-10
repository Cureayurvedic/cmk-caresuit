import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, UserPlus, FileEdit, Trash2, Filter, FileSpreadsheet, Loader2, Printer, Building2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
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
import { useIsAdmin } from "@/contexts/AuthContext";
import ImportPatientsModal from "../components/ImportPatientsModal";
import PatientLedgerView from "../components/PatientLedgerView";
import { PatientRegistrationDetailsPrint, PatientRegDetailsData } from "../components/PatientRegistrationDetailsPrint";
import { useBranch } from "@/contexts/BranchContext";

export default function PatientSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { activeBranch } = useBranch();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("query") || searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 50;
  const [isLoading, setIsLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [printingPatient, setPrintingPatient] = useState<PatientData | null>(null);
  
  const isAdmin = useIsAdmin();

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "PatientRegistrationDetails"
  });

  useEffect(() => {
    if (printingPatient) {
      handlePrint();
    }
  }, [printingPatient, handlePrint]);

  const handleDeletePatient = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
        toast.success("Patient Deleted", "Patient record has been deleted.");
        fetchPatients();
      } catch (err: any) {
        toast.error("Delete Failed", err.message || "Could not delete patient.");
      }
    }
  };

  const fetchPatients = useCallback(async (page = currentPage) => {
    setIsLoading(true);
    try {
      const data = await getPatients({
        search: searchTerm,
        hcf: activeBranch,
        limit: PAGE_SIZE,
        page,
      });
      setPatients(data.patients || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setPatients([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, activeBranch, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchPatients(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeBranch, statusFilter, genderFilter]);

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
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-slate-50/60 p-3 sm:p-5 space-y-4 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Patient Search</h2>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              {activeBranch}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Showing patient records for <strong className="font-semibold text-slate-700">{activeBranch}</strong>
          </p>
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
            <Button variant="outline" className="h-9 gap-2" onClick={() => fetchPatients(currentPage)}>
              <Filter className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results & Detail split layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[620px]">
        {/* Results Table */}
        <Card className={`flex flex-col overflow-hidden transition-all duration-300 ${selectedPatient ? "w-full lg:w-5/12 h-[calc(100vh-220px)] min-h-[600px]" : "w-full"}`}>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">UHID</th>
                  <th className="px-4 py-3 font-semibold">Patient Name</th>
                  <th className="px-4 py-3 font-semibold">Branch</th>
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
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                      <td className="px-4 py-3"><div className="h-3.5 w-14 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-3.5 w-36 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded-full" /></td>
                      {!selectedPatient && <td className="px-4 py-3"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>}
                      {!selectedPatient && <td className="px-4 py-3"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>}
                      {!selectedPatient && <td className="px-4 py-3"><div className="h-3.5 w-32 bg-slate-200 rounded" /></td>}
                      {!selectedPatient && <td className="px-4 py-3"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>}
                      <td className="px-4 py-3"><div className="h-5 w-14 bg-slate-200 rounded-full" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-6 w-20 bg-slate-200 rounded ml-auto" /></td>
                    </tr>
                  ))
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
                      <td className="px-4 py-3 font-medium font-mono text-[10px] text-primary whitespace-nowrap" title={patient.uhid}>{patient.uhid}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {patient.title} {patient.fullName || `${patient.firstName} ${patient.lastName || ""}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold px-2 py-0.5 inline-flex items-center gap-1"
                        >
                          <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          {patient.hcf || "CMK Main"}
                        </Badge>
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
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Print Patient Details"
                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => setPrintingPatient(patient)}
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit Patient"
                                className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                                onClick={() => navigate(`/registration/demographics?edit=${patient.id}`)}
                              >
                                <FileEdit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Patient"
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedPatient ? 5 : 9} className="px-4 py-12 text-center text-slate-500">
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
          <div className="border-t border-slate-200 p-3 flex items-center justify-between bg-slate-50 text-xs text-slate-500 flex-wrap gap-2">
            <div className="font-medium">
              Showing <span className="text-slate-700 font-semibold">{((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of <span className="text-slate-700 font-semibold">{totalCount}</span> patients
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchPatients(1)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >«</button>
              <button
                onClick={() => fetchPatients(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >‹ Prev</button>
              <span className="px-3 py-1 rounded border border-blue-300 bg-blue-50 text-blue-700 font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchPatients(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >Next ›</button>
              <button
                onClick={() => fetchPatients(totalPages)}
                disabled={currentPage >= totalPages || isLoading}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >»</button>
            </div>
          </div>
        </Card>

        {/* Right Side: Ledger View */}
        {selectedPatient && (
          <Card className="w-full lg:w-7/12 flex flex-col h-[calc(100vh-220px)] min-h-[600px] overflow-hidden animate-slide-in-right bg-white border border-slate-200 shadow-md rounded-xl">
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

      {/* Hidden Printable Component */}
      {printingPatient && (
        <div className="hidden">
          <PatientRegistrationDetailsPrint
            ref={printRef}
            patient={{
              uhid: printingPatient.uhid || "",
              regDate: printingPatient.regDate || new Date().toISOString(),
              name: `${printingPatient.title || ""} ${printingPatient.fullName || `${printingPatient.firstName} ${printingPatient.lastName || ""}`}`.trim(),
              guardianName: printingPatient.guardianName || "",
              genderAge: `${printingPatient.gender || ""} / ${printingPatient.age ? `${printingPatient.age} Yr` : ""}`.trim(),
              maritalStatus: printingPatient.maritalStatus || "",
              religion: printingPatient.religion || "",
              aadhaarCard: printingPatient.aadhaarCard || "",
              nationality: printingPatient.nationality || "",
              passportNo: printingPatient.passportNo || "",
              address: printingPatient.address || "",
              cityStateZip: `${printingPatient.districtCity || ""} - ${printingPatient.pinCode || ""}`.trim(),
              city: printingPatient.districtCity || "",
              pinCode: printingPatient.pinCode || "",
              mobile: printingPatient.mobile || "",
              altPhone: printingPatient.altPhone || "",
              emergencyName: printingPatient.emergencyName || "",
              emergencyContact: printingPatient.emergencyContact || "",
              sponsor: printingPatient.sponsor || printingPatient.payer || "",
              referringDoctor: printingPatient.provider || ""
            }}
          />
        </div>
      )}
    </div>
  );
}
