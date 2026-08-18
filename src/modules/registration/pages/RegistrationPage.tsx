import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save, Printer, Plus, Copy, Search, Upload, Trash2, Calendar,
  User, Phone, AlertCircle, Shield, CreditCard,
  Users, FileText, Tag, ChevronDown, Sliders, Loader2, FileSpreadsheet, Check
} from "lucide-react";
import { format } from "date-fns";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatient, getPatientById, updatePatient, getPatients, PatientData } from "@/api/patientApi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
}

function SearchSelect({ value, onChange, options, placeholder = "Select..." }: SearchSelectProps) {
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
        className="flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-2" />
      </div>

      {/* Options overlay */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-md">
          <div className="sticky top-0 bg-white pb-1 z-10">
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-7 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-blue-400"
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
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs outline-none hover:bg-slate-100 hover:text-slate-900"
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
  guardianName: "Guardian Name",
  guardianRelation: "Guardian Relation",
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
  guardianName: z.string().min(1, "Guardian Name is required").regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed in Guardian Name"),
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
  // Payer
  payerType: z.string(),
  payer: z.string().optional(),
  sponsor: z.string().optional(),
  // Referral
  provider: z.string().optional(),
  leadSource: z.string().optional(),
  referredType: z.string().optional(),
  referredBy: z.string().optional(),
  hcf: z.string().optional(),
  status: z.string(),
  remarks: z.string().optional(),
  // Other
  religion: z.string().optional(),
  occupation: z.string().optional(),
  isVip: z.boolean(),
  isAnimation: z.boolean(),
  nameMasking: z.boolean(),
  handleWithCare: z.boolean(),
  sendPromoSms: z.boolean(),
  sendPromoEmail: z.boolean(),
  // Custom Fields
  voterId: z.string().optional(),
  covidStatus: z.string().optional(),
  visaNo: z.string().optional(),
  visaExpiry: z.string().optional(),
  passportNo: z.string().optional(),
  passportExpiry: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

// ─── Helper Components ─────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = "text-primary" }: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-md mb-3",
      "bg-primary/5 border-l-4 border-primary text-primary"
    )}>
      <Icon className={cn("h-3.5 w-3.5", color)} />
      {title}
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
      <Label className={cn("text-[11px] font-medium text-slate-500", required && "after:content-['_*'] after:text-red-500")}>
        {label}
      </Label>
      {children}
      {error && (
        <span className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
          <AlertCircle className="h-3 w-3" />{error}
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
const GUARDIAN_RELATIONS = ["S/O", "D/O", "W/O", "C/O", "Father", "Mother", "Husband", "Wife", "Guardian", "Self", "Other"];
const EMERGENCY_RELATIONSHIPS = [
  "Aunty",
  "Brother",
  "Brother In Law",
  "Cousin",
  "Daughter",
  "Daughter In Law",
  "Father",
  "Father In Law",
  "Friend",
  "GrandDaughter",
  "GrandFather",
  "GrandMother",
  "GrandSon",
  "Husband",
  "Interprator",
  "Mother",
  "Mother In Law",
  "Nephew",
  "Niece",
  "Self",
  "Sister",
  "Sister In Law",
  "Son",
  "Son In Law",
  "Uncle",
  "Wife",
  "Other",
];
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"];
const OCCUPATIONS = [
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
];
const PROVIDERS = ["Self", "Referral", "Camp", "OPD", "Emergency"];
const LEAD_SOURCES = ["Walk-in", "Online", "Phone", "Camp", "Doctor Referral", "Insurance"];
const REFERRED_TYPES = ["Doctor", "Hospital", "Patient", "Corporate", "Other"];
const STATUSES = ["Active", "Inactive", "Discharged", "Deceased"];
const HCF_OPTIONS = ["CMK Main", "CMK Branch 1", "CMK Branch 2"];

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

  const fetchModalPatients = useCallback(async () => {
    setIsModalLoading(true);
    try {
      // Clear out empty string filters
      const activeFilters = Object.fromEntries(
        Object.entries(modalFilters).filter(([_, v]) => v.trim() !== "")
      );
      const data = await getPatients({ ...activeFilters, limit: 50 });
      setModalPatients(data.patients || []);
    } catch (err) {
      console.error(err);
      setModalPatients([]);
    } finally {
      setIsModalLoading(false);
    }
  }, [modalFilters]);

  useEffect(() => {
    if (isPatientSearchModalOpen) {
      const timer = setTimeout(() => {
        fetchModalPatients();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isPatientSearchModalOpen, modalFilters, fetchModalPatients]);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  const today = format(new Date(), "yyyy-MM-dd");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("other-info");
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

  const [dynamicProviders, setDynamicProviders] = useState<string[]>(PROVIDERS);
  const [dynamicLeadSources, setDynamicLeadSources] = useState<string[]>(LEAD_SOURCES);
  const [dynamicReligions, setDynamicReligions] = useState<string[]>(RELIGIONS);
  const [dynamicOccupations, setDynamicOccupations] = useState<string[]>(OCCUPATIONS);
  const [dynamicBranches, setDynamicBranches] = useState<string[]>(HCF_OPTIONS);
  const [dynamicCompanies, setDynamicCompanies] = useState<string[]>(["TATA Consultancy Services", "Reliance Industries", "Infosys Ltd", "Wipro", "HDFC Bank"]);
  const [dynamicInsurances, setDynamicInsurances] = useState<string[]>(["Star Health Insurance", "Niva Bupa Health Insurance", "Care Health Insurance", "HDFC ERGO", "ICICI Lombard", "Aditya Birla Health", "LIC of India"]);

  useEffect(() => {
    // Load Providers
    const storedProviders = localStorage.getItem("cmk_providers");
    if (storedProviders) {
      try { setDynamicProviders(JSON.parse(storedProviders)); } catch (e) {}
    } else {
      localStorage.setItem("cmk_providers", JSON.stringify(PROVIDERS));
    }

    // Load Lead Sources
    const storedLeadSources = localStorage.getItem("cmk_lead_sources");
    if (storedLeadSources) {
      try { setDynamicLeadSources(JSON.parse(storedLeadSources)); } catch (e) {}
    } else {
      localStorage.setItem("cmk_lead_sources", JSON.stringify(LEAD_SOURCES));
    }

    // Load Religions
    const storedReligions = localStorage.getItem("cmk_religions");
    if (storedReligions) {
      try { setDynamicReligions(JSON.parse(storedReligions)); } catch (e) {}
    } else {
      localStorage.setItem("cmk_religions", JSON.stringify(RELIGIONS));
    }

    // Load Occupations
    const storedOccupations = localStorage.getItem("cmk_occupations");
    let loadedOccupations: string[] | null = null;
    if (storedOccupations) {
      try {
        loadedOccupations = JSON.parse(storedOccupations);
      } catch (e) {}
    }
    if (loadedOccupations && !loadedOccupations.includes("Astrologer")) {
      loadedOccupations = null;
    }
    if (loadedOccupations) {
      setDynamicOccupations(loadedOccupations);
    } else {
      setDynamicOccupations(OCCUPATIONS);
      localStorage.setItem("cmk_occupations", JSON.stringify(OCCUPATIONS));
    }

    // Load Branches
    const storedBranches = localStorage.getItem("cmk_hcf_branches");
    if (storedBranches) {
      try { setDynamicBranches(JSON.parse(storedBranches)); } catch (e) {}
    } else {
      localStorage.setItem("cmk_hcf_branches", JSON.stringify(HCF_OPTIONS));
    }

    // Load Corporate Companies
    const storedCompanies = localStorage.getItem("cmk_payer_companies");
    if (storedCompanies) {
      try { setDynamicCompanies(JSON.parse(storedCompanies)); } catch (e) {}
    } else {
      localStorage.setItem("cmk_payer_companies", JSON.stringify(["TATA Consultancy Services", "Reliance Industries", "Infosys Ltd", "Wipro", "HDFC Bank"]));
    }

    // Load Insurances
    const storedInsurances = localStorage.getItem("cmk_payer_insurances");
    if (storedInsurances) {
      try { setDynamicInsurances(JSON.parse(storedInsurances)); } catch (e) {}
    } else {
      localStorage.setItem("cmk_payer_insurances", JSON.stringify(["Star Health Insurance", "Niva Bupa Health Insurance", "Care Health Insurance", "HDFC ERGO", "ICICI Lombard", "Aditya Birla Health", "LIC of India"]));
    }
  }, []);

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
      guardianRelation: "S/O",
      country: "India",
      state: "Delhi",
      nationality: "Indian",
      payerType: "direct",
      payer: "CASH",
      status: "Active",
      isVip: false,
      isAnimation: false,
      nameMasking: false,
      handleWithCare: false,
      sendPromoSms: false,
      sendPromoEmail: false,
      regDate: today,
      voterId: "0",
      covidStatus: "",
      visaNo: "",
      visaExpiry: "",
      passportNo: "",
      passportExpiry: "",
    },
  });

  useEffect(() => {
    if (editId) {
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
            guardianRelation: patient.guardianRelation || "S/O",
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
            payerType: patient.payerType || "direct",
            payer: patient.payer || "CASH",
            sponsor: patient.sponsor || "",
            provider: patient.provider || "",
            leadSource: patient.leadSource || "",
            referredType: patient.referredType || "",
            referredBy: patient.referredBy || "",
            hcf: patient.hcf || "",
            status: patient.status || "Active",
            remarks: patient.remarks || "",
            religion: patient.religion || "",
            occupation: patient.occupation || "",
            isVip: !!patient.isVip,
            isAnimation: !!patient.isAnimation,
            nameMasking: !!patient.nameMasking,
            handleWithCare: !!patient.handleWithCare,
            sendPromoSms: !!patient.sendPromoSms,
            sendPromoEmail: !!patient.sendPromoEmail,
            regDate: formattedRegDate,
            voterId: patient.voterId || "0",
            covidStatus: patient.covidStatus || "",
            visaNo: patient.visaNo || "",
            visaExpiry: patient.visaExpiry ? format(new Date(patient.visaExpiry), "yyyy-MM-dd") : "",
            passportNo: patient.passportNo || "",
            passportExpiry: patient.passportExpiry ? format(new Date(patient.passportExpiry), "yyyy-MM-dd") : "",
          });
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
        guardianRelation: "S/O",
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
        emergencyRelationship: "",
        emergencyContact: "",
        nationality: "Indian",
        aadhaarCard: "",
        panNo: "",
        payerType: "direct",
        payer: "CASH",
        sponsor: "",
        provider: "",
        leadSource: "",
        referredType: "",
        referredBy: "",
        hcf: "",
        status: "Active",
        remarks: "",
        religion: "",
        occupation: "",
        isVip: false,
        isAnimation: false,
        nameMasking: false,
        handleWithCare: false,
        sendPromoSms: false,
        sendPromoEmail: false,
        regDate: today,
        voterId: "0",
        covidStatus: "",
        visaNo: "",
        visaExpiry: "",
        passportNo: "",
        passportExpiry: "",
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

  const payerType = watch("payerType");
  const selectedCountryName = watch("country") || "India";
  const selectedStateName = watch("state");

  useEffect(() => {
    if (payerType === "direct") {
      setValue("payer", "CASH");
      setValue("sponsor", "");
    } else {
      setValue("payer", "");
    }
  }, [payerType, setValue]);

  const countries = Country.getAllCountries();
  const selectedCountry = countries.find(c => c.name === selectedCountryName) || countries.find(c => c.isoCode === "IN");
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : STATES.map(s => ({ name: s, isoCode: s }));
  const selectedState = states.find(s => s.name === selectedStateName);
  const cities = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* ── Top Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-slate-200 flex-shrink-0">
        {/* Registration Type */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-slate-500 whitespace-nowrap">Registration Type</Label>
          <Controller
            control={control}
            name="registrationType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-8 w-40 text-xs">
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

        <Separator orientation="vertical" className="h-6" />

        {/* UHID */}
        <div className="flex items-center gap-2">
          <Label 
            className="text-xs text-blue-600 font-bold underline cursor-pointer"
            onClick={() => setIsPatientSearchModalOpen(true)}
          >
            UHID
          </Label>
          <Input
            {...register("uhid")}
            placeholder="Auto-generated"
            className="h-8 w-36 text-xs bg-slate-50"
            readOnly
          />
        </div>

        <div className="flex-1" />

        {/* Status badge */}
        {isDirty && (
          <Badge variant="warning" className="text-[10px]">Unsaved Changes</Badge>
        )}

        {/* Action Buttons */}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
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
          className="h-8 text-xs gap-1.5 min-w-[70px]"
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
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            if (!editId) {
              toast.error("Please Select Patient !");
              return;
            }
            handlePrintLabel();
          }}
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            if (!editId) {
              toast.error("Please Select Patient !");
              return;
            }
            handlePrintCard();
          }}
        >
          <Printer className="h-3.5 w-3.5" />
          Print Card
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            if (!editId) {
              toast.error("Please Select Patient !");
              return;
            }
            handlePrintDetails();
          }}
        >
          <FileText className="h-3.5 w-3.5" />
          Patient/Reg Details
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          Check Duplicate
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          <Search className="h-3.5 w-3.5" />
          Borrow
        </Button>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50/60">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-3">

            {/* ── Section 1: Top Info Grid ── */}
            <div className="grid grid-cols-12 gap-3">

              {/* Patient Photo, Title & Reg Date */}
              <div className="col-span-12 md:col-span-3 lg:col-span-2 xl:col-span-2 bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col items-center gap-2.5">
                {/* Title / Salutation Dropdown */}
                <div className="w-full">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-red-500 font-bold text-sm leading-none">*</span>
                    <Label className="text-[11px] font-medium text-slate-600">Title</Label>
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
                        <SelectTrigger className={cn("h-8 w-full text-xs font-medium bg-amber-50/30 border-slate-300", errors.title && "border-red-400")}>
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
                    <span className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3" />{errors.title.message}
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
                    className="text-[11px] h-7 gap-1 text-primary hover:text-primary hover:bg-primary/5 border-primary/40 font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="text-[11px] h-7 gap-1 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-medium"
                    onClick={handlePhotoRemove}
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </Button>
                </div>

                <Separator className="w-full my-0.5" />

                {/* Registration Date below photo */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[11px] font-medium text-slate-600">Reg. Date</Label>
                  </div>
                  <Input
                    {...register("regDate")}
                    type="date"
                    className={cn("h-8 text-xs bg-slate-50 text-center font-medium cursor-pointer hover:bg-slate-100/80 transition-colors", errors.regDate && "border-red-400")}
                    onClick={(e) => {
                      try { e.currentTarget.showPicker(); } catch {}
                    }}
                  />
                  {errors.regDate && (
                    <span className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3" />{errors.regDate.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-span-12 md:col-span-9 lg:col-span-4 xl:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <SectionHeader icon={User} title="Personal Information" />

                {/* First Name */}
                <FormField label="First Name" required className="mb-3" error={errors.firstName?.message}>
                  <Input
                    {...register("firstName")}
                    className={cn("h-8 text-xs bg-amber-50/20 border-slate-300 focus:bg-white", errors.firstName && "border-red-400")}
                    placeholder="First name"
                    autoFocus
                  />
                </FormField>

                {/* Middle Name + Last Name */}
                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="Middle Name" error={errors.middleName?.message}>
                    <Input
                      {...register("middleName")}
                      className={cn("h-8 text-xs", errors.middleName && "border-red-400")}
                      placeholder="Middle name"
                    />
                  </FormField>
                  <FormField label="Last Name" error={errors.lastName?.message}>
                    <Input
                      {...register("lastName")}
                      className={cn("h-8 text-xs", errors.lastName && "border-red-400")}
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
                          <SelectTrigger className={cn("h-8 text-xs bg-amber-50/20 border-slate-300", errors.gender && "border-red-400")}>
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
                          <SelectTrigger className="h-8 text-xs">
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
                <FieldRow className="grid-cols-3 mb-3">
                  <FormField label="DOB" required className="col-span-2" error={errors.dob?.message}>
                    <Input
                      {...register("dob")}
                      type="date"
                      className={cn("h-8 text-xs cursor-pointer bg-amber-50/20 border-slate-300 focus:bg-white hover:bg-slate-50/60 transition-colors", errors.dob && "border-red-400")}
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
                      className="h-8 text-xs bg-slate-50 font-medium"
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
                  <FormField label="Relation" className="col-span-1">
                    <Controller
                      control={control}
                      name="guardianRelation"
                      render={({ field }) => (
                        <Select value={field.value ?? "S/O"} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="S/O" />
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
                  <FormField label="Guardian Name" required className="col-span-2" error={errors.guardianName?.message}>
                    <Input
                      {...register("guardianName")}
                      className={cn("h-8 text-xs bg-amber-50/20 border-slate-300", errors.guardianName && "border-red-400")}
                      placeholder="Guardian name"
                    />
                  </FormField>
                </FieldRow>

                {/* Email */}
                <FormField label="Email" error={errors.email?.message}>
                  <Input
                    {...register("email")}
                    type="email"
                    className={cn("h-8 text-xs", errors.email && "border-red-400")}
                    placeholder="email@example.com"
                  />
                </FormField>
              </div>

              {/* Contact Details */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <SectionHeader icon={Phone} title="Contact Details" />

                <FormField label="Mobile" required className="mb-3" error={errors.mobile?.message}>
                  <Input
                    {...register("mobile")}
                    type="tel"
                    className={cn("h-8 text-xs", errors.mobile && "border-red-400")}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </FormField>

                <FormField label="Address" required className="mb-3" error={errors.address?.message}>
                  <Textarea
                    {...register("address")}
                    className={cn("text-xs min-h-[60px] resize-none", errors.address && "border-red-400")}
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
                            <SelectTrigger className="h-8 text-xs">
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
                        className="h-8 text-xs"
                        placeholder="City"
                      />
                    )}
                  </FormField>
                  <FormField label="Area" error={errors.area?.message}>
                    <Input
                      {...register("area")}
                      className="h-8 text-xs"
                      placeholder="Area / Locality"
                    />
                  </FormField>
                </FieldRow>

                <FieldRow className="grid-cols-2">
                  <FormField label="Pin Code" error={errors.pinCode?.message}>
                    <Input
                      {...register("pinCode")}
                      className={cn("h-8 text-xs", errors.pinCode && "border-red-400")}
                      placeholder="6-digit pin"
                      maxLength={6}
                    />
                  </FormField>
                  <FormField label="Alt. Phone" error={errors.altPhone?.message}>
                    <Input
                      {...register("altPhone")}
                      type="tel"
                      className={cn("h-8 text-xs", errors.altPhone && "border-red-400")}
                      placeholder="Alternate number"
                    />
                  </FormField>
                </FieldRow>
              </div>

              {/* Right column: Emergency + Identity */}
              <div className="col-span-12 lg:col-span-3 space-y-3">
                {/* Emergency Contact */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <SectionHeader icon={AlertCircle} title="Emergency Contact" />

                  <FormField label="Name" className="mb-3" error={errors.emergencyName?.message}>
                    <Input
                      {...register("emergencyName")}
                      className={cn("h-8 text-xs", errors.emergencyName && "border-red-400")}
                      placeholder="Emergency contact name"
                    />
                  </FormField>
                  <FormField label="Relationship" className="mb-3">
                    <Controller
                      control={control}
                      name="emergencyRelationship"
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8 text-xs">
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
                      className={cn("h-8 text-xs", errors.emergencyContact && "border-red-400")}
                      placeholder="Emergency number"
                    />
                  </FormField>
                </div>

                {/* Patient Identity */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <SectionHeader icon={Shield} title="Patient Identity" />

                  <FormField label="Nationality" required className="mb-3">
                    <Controller
                      control={control}
                      name="nationality"
                      render={({ field }) => (
                        <SearchSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={NATIONALITIES}
                          placeholder="Select Nationality"
                        />
                      )}
                    />
                  </FormField>
                  <FormField label="Aadhaar Card" className="mb-3" error={errors.aadhaarCard?.message}>
                    <Controller
                      control={control}
                      name="aadhaarCard"
                      render={({ field }) => (
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            // format in groups of 4 digits: e.g. 1234 5678 1234
                            const formatted = raw
                              .replace(/(\d{4})(\d{4})?(\d{4})?/, (_, p1, p2, p3) => {
                                let parts = [p1];
                                if (p2) parts.push(p2);
                                if (p3) parts.push(p3);
                                return parts.join(" ");
                              })
                              .substring(0, 14); // 12 digits + 2 spaces = 14
                            field.onChange(formatted);
                          }}
                          className={cn("h-8 text-xs", errors.aadhaarCard && "border-red-400")}
                          placeholder="7657 3453 3453"
                          maxLength={14}
                        />
                      )}
                    />
                  </FormField>
                  <FormField label="PAN No." error={errors.panNo?.message}>
                    <Input
                      {...register("panNo")}
                      className={cn("h-8 text-xs", errors.panNo && "border-red-400")}
                      placeholder="PAN number"
                      style={{ textTransform: "uppercase" }}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* ── Section 2: Tabs (Payer / Referral / Other) ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-slate-200 px-4 pt-3">
                  <TabsList className="h-8 bg-transparent p-0 gap-1">
                    <TabsTrigger
                      value="other-info"
                      className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-medium px-3"
                    >
                      <CreditCard className="h-3 w-3 mr-1.5" />
                      Payer / Insurance
                    </TabsTrigger>
                    <TabsTrigger
                      value="referral"
                      className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-medium px-3"
                    >
                      <Users className="h-3 w-3 mr-1.5" />
                      Referral Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="other"
                      className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-medium px-3"
                    >
                      <Tag className="h-3 w-3 mr-1.5" />
                      Other Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="permanent-address"
                      className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-medium px-3"
                    >
                      <FileText className="h-3 w-3 mr-1.5" />
                      Permanent Address
                    </TabsTrigger>
                    <TabsTrigger
                      value="custom-fields"
                      className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-medium px-3"
                    >
                      <Sliders className="h-3 w-3 mr-1.5" />
                      Custom Fields
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Payer Tab */}
                <TabsContent value="other-info" className="p-4 mt-0">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Payer */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Payer</p>
                      <FormField label="Payer Type" required className="mb-3">
                        <Controller
                          control={control}
                          name="payerType"
                          render={({ field }) => (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex flex-row gap-4"
                            >
                              {[
                                { value: "direct", label: "Direct Patient" },
                                { value: "company", label: "Company" },
                                { value: "insurance", label: "Insurance" },
                              ].map((opt) => (
                                <div key={opt.value} className="flex items-center gap-1.5">
                                  <RadioGroupItem value={opt.value} id={`payer-${opt.value}`} />
                                  <Label htmlFor={`payer-${opt.value}`} className="text-xs cursor-pointer">
                                    {opt.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                        />
                      </FormField>
                      <FormField label="Payer" required className="mb-3">
                        <Controller
                          control={control}
                          name="payer"
                          render={({ field }) => (
                            <Select 
                              value={field.value ?? ""} 
                              onValueChange={field.onChange}
                              disabled={payerType === "direct"}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={payerType === "direct" ? "CASH" : "Select Payer"} />
                              </SelectTrigger>
                              <SelectContent>
                                {payerType === "company" && dynamicCompanies.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                                {payerType === "insurance" && dynamicInsurances.map((i) => (
                                  <SelectItem key={i} value={i}>{i}</SelectItem>
                                ))}
                                {payerType === "direct" && (
                                  <SelectItem value="CASH">CASH</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormField>
                      <FormField label="Sponsor">
                        <Input
                          {...register("sponsor")}
                          className="h-8 text-xs"
                          placeholder="Sponsor / TPA"
                          disabled={payerType === "direct"}
                        />
                      </FormField>
                    </div>

                    {/* Referral quick view */}
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Referral</p>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Provider">
                          <Controller
                            control={control}
                            name="provider"
                            render={({ field }) => (
                              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {dynamicProviders.map((p) => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>
                        <FormField label="Status" required>
                          <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Referral Info Tab */}
                <TabsContent value="referral" className="p-4 mt-0">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Provider">
                      <Controller
                        control={control}
                        name="provider"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {dynamicProviders.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                    <FormField label="Lead Source">
                      <Controller
                        control={control}
                        name="leadSource"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {dynamicLeadSources.map((l) => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                    <FormField label="Referred Type">
                      <Controller
                        control={control}
                        name="referredType"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {REFERRED_TYPES.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                    <FormField label="Referred By">
                      <Input {...register("referredBy")} className="h-8 text-xs" placeholder="Doctor / Source name" />
                    </FormField>
                    <FormField label="HCF">
                      <Controller
                        control={control}
                        name="hcf"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {dynamicBranches.map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                    <FormField label="Status" required>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                    <FormField label="Remarks" className="col-span-3">
                      <Textarea
                        {...register("remarks")}
                        className="text-xs resize-none min-h-[52px]"
                        rows={2}
                        placeholder="Additional notes about referral..."
                      />
                    </FormField>
                  </div>
                </TabsContent>

                {/* Other Details Tab */}
                <TabsContent value="other" className="p-4 mt-0">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="col-span-2 space-y-3">
                      <FormField label="Religion">
                        <Controller
                          control={control}
                          name="religion"
                          render={({ field }) => (
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {dynamicReligions.map((r) => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormField>
                      <FormField label="Occupation">
                        <Controller
                          control={control}
                          name="occupation"
                          render={({ field }) => (
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {dynamicOccupations.map((o) => (
                                  <SelectItem key={o} value={o}>{o}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormField>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Flags & Preferences</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "isVip" as const, label: "VIP Patient" },
                          { name: "isAnimation" as const, label: "Animation" },
                          { name: "nameMasking" as const, label: "Name Masking" },
                          { name: "handleWithCare" as const, label: "Handle With Care" },
                          { name: "sendPromoSms" as const, label: "Send Promo — SMS" },
                          { name: "sendPromoEmail" as const, label: "Send Promo — Email" },
                        ].map((flag) => (
                          <div key={flag.name} className="flex items-center gap-2">
                            <Controller
                              control={control}
                              name={flag.name}
                              render={({ field }) => (
                                <Checkbox
                                  id={flag.name}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                            <Label htmlFor={flag.name} className="text-xs cursor-pointer">
                              {flag.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Permanent Address Tab */}
                <TabsContent value="permanent-address" className="p-4 mt-0">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Same as Contact Address" className="col-span-3">
                      <div className="flex items-center gap-2">
                        <Checkbox id="same-address" />
                        <Label htmlFor="same-address" className="text-xs cursor-pointer">
                          Use same address as contact details
                        </Label>
                      </div>
                    </FormField>
                    <FormField label="Address" className="col-span-3">
                      <Textarea className="text-xs resize-none min-h-[60px]" rows={2} placeholder="Permanent address..." />
                    </FormField>
                    <FormField label="Country">
                      <Select defaultValue="India">
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="State">
                      <Select>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="City">
                      <Input className="h-8 text-xs" placeholder="City" />
                    </FormField>
                    <FormField label="Area">
                      <Input className="h-8 text-xs" placeholder="Area / Locality" />
                    </FormField>
                    <FormField label="Pin Code">
                      <Input className="h-8 text-xs" placeholder="Pin code" maxLength={6} />
                    </FormField>
                  </div>
                </TabsContent>

                {/* Custom Fields Tab */}
                <TabsContent value="custom-fields" className="p-4 mt-0">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Voter ID">
                      <Input {...register("voterId")} className="h-8 text-xs" placeholder="Voter ID number" />
                    </FormField>
                    <FormField label="Covid Status">
                      <Controller
                        control={control}
                        name="covidStatus"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Covid Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Positive">Positive</SelectItem>
                              <SelectItem value="Negative">Negative</SelectItem>
                              <SelectItem value="Vaccinated">Vaccinated</SelectItem>
                              <SelectItem value="Not Vaccinated">Not Vaccinated</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                    <FormField label="Visa No">
                      <Input {...register("visaNo")} className="h-8 text-xs" placeholder="Visa Number" />
                    </FormField>
                    <FormField label="Visa Expiry Date">
                      <Input {...register("visaExpiry")} type="date" className="h-8 text-xs" />
                    </FormField>
                    <FormField label="Passport Isssue No.">
                      <Input {...register("passportNo")} className="h-8 text-xs" placeholder="Passport number" />
                    </FormField>
                    <FormField label="Passport Expiry Date">
                      <Input {...register("passportExpiry")} type="date" className="h-8 text-xs" />
                    </FormField>
                  </div>
                </TabsContent>
              </Tabs>
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
                <Button size="sm" variant="outline" className="h-6 px-4 text-[11px] font-bold border-slate-300" onClick={fetchModalPatients}>Filter</Button>
                <Button size="sm" variant="outline" className="h-6 px-4 text-[11px] font-bold border-slate-300" onClick={() => setModalFilters({ uhid: "", patientName: "", mobile: "", dob: "", email: "", company: "", identityNo: "", address: "", phone: "" })}>Clear Filter</Button>
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
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">MobileNo</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">DOB</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">PatientAddress</th>
                    <th className="px-2 py-1.5 border-r border-blue-200 text-blue-800">Old Reg No</th>
                    <th className="px-2 py-1.5 text-blue-800">Father Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isModalLoading ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Searching...
                      </td>
                    </tr>
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
                        <td className="px-2 py-1.5 border-r border-slate-100 font-mono text-slate-700">{p.uhid}</td>
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
            genderAge: `${watch("gender") || ""} / ${watch("age") ? `${watch("age")} Y` : ""}`.trim(),
            maritalStatus: watch("maritalStatus") || "",
            religion: watch("religion") || "",
            aadhaarCard: watch("aadhaarCard") || "",
            nationality: watch("nationality") || "",
            passportNo: watch("passportNo") || "",
            address: watch("address") || "",
            cityStateZip: `${watch("districtCity") || ""} - ${watch("pinCode") || ""}`.trim(),
            mobile: watch("mobile") || "",
            altPhone: watch("altPhone") || "",
            emergencyName: watch("emergencyName") || "",
            emergencyContact: watch("emergencyContact") || "",
            sponsor: watch("sponsor") || watch("payer") || "",
            referringDoctor: watch("provider") || ""
          }} 
        />
      </div>

    </div>
  );
}
