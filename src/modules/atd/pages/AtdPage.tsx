import { Activity, UserCheck, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { label: "Present Today", value: "142", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "On Leave", value: "8", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Late Arrivals", value: "5", icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
  { label: "On Duty", value: "67", icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-50" },
];

export default function AtdPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ATD — Attendance & Duty</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track staff attendance and duty schedules</p>
        </div>
        <Badge variant="success" className="text-xs">Today: {new Date().toLocaleDateString("en-IN")}</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-hover">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <CardTitle className="text-xs text-slate-500 font-medium">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            ATD Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <div className="text-center">
              <Activity className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Attendance module coming soon</p>
              <p className="text-xs mt-1">Staff attendance, duty rosters will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
