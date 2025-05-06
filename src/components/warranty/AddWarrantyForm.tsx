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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parse, isValid } from "date-fns"; // Import parse and isValid
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios'; // Keep axios for now, will refactor later
import { useAuth } from '../../context/AuthContext'; // Corrected path
import { createWorker } from 'tesseract.js'; // Ensure this import is present
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components

// Define the API endpoint using Vite's env variable syntax
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to parse dates with multiple formats
const parseDateFromString = (dateString: string): Date | undefined => {
  if (!dateString) {
    console.log("parseDateFromString: received empty string, returning undefined.");
    return undefined;
  }
  console.log(`parseDateFromString: Attempting to parse raw string: "${dateString}"`);

  // Normalize whitespace and remove any characters not typically part of a date string
  // This cleaning is important if OCR includes subtle non-printing chars or minor misinterpretations
  const cleanedDateString = dateString
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/[^\w\s,-/.]/g, '') // Remove characters not common in dates (kept period for things like "Aug. 14")
    .trim();
  console.log(`parseDateFromString: Cleaned string for parsing: "${cleanedDateString}"`);

  if (!cleanedDateString) {
    console.log("parseDateFromString: string is empty after cleaning, returning undefined.");
    return undefined;
  }

  const formats = [
    'yyyy-MM-dd',   // For "2024-08-15"
    'MMM dd, yyyy', // For "August 14, 2026"
    'MM/dd/yyyy', 'M/d/yyyy', 'MM-dd-yyyy', 'M-d-yyyy',
    'yyyy/MM/dd',
    'dd-MMM-yyyy', 'd-MMM-yyyy',
    'MMM d, yyyy',  // For "Aug 14, 2026" (if OCR varies)
    'MMMM dd, yyyy', // For full month name like "August"
    'MMMM d, yyyy',
    'MM/dd/yy', 'M/d/yy',
  ];

  for (const fmt of formats) {
    try {
      console.log(`parseDateFromString: Trying format "${fmt}" for string "${cleanedDateString}"`);
      const parsedDate = parse(cleanedDateString, fmt, new Date()); // Using date-fns parse

      if (isValid(parsedDate)) { // Using date-fns isValid
        console.log(`parseDateFromString: Successfully parsed "${cleanedDateString}" with format "${fmt}" into Date:`, parsedDate);
        
        // Basic sanity check for two-digit years (assume 20xx)
        if (fmt.includes('yy') && !fmt.includes('yyyy')) {
          const year = parsedDate.getFullYear();
          if (year < 2000) { // e.g., if '24' became 1924
            parsedDate.setFullYear(year + 100); // Adjust to 2024
            console.log(`parseDateFromString: Adjusted 2-digit year to:`, parsedDate);
          }
        }
        
        // Further sanity check: date shouldn't be too far in the past/future
        const currentYear = new Date().getFullYear();
        if (parsedDate.getFullYear() >= 1990 && parsedDate.getFullYear() <= currentYear + 20) { // Allow up to 20 years in future
            return parsedDate;
        } else {
            console.log(`parseDateFromString: Parsed date ${parsedDate} (year ${parsedDate.getFullYear()}) is out of sane year range (1990-${currentYear + 20}), discarding for this format.`);
        }
      } else {
        // This log can be very verbose, enable if needed:
        // console.log(`parseDateFromString: String "${cleanedDateString}" is NOT valid for format "${fmt}" according to isValid(parse(...))`);
      }
    } catch (e) {
      console.error(`parseDateFromString: Error during parse attempt with format "${fmt}" for string "${cleanedDateString}":`, e);
    }
  }
  console.warn(`parseDateFromString: Failed to parse "${cleanedDateString}" with any known format.`);
  return undefined;
};

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
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const { toast } = useToast();
  const { token } = useAuth(); // Get the auth token
  const navigate = useNavigate(); // For potential redirection after success

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        processImageWithOcr(reader.result as string); // Trigger OCR processing
      };
      reader.readAsDataURL(file);
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

  // Function to parse OCR text and attempt to fill form fields
  const parseOcrTextAndFillForm = (text: string) => {
    if (!text) return;

    console.log("Attempting to parse OCR text:\n---\n", text, "\n---");
    let purchaseDateFound: Date | undefined;
    let expiryDateFound: Date | undefined;
    let serialNumberFound: string | undefined;
    let brandFound: string | undefined;
    let productFound: string | undefined;

    // --- Refined Parsing Logic ---

    // Regex to find common date patterns. \w{3,} allows for full month names.
    const specificDatePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}-\w{3}-\d{4}|\w{3,}\s+\d{1,2},\s+\d{4}|\w{3,}\s+\d{1,2}\s+\d{4})/i;

    // 1. Find Purchase Date
    // First, find the line/section for "Purchase Date:"
    // It captures everything after "Purchase Date:" up to a newline or the start of another common field label, or end of text.
    const purchaseLabelRegex = /Purchase Date:\s*([\s\S]*?)(?:\n|Item Purchased:|Brand:|Serial Number:|Expiry Date:|$)/i;
    const purchaseSectionMatch = text.match(purchaseLabelRegex);
    if (purchaseSectionMatch?.[1]) {
        let relevantText = purchaseSectionMatch[1].trim();
        console.log("Purchase Date - Text section after label:", `"${relevantText}"`);
        // Now, extract a specific date pattern from this relevant text
        const dateMatch = relevantText.match(specificDatePattern);
        if (dateMatch?.[0]) {
            let potentialDateStr = dateMatch[0].trim();
            console.log("Purchase Date - Isolated date string:", `"${potentialDateStr}"`);
            purchaseDateFound = parseDateFromString(potentialDateStr);
            console.log("Purchase Date - Parsed Date object:", purchaseDateFound);
        } else {
            console.log("Purchase Date - No specific date pattern found in section:", `"${relevantText}"`);
        }
    } else {
        console.log("Purchase Date - No match found for label pattern.");
    }

    // 2. Find Expiry Date
    // Similar logic for "Expiry Date:"
    const expiryLabelRegex = /(?:Warranty\s+)?Expiry Date:\s*([\s\S]*?)(?:\n|Retailer:|Notes:|Reminder Preference:|Purchase Date:|$)/i;
    const expirySectionMatch = text.match(expiryLabelRegex);
    if (expirySectionMatch?.[1]) {
        let relevantText = expirySectionMatch[1].trim();
        console.log("Expiry Date - Text section after label:", `"${relevantText}"`);
        const dateMatch = relevantText.match(specificDatePattern);
        if (dateMatch?.[0]) {
            let potentialDateStr = dateMatch[0].trim();
            console.log("Expiry Date - Isolated date string:", `"${potentialDateStr}"`);
            expiryDateFound = parseDateFromString(potentialDateStr);
            console.log("Expiry Date - Parsed Date object:", expiryDateFound);
        } else {
            console.log("Expiry Date - No specific date pattern found in section:", `"${relevantText}"`);
        }
    } else {
        console.log("Expiry Date - No match found for label pattern.");
    }

    // 3. Find Serial Number (Regex remains the same as it was working)
    const serialRegex = /(?:Serial\sNumber|S[/]?N):\s*([a-zA-Z0-9-]+)/i;
    const serialMatch = text.match(serialRegex);
    if (serialMatch?.[1]) {
      serialNumberFound = serialMatch[1].trim();
      console.log("Serial Number - Found:", `"${serialNumberFound}"`);
    } else {
        console.log("Serial Number - No match found for pattern.");
    }

    // 4. Find Brand (Regex remains the same)
     const brandRegex = /Brand:\s*(.*)/i; // This will capture till end of line or text
     const brandMatch = text.match(brandRegex);
     if (brandMatch?.[1]) {
         brandFound = brandMatch[1].split('\n')[0].trim(); // Take only the first line of the match
         console.log("Brand - Found:", `"${brandFound}"`);
     } else {
        console.log("Brand - No match found for pattern.");
     }

     // 5. Find Product Name (Regex remains the same)
     const productRegex = /Item Purchased:\s*(.*)/i; // This will capture till end of line or text
     const productMatch = text.match(productRegex);
     if (productMatch?.[1]) {
         productFound = productMatch[1].split('\n')[0].trim(); // Take only the first line of the match
         console.log("Product Name - Found:", `"${productFound}"`);
     } else {
        console.log("Product Name - No match found for pattern.");
     }

    // --- Update State (Only if field is currently empty) ---
    let fieldsFilledCount = 0;
    if (purchaseDateFound && !purchaseDate) {
        console.log("Attempting to set Purchase Date state with:", purchaseDateFound);
        setPurchaseDate(purchaseDateFound);
        fieldsFilledCount++;
    }
    if (expiryDateFound && !expiryDate) {
        console.log("Attempting to set Expiry Date state with:", expiryDateFound);
        setExpiryDate(expiryDateFound);
        fieldsFilledCount++;
    }
    if (serialNumberFound && !serialNumber) {
        console.log("Attempting to set Serial Number state with:", serialNumberFound);
        setSerialNumber(serialNumberFound);
        fieldsFilledCount++;
    }
     if (brandFound && !brand) {
        console.log("Attempting to set Brand state with:", brandFound);
        setBrand(brandFound);
        fieldsFilledCount++;
    }
     if (productFound && !productName) {
        console.log("Attempting to set Product Name state with:", productFound);
        setProductName(productFound);
        fieldsFilledCount++;
    }

    // --- Toast Notification ---
    if (fieldsFilledCount > 0) {
        toast({
            title: "OCR Parsed",
            description: `Attempted to fill ${fieldsFilledCount} form field(s) from image. Please review.`,
        });
    } else {
         toast({
            title: "OCR Parsed",
            description: "Extracted text, but couldn't automatically identify fields to fill. Please review extracted text and console logs.",
            duration: 7000, // Increased duration
        });
    }
  };

  // Function to process image with Tesseract
  const processImageWithOcr = async (imageDataUrl: string) => {
    if (!imageDataUrl) return;

    setIsOcrLoading(true);
    setOcrText(null);
    toast({ title: "OCR Started", description: "Extracting text from image..." });

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(imageDataUrl);
      const extractedText = ret.data.text;
      setOcrText(extractedText);
      toast({ title: "OCR Complete", description: "Text extracted. Attempting to parse..." });
      await worker.terminate();

      // Attempt to parse and fill form
      parseOcrTextAndFillForm(extractedText);

    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "OCR Failed",
        description: "Could not extract text from the image.",
        variant: "destructive",
      });
      setOcrText("Error during OCR processing.");
    } finally {
      setIsOcrLoading(false);
    }
  };

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

          {/* OCR Status and Results */}
          {isOcrLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing image and text...</span> {/* Updated text */}
            </div>
          )}
          {ocrText && !isOcrLoading && (
            <div className="space-y-2 rounded-md border bg-muted p-3">
               <Label className="font-semibold">Extracted Text (Review Fields Above):</Label> {/* Updated label */}
               <pre className="whitespace-pre-wrap text-sm font-mono max-h-40 overflow-auto">
                 {ocrText}
               </pre>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || isOcrLoading}>
            {loading ? 'Adding Warranty...' : isOcrLoading ? 'Processing Image...' : 'Add Warranty'} {/* Update button text */}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
