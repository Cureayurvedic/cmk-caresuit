import { ReceiptText, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { label: "Today's Revenue", value: "₹1,24,500", icon: DollarSign, trend: "+12%", color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Pending Bills", value: "23", icon: Clock, trend: "4 overdue", color: "text-amber-500", bg: "bg-amber-50" },
  { label: "This Month", value: "₹18,50,000", icon: TrendingUp, trend: "+8%", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Total Invoices", value: "342", icon: ReceiptText, trend: "Today: 18", color: "text-purple-500", bg: "bg-purple-50" },
];

export default function BillingPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Billing & Payments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage patient invoices and payment records</p>
        </div>
        <Button size="sm" className="gap-2">
          <ReceiptText className="h-4 w-4" />
          New Invoice
        </Button>
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
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-slate-800">{stat.value}</span>
                  <Badge variant="success" className="text-[10px]">{stat.trend}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-primary" />
            Billing Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <div className="text-center">
              <ReceiptText className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Billing module coming soon</p>
              <p className="text-xs mt-1">Invoice creation, payment tracking will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
