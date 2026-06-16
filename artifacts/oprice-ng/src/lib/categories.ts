import {
  Tv, Smartphone, Monitor, Shirt, Home, Leaf, Car, Building2,
  KeyRound, BriefcaseBusiness, Wrench, ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryConfig {
  label: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  subcategories: string[];
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    label: "Electronics",
    slug: "electronics",
    icon: Tv,
    color: "#1a3a5c",
    subcategories: ["Televisions", "Generators", "Air Conditioners", "Refrigerators", "Sound Systems", "Cameras", "Fans", "Irons & Steamers"],
  },
  {
    label: "Phones",
    slug: "phones",
    icon: Smartphone,
    color: "#1a3a2a",
    subcategories: ["Smartphones", "Tablets", "Earphones", "Chargers & Cables", "Cases & Covers", "Smartwatches", "Feature Phones"],
  },
  {
    label: "Computers",
    slug: "computers",
    icon: Monitor,
    color: "#2a1a4a",
    subcategories: ["Laptops", "Desktops", "Monitors", "Printers", "Accessories", "Networking", "Storage"],
  },
  {
    label: "Fashion",
    slug: "fashion",
    icon: Shirt,
    color: "#3a1a1a",
    subcategories: ["Men's Wear", "Women's Wear", "Shoes", "Bags", "Jewelry", "Kids' Fashion", "Ankara & Native", "Underwear"],
  },
  {
    label: "Home",
    slug: "home-living",
    icon: Home,
    color: "#1a3a1a",
    subcategories: ["Furniture", "Kitchenware", "Bedding", "Lighting", "Home Decor", "Garden", "Cleaning Supplies", "Tools"],
  },
  {
    label: "Food",
    slug: "food-agriculture",
    icon: Leaf,
    color: "#2a3a10",
    subcategories: ["Food Items", "Farm Produce", "Livestock", "Poultry", "Farm Equipment", "Seeds & Fertilizers", "Fish & Seafood"],
  },
  {
    label: "Vehicles",
    slug: "vehicles",
    icon: Car,
    color: "#2a1a00",
    subcategories: ["Cars", "Motorcycles", "Trucks", "Buses", "Boats", "Spare Parts", "Tyres & Wheels", "Car Accessories"],
  },
  {
    label: "Property",
    slug: "property",
    icon: Building2,
    color: "#0a2a1a",
    subcategories: ["Houses for Sale", "Land", "Commercial", "Short Lets", "Hotels & Lodging"],
  },
  {
    label: "Rentals",
    slug: "rentals",
    icon: KeyRound,
    color: "#1a2a3a",
    subcategories: ["Apartments", "Shops", "Offices", "Event Halls", "Equipment Rental"],
  },
  {
    label: "Jobs",
    slug: "jobs",
    icon: BriefcaseBusiness,
    color: "#1a0a2a",
    subcategories: ["Full Time", "Part Time", "Internship", "Remote", "Contract", "Freelance"],
  },
  {
    label: "Services",
    slug: "services",
    icon: Wrench,
    color: "#2a2a00",
    subcategories: ["Repairs", "Beauty & Wellness", "Cleaning", "Catering", "Logistics", "Photography", "Education & Tutoring", "Events"],
  },
];

export const ALL_LABEL = "All";
