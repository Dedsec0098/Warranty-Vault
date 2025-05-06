import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Select imports as category is now Input
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios'; // Keep axios for now, will refactor later
import { useAuth } from '../../context/AuthContext'; // Corrected path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components

// Define the API endpoint using Vite's env variable syntax
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function AddWarrantyForm() {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [category, setCategory] = useState("");
  const [retailer, setRetailer] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<string | null>(null); // Store image as base64 string or URL
  const [reminderPreference, setReminderPreference] = useState<string>("7d");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth(); // Get the auth token
  const navigate = useNavigate(); // For potential redirection after success

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Consider adding OCR trigger here if desired
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !purchaseDate || !expiryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in Product Name, Purchase Date, and Expiry Date.",
        variant: "destructive",
      });
      return;
    }
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to add a warranty.",
            variant: "destructive",
        });
        // Optionally redirect to login
        // navigate('/login');
        return;
    }

    setLoading(true);

    const warrantyData = {
      productName,
      brand,
      purchaseDate: purchaseDate ? purchaseDate.toISOString() : undefined, // Send as ISO string
      expiryDate: expiryDate ? expiryDate.toISOString() : undefined, // Send as ISO string
      category,
      retailer,
      serialNumber,
      notes,
      image,
      reminderPreference, // Include reminder preference
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/warranties`, // Use environment variable
        warrantyData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send the token
          },
        }
      );

      console.log('Warranty added:', response.data);
      toast({
        title: "Warranty Added",
        description: `"${productName}" has been added successfully.`,
      });
      // Reset form
      setProductName("");
      setBrand("");
      setPurchaseDate(undefined);
      setExpiryDate(undefined);
      setCategory("");
      setRetailer("");
      setSerialNumber("");
      setNotes("");
      setImage(null);
      setReminderPreference("7d"); // Reset to default
      // Optionally navigate away
      // navigate('/warranties');
    } catch (error: any) {
      console.error("Error adding warranty:", error);
      toast({
        title: "Error Adding Warranty",
        description: error.response?.data?.message || "Could not add warranty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Removed OCR related states and functions for cleanup (can be added back later)
  // Removed file drop handler

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Warranty</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Purchase Date */}
          <div className="space-y-1">
            <Label>Purchase Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !purchaseDate && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {purchaseDate ? format(purchaseDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={setPurchaseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <Label>Expiry Date *</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label htmlFor="category">Category</Label>
            <Input // Changed from Select for simplicity, can revert if needed
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Electronics, Appliance"
              disabled={loading}
            />
          </div>

          {/* Retailer */}
          <div className="space-y-1">
            <Label htmlFor="retailer">Retailer</Label>
            <Input
              id="retailer"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              placeholder="e.g., Best Buy, Amazon"
              disabled={loading}
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-1">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Reminder Preference */}
          <div className="space-y-1">
            <Label htmlFor="reminderPreference">Start Reminders</Label>
            <Select
              value={reminderPreference}
              onValueChange={setReminderPreference}
              disabled={loading}
            >
              <SelectTrigger id="reminderPreference">
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day Before Expiry</SelectItem>
                <SelectItem value="7d">1 Week Before Expiry</SelectItem>
                <SelectItem value="30d">1 Month Before Expiry</SelectItem>
                <SelectItem value="none">No Reminders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <Label htmlFor="image">Upload Receipt/Warranty Document</Label>
            <Input
              id="image"
              type="file"
              accept="image/*" // Simplified accept for now
              onChange={handleImageUpload}
              disabled={loading}
            />
            {image && image.startsWith('data:image') && ( // Only preview images
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Preview:</p>
                <img src={image} alt="Preview" className="mt-1 max-h-40 rounded border" />
              </div>
            )}
          </div>

          {/* REMOVED Notification Email Field */}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding Warranty...' : 'Add Warranty'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
