import { BarChart3, TrendingUp, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const REPORT_CATEGORIES = [
  { label: "Patient Reports", count: 24, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "OPD Reports", count: 12, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Billing Reports", count: 18, icon: BarChart3, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Lab Reports", count: 8, icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analytics & Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">View and export hospital performance reports</p>
        </div>
        <Button size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.label} className="card-hover cursor-pointer">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <CardTitle className="text-sm">{cat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-800">{cat.count}</span>
                  <Badge variant="info">Reports</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Report Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Reports module coming soon</p>
              <p className="text-xs mt-1">Patient, OPD, billing, and lab reports will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
