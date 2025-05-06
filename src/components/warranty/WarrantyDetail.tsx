import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  Clock,
  Edit,
  FileText,
  Share2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Define an empty array as a placeholder for warranties
const warranties: any[] = [];

export function WarrantyDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isReminderSet, setIsReminderSet] = useState(false);

  // Find the warranty by ID
  const warranty = warranties.find((w) => w.id === id);

  if (!warranty) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="h-16 w-16 text-orange-400" />
        <h2 className="mt-4 text-2xl font-bold">Warranty Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The warranty you're looking for doesn't exist or has been removed
        </p>
        <Button onClick={() => navigate("/warranties")} className="mt-6">
          Go to My Warranties
        </Button>
      </div>
    );
  }

  // Calculate days left for warranty
  const today = new Date();
  const expiryDate = new Date(warranty.expiryDate);
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Format dates for display
  const formattedPurchaseDate = new Date(warranty.purchaseDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const formattedExpiryDate = new Date(warranty.expiryDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const handleDelete = () => {
    // In a real app, you would delete the warranty here
    toast({
      title: "Warranty Deleted",
      description: "The warranty has been successfully deleted.",
    });
    navigate("/warranties");
  };

  const toggleReminder = () => {
    setIsReminderSet(!isReminderSet);
    toast({
      title: isReminderSet ? "Reminder Removed" : "Reminder Set",
      description: isReminderSet
        ? "The warranty expiration reminder has been removed."
        : "We'll remind you 30 days before your warranty expires.",
    });
  };

  const handleShare = () => {
    // Simulate sharing
    toast({
      title: "Warranty Shared",
      description: "A shareable link has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/warranties")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Warranties
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(`/warranty/edit/${id}`)}
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Warranty</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this warranty? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>{warranty.productName}</CardTitle>
                <CardDescription>{warranty.brand}</CardDescription>
              </div>
              <Badge
                variant={
                  daysLeft < 0
                    ? "destructive"
                    : daysLeft < 30
                    ? "default"
                    : "secondary"
                }
              >
                {daysLeft <= 0 ? "Expired" : `${daysLeft} days remaining`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {warranty.image && (
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={warranty.image}
                  alt={warranty.productName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <h4 className="text-sm text-muted-foreground">Category</h4>
                <p className="font-medium">{warranty.category}</p>
              </div>
              {warranty.retailer && (
                <div className="space-y-1">
                  <h4 className="text-sm text-muted-foreground">Retailer</h4>
                  <p className="font-medium">{warranty.retailer}</p>
                </div>
              )}
              <div className="space-y-1">
                <h4 className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Purchase Date
                  </span>
                </h4>
                <p className="font-medium">{formattedPurchaseDate}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Warranty Expiry
                  </span>
                </h4>
                <p className="font-medium">{formattedExpiryDate}</p>
              </div>
              {warranty.serialNumber && (
                <div className="space-y-1 sm:col-span-2">
                  <h4 className="text-sm text-muted-foreground">Serial Number</h4>
                  <p className="font-medium font-mono">{warranty.serialNumber}</p>
                </div>
              )}
            </div>

            {warranty.notes && (
              <div className="space-y-1">
                <h4 className="text-sm text-muted-foreground">Notes</h4>
                <p className="rounded-lg bg-muted p-3 text-sm">{warranty.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warranty Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={toggleReminder}
              >
                <Bell className={isReminderSet ? "text-primary" : "text-muted-foreground"} />
                {isReminderSet ? "Remove Reminder" : "Set Expiry Reminder"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleShare}
              >
                <Share2 className="text-muted-foreground" />
                Share Warranty Details
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <FileText className="text-muted-foreground" />
                View Warranty Document
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warranty Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Purchased</p>
                    <p className="text-xs text-muted-foreground">
                      {formattedPurchaseDate}
                    </p>
                  </div>
                </div>
                <div className="ml-3.5 h-10 w-px bg-border" />
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                    <Clock className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Warranty Period</p>
                    <p className="text-xs text-muted-foreground">
                      {daysLeft > 0
                        ? `${daysLeft} days remaining`
                        : "Warranty expired"}
                    </p>
                  </div>
                </div>
                <div className="ml-3.5 h-10 w-px bg-border" />
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Expires</p>
                    <p className="text-xs text-muted-foreground">
                      {formattedExpiryDate}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
