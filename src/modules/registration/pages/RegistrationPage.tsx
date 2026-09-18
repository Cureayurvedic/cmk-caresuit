import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save, Printer, Plus, Search, Upload, Trash2, Calendar,
  User, Phone, AlertCircle, Shield,
  FileText, ChevronDown, Loader2, FileSpreadsheet, Check, Building2
} from "lucide-react";
import { format } from "date-fns";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatient, getPatientById, updatePatient, getPatients, PatientData } from "@/api/patientApi";
import { getSettingsItems } from "@/api/settingsApi";
import { useBranch } from "@/contexts/BranchContext";
import { useIsAdmin } from "@/contexts/AuthContext";
import ImportPatientsModal from "../components/ImportPatientsModal";
import { useToast } from "@/components/ui/toast-notification";
import { useReactToPrint } from "react-to-print";
import { RegistrationLabelPrint } from "../components/RegistrationLabelPrint";
import { RegistrationCardPrint } from "../components/RegistrationCardPrint";
import { PatientRegistrationDetailsPrint } from "../components/PatientRegistrationDetailsPrint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── SearchSelect Component for Auto-complete Dropdowns ───────────────────────
interface SearchSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  dropUp?: boolean;
}

function SearchSelect({ value, onChange, options, placeholder = "Select...", required, className, dropUp }: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Field */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className={cn(
          "flex h-8.5 w-full items-center justify-between rounded-md border border-slate-300 px-3 py-1 text-xs sm:text-sm font-semibold text-slate-900 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
          required ? "bg-[#fffde6]" : "bg-white",
          className
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0 ml-2" />
      </div>

      {/* Options overlay */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 max-h-60 w-full overflow-auto rounded-md border border-slate-300 bg-white p-1 text-slate-900 shadow-xl",
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="sticky top-0 bg-white pb-1 z-10">
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-7 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-blue-400 font-medium"
            />
          </div>
          <div className="space-y-0.5 mt-1">
            {filtered.length === 0 ? (
              <div className="py-1.5 text-center text-xs text-slate-400">
                No results found.
              </div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs font-semibold outline-none hover:bg-blue-50 hover:text-blue-900",
                    value === opt && "bg-blue-100 text-blue-900 font-bold"
                  )}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  registrationType: "Registration Type",
  title: "Title",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  gender: "Gender",
  dob: "Date of Birth",
  age: "Age",
  guardianName: "Attendant Name",
  guardianRelation: "Attendant Relation",
  mobile: "Mobile Number",
  address: "Address",
  country: "Country",
  state: "State",
  districtCity: "District / City",
  pinCode: "PIN Code",
  altPhone: "Alternative Phone",
  email: "Email Address",
  emergencyName: "Emergency Contact Name",
  emergencyRelationship: "Emergency Relationship",
  emergencyContact: "Emergency Contact Number",
  nationality: "Nationality",
  aadhaarCard: "Aadhaar Card",
  panNo: "PAN Number",
  payerType: "Payer Type",
  payer: "Payer",
  status: "Status",
};

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const registrationSchema = z.object({
  registrationType: z.string().min(1, "Registration type is required"),
  uhid: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First Name is required").regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed in First Name"),
  middleName: z.string().regex(/^[A-Za-z\s]*$/, "Only alphabets are allowed").optional(),
  lastName: z.string().regex(/^[A-Za-z\s]*$/, "Only alphabets are allowed").optional(),
  gender: z.string().min(1, "Gender selection is required"),
  maritalStatus: z.string().optional(),
  dob: z.string().optional(),
  age: z.string().optional(),
  guardianName: z.string().min(1, "Attendant Name is required").regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed in Attendant Name"),
  guardianRelation: z.string().optional(),
  regDate: z.string(),
  // Contact
  mobile: z.string().min(1, "Mobile Number is required").regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country selection is required"),
  state: z.string().min(1, "State selection is required"),
  districtCity: z.string().optional(),
  area: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must be exactly 6 digits").optional().or(z.literal("")),
  altPhone: z.string().regex(/^\d{10}$/, "Alternative phone must be exactly 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  // Emergency
  emergencyName: z.string().regex(/^[A-Za-z\s]*$/, "Only alphabets are allowed").optional().or(z.literal("")),
  emergencyRelationship: z.string().optional(),
  emergencyContact: z.string().regex(/^\d{10}$/, "Emergency contact must be exactly 10 digits").optional().or(z.literal("")),
  // Identity
  nationality: z.string(),
  aadhaarCard: z.string().regex(/^(\d{4} \d{4} \d{4})?$/, "Aadhaar must be exactly 12 digits").optional().or(z.literal("")),
  panNo: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

// ─── Helper Components ─────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = "text-[#0f2b48]" }: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) {
  return (
    <div className="-mx-4 -mt-4 mb-3.5 px-4 py-2.5 bg-[#cee6f8] border-b border-[#a9d4f5] text-[#0f2b48] font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 rounded-t-xl">
      <Icon className={cn("h-4 w-4 text-[#1b3d5b]", color)} />
      <span>{title}</span>
    </div>
  );
}

function FieldRow({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      {children}
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className={cn("text-xs font-bold text-slate-700", required && "after:content-['_*'] after:text-red-500 after:font-extrabold")}>
        {label}
      </Label>
      {children}
      {error && (
        <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </span>
      )}
    </div>
  );
}

// ─── Selects ───────────────────────────────────────────────────────────────────
const TITLES = ["B/O", "Baba", "Baby", "Baby Of", "Dr.", "Master", "Mohd.", "Mr.", "Mrs.", "Ms."];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed", "Separated"];
const COUNTRIES = ["India", "USA", "UK", "UAE", "Canada", "Australia"];
const STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Haryana", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];
const NATIONALITIES = [
  "Afghan (Afghanistan)",
  "Albanian (Albania)",
  "Algerian (Algeria)",
  "American (United States)",
  "Andorran (Andorra)",
  "Angolan (Angola)",
  "Argentinian (Argentina)",
  "Armenian (Armenia)",
  "Australian (Australia)",
  "Austrian (Austria)",
  "Azerbaijani (Azerbaijan)",
  "Bahamian (Bahamas)",
  "Bahraini (Bahrain)",
  "Bangladeshi (Bangladesh)",
  "Barbadian (Barbados)",
  "Belarusian (Belarus)",
  "Belgian (Belgium)",
  "Belizean (Belize)",
  "Beninese (Benin)",
  "Bhutanese (Bhutan)",
  "Bolivian (Bolivia)",
  "Bosnian (Bosnia and Herzegovina)",
  "Brazilian (Brazil)",
  "British (United Kingdom)",
  "Bruneian (Brunei)",
  "Bulgarian (Bulgaria)",
  "Burkinese (Burkina Faso)",
  "Burundian (Burundi)",
  "Cambodian (Cambodia)",
  "Cameroonian (Cameroon)",
  "Canadian (Canada)",
  "Cape Verdean (Cabo Verde)",
  "Central African (Central African Republic)",
  "Chadian (Chad)",
  "Chilean (Chile)",
  "Chinese (China)",
  "Colombian (Colombia)",
  "Comoran (Comoros)",
  "Congolese (Congo)",
  "Costa Rican (Costa Rica)",
  "Croatian (Croatia)",
  "Cuban (Cuba)",
  "Cypriot (Cyprus)",
  "Czech (Czechia)",
  "Danish (Denmark)",
  "Djiboutian (Djibouti)",
  "Dominican (Dominica)",
  "Dutch (Netherlands)",
  "East Timorese (Timor-Leste)",
  "Ecuadorian (Ecuador)",
  "Egyptian (Egypt)",
  "Emirati (United Arab Emirates)",
  "Equatorial Guinean (Equatorial Guinea)",
  "Eritrean (Eritrea)",
  "Estonian (Estonia)",
  "Ethiopian (Ethiopia)",
  "Fijian (Fiji)",
  "Filipino (Philippines)",
  "Finnish (Finland)",
  "French (France)",
  "Gabonese (Gabon)",
  "Gambian (Gambia)",
  "Georgian (Georgia)",
  "German (Germany)",
  "Ghanaian (Ghana)",
  "Greek (Greece)",
  "Grenadian (Grenada)",
  "Guatemalan (Guatemala)",
  "Guinean (Guinea)",
  "Guyanese (Guyana)",
  "Haitian (Haiti)",
  "Honduran (Honduras)",
  "Hungarian (Hungary)",
  "Icelandic (Iceland)",
  "Indian (India)",
  "Indonesian (Indonesia)",
  "Iranian (Iran)",
  "Iraqi (Iraq)",
  "Irish (Ireland)",
  "Israeli (Israel)",
  "Italian (Italy)",
  "Ivorian (Ivory Coast)",
  "Jamaican (Jamaica)",
  "Japanese (Japan)",
  "Jordanian (Jordan)",
  "Kazakh (Kazakhstan)",
  "Kenyan (Kenya)",
  "Korean (South Korea)",
  "Kuwaiti (Kuwait)",
  "Kyrgyz (Kyrgyzstan)",
  "Lao (Laos)",
  "Latvian (Latvia)",
  "Lebanese (Lebanon)",
  "Liberian (Liberia)",
  "Libyan (Libya)",
  "Liechtensteiner (Liechtenstein)",
  "Lithuanian (Lithuania)",
  "Luxembourger (Luxembourg)",
  "Macedonian (North Macedonia)",
  "Malagasy (Madagascar)",
  "Malawian (Malawi)",
  "Malaysian (Malaysia)",
  "Maldivian (Maldives)",
  "Malian (Mali)",
  "Maltese (Malta)",
  "Mauritanian (Mauritania)",
  "Mauritian (Mauritius)",
  "Mexican (Mexico)",
  "Moldovan (Moldova)",
  "Monacan (Monaco)",
  "Mongolian (Mongolia)",
  "Montenegrin (Montenegro)",
  "Moroccan (Morocco)",
  "Mozambican (Mozambique)",
  "Myanmar (Burma)",
  "Namibian (Namibia)",
  "Nepalese (Nepal)",
  "New Zealander (New Zealand)",
  "Nicaraguan (Nicaragua)",
  "Nigerian (Nigeria)",
  "Nigerien (Niger)",
  "Norwegian (Norway)",
  "Omani (Oman)",
  "Pakistani (Pakistan)",
  "Palestinian (Palestine)",
  "Panamanian (Panama)",
  "Papua New Guinean (Papua New Guinea)",
  "Paraguayan (Paraguay)",
  "Peruvian (Peru)",
  "Polish (Poland)",
  "Portuguese (Portugal)",
  "Qatari (Qatar)",
  "Romanian (Romania)",
  "Russian (Russia)",
  "Rwandan (Rwanda)",
  "Saudi (Saudi Arabia)",
  "Senegalese (Senegal)",
  "Serbian (Serbia)",
  "Singaporean (Singapore)",
  "Slovak (Slovakia)",
  "Slovenian (Slovenia)",
  "Somali (Somalia)",
  "South African (South Africa)",
  "Spanish (Spain)",
  "Sri Lankan (Sri Lanka)",
  "Sudanese (Sudan)",
  "Surinamese (Suriname)",
  "Swedish (Sweden)",
  "Swiss (Switzerland)",
  "Syrian (Syria)",
  "Taiwanese (Taiwan)",
  "Tajik (Tajikistan)",
  "Tanzanian (Tanzania)",
  "Thai (Thailand)",
  "Togolese (Togo)",
  "Tunisian (Tunisia)",
  "Turkish (Turkey)",
  "Turkmen (Turkmenistan)",
  "Ugandan (Uganda)",
  "Ukrainian (Ukraine)",
  "Uruguayan (Uruguay)",
  "Uzbek (Uzbekistan)",
  "Venezuelan (Venezuela)",
  "Vietnamese (Vietnam)",
  "Yemeni (Yemen)",
  "Zambian (Zambia)",
  "Zimbabwean (Zimbabwe)",
  "Other"
];
const GUARDIAN_RELATIONS = ["Father", "Mother", "Son", "Daughter", "Husband", "Wife", "Brother", "Sister", "Guardian", "Self", "Other"];
const EMERGENCY_RELATIONSHIPS = GUARDIAN_RELATIONS;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");
  const [showPrintCard, setShowPrintCard] = useState(false);

  // ─── PATIENT SEARCH MODAL STATE ─────────────────────────────────────────────
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState({
    uhid: "",
    patientName: "",
    mobile: "",
    dob: "",
    email: "",
    company: "",
    identityNo: "",
    address: "",
    phone: ""
  });
  const [modalPatients, setModalPatients] = useState<PatientData[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);

  const fetchModalPatients = useCallback(async () => {
    setIsModalLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(modalFilters).filter(([_, v]) => v.trim() !== "")
      );
      const data = await getPatients({ ...activeFilters, limit: 10, page: modalPage });
      setModalPatients(data.patients || []);
      setModalTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      setModalPatients([]);
      setModalTotalPages(1);
    } finally {
      setIsModalLoading(false);
    }
  }, [modalFilters, modalPage]);

  useEffect(() => {
    if (isPatientSearchModalOpen) {
      const timer = setTimeout(() => {
        fetchModalPatients();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isPatientSearchModalOpen, modalFilters, modalPage, fetchModalPatients]);

  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  const today = format(new Date(), "yyyy-MM-dd");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const isAdmin = useIsAdmin();

  const [activeTab, setActiveTab] = useState("general");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const printLabelRef = useRef<HTMLDivElement>(null);
  const handlePrintLabel = useReactToPrint({
    contentRef: printLabelRef,
    documentTitle: "RegistrationLable"
  });

  const printCardRef = useRef<HTMLDivElement>(null);
  const handlePrintCard = useReactToPrint({
    contentRef: printCardRef,
    documentTitle: "RegistrationCard"
  });

  const printDetailsRef = useRef<HTMLDivElement>(null);
  const handlePrintDetails = useReactToPrint({
    contentRef: printDetailsRef,
    documentTitle: "PatientRegistrationDetails"
  });

  const { activeBranch } = useBranch();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      registrationType: "New Registration",
      title: "Mr.",
      firstName: "",
      gender: "Male",
      maritalStatus: "Single",
      guardianRelation: "Father",
      country: "India",
      state: "Delhi",
      nationality: "Indian",
      regDate: today,
    },
  });

  const [isEmergencyNameManuallyEdited, setIsEmergencyNameManuallyEdited] = useState(false);
  const [isEmergencyRelationManuallyEdited, setIsEmergencyRelationManuallyEdited] = useState(false);

  const watchedGuardianName = watch("guardianName");
  const watchedGuardianRelation = watch("guardianRelation");

  useEffect(() => {
    if (!isEmergencyNameManuallyEdited) {
      setValue("emergencyName", watchedGuardianName || "", { shouldValidate: false });
    }
  }, [watchedGuardianName, isEmergencyNameManuallyEdited, setValue]);

  useEffect(() => {
    if (!isEmergencyRelationManuallyEdited) {
      if (watchedGuardianRelation) {
        setValue("emergencyRelationship", watchedGuardianRelation, { shouldValidate: false });
      }
    }
  }, [watchedGuardianRelation, isEmergencyRelationManuallyEdited, setValue]);

  useEffect(() => {
    if (editId) {
      if (!isAdmin) {
        toast.error("Access Denied", "You do not have permission to edit patients.");
        navigate("/registration/demographics");
        return;
      }
      
      setIsEditing(true);
      const loadPatient = async () => {
        try {
          const patient = await getPatientById(editId);
          let formattedDob = "";
          if (patient.dob) {
            formattedDob = format(new Date(patient.dob), "yyyy-MM-dd");
          }
          let formattedRegDate = today;
          if (patient.regDate) {
            formattedRegDate = format(new Date(patient.regDate), "yyyy-MM-dd");
          }

          if (patient.photoUrl) {
            setPhotoPreview(patient.photoUrl);
          } else {
            setPhotoPreview(null);
          }

          reset({
            registrationType: patient.registrationType || "New Registration",
            uhid: patient.uhid || "",
            title: patient.title || "Mr.",
            firstName: patient.firstName || "",
            middleName: patient.middleName || "",
            lastName: patient.lastName || "",
            gender: patient.gender || "Male",
            maritalStatus: patient.maritalStatus || "Single",
            guardianName: patient.guardianName || "",
            guardianRelation: patient.guardianRelation || "Father",
            dob: formattedDob,
            age: patient.age ? `${patient.age} Y` : "",
            mobile: patient.mobile || "",
            address: patient.address || "",
            country: patient.country || "India",
            state: patient.state || "Delhi",
            districtCity: patient.districtCity || "",
            area: patient.area || "",
            pinCode: patient.pinCode || "",
            altPhone: patient.altPhone || "",
            email: patient.email || "",
            emergencyName: patient.emergencyName || "",
            emergencyRelationship: patient.emergencyRelationship || "",
            emergencyContact: patient.emergencyContact || "",
            nationality: patient.nationality || "Indian",
            aadhaarCard: patient.aadhaarCard ? patient.aadhaarCard.replace(/(\d{4})(\d{4})?(\d{4})?/, (_, p1, p2, p3) => {
              let parts = [p1];
              if (p2) parts.push(p2);
              if (p3) parts.push(p3);
              return parts.join(" ");
            }) : "",
            panNo: patient.panNo || "",
            regDate: formattedRegDate,
          });

          const hasCustomEmergencyName = Boolean(
            patient.emergencyName && patient.emergencyName !== patient.guardianName
          );
          const hasCustomEmergencyRelation = Boolean(
            patient.emergencyRelationship && patient.emergencyRelationship !== patient.guardianRelation
          );
          setIsEmergencyNameManuallyEdited(hasCustomEmergencyName);
          setIsEmergencyRelationManuallyEdited(hasCustomEmergencyRelation);
        } catch (err: any) {
          toast.error(
            "Failed to Load Patient",
            err.message || "Could not retrieve patient data."
          );
        }
      };
      loadPatient();
    }
  }, [editId, reset, today, toast]);

  // Auto-calculate age from DOB (Y, M, D)
  const handleDobChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) {
        setValue("age", "");
        return;
      }
      const dob = new Date(val);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        let days = today.getDate() - dob.getDate();

        if (days < 0) {
          months -= 1;
          const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
          days += prevMonthLastDay;
        }
        if (months < 0) {
          years -= 1;
          months += 12;
        }

        if (years < 0) {
          setValue("age", "0 Y");
        } else if (years === 0 && months === 0) {
          setValue("age", `${days} D`);
        } else if (years === 0) {
          setValue("age", `${months} M ${days} D`);
        } else {
          setValue("age", months > 0 ? `${years} Y ${months} M` : `${years} Y`);
        }
      }
    },
    [setValue]
  );

  // Auto-estimate DOB when age is entered manually
  const handleAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      const numMatch = val.match(/^(\d+)/);
      if (numMatch) {
        const years = parseInt(numMatch[1], 10);
        if (!isNaN(years) && years >= 0 && years <= 125) {
          const today = new Date();
          const estimatedDob = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
          const formattedDob = format(estimatedDob, "yyyy-MM-dd");
          setValue("dob", formattedDob, { shouldValidate: true });
        }
      }
    },
    [setValue]
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const onSubmit = async (data: RegistrationForm) => {
    setIsSaving(true);
    try {
      let parsedAge: number | undefined = undefined;
      if (data.age) {
        const numMatch = String(data.age).match(/^(\d+)/);
        if (numMatch) parsedAge = parseInt(numMatch[1], 10);
      }

      const sanitizeNumber = (val?: string) => (val ? val.replace(/[\s-]/g, "") : "");

      const payload: any = {
        ...data,
        hcf: (data as any).hcf || activeBranch,
        payerType: "direct",
        payer: "CASH",
        status: "Active",
        photoUrl: photoPreview || null,
        aadhaarCard: sanitizeNumber(data.aadhaarCard),
        mobile: sanitizeNumber(data.mobile),
        altPhone: sanitizeNumber(data.altPhone),
        emergencyContact: sanitizeNumber(data.emergencyContact),
        pinCode: sanitizeNumber(data.pinCode),
        panNo: data.panNo ? data.panNo.trim().toUpperCase() : "",
        age: parsedAge,
        dob: data.dob ? new Date(data.dob).toISOString() : null,
        regDate: data.regDate ? new Date(data.regDate).toISOString() : new Date().toISOString(),
      };

      if (isEditing && editId) {
        await updatePatient(editId, payload);
        toast.success(
          "Patient Updated Successfully!",
          "Patient record has been updated successfully."
        );
        setIsEditing(false);
        navigate("/registration/demographics");
      } else {
        const savedPatient = await createPatient(payload);
        toast.success(
          "Patient Registered Successfully!",
          `Patient record has been saved. Assigned UHID: ${savedPatient.uhid}`
        );
      }

      // Reset form fields to clean state for both update and save
      setIsEmergencyNameManuallyEdited(false);
      setIsEmergencyRelationManuallyEdited(false);
      setPhotoPreview(null);
      reset({
        registrationType: "New Registration",
        uhid: "",
        title: "Mr.",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "Male",
        maritalStatus: "Single",
        guardianName: "",
        guardianRelation: "Father",
        dob: "",
        age: "",
        mobile: "",
        address: "",
        country: "India",
        state: "Delhi",
        districtCity: "",
        area: "",
        pinCode: "",
        altPhone: "",
        email: "",
        emergencyName: "",
        emergencyRelationship: "Father",
        emergencyContact: "",
        nationality: "Indian",
        aadhaarCard: "",
        panNo: "",
        regDate: today,
      });

      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      toast.error(
        isEditing ? "Update Failed" : "Registration Failed",
        err.message || "Unable to save patient record. Please verify fields and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCountryName = watch("country") || "India";
  const selectedStateName = watch("state");

  const countries = Country.getAllCountries();
  const selectedCountry = countries.find(c => c.name === selectedCountryName) || countries.find(c => c.isoCode === "IN");
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : STATES.map(s => ({ name: s, isoCode: s }));
  const selectedState = states.find(s => s.name === selectedStateName);
  const cities = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* ── Top Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-3 md:px-5 py-2 bg-[#dceefb] border-b border-[#a9d4f5] flex-shrink-0 overflow-x-auto">
        {/* Registration Type */}
        <div className="flex items-center gap-2 shrink-0">
          <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Registration Type</Label>
          <Controller
            control={control}
            name="registrationType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-8.5 w-36 md:w-44 text-xs sm:text-sm font-bold text-slate-900 bg-white border-slate-300 shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Registration">New Registration</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Organ Donor">Organ Donor</SelectItem>
                  <SelectItem value="MHC">MHC</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="Diagnostic Only">Diagnostic Only</SelectItem>
                  <SelectItem value="New Born">New Born</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* UHID */}
        <div className="flex items-center gap-2 shrink-0">
          <Label 
            className="text-xs text-blue-800 font-extrabold underline cursor-pointer hover:text-blue-900"
            onClick={() => setIsPatientSearchModalOpen(true)}
          >
            UHID
          </Label>
          <Input
            {...register("uhid")}
            placeholder="Auto-generated"
            className="h-8.5 w-36 text-xs sm:text-sm font-bold bg-white text-slate-900 border-slate-300 shadow-2xs"
            readOnly
          />
        </div>

        {/* Active Branch Badge */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-bold text-blue-700 ml-2 max-w-[150px] lg:max-w-[250px]"
          title={`Branch: ${activeBranch}`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Branch: <strong className="font-extrabold text-blue-900">{activeBranch}</strong></span>
        </div>

        <div className="flex-1" />

        {/* Status badge */}
        {isDirty && (
          <Badge variant="warning" className="text-[10px]">Unsaved Changes</Badge>
        )}

        {/* Action Buttons */}
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs gap-1.5 bg-[#1b3d5b] hover:bg-[#132d44] text-white font-bold shadow-xs transition-all border-none"
          onClick={() => {
            window.location.href = "/registration/demographics";
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
        <Button
          type="button"
          variant="success"
          size="sm"
          className="h-8 text-xs gap-1.5 min-w-[70px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all"
          disabled={isSaving}
          onClick={handleSubmit(onSubmit, (formErrors) => {
            console.warn("Validation errors:", formErrors);
            const errorKeys = Object.keys(formErrors);
            if (errorKeys.length > 0) {
              const missingLabels = errorKeys.map((k) => FIELD_LABELS[k] || k);
              const firstKey = errorKeys[0];
              const firstMsg = formErrors[firstKey as keyof typeof formErrors]?.message;

              let errorDesc = `Please fill out required field(s): ${missingLabels.join(", ")}`;
              if (firstMsg && firstMsg !== "Required" && !firstMsg.toLowerCase().includes("required")) {
                errorDesc = `${FIELD_LABELS[firstKey] || firstKey}: ${firstMsg}`;
              }

              toast.error(
                "Missing Required Field" + (errorKeys.length > 1 ? "s" : ""),
                errorDesc
              );
            }
          })}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {isEditing ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> {isEditing ? "Update" : "Save"}
            </>
          )}
        </Button>

        <Button
          type="button"
          size="sm"
          className="h-8 text-xs gap-1.5 bg-[#2b5f88] hover:bg-[#1f496a] text-white font-bold shadow-xs transition-all border-none"
          onClick={() => {
            if (!editId) {
              toast.error("Please Select Patient !");
              return;
            }
            handlePrintDetails();
          }}
        >
          <Printer className="h-3.5 w-3.5" />
          Print Patient Details
        </Button>


      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50/60">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-3">

            {/* ── Section 1: Top Info Grid ── */}
            <div className="grid grid-cols-12 gap-3">

              {/* Patient Photo, Title & Reg Date */}
              <div className="col-span-12 md:col-span-3 lg:col-span-2 xl:col-span-2 bg-white rounded-xl border border-[#a9d4f5] p-3 shadow-xs flex flex-col items-center gap-2.5 overflow-hidden">
                {/* Title / Salutation Dropdown */}
                <div className="w-full">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-red-500 font-bold text-sm leading-none">*</span>
                    <Label className="text-xs font-bold text-slate-700">Title</Label>
                  </div>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (val === "Mr." || val === "Master" || val === "Baba") {
                            if (!watch("gender")) setValue("gender", "Male", { shouldValidate: true });
                          } else if (val === "Mrs." || val === "Ms.") {
                            if (!watch("gender")) setValue("gender", "Female", { shouldValidate: true });
                          }
                        }}
                      >
                        <SelectTrigger className={cn("h-8.5 w-full text-xs sm:text-sm font-semibold text-slate-900 bg-[#fffde6] border-slate-300 shadow-2xs", errors.title && "border-red-400")}>
                          <SelectValue placeholder="[Select Title]" />
                        </SelectTrigger>
                        <SelectContent>
                          {TITLES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.title && (
                    <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3 shrink-0" />{errors.title.message}
                    </span>
                  )}
                </div>

                {/* Patient Photo Box */}
                <div 
                  className="relative w-full max-w-[130px] aspect-[4/4.5] rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-100/90 flex items-center justify-center group shadow-inner cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Patient"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-slate-400">
                      <div className="w-14 h-14 rounded-full bg-slate-200/90 flex items-center justify-center mb-1 group-hover:bg-primary/10 transition-colors">
                        <User className="h-9 w-9 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium group-hover:text-primary transition-colors">Upload Photo</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>

                {/* Upload & Remove Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="text-xs h-7.5 gap-1 text-primary hover:text-primary hover:bg-primary/5 border-primary/40 font-bold"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="text-xs h-7.5 gap-1 text-slate-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-bold"
                    onClick={handlePhotoRemove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>

                <Separator className="w-full my-0.5" />

                {/* Registration Date below photo */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-bold text-slate-700">Reg. Date</Label>
                  </div>
                  <Input
                    {...register("regDate")}
                    type="date"
                    className={cn("h-8.5 text-xs sm:text-sm bg-[#fffde6] text-center font-bold text-slate-900 cursor-pointer border-slate-300 hover:bg-amber-50/70 transition-colors shadow-2xs", errors.regDate && "border-red-400")}
                    onClick={(e) => {
                      try { e.currentTarget.showPicker(); } catch {}
                    }}
                  />
                  {errors.regDate && (
                    <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3 shrink-0" />{errors.regDate.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-span-12 md:col-span-9 lg:col-span-4 xl:col-span-4 bg-white rounded-xl border border-[#a9d4f5] p-4 shadow-xs">
                <SectionHeader icon={User} title="Personal Information" />

                {/* First Name */}
                <FormField label="First Name" required className="mb-3" error={errors.firstName?.message}>
                  <Input
                    {...register("firstName")}
                    className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#fffde6] border-slate-300 focus:bg-white shadow-2xs", errors.firstName && "border-red-400")}
                    placeholder="First name"
                    autoFocus
                  />
                </FormField>

                {/* Middle Name + Last Name */}
                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="Middle Name" error={errors.middleName?.message}>
                    <Input
                      {...register("middleName")}
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.middleName && "border-red-400")}
                      placeholder="Middle name"
                    />
                  </FormField>
                  <FormField label="Last Name" error={errors.lastName?.message}>
                    <Input
                      {...register("lastName")}
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.lastName && "border-red-400")}
                      placeholder="Last name"
                    />
                  </FormField>
                </FieldRow>

                {/* Gender + Marital Status */}
                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="Gender" required error={errors.gender?.message}>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#fffde6] border-slate-300 shadow-2xs", errors.gender && "border-red-400")}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Marital Status">
                    <Controller
                      control={control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {MARITAL_STATUS.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                </FieldRow>

                {/* DOB + Age */}
                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="DOB" required error={errors.dob?.message}>
                    <Input
                      {...register("dob")}
                      type="date"
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer bg-[#fffde6] border-slate-300 focus:bg-white hover:bg-amber-50/70 transition-colors shadow-2xs", errors.dob && "border-red-400")}
                      onChange={(e) => {
                        register("dob").onChange(e);
                        handleDobChange(e);
                      }}
                      onClick={(e) => {
                        try { e.currentTarget.showPicker(); } catch {}
                      }}
                    />
                  </FormField>
                  <FormField label="Age (Y-M-D)">
                    <Input
                      {...register("age")}
                      className="h-8.5 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 border-slate-300 shadow-2xs"
                      placeholder="Auto"
                      onChange={(e) => {
                        register("age").onChange(e);
                        handleAgeChange(e);
                      }}
                    />
                  </FormField>
                </FieldRow>

                {/* Guardian Relation + Guardian Name */}
                <FieldRow className="grid-cols-3 mb-3">
                  <FormField label="Attendant Relation" className="col-span-1">
                    <Controller
                      control={control}
                      name="guardianRelation"
                      render={({ field }) => (
                        <Select value={field.value ?? "Father"} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs">
                            <SelectValue placeholder="Father" />
                          </SelectTrigger>
                          <SelectContent>
                            {GUARDIAN_RELATIONS.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Attendant Name" required className="col-span-2" error={errors.guardianName?.message}>
                    <Input
                      {...register("guardianName")}
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#fffde6] border-slate-300 focus:bg-white shadow-2xs", errors.guardianName && "border-red-400")}
                      placeholder="Attendant name"
                    />
                  </FormField>
                </FieldRow>

                {/* Email & Nationality */}
                <FieldRow className="grid-cols-2">
                  <FormField label="Email" error={errors.email?.message}>
                    <Input
                      {...register("email")}
                      type="email"
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.email && "border-red-400")}
                      placeholder="email@example.com"
                    />
                  </FormField>
                  <FormField label="Nationality" required error={errors.nationality?.message}>
                    <Controller
                      control={control}
                      name="nationality"
                      render={({ field }) => (
                        <SearchSelect
                          required
                          dropUp
                          value={field.value}
                          onChange={field.onChange}
                          options={NATIONALITIES}
                          placeholder="Select Nationality"
                        />
                      )}
                    />
                  </FormField>
                </FieldRow>
              </div>

              {/* Contact Details */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 bg-white rounded-xl border border-[#a9d4f5] p-4 shadow-xs">
                <SectionHeader icon={Phone} title="Contact Details" />

                <FormField label="Mobile" required className="mb-3" error={errors.mobile?.message}>
                  <Input
                    {...register("mobile")}
                    type="tel"
                    className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#fffde6] border-slate-300 focus:bg-white shadow-2xs", errors.mobile && "border-red-400")}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </FormField>

                <FormField label="Address" required className="mb-3" error={errors.address?.message}>
                  <Textarea
                    {...register("address")}
                    className={cn("text-xs sm:text-sm font-semibold text-slate-900 bg-[#fffde6] border-slate-300 focus:bg-white min-h-[60px] resize-none shadow-2xs", errors.address && "border-red-400")}
                    placeholder="House no., Street, Locality..."
                    rows={2}
                  />
                </FormField>

                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="Country" required error={errors.country?.message}>
                    <Controller
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <SearchSelect
                          required
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            setValue("state", "");
                            setValue("districtCity", "");
                          }}
                          options={countries.map((c) => c.name)}
                          placeholder="Select Country"
                        />
                      )}
                    />
                  </FormField>
                  <FormField label="State" required error={errors.state?.message}>
                    <Controller
                      control={control}
                      name="state"
                      render={({ field }) => (
                        <SearchSelect
                          required
                          value={field.value ?? ""}
                          onChange={(val) => {
                            field.onChange(val);
                            setValue("districtCity", "");
                          }}
                          options={states.map((s) => s.name)}
                          placeholder="Select State"
                        />
                      )}
                    />
                  </FormField>
                </FieldRow>

                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="District / City" error={errors.districtCity?.message}>
                    {cities.length > 0 ? (
                      <Controller
                        control={control}
                        name="districtCity"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((c) => (
                                <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    ) : (
                      <Input
                        {...register("districtCity")}
                        className="h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs"
                        placeholder="City"
                      />
                    )}
                  </FormField>
                  <FormField label="Area" error={errors.area?.message}>
                    <Input
                      {...register("area")}
                      className="h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs"
                      placeholder="Area / Locality"
                    />
                  </FormField>
                </FieldRow>

                <FieldRow className="grid-cols-2">
                  <FormField label="Pin Code" error={errors.pinCode?.message}>
                    <Input
                      {...register("pinCode")}
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.pinCode && "border-red-400")}
                      placeholder="6-digit pin"
                      maxLength={6}
                    />
                  </FormField>
                  <FormField label="Alt. Phone" error={errors.altPhone?.message}>
                    <Input
                      {...register("altPhone")}
                      type="tel"
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.altPhone && "border-red-400")}
                      placeholder="Alternate number"
                    />
                  </FormField>
                </FieldRow>
              </div>

              {/* Right column: Emergency */}
              <div className="col-span-12 lg:col-span-3 space-y-3">
                {/* Emergency Contact */}
                <div className="bg-white rounded-xl border border-[#a9d4f5] p-4 shadow-xs overflow-hidden">
                  <SectionHeader icon={AlertCircle} title="Emergency Contact" />

                  <FormField label="Name" className="mb-3" error={errors.emergencyName?.message}>
                    <Input
                      {...register("emergencyName", {
                        onChange: (e) => {
                          const val = e.target.value;
                          if (val && val.trim() !== "") {
                            setIsEmergencyNameManuallyEdited(true);
                          } else {
                            setIsEmergencyNameManuallyEdited(false);
                            setValue("emergencyName", watchedGuardianName || "", { shouldValidate: false });
                          }
                        },
                      })}
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.emergencyName && "border-red-400")}
                      placeholder="Emergency contact name"
                    />
                  </FormField>
                  <FormField label="Relationship" className="mb-3">
                    <Controller
                      control={control}
                      name="emergencyRelationship"
                      render={({ field }) => (
                        <Select 
                          value={field.value ?? ""} 
                          onValueChange={(val) => {
                            setIsEmergencyRelationManuallyEdited(true);
                            field.onChange(val);
                          }}
                        >
                          <SelectTrigger className="h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {EMERGENCY_RELATIONSHIPS.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Contact No." error={errors.emergencyContact?.message}>
                    <Input
                      {...register("emergencyContact")}
                      type="tel"
                      className={cn("h-8.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white border-slate-300 shadow-2xs", errors.emergencyContact && "border-red-400")}
                      placeholder="Emergency number"
                    />
                  </FormField>
                </div>
              </div>
            </div>


          </div>
        </form>
      </div>
      <ImportPatientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* ─── PATIENT SEARCH MODAL ─────────────────────────────────────────── */}
      {isPatientSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-10">
          <div className="w-full max-w-[75vw] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-[#cee6f8] rounded-t-xl shrink-0">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-700" />
                Patient Details
              </span>
              <Button size="sm" onClick={() => setIsPatientSearchModalOpen(false)} className="h-6 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded">
                Close
              </Button>
            </div>

            <div className="p-3 shrink-0 border-b bg-white text-xs">
              {/* Top Filters Row */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-700">Facility</span>
                  <Select defaultValue="CMK">
                    <SelectTrigger className="h-6 w-64 text-[11px] bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CMK">CMK HEALTHCARE PVT. LTD.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-700">Entry Site</span>
                  <Select defaultValue="ALL">
                    <SelectTrigger className="h-6 w-32 text-[11px] bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">-- ALL --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1" />
                <Button size="sm" variant="outline" className="h-6 px-4 text-[11px] font-bold border-slate-300 cursor-pointer hover:bg-slate-50" onClick={() => { setModalPage(1); fetchModalPatients(); }}>Filter</Button>
                <Button size="sm" variant="outline" className="h-6 px-4 text-[11px] font-bold border-slate-300 cursor-pointer hover:bg-slate-50" onClick={() => { setModalPage(1); setModalFilters({ uhid: "", patientName: "", mobile: "", dob: "", email: "", company: "", identityNo: "", address: "", phone: "" }); }}>Clear Filter</Button>
              </div>

              {/* Radio Group Row */}
              <div className="flex items-center gap-8 mb-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="searchType" defaultChecked className="accent-blue-600 w-3 h-3" />
                    <span className="text-[11px] font-semibold">Search on Criteria</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="searchType" className="accent-blue-600 w-3 h-3" />
                    <span className="text-[11px] font-semibold">Search All (Date Range)</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="recordType" defaultChecked className="accent-blue-600 w-3 h-3" />
                    <span className="text-[11px] font-semibold">Registration</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="recordType" className="accent-blue-600 w-3 h-3" />
                    <span className="text-[11px] font-semibold">Encounter</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="recordType" className="accent-blue-600 w-3 h-3" />
                    <span className="text-[11px] font-semibold">Discharge</span>
                  </label>
                </div>
              </div>

              {/* Grid of Inputs */}
              <div className="grid grid-cols-4 gap-x-6 gap-y-1.5">
                {[
                  { label: "UHID", key: "uhid", placeholder: "" },
                  { label: "IP No.", placeholder: "" },
                  { label: "Patient Name", key: "patientName", placeholder: "" },
                  { label: "Date of Birth", key: "dob", placeholder: "YYYY-MM-DD" },
                  { label: "Phone", key: "phone", placeholder: "" },
                  { label: "Mobile #", key: "mobile", placeholder: "" },
                  { label: "Bed No", placeholder: "" },
                  { label: "E-Mail Id", key: "email", placeholder: "" },
                  { label: "Company", key: "company", placeholder: "" },
                  { label: "Passport No", placeholder: "" },
                  { label: "Identity No", key: "identityNo", placeholder: "Aadhaar/PAN" },
                  { label: "Old Reg No", placeholder: "" },
                  { label: "Mother Name", placeholder: "" },
                  { label: "Father Name", placeholder: "" },
                  { label: "Privilege Card", placeholder: "" },
                  { label: "Address", key: "address", placeholder: "" },
                ].map((field, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-24 text-[10px] text-slate-700 font-medium">{field.label}</span>
                    <Input 
                      className="h-6 flex-1 text-[11px] px-1.5 border-slate-300 rounded-sm" 
                      value={field.key ? modalFilters[field.key as keyof typeof modalFilters] : ""} 
                      onChange={(e) => {
                        if (field.key) {
                          setModalFilters(prev => ({ ...prev, [field.key as keyof typeof modalFilters]: e.target.value }));
                        }
                      }}
                      placeholder={field.placeholder}
                      disabled={!field.key}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white">
              <table className="w-full text-left text-[10px] whitespace-nowrap">
                <thead className="bg-[#cee6f8] border-b border-blue-200 text-slate-800 font-semibold sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-center w-12">Select</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">UHID</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Patient Name</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Gender/Age</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Registration Date</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Company</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Mobile No.</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">DOB</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Patient Address</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Old Reg No</th>
                    <th className="px-2 py-1.5 text-blue-800">Father Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isModalLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse border-b border-slate-50 last:border-0 bg-white">
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-8 mx-auto" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-32" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-40" /></td>
                        <td className="px-2 py-2 border-r border-slate-100"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                        <td className="px-2 py-2"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                      </tr>
                    ))
                  ) : modalPatients.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        No patients found matching your search.
                      </td>
                    </tr>
                  ) : (
                    modalPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-2 py-1.5 border-r border-slate-100 text-center">
                          <button 
                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                            onClick={() => {
                              setIsPatientSearchModalOpen(false);
                              navigate(`/registration/demographics?edit=${p.id}`);
                            }}
                          >
                            Select
                          </button>
                        </td>
                        <td className="px-2 py-1.5 border-r border-slate-100 font-mono text-slate-700 whitespace-nowrap" title={p.uhid}>{p.uhid}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100 font-semibold">{p.firstName} {p.lastName}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100">{p.gender}/{p.age ? `${p.age} Yrs` : "-"}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100">{p.regDate ? format(new Date(p.regDate), "dd/MM/yyyy h:mm a") : "-"}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100">{p.payer || "CASH"}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100">{p.mobile}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100">{p.dob ? format(new Date(p.dob), "dd/MM/yyyy") : "-"}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100 truncate max-w-[150px]">{p.address}</td>
                        <td className="px-2 py-1.5 border-r border-slate-100">-</td>
                        <td className="px-2 py-1.5">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 rounded-b-xl">
              <span className="text-[11px] text-slate-600 font-semibold pl-2">
                Page {modalPage} of {modalTotalPages}
              </span>
              <div className="flex gap-2 pr-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[11px] bg-white cursor-pointer hover:bg-slate-100" 
                  disabled={modalPage === 1}
                  onClick={() => setModalPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[11px] bg-white cursor-pointer hover:bg-slate-100" 
                  disabled={modalPage >= modalTotalPages || modalTotalPages === 0}
                  onClick={() => setModalPage(p => Math.min(modalTotalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Component - Label */}
      <div className="hidden">
        <RegistrationLabelPrint 
          ref={printLabelRef} 
          patient={{
            name: watch("firstName") ? `${watch("firstName")} ${watch("lastName") || ""}`.trim() : "",
            uhid: watch("uhid") || "",
            dob: watch("dob")
          }} 
        />
      </div>

      {/* Hidden Printable Component - Card */}
      <div className="hidden">
        <RegistrationCardPrint 
          ref={printCardRef} 
          patient={{
            name: watch("firstName") ? `${watch("firstName")} ${watch("lastName") || ""}`.trim() : "",
            uhid: watch("uhid") || "",
            age: watch("age"),
            gender: watch("gender"),
            contact: watch("mobile")
          }} 
        />
      </div>

      {/* Hidden Printable Component - Reg Details */}
      <div className="hidden">
        <PatientRegistrationDetailsPrint 
          ref={printDetailsRef} 
          patient={{
            uhid: watch("uhid") || "",
            regDate: watch("regDate") || new Date().toISOString(),
            name: watch("firstName") ? `${watch("title") || ""} ${watch("firstName")} ${watch("lastName") || ""}`.trim() : "",
            guardianName: watch("guardianName") || "",
            genderAge: `${watch("gender") || ""} / ${watch("age") ? `${watch("age")} Yr` : ""}`.trim(),
            maritalStatus: watch("maritalStatus") || "",
            religion: "",
            aadhaarCard: watch("aadhaarCard") || "",
            nationality: watch("nationality") || "",
            passportNo: "",
            address: watch("address") || "",
            cityStateZip: `${watch("districtCity") || ""} - ${watch("pinCode") || ""}`.trim(),
            city: watch("districtCity") || "",
            pinCode: watch("pinCode") || "",
            mobile: watch("mobile") || "",
            altPhone: watch("altPhone") || "",
            emergencyName: watch("emergencyName") || "",
            emergencyContact: watch("emergencyContact") || "",
            sponsor: "",
            referringDoctor: ""
          }} 
        />
      </div>

    </div>
  );
}
