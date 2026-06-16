import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  { name: "John Adeyemi", username: "johntech", bio: "Tech enthusiast & gadget reseller. Lagos based.", location: "Lagos, Nigeria", rating: 4.8, total_sales: 142, is_verified: true },
  { name: "Amaka Osei", username: "amaka_styles", bio: "Fashion curator. Affordable luxury.", location: "Abuja, Nigeria", rating: 4.9, total_sales: 87, is_verified: true },
  { name: "Chukwudi Nwosu", username: "chukwudi_cars", bio: "Certified auto dealer. Trusted since 2018.", location: "Port Harcourt, Nigeria", rating: 4.7, total_sales: 63, is_verified: true },
  { name: "Fatima Bello", username: "fatima_homes", bio: "Real estate agent. Dream homes made real.", location: "Kano, Nigeria", rating: 4.6, total_sales: 29, is_verified: false },
  { name: "Emeka Okonkwo", username: "emeka_kitchen", bio: "Home & kitchen specialist. Quality guaranteed.", location: "Enugu, Nigeria", rating: 4.5, total_sales: 201, is_verified: true },
  { name: "Ngozi Eze", username: "ngozi_phones", bio: "Mobile device reseller. Sealed packs only.", location: "Lagos, Nigeria", rating: 4.9, total_sales: 315, is_verified: true },
  { name: "Segun Alade", username: "segun_electronics", bio: "Electronics and gadgets at best prices.", location: "Ibadan, Nigeria", rating: 4.3, total_sales: 98, is_verified: false },
  { name: "Chisom Ude", username: "chisom_fashion", bio: "Vintage & designer pieces. Style for less.", location: "Lagos, Nigeria", rating: 4.7, total_sales: 55, is_verified: true },
];

