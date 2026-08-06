import { useState } from "react";
import { Search, UserPlus, FileEdit, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const PATIENTS = [
  { id: "UHID-2023-001", name: "Rahul Sharma", age: 45, gender: "Male", phone: "9876543210", regDate: "2023-08-01", status: "Active" },
  { id: "UHID-2023-002", name: "Priya Singh", age: 32, gender: "Female", phone: "9876543211", regDate: "2023-08-02", status: "Active" },
  { id: "UHID-2023-003", name: "Amit Kumar", age: 28, gender: "Male", phone: "9876543212", regDate: "2023-08-03", status: "Inactive" },
  { id: "UHID-2023-004", name: "Sneha Patel", age: 50, gender: "Female", phone: "9876543213", regDate: "2023-08-04", status: "Active" },
  { id: "UHID-2023-005", name: "Vikram Reddy", age: 60, gender: "Male", phone: "9876543214", regDate: "2023-08-05", status: "Discharged" },
];

export default function PatientSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-50/60 p-5 space-y-4 animate-fade-in">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patient Search</h2>
          <p className="text-sm text-slate-500 mt-0.5">Search and manage registered patients</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => window.location.href = '/registration/demographics'}>
          <UserPlus className="h-4 w-4" />
          New Patient
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Search by Name / UHID / Mobile</label>
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
              <Select defaultValue="all">
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
              <Select defaultValue="all">
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
            <Button variant="outline" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">UHID</th>
                <th className="px-4 py-3 font-semibold">Patient Name</th>
                <th className="px-4 py-3 font-semibold">Age/Gender</th>
                <th className="px-4 py-3 font-semibold">Mobile</th>
                <th className="px-4 py-3 font-semibold">Reg. Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">{patient.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{patient.name}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.age} Y / {patient.gender}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.regDate}</td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant={patient.status === 'Active' ? 'success' : patient.status === 'Inactive' ? 'secondary' : 'warning'}
                        className="text-[10px]"
                      >
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:bg-blue-50">
                          <FileEdit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-600">No patients found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 p-3 flex items-center justify-between bg-slate-50 text-xs text-slate-500">
          <div>Showing {filteredPatients.length} of {PATIENTS.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="xs" disabled>Previous</Button>
            <Button variant="outline" size="xs" disabled>Next</Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
