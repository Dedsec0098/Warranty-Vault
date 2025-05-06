import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, parseISO } from 'date-fns';
import { CalendarDays, Eye } from "lucide-react";

// Define Warranty type matching the backend/page
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

interface WarrantyCardProps {
  warranty: Warranty;
}

// Function to determine badge variant based on expiry
const getExpiryBadgeVariant = (expiryDate: string): "default" | "secondary" | "destructive" | "outline" => {
  const daysLeft = differenceInDays(parseISO(expiryDate), new Date());
  if (daysLeft < 0) return "destructive"; // Expired
  if (daysLeft <= 30) return "secondary"; // Expiring soon (within 30 days)
  return "outline"; // Valid
};

// Function to format expiry status text
const formatExpiryStatus = (expiryDate: string): string => {
  const daysLeft = differenceInDays(parseISO(expiryDate), new Date());
  if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`;
  if (daysLeft === 0) return "Expires today";
  if (daysLeft === 1) return "Expires tomorrow";
  return `Expires in ${daysLeft} days`;
};

export function WarrantyCard({ warranty }: WarrantyCardProps) {
  const expiryDate = parseISO(warranty.expiryDate);
  const badgeVariant = getExpiryBadgeVariant(warranty.expiryDate);
  const expiryStatus = formatExpiryStatus(warranty.expiryDate);

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg break-words">{warranty.productName}</CardTitle>
          <Badge variant={badgeVariant} className="whitespace-nowrap shrink-0">
            {expiryStatus}
          </Badge>
        </div>
        {warranty.brand && (
          <CardDescription>Brand: {warranty.brand}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Expires on: {format(expiryDate, 'PPP')}</span>
        </div>
        {warranty.category && (
            <p className="text-sm text-muted-foreground">Category: {warranty.category}</p>
        )}
         {warranty.retailer && (
            <p className="text-sm text-muted-foreground">Retailer: {warranty.retailer}</p>
        )}
        {/* Optionally display a thumbnail if image exists */} 
        {/* {warranty.image && warranty.image.startsWith('data:image') && ( */}
        {/*   <img src={warranty.image} alt="Product image" className="mt-2 max-h-20 rounded border" /> */}
        {/* )} */}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/warranty/${warranty._id}`}>
            <Eye className="mr-1 h-4 w-4" /> View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
