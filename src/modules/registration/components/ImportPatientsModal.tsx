import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { importPatientsBulk, PatientData } from "@/api/patientApi";
import { useToast } from "@/components/ui/toast-notification";

interface ImportPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportPatientsModal({ isOpen, onClose, onSuccess }: ImportPatientsModalProps) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<PatientData>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    totalRecords: number;
    insertedCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const parseCSV = (text: string): Partial<PatientData>[] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
    const records: Partial<PatientData>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0 || values.every((v) => !v.trim())) continue;

      const record: Record<string, any> = {};

      headers.forEach((h, idx) => {
        const val = values[idx] ? values[idx].trim() : "";
        if (!val) return;

        if (h === "uhid" || h === "uhn" || h === "patientid") record.uhid = val;
        else if (h === "firstname" || h === "first_name" || h === "fname") record.firstName = val;
        else if (h === "middlename" || h === "middle_name" || h === "mname") record.middleName = val;
        else if (h === "lastname" || h === "last_name" || h === "lname") record.lastName = val;
        else if (h === "fullname" || h === "name" || h === "patientname") record.fullName = val;
        else if (h === "title" || h === "salutation") record.title = val;
        else if (h === "gender" || h === "sex") record.gender = val;
        else if (h === "maritalstatus" || h === "marital_status") record.maritalStatus = val;
        else if (h === "dob" || h === "dateofbirth" || h === "birthdate") record.dob = val;
        else if (h === "age") record.age = val;
        else if (h === "mobile" || h === "phone" || h === "contact" || h === "mobilenumber") record.mobile = val;
        else if (h === "address" || h === "location") record.address = val;
        else if (h === "state") record.state = val;
        else if (h === "city" || h === "districtcity") record.districtCity = val;
        else if (h === "pincode" || h === "zipcode") record.pinCode = val;
        else if (h === "country") record.country = val;
        else if (h === "guardianname" || h === "guardian_name" || h === "fathername") record.guardianName = val;
        else if (h === "guardianrelation" || h === "relation") record.guardianRelation = val;
        else if (h === "registrationtype" || h === "regtype") record.registrationType = val;
        else if (h === "payertype" || h === "payer_type") record.payerType = val;
        else if (h === "payer") record.payer = val;
        else if (h === "aadhaarcard" || h === "aadhaar" || h === "aadhar") record.aadhaarCard = val;
        else if (h === "status") record.status = val;
      });

      // Default required fallbacks
      if (!record.firstName && record.fullName) {
        const parts = record.fullName.split(" ");
        record.firstName = parts[0];
        if (parts.length > 1) record.lastName = parts.slice(1).join(" ");
      }
      if (!record.title) record.title = "Mr.";
      if (!record.gender) record.gender = "Male";
      if (!record.mobile) record.mobile = "9999999999";
      if (!record.address) record.address = "N/A";
      if (!record.state) record.state = "Delhi";
      if (!record.registrationType) record.registrationType = "New Registration";
      if (!record.guardianName) record.guardianName = record.firstName ? `${record.firstName}'s Guardian` : "Guardian";

      records.push(record as Partial<PatientData>);
    }

    return records;
  };

  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  };

  const processFile = (file: File) => {
    setFile(file);
    setParseError(null);
    setImportResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          const list = Array.isArray(json) ? json : [json];
          setParsedData(list);
        } else {
          const records = parseCSV(content);
          if (records.length === 0) {
            setParseError("No valid records found in CSV file. Please check column headers.");
          } else {
            setParsedData(records);
          }
        }
      } catch (err: any) {
        setParseError(`Error reading file: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setParseError("Failed to read file.");
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      "UHID,Registration Type,Title,First Name,Middle Name,Last Name,Gender,Age,DOB,Mobile,Address,State,Guardian Name,Guardian Relation,Payer Type\n" +
      "UHID-2023-1001,New Registration,Mr.,Rajesh,Kumar,Sharma,Male,35,1988-05-14,9876543210,123 Main St Sector 15,Delhi,Suresh Sharma,Father,direct\n" +
      "UHID-2023-1002,New Registration,Mrs.,Anita,,Verma,Female,29,1994-11-20,9876543211,45 Green Park,Delhi,Ramesh Verma,Husband,direct\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "patients_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartImport = async () => {
    if (parsedData.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await importPatientsBulk(parsedData);
      setImportResult(res);
      toast.success(
        "Bulk Import Completed!",
        `Successfully imported ${res.insertedCount} patient records into database.`
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setParseError(err.message || "Failed to complete bulk import.");
      toast.error("Import Failed", err.message || "Failed to process bulk patient data import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Import Previous Software Registrations</h3>
              <p className="text-xs text-slate-500">Upload CSV or JSON export to save patient records into the <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-700">patients</code> table</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Action Row: Upload & Download Template */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-800 font-medium">Need the standard import header structure?</span>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleDownloadSampleCSV}>
              <Download className="h-3.5 w-3.5" /> Download Sample CSV Template
            </Button>
          </div>

          {/* Upload Drop Area */}
          {!importResult && (
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-blue-500 mb-1" />
                <span className="text-sm font-medium text-slate-700">
                  {file ? file.name : "Click to browse or drag & drop CSV / JSON export file"}
                </span>
                <span className="text-xs text-slate-400">Supports .csv or .json formatted patient data</span>
              </label>
            </div>
          )}

          {/* Parse Error */}
          {parseError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && !importResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200">
                  {parsedData.length} patient records parsed and ready for import
                </Badge>
                {isParsing && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing file...
                  </span>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden border-slate-200 max-h-52 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 sticky top-0 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">UHID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Gender</th>
                      <th className="p-2">Mobile</th>
                      <th className="p-2">State</th>
                      <th className="p-2">Guardian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2 font-mono text-[11px]">{row.uhid || "Auto-gen"}</td>
                        <td className="p-2 font-medium">{row.firstName} {row.lastName}</td>
                        <td className="p-2">{row.gender}</td>
                        <td className="p-2">{row.mobile}</td>
                        <td className="p-2">{row.state}</td>
                        <td className="p-2 text-slate-500">{row.guardianName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <p className="text-[11px] text-slate-400 italic text-center">+ {parsedData.length - 10} more rows queued</p>
              )}
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Bulk Data Import Completed!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Successfully saved <strong>{importResult.insertedCount}</strong> patients into PostgreSQL database table <code>patients</code>.
                    {importResult.skippedCount > 0 && ` (${importResult.skippedCount} skipped)`}
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Skipped Row Details ({importResult.errors.length}):
                  </p>
                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 max-h-36 overflow-y-auto text-[11px] text-amber-800 space-y-1 font-mono">
                    {importResult.errors.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            {importResult ? "Close" : "Cancel"}
          </Button>
          {!importResult && parsedData.length > 0 && (
            <Button size="sm" onClick={handleStartImport} disabled={isSubmitting} className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing Data...
                </>
              ) : (
                <>Start Import ({parsedData.length} Records)</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
