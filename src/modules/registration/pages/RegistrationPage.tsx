import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save, Printer, Plus, Copy, Search, Upload,
  User, Phone, AlertCircle, Shield, CreditCard,
  Users, FileText, Tag, ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const registrationSchema = z.object({
  registrationType: z.string(),
  uhid: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required").regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),
  middleName: z.string().regex(/^[A-Za-z\s]*$/, "Only alphabets are allowed").optional(),
  lastName: z.string().regex(/^[A-Za-z\s]*$/, "Only alphabets are allowed").optional(),
  gender: z.string().min(1, "Gender is required"),
  maritalStatus: z.string().optional(),
  dob: z.string().optional(),
  age: z.string().optional(),
  guardianName: z.string().min(1, "Guardian name is required").regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),
  guardianRelation: z.string().optional(),
  regDate: z.string(),
  // Contact
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  country: z.string(),
  state: z.string(),
  districtCity: z.string().optional(),
  area: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must be exactly 6 digits").optional().or(z.literal("")),
  altPhone: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  // Emergency
  emergencyName: z.string().regex(/^[A-Za-z\s]*$/, "Only alphabets are allowed").optional().or(z.literal("")),
  emergencyRelationship: z.string().optional(),
  emergencyContact: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional().or(z.literal("")),
  // Identity
  nationality: z.string(),
  aadhaarCard: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits").optional().or(z.literal("")),
  panNo: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)").optional().or(z.literal("")),
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
const NATIONALITIES = ["Indian", "American", "British", "Emirati", "Other"];
const RELATIONSHIPS = ["Self", "Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Guardian", "Other"];
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"];
const OCCUPATIONS = ["Service", "Business", "Student", "Retired", "Homemaker", "Farmer", "Other"];
const PROVIDERS = ["Self", "Referral", "Camp", "OPD", "Emergency"];
const LEAD_SOURCES = ["Walk-in", "Online", "Phone", "Camp", "Doctor Referral", "Insurance"];
const REFERRED_TYPES = ["Doctor", "Hospital", "Patient", "Corporate", "Other"];
const STATUSES = ["Active", "Inactive", "Discharged", "Deceased"];
const HCF_OPTIONS = ["CMK Main", "CMK Branch 1", "CMK Branch 2"];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegistrationPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("other-info");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      registrationType: "New Registration",
      title: "",
      firstName: "",
      gender: "",
      maritalStatus: "",
      country: "India",
      nationality: "Indian",
      payerType: "direct",
      status: "Active",
      isVip: false,
      isAnimation: false,
      nameMasking: false,
      handleWithCare: false,
      sendPromoSms: false,
      sendPromoEmail: false,
      regDate: today,
    },
  });

  // Auto-calculate age from DOB
  const handleDobChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dob = new Date(e.target.value);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        const years = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        const age = m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? years - 1 : years;
        setValue("age", age.toString());
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

  const onSubmit = (data: RegistrationForm) => {
    console.log("Registration data:", data);
    // TODO: API call
  };

  const payerType = watch("payerType");
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
          <Label className="text-xs text-slate-500 font-semibold">UHN</Label>
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
          onClick={() => window.location.reload()}
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
        <Button
          type="button"
          variant="success"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleSubmit(onSubmit)}
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Card
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
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

              {/* Patient Photo */}
              <div className="col-span-12 lg:col-span-1">
                <div className="flex flex-col items-center gap-2">
                  <label className="patient-photo cursor-pointer group" htmlFor="photo-upload">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Patient"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <User className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-slate-400 group-hover:text-primary mt-1 text-center px-1">
                          Upload Photo
                        </span>
                      </>
                    )}
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                  <Button type="button" variant="outline" size="xs" className="w-full text-[10px]">
                    <Upload className="h-3 w-3" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <SectionHeader icon={User} title="Personal Information" />

                {/* Title + First Name */}
                <FieldRow className="grid-cols-4 mb-3">
                  <FormField label="Title" required className="col-span-1">
                    <Controller
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn("h-8 text-xs", errors.title && "border-red-400")}>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {TITLES.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="First Name" required className="col-span-3" error={errors.firstName?.message}>
                    <Input
                      {...register("firstName")}
                      className={cn("h-8 text-xs", errors.firstName && "border-red-400")}
                      placeholder="First name"
                      autoFocus
                    />
                  </FormField>
                </FieldRow>

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

                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="Gender" required>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn("h-8 text-xs", errors.gender && "border-red-400")}>
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

                <FieldRow className="grid-cols-3 mb-3">
                  <FormField label="Date of Birth" className="col-span-2">
                    <Input
                      {...register("dob")}
                      type="date"
                      className="h-8 text-xs"
                      onChange={(e) => {
                        register("dob").onChange(e);
                        handleDobChange(e);
                      }}
                    />
                  </FormField>
                  <FormField label="Age (Y/M/D)">
                    <Input
                      {...register("age")}
                      className="h-8 text-xs bg-slate-50"
                      placeholder="Auto"
                      readOnly
                    />
                  </FormField>
                </FieldRow>

                <FieldRow className="grid-cols-3 mb-3">
                  <FormField label="Relation" className="col-span-1">
                    <Controller
                      control={control}
                      name="guardianRelation"
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="S/O" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIPS.map((r) => (
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
                      className={cn("h-8 text-xs", errors.guardianName && "border-red-400")}
                      placeholder="Guardian name"
                    />
                  </FormField>
                </FieldRow>

                <FieldRow className="grid-cols-2">
                  <FormField label="Email" error={errors.email?.message}>
                    <Input
                      {...register("email")}
                      type="email"
                      className={cn("h-8 text-xs", errors.email && "border-red-400")}
                      placeholder="email@example.com"
                    />
                  </FormField>
                  <FormField label="Reg. Date" error={errors.regDate?.message}>
                    <Input
                      {...register("regDate")}
                      type="date"
                      className={cn("h-8 text-xs bg-slate-50", errors.regDate && "border-red-400")}
                    />
                  </FormField>
                </FieldRow>
              </div>

              {/* Contact Details */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
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

                <FormField label="Address" required className="mb-3">
                  <Textarea
                    {...register("address")}
                    className={cn("text-xs min-h-[60px] resize-none", errors.address && "border-red-400")}
                    placeholder="House no., Street, Locality..."
                    rows={2}
                  />
                </FormField>

                <FieldRow className="grid-cols-2 mb-3">
                  <FormField label="Country" required>
                    <Controller
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(val) => {
                            field.onChange(val);
                            setValue("state", "");
                            setValue("districtCity", "");
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.length > 0 ? countries.map((c) => (
                              <SelectItem key={c.isoCode} value={c.name}>{c.name}</SelectItem>
                            )) : COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="State" required>
                    <Controller
                      control={control}
                      name="state"
                      render={({ field }) => (
                        <Select 
                          value={field.value ?? ""} 
                          onValueChange={(val) => {
                            field.onChange(val);
                            setValue("districtCity", "");
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((s) => (
                              <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <SelectContent>
                            {RELATIONSHIPS.map((r) => (
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

                  <FormField label="Nationality" className="mb-3">
                    <Controller
                      control={control}
                      name="nationality"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NATIONALITIES.map((n) => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Aadhaar Card" className="mb-3" error={errors.aadhaarCard?.message}>
                    <Input
                      {...register("aadhaarCard")}
                      className={cn("h-8 text-xs", errors.aadhaarCard && "border-red-400")}
                      placeholder="12-digit Aadhaar"
                      maxLength={12}
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
                        <Input
                          {...register("payer")}
                          className="h-8 text-xs"
                          placeholder={payerType === "insurance" ? "Insurance company" : payerType === "company" ? "Company name" : "CASH"}
                          defaultValue={payerType === "direct" ? "CASH" : ""}
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
                                  {PROVIDERS.map((p) => (
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
                              {PROVIDERS.map((p) => (
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
                              {LEAD_SOURCES.map((l) => (
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
                              {HCF_OPTIONS.map((h) => (
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
                                {RELIGIONS.map((r) => (
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
                                {OCCUPATIONS.map((o) => (
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
              </Tabs>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
