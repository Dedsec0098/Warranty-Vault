import {
  AlertTriangle,
  Clock,
  FileCheck,
  FileX
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define the structure of a warranty object (adjust based on your actual data structure)
interface Warranty {
  id: string;
  expiryDate: string; // Assuming date string format like 'YYYY-MM-DD'
  // Add other relevant properties if needed for calculations
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  // Removed trend prop as it requires historical data
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs">{description}</CardDescription>
        {/* Removed trend display */}
      </CardContent>
    </Card>
  );
}

interface WarrantyStatsProps {
  warranties: Warranty[];
}

export function WarrantyStats({ warranties }: WarrantyStatsProps) {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const activeWarranties = warranties.filter(w => new Date(w.expiryDate) >= today).length;

  const expiringSoon = warranties.filter(w => {
    const expiry = new Date(w.expiryDate);
    return expiry >= today && expiry <= thirtyDaysFromNow;
  }).length;

  const recentlyExpired = warranties.filter(w => {
    const expiry = new Date(w.expiryDate);
    return expiry < today && expiry >= thirtyDaysAgo;
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid columns */}
      <StatCard
        title="Active Warranties"
        value={activeWarranties}
        description="Currently active warranties"
        icon={<FileCheck className="h-4 w-4 text-primary" />}
        // Removed trend prop
      />
      <StatCard
        title="Expiring Soon"
        value={expiringSoon}
        description="Warranties expiring in 30 days"
        icon={<AlertTriangle className="h-4 w-4 text-orange-400" />}
      />
      <StatCard
        title="Recently Expired"
        value={recentlyExpired}
        description="Expired in the last 30 days"
        icon={<FileX className="h-4 w-4 text-destructive" />}
      />
    </div>
  );
}