const listings = [
  // Phones
  { title: "iPhone 14 Pro Max 256GB – Deep Purple", description: "Brand new sealed box. Apple warranty. No swap.", price: 820000, original_price: 950000, seller_username: "ngozi_phones", condition: "New", category: "Phones", location: "Lagos, Nigeria", shipping_info: "Ships nationwide", view_count: 1240, watch_count: 87, offer_count: 12, is_auction: false, is_sponsored: true },
  { title: "Samsung Galaxy S23 Ultra 512GB", description: "UK used, excellent condition. S Pen included.", price: 650000, original_price: 800000, seller_username: "ngozi_phones", condition: "Used", category: "Phones", location: "Lagos, Nigeria", shipping_info: "Ships nationwide", view_count: 890, watch_count: 54, offer_count: 8, is_auction: false, is_sponsored: false },
  { title: "Tecno Camon 20 Pro 5G", description: "Brand new, sealed. Network unlocked.", price: 185000, original_price: null, seller_username: "johntech", condition: "New", category: "Phones", location: "Lagos, Nigeria", shipping_info: null, view_count: 420, watch_count: 23, offer_count: 3, is_auction: false, is_sponsored: false },
  { title: "iPhone 12 64GB – Midnight", description: "Good condition. Battery health 86%. Comes with charger.", price: 280000, original_price: 320000, seller_username: "segun_electronics", condition: "Used", category: "Phones", location: "Ibadan, Nigeria", shipping_info: "Ships nationwide", view_count: 610, watch_count: 41, offer_count: 6, is_auction: false, is_sponsored: false },
  { title: "Google Pixel 7a – Charcoal", description: "Never used. Full box. 5 years of updates guaranteed.", price: 370000, original_price: null, seller_username: "ngozi_phones", condition: "New", category: "Phones", location: "Lagos, Nigeria", shipping_info: "Ships nationwide", view_count: 320, watch_count: 19, offer_count: 2, is_auction: false, is_sponsored: false },

  // Electronics
  { title: "MacBook Pro M2 14-inch – 16GB RAM 512GB", description: "2023 model. Barely used. Full Apple warranty.", price: 1450000, original_price: 1700000, seller_username: "johntech", condition: "Used", category: "Electronics", location: "Lagos, Nigeria", shipping_info: "Insured delivery", view_count: 2100, watch_count: 145, offer_count: 21, is_auction: false, is_sponsored: true },
  { title: "Sony WH-1000XM5 Wireless Headphones", description: "Sealed box. Industry-leading noise cancellation.", price: 145000, original_price: 180000, seller_username: "segun_electronics", condition: "New", category: "Electronics", location: "Ibadan, Nigeria", shipping_info: "Ships nationwide", view_count: 750, watch_count: 62, offer_count: 9, is_auction: false, is_sponsored: false },
  { title: "Dell XPS 15 Intel i7 – 32GB RAM 1TB SSD", description: "Excellent condition. Comes with original bag and charger.", price: 980000, original_price: 1200000, seller_username: "johntech", condition: "Used", category: "Electronics", location: "Lagos, Nigeria", shipping_info: null, view_count: 540, watch_count: 38, offer_count: 5, is_auction: false, is_sponsored: false },
  { title: "PlayStation 5 Console (Disc Edition)", description: "Brand new sealed. DualSense controller included.", price: 620000, original_price: null, seller_username: "segun_electronics", condition: "New", category: "Electronics", location: "Ibadan, Nigeria", shipping_info: "Ships nationwide", view_count: 1830, watch_count: 110, offer_count: 18, is_auction: true, auction_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), current_bid: 640000, is_sponsored: false },
  { title: "iPad Air 5th Gen – Wi-Fi 256GB Blue", description: "UK used, pristine. Original accessories included.", price: 510000, original_price: 600000, seller_username: "johntech", condition: "Used", category: "Electronics", location: "Lagos, Nigeria", shipping_info: "Insured delivery", view_count: 680, watch_count: 47, offer_count: 7, is_auction: false, is_sponsored: false },

  // Vehicles
  { title: "2018 Toyota Camry SE – Red", description: "Nigerian used. Full AC, leather seats, reverse camera. Accident-free.", price: 12500000, original_price: null, seller_username: "chukwudi_cars", condition: "Used", category: "Vehicles", location: "Port Harcourt, Nigeria", shipping_info: null, view_count: 3200, watch_count: 210, offer_count: 34, is_auction: false, is_sponsored: true },
  { title: "2020 Honda Civic Sport Turbo", description: "Super clean, full option. All papers intact.", price: 16800000, original_price: null, seller_username: "chukwudi_cars", condition: "Used", category: "Vehicles", location: "Port Harcourt, Nigeria", shipping_info: null, view_count: 2780, watch_count: 195, offer_count: 28, is_auction: false, is_sponsored: false },
  { title: "2016 Ford Edge SEL AWD", description: "Very neat. Panoramic roof, leather interior. Registered Lagos.", price: 14200000, original_price: null, seller_username: "chukwudi_cars", condition: "Used", category: "Vehicles", location: "Port Harcourt, Nigeria", shipping_info: null, view_count: 1450, watch_count: 98, offer_count: 14, is_auction: false, is_sponsored: false },

  // Fashion
  { title: "Nike Air Jordan 1 Retro High OG – Size 44", description: "Brand new in box. DS. Chicago colourway.", price: 85000, original_price: null, seller_username: "amaka_styles", condition: "New", category: "Fashion", location: "Abuja, Nigeria", shipping_info: "Ships nationwide", view_count: 920, watch_count: 73, offer_count: 11, is_auction: false, is_sponsored: false },
  { title: "Gucci GG Supreme Canvas Tote Bag", description: "Authentic. Comes with dust bag and receipt.", price: 420000, original_price: 550000, seller_username: "chisom_fashion", condition: "Used", category: "Fashion", location: "Lagos, Nigeria", shipping_info: "Insured delivery", view_count: 1100, watch_count: 89, offer_count: 16, is_auction: false, is_sponsored: false },
  { title: "Men's Native Senator Fabric 3-Piece Set", description: "Custom tailored. Rich Ankara fabric. Fits size L–XL.", price: 28000, original_price: 35000, seller_username: "amaka_styles", condition: "New", category: "Fashion", location: "Abuja, Nigeria", shipping_info: "Ships nationwide", view_count: 340, watch_count: 22, offer_count: 4, is_auction: false, is_sponsored: false },
  { title: "Adidas Yeezy Boost 350 V2 – Cream White sz 43", description: "Worn twice. Excellent condition. With box.", price: 110000, original_price: 140000, seller_username: "chisom_fashion", condition: "Used", category: "Fashion", location: "Lagos, Nigeria", shipping_info: "Ships nationwide", view_count: 780, watch_count: 58, offer_count: 9, is_auction: false, is_sponsored: false },

  // Property
  { title: "3-Bedroom Flat for Rent – Lekki Phase 1", description: "En-suite. Serviced compound. 24hr security. ₦4.5M/yr.", price: 4500000, original_price: null, seller_username: "fatima_homes", condition: "New", category: "Property", location: "Lekki, Lagos", shipping_info: null, view_count: 5400, watch_count: 320, offer_count: 45, is_auction: false, is_sponsored: true },
  { title: "Self-contained 1-Bedroom – Wuse 2 Abuja", description: "Fully furnished. DSTV, internet included. Short let available.", price: 1800000, original_price: null, seller_username: "fatima_homes", condition: "New", category: "Property", location: "Wuse 2, Abuja", shipping_info: null, view_count: 2100, watch_count: 140, offer_count: 19, is_auction: false, is_sponsored: false },

  // Home & Kitchen
  { title: "Thermomix TM6 – All-in-One Kitchen Machine", description: "New in box. Guided cooking, 22 functions. Full warranty.", price: 850000, original_price: 1000000, seller_username: "emeka_kitchen", condition: "New", category: "Home & Kitchen", location: "Enugu, Nigeria", shipping_info: "Ships nationwide", view_count: 430, watch_count: 31, offer_count: 6, is_auction: false, is_sponsored: false },
  { title: "Scanfrost 310L Double-Door Refrigerator", description: "Brand new. Energy efficient. 2-year warranty.", price: 245000, original_price: 290000, seller_username: "emeka_kitchen", condition: "New", category: "Home & Kitchen", location: "Enugu, Nigeria", shipping_info: "Free delivery within Enugu", view_count: 560, watch_count: 44, offer_count: 7, is_auction: false, is_sponsored: false },
  { title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker", description: "Used twice. Perfect condition. All accessories included.", price: 68000, original_price: 85000, seller_username: "emeka_kitchen", condition: "Used", category: "Home & Kitchen", location: "Enugu, Nigeria", shipping_info: "Ships nationwide", view_count: 280, watch_count: 18, offer_count: 3, is_auction: false, is_sponsored: false },
  { title: "Sofa Set 7-Seater – L-Shaped Executive", description: "Brand new. Genuine leather. Delivery available in Lagos.", price: 380000, original_price: 450000, seller_username: "emeka_kitchen", condition: "New", category: "Home & Kitchen", location: "Lagos, Nigeria", shipping_info: "Lagos delivery only", view_count: 720, watch_count: 52, offer_count: 8, is_auction: false, is_sponsored: false },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding database…");

    // Clear existing data
    await client.query("TRUNCATE listings, users RESTART IDENTITY CASCADE");

    // Insert users
    const userMap = {};
    for (const user of users) {
      const res = await client.query(
        `INSERT INTO users (name, username, bio, location, rating, total_sales, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [user.name, user.username, user.bio, user.location, user.rating, user.total_sales, user.is_verified]
      );
      userMap[user.username] = res.rows[0].id;
      console.log(`  ✓ User: ${user.username}`);
    }

    // Insert listings
    for (const listing of listings) {
      const sellerId = userMap[listing.seller_username];
      if (!sellerId) {
        console.warn(`  ⚠ No seller found for username: ${listing.seller_username}`);
        continue;
      }
      await client.query(
        `INSERT INTO listings
           (title, description, price, original_price, seller_id, condition, category,
            location, shipping_info, view_count, watch_count, offer_count,
            is_auction, auction_ends_at, current_bid, is_sponsored)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          listing.title,
          listing.description,
          listing.price,
          listing.original_price ?? null,
          sellerId,
          listing.condition,
          listing.category,
          listing.location,
          listing.shipping_info ?? null,
          listing.view_count,
          listing.watch_count,
          listing.offer_count,
          listing.is_auction ?? false,
          listing.auction_ends_at ?? null,
          listing.current_bid ?? null,
          listing.is_sponsored ?? false,
        ]
      );
      console.log(`  ✓ Listing: ${listing.title.slice(0, 50)}`);
    }

    console.log("\n✅ Seed complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
