import { useState } from "react";
import { useCreateListing, useGetCategories } from "@workspace/api-client-react";
import { BottomNav } from "@/components/navigation";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Camera, MapPin, Tag, Box, Info, Navigation, Truck, X } from "lucide-react";

export default function Sell() {
  const [, setLocation] = useLocation();
  const createListing = useCreateListing();
  const { data: categories } = useGetCategories();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "New",
    category: "",
    location: "",
    shippingInfo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    createListing.mutate({
      data: {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        condition: formData.condition,
        category: formData.category,
        location: formData.location,
        shippingInfo: formData.shippingInfo,
        images: ["https://placehold.co/800x600/1d9bf0/000000?text=Listing+Image"]
      }
    }, {
      onSuccess: (listing) => {
        toast.success("Listing created successfully!");
        setLocation(`/listing/${listing.id}`);
      },
      onError: () => {
        toast.error("Failed to create listing");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">New Listing</h1>
        <button 
          onClick={handleSubmit}
          disabled={createListing.isPending}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold text-sm disabled:opacity-50"
        >
          {createListing.isPending ? "Posting..." : "Post"}
        </button>
      </div>

      <form className="p-4 space-y-6" onSubmit={handleSubmit}>
        {/* Image Upload Area */}
        <div className="aspect-[4/3] w-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card cursor-pointer hover:border-primary/50 transition-colors">
          <Camera className="w-8 h-8 mb-2" />
          <span className="font-medium">Add Photos</span>
          <span className="text-xs">Up to 10 images</span>
        </div>

        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="What are you selling?" 
              className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground border-b border-border pb-2 focus:border-primary transition-colors"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-2">
            <span className="text-xl font-bold text-muted-foreground">₦</span>
            <input 
              type="number" 
              placeholder="Price" 
              className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground focus:text-primary transition-colors"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-2 text-muted-foreground focus-within:text-primary transition-colors">
            <Box className="w-5 h-5 shrink-0" />
            <select 
              className="w-full bg-transparent outline-none appearance-none text-foreground"
              value={formData.condition}
              onChange={e => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="New" className="bg-card">New</option>
              <option value="Like New" className="bg-card">Like New</option>
              <option value="Used" className="bg-card">Used</option>
            </select>
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-2 text-muted-foreground focus-within:text-primary transition-colors">
            <Tag className="w-5 h-5 shrink-0" />
            <select 
              className="w-full bg-transparent outline-none appearance-none text-foreground"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled className="bg-card">Select Category</option>
              {categories?.map(c => (
                <option key={c.id} value={c.slug} className="bg-card">{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-2 text-muted-foreground focus-within:text-primary transition-colors">
            <MapPin className="w-5 h-5 shrink-0" />
            <input 
              type="text" 
              placeholder="Location (e.g. Lagos, Abuja)" 
              className="w-full bg-transparent outline-none text-foreground"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-3 border-b border-border pb-2 text-muted-foreground focus-within:text-primary transition-colors">
            <Info className="w-5 h-5 shrink-0 mt-1" />
            <textarea 
              placeholder="Describe your item in detail. Include flaws, dimensions, reasons for selling..." 
              className="w-full bg-transparent outline-none text-foreground resize-none min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-2 text-muted-foreground focus-within:text-primary transition-colors">
            <Truck className="w-5 h-5 shrink-0" />
            <input 
              type="text" 
              placeholder="Shipping options (Optional)" 
              className="w-full bg-transparent outline-none text-foreground"
              value={formData.shippingInfo}
              onChange={e => setFormData({ ...formData, shippingInfo: e.target.value })}
            />
          </div>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}