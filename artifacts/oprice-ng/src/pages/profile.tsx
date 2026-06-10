import { useGetUserProfile, useGetUserListings } from "@workspace/api-client-react";
import { BottomNav } from "@/components/navigation";
import { ListingCard } from "@/components/listing-card";
import { Calendar, MapPin, BadgeCheck, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  // Hardcoded to current user for demo purposes
  const username = "john_doe"; 
  
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile(username);
  const { data: listings, isLoading: isListingsLoading } = useGetUserListings(username);

  if (isProfileLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-20">
      {/* Cover Photo */}
      <div className="h-32 sm:h-48 bg-secondary relative">
        {profile.coverImage && <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />}
      </div>

      <div className="px-4 relative">
        {/* Avatar & Action Button */}
        <div className="flex justify-between items-start">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background bg-card -mt-10 sm:-mt-12 overflow-hidden relative z-10">
            {profile.avatar && <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />}
          </div>
          <div className="mt-3">
            <button className="px-4 py-1.5 rounded-full border border-border font-bold text-sm hover:bg-card transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-3">
          <h1 className="text-xl font-bold flex items-center gap-1">
            {profile.name}
            {profile.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>

        {profile.bio && <p className="mt-3">{profile.bio}</p>}

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Joined {format(new Date(profile.joinDate), 'MMMM yyyy')}
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <div><span className="font-bold text-foreground">{profile.totalSales}</span> <span className="text-muted-foreground">Sales</span></div>
          <div><span className="font-bold text-foreground">{profile.rating}</span> <span className="text-muted-foreground">Rating</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mt-4">
        <button className="flex-1 py-3 font-bold relative text-foreground">
          Listings
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
        </button>
        <button className="flex-1 py-3 font-bold text-muted-foreground hover:bg-card/50 transition-colors">
          Bookmarks
        </button>
      </div>

      {/* Listings Grid */}
      {isListingsLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col">
          {listings?.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}