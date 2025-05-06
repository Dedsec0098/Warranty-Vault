import { useState } from "react"; // Remove useEffect
import {
  Filter,
  List,
  Grid as GridIcon,
  CheckSquare,
  Clock,
  FileX,
  // Remove Loader2 and AlertTriangle if loading/error handled by parent
} from "lucide-react";
import { WarrantyCard } from "./WarrantyCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Update Warranty type to include fields from MongoDB (_id, etc.)
interface Warranty {
  _id: string; // Use _id from MongoDB
  id?: string; // Keep optional id if used elsewhere, though _id is primary
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

type WarrantyView = "grid" | "list";
type WarrantyStatus = "all" | "active" | "expiring" | "expired";

interface WarrantyListProps {
  warranties: Warranty[]; // Keep warranties prop
  isLoading?: boolean; // Optional: Pass loading state from parent
  error?: string | null; // Optional: Pass error state from parent
  // Remove onDelete prop
  // onDelete: (id: string) => void;
}

// Remove onDelete from the function parameters
export function WarrantyList({ warranties, isLoading, error }: WarrantyListProps) {
  // Remove internal state for data, loading, and error
  // const [warrantiesData, setWarrantiesData] = useState<Warranty[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<WarrantyView>("grid");
  const [status, setStatus] = useState<WarrantyStatus>("all");
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Remove useEffect for fetching data
  // useEffect(() => { ... }, []);

  // Filter warranties based on the passed 'warranties' prop
  const filteredWarranties = warranties.filter((warranty) => {
    // ... (keep existing filtering logic) ...
    // Filter by search query
    if (
      searchQuery &&
      !warranty.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !warranty.brand.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by category
    if (category !== "all" && warranty.category !== category) {
      return false;
    }

    // Filter by status
    if (status !== "all") {
      const today = new Date();
      const expiryDate = new Date(warranty.expiryDate);
      const daysLeft = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        (status === "active" && daysLeft <= 0) ||
        (status === "expiring" && (daysLeft <= 0 || daysLeft > 30)) ||
        (status === "expired" && daysLeft > 0)
      ) {
        return false;
      }
    }

    return true;
  });

  // ... (keep statusOptions and categories) ...
  const statusOptions = [
    { value: "all", label: "All Warranties", icon: CheckSquare },
    { value: "active", label: "Active", icon: CheckSquare },
    { value: "expiring", label: "Expiring Soon", icon: Clock },
    { value: "expired", label: "Expired", icon: FileX },
  ];

  const categories = ["all", "Electronics", "Appliances", "Furniture", "Automotive", "Other"];


  // Remove internal Loading State - Parent should handle this
  // if (isLoading) { ... }

  // Remove internal Error State - Parent should handle this
  // if (error) { ... }

  // Update initial empty check based on the prop (optional, parent might handle)
  // if (warranties.length === 0 && !isLoading && !error) { ... }


  return (
    <div className="space-y-4">
      {/* ... (keep header and filter controls) ... */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Warranties</h2>
          <p className="text-muted-foreground">
            Manage and track all your product warranties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue={view}
            className="w-full sm:w-auto"
            onValueChange={(value) => setView(value as WarrantyView)}
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="grid">
                <GridIcon className="mr-2 h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="mr-2 h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search warranties..."
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setStatus(option.value as WarrantyStatus)}
                  className={status === option.value ? "bg-secondary" : ""}
                >
                  <option.icon className="mr-2 h-4 w-4" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-32 sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Render based on filteredWarranties derived from the prop */}
      {filteredWarranties.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileX className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No warranties found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || category !== 'all' || status !== 'all'
              ? "Try adjusting your search or filters."
              // Update the message slightly as the component doesn't know if *any* warranties exist
              : "No warranties match the current filters, or you haven't added any yet."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "fade-in stagger-children",
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          )}
        >
          {filteredWarranties.map((warranty) => (
            <WarrantyCard
              key={warranty._id} // Use _id as the key
              warranty={warranty} // Pass the whole warranty object as the 'warranty' prop
              // Remove onDelete prop being passed
              // onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
