import React from 'react';
import { useGetBookmarks } from '@workspace/api-client-react';
import MasonryGrid from '../components/ui/masonry-grid';
import { DiscoverCard } from '../components/discover-card';

export default function SavedPage() {
  const { data: listings, isLoading, isError } = useGetBookmarks();

  if (isLoading) return <div className="p-8">Loading saved items…</div>;
  if (isError) return <div className="p-8">Failed to load saved items.</div>;

  const items = Array.isArray(listings) ? listings : [];

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold">No saved items</h3>
        <p className="text-muted-foreground">Save listings to see them here.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <MasonryGrid>
        {items.map((listing) => (
          <DiscoverCard key={listing.id} listing={listing} />
        ))}
      </MasonryGrid>
    </div>
  );
}
