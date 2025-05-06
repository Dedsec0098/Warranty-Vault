import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CalendarDays, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sidebar } from "@/components/layout/Sidebar";

// Define Warranty type
interface Warranty {
  _id: string;
  productName: string;
  brand?: string;
  purchaseDate: string;
  expiryDate: string;
  category?: string;
  retailer?: string;
  serialNumber?: string;
  notes?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the API endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function WarrantyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWarranty = async () => {
      if (!token) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }
      if (!id) {
        setError("Warranty ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/warranties/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setWarranty(response.data);
      } catch (err: any) {
        console.error("Error fetching warranty details:", err);
        const message = err.response?.status === 404
          ? "Warranty not found or you do not have permission to view it."
          : err.response?.data?.message || "Failed to fetch warranty details.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchWarranty();
  }, [id, token, toast]);

  const handleDelete = async () => {
    if (!token || !id) return;
    try {
      await axios.delete(`${API_BASE_URL}/warranties/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Warranty deleted successfully." });
      navigate('/warranties'); // Redirect to the list page after deletion
    } catch (err: any) {
      console.error("Error deleting warranty:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete warranty.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center text-red-600">
        <p>{error}</p>
        <Button variant="outline" onClick={() => navigate('/warranties')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Warranties
        </Button>
      </div>
    );
  }

  if (!warranty) {
    // This case might be redundant if error handles not found, but good for safety
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center text-muted-foreground">
            <p>Warranty data could not be loaded.</p>
             <Button variant="outline" onClick={() => navigate('/warranties')} className="mt-4">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Warranties
             </Button>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl break-words">{warranty.productName}</CardTitle>
                {warranty.brand && (
                  <CardDescription>Brand: {warranty.brand}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                  <span>Purchased on: {format(parseISO(warranty.purchaseDate), 'PPP')}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4 text-destructive" />
                  <span>Expires on: {format(parseISO(warranty.expiryDate), 'PPP')}</span>
                </div>
                {warranty.category && <p><strong className="font-medium">Category:</strong> {warranty.category}</p>}
                {warranty.retailer && <p><strong className="font-medium">Retailer:</strong> {warranty.retailer}</p>}
                {warranty.serialNumber && <p><strong className="font-medium">Serial Number:</strong> {warranty.serialNumber}</p>}
                {warranty.notes && (
                  <div>
                    <strong className="font-medium">Notes:</strong>
                    <p className="text-muted-foreground whitespace-pre-wrap">{warranty.notes}</p>
                  </div>
                )}
                {warranty.image && warranty.image.startsWith('data:image') && (
                  <div>
                    <strong className="font-medium">Document/Receipt:</strong>
                    <img src={warranty.image} alt="Warranty document" className="mt-2 max-w-full md:max-w-md rounded border" />
                  </div>
                )}
                 {warranty.image && !warranty.image.startsWith('data:image') && (
                   <div>
                     <strong className="font-medium">Document/Receipt:</strong>
                     <p className="text-muted-foreground italic">(Image data not available for preview)</p>
                     {/* Optionally add a download link if the backend provides one */}
                   </div>
                 )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {/* TODO: Implement Edit Functionality */}
                {/* <Button variant="outline" size="sm" disabled> */}
                {/*   <Edit className="mr-1 h-4 w-4" /> Edit */}
                {/* </Button> */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the warranty
                        for "{warranty.productName}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
