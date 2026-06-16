export interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  condition: string;
  category: string;
  location: string;
  images?: string[];
  shippingInfo?: string;
  isSponsored?: boolean;
  isFeatured?: boolean;
  isAuction?: boolean;
  auctionEndsAt?: string;
  viewCount: number;
  watchCount: number;
  offerCount: number;
  isWatched?: boolean;
  sellerName: string;
  sellerUsername: string;
  sellerAvatar?: string;
  isVerifiedSeller: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  totalListings: number;
  joinDate: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface TrendingSearch {
  term: string;
  count: number;
}

export interface ListingsPage {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
}
