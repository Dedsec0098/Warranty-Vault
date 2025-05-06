import { useState, useEffect } from "react";
import { CalendarDays, Clock, FileText, ShoppingBag, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantyStats } from "@/components/warranty/WarrantyStats";
import { Button } from "@/components/ui/button";
import { WarrantyCard } from "@/components/warranty/WarrantyCard";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// ... (keep existing API_URL and Warranty interface) ...
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Warranty {
  _id: string;
  productName: string;
  brand: string;
  purchaseDate: string;
  expiryDate: string;
  category: string;
  retailer?: string;
  serialNumber?: string;
  notes?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}


export function DashboardSummary() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get the token from AuthContext

  useEffect(() => {
    const fetchWarranties = async () => {
      if (!token) { // Don't fetch if not logged in
        setError("You must be logged in to view warranties.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/warranties`, {
          headers: { // Add Authorization header
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Optional: Good practice to include
          },
        });
        if (!response.ok) {
          // Handle specific errors like 401
          if (response.status === 401) {
             setError("Authentication failed. Please log in again.");
             // Optionally call logout() from useAuth() here if token is invalid
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else { // Only parse JSON if response is ok
            const data: Warranty[] = await response.json();
            setWarranties(data);
        }
      } catch (err) {
        console.error("Failed to fetch warranties for dashboard:", err);
        // Avoid setting error if it was already set (e.g., for 401)
        if (!error) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarranties();
  }, [token]); // Add token as a dependency

  // ... (keep existing calculations for recent/expiring warranties) ...
  const recentWarranties = [...warranties]
    .sort((a, b) => new Date(b.createdAt || b.purchaseDate).getTime() - new Date(a.createdAt || a.purchaseDate).getTime()) // Sort by creation or purchase date
    .slice(0, 4);

  const today = new Date();
  const expiringWarranties = warranties
    .filter((warranty) => {
      const expiryDate = new Date(warranty.expiryDate);
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 30;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 4);


  // ... (keep existing return statement with JSX) ...
  // Make sure the error display handles the new error messages
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          An overview of your warranty information
        </p>
      </div>

      {/* Conditionally render WarrantyStats based on loading/error state */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder/Skeleton for stats */}
          <Card><CardHeader><CardTitle className="text-sm font-medium">Loading...</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">Loading...</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">Loading...</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h4 className="font-semibold">Failed to load warranty stats</h4>
          </div>
          {/* Display the specific error message */}
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <WarrantyStats warranties={warranties} />
      )}

      {/* Example: Recent Warranties Card - Check loading state */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">Recent Warranties</CardTitle>
              <CardDescription>Recently added warranty documents</CardDescription>
            </div>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
             ) : error ? ( // Show error message if fetch failed
               <div className="flex flex-col items-center justify-center py-8 text-center text-destructive">
                 <AlertTriangle className="h-8 w-8" />
                 <p className="mt-2 text-sm">{error}</p>
               </div>
            ) : recentWarranties.length > 0 ? (
              <div className="space-y-4">
                {recentWarranties.map((warranty) => (
                  <div key={warranty._id} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {warranty.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {warranty.brand}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p>
                        {new Date(warranty.purchaseDate).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">{warranty.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No recent warranties</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your first warranty to get started
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link to="/add-warranty">Add Warranty</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example: Upcoming Expirations Card - Check loading state */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">Upcoming Expirations</CardTitle>
              <CardDescription>Warranties expiring in the next 30 days</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : error ? ( // Show error message if fetch failed
               <div className="flex flex-col items-center justify-center py-8 text-center text-destructive">
                 <AlertTriangle className="h-8 w-8" />
                 <p className="mt-2 text-sm">{error}</p>
               </div>
            ) : expiringWarranties.length > 0 ? (
              <div className="space-y-4">
                {expiringWarranties.map((warranty) => {
                  const expiryDate = new Date(warranty.expiryDate);
                  const daysLeft = Math.ceil(
                    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={warranty._id} className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                        <CalendarDays className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {warranty.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {warranty.brand}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {daysLeft} {daysLeft === 1 ? "day" : "days"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {expiryDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No upcoming expirations</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All your warranties are safe for now
                </p>
                <Button asChild variant="outline" className="mt-4" size="sm">
                  <Link to="/warranties">View All Warranties</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example: Recent Activity Section - Check loading state */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Activity</h3>
          <Button variant="outline" size="sm" asChild>
            <Link to="/warranties">View All</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            // Optional: Show skeleton cards for recent activity
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-48 animate-pulse bg-muted"></Card>
            ))
          ) : error ? ( // Show error message if fetch failed
             <div className="col-span-full flex flex-col items-center justify-center py-8 text-center text-destructive">
               <AlertTriangle className="h-8 w-8" />
               <p className="mt-2 text-sm">{error}</p>
             </div>
          ) : recentWarranties.length > 0 ? ( // Only map if warranties exist and no error
            recentWarranties.map((warranty) => (
              // Pass warranty object and a placeholder onDelete function
              <WarrantyCard
                key={warranty._id}
                warranty={warranty}
                onDelete={() => { /* No-op or implement dashboard-specific delete logic */ }}
              />
            ))
          ) : ( // Show "No recent warranties" only if fetch was successful but returned empty
             !error && <div className="col-span-full text-center text-muted-foreground py-8">No recent activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}