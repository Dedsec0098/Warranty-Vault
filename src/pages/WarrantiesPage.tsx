import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { WarrantyList } from "@/components/warranty/WarrantyList";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { Loader2, AlertTriangle } from "lucide-react"; // For loading/error states

// Define the API endpoint (ensure this matches your setup)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Define Warranty type (or import if defined elsewhere)
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


export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get token for API calls

  useEffect(() => {
    const fetchWarranties = async () => {
      if (!token) {
        setError("Please log in to view warranties.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/warranties`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
             setError("Authentication failed. Please log in again.");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const data: Warranty[] = await response.json();
          setWarranties(data);
        }
      } catch (err) {
        console.error("Failed to fetch warranties:", err);
        if (!error) { // Avoid overwriting specific 401 error
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarranties();
  }, [token]); // Re-fetch if token changes

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="container py-6">
          {/* Pass fetched data and handlers to WarrantyList */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h4 className="font-semibold">Error loading warranties</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <WarrantyList
              warranties={warranties}
            />
          )}
        </div>
      </main>
    </div>
  );
}
