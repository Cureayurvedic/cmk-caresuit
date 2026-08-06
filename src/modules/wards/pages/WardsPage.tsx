import { Building2, BedDouble, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const WARDS = [
  { name: "General Ward", total: 40, occupied: 32, available: 8, color: "bg-blue-500" },
  { name: "ICU", total: 10, occupied: 9, available: 1, color: "bg-rose-500" },
  { name: "Maternity", total: 20, occupied: 14, available: 6, color: "bg-pink-500" },
  { name: "Pediatric", total: 15, occupied: 10, available: 5, color: "bg-purple-500" },
  { name: "Surgery", total: 12, occupied: 8, available: 4, color: "bg-amber-500" },
];

export default function WardsPage() {
  const totalBeds = WARDS.reduce((a, w) => a + w.total, 0);
  const totalOccupied = WARDS.reduce((a, w) => a + w.occupied, 0);
  const totalAvailable = WARDS.reduce((a, w) => a + w.available, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ward Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor bed occupancy across all wards</p>
        </div>
        <Button size="sm" className="gap-2">
          <BedDouble className="h-4 w-4" />
          Assign Bed
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Beds", value: totalBeds, icon: BedDouble, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Occupied", value: totalOccupied, icon: UserCheck, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Available", value: totalAvailable, icon: AlertCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="card-hover">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <CardTitle className="text-xs text-slate-500 font-medium">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-slate-800">{s.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ward breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Ward Occupancy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {WARDS.map((ward) => {
            const pct = Math.round((ward.occupied / ward.total) * 100);
            return (
              <div key={ward.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{ward.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={ward.available === 0 ? "destructive" : ward.available < 3 ? "warning" : "success"} className="text-[10px]">
                      {ward.available} free
                    </Badge>
                    <span className="text-xs text-slate-500">{ward.occupied}/{ward.total}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ward.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
