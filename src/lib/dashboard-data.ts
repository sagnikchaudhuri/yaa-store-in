// ─── Types ────────────────────────────────────────────────────────

export type ProductStatus  = "listed" | "unlisted" | "scheduled";
export type TicketStatus   = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type DropStatus     = "draft" | "scheduled" | "live" | "ended";
export type AnemoneMode    = "casual" | "hype" | "calm" | "festive";
export type TicketSource   = "contact-form" | "manual";

export type IssueType =
  | "wrong-item"
  | "damaged"
  | "not-received"
  | "exchange-return"
  | "drop-registration"
  | "payment"
  | "sizing"
  | "general-inquiry"
  | "other";

export const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; emoji: string; priority: TicketPriority }> = {
  "wrong-item":        { label: "Wrong Item Received",   emoji: "📦", priority: "high"   },
  "damaged":           { label: "Damaged / Defective",   emoji: "🔴", priority: "high"   },
  "not-received":      { label: "Order Not Received",    emoji: "🚚", priority: "high"   },
  "exchange-return":   { label: "Exchange / Return",     emoji: "🔄", priority: "medium" },
  "drop-registration": { label: "Drop Registration",     emoji: "⚡", priority: "medium" },
  "payment":           { label: "Payment Issue",         emoji: "💳", priority: "high"   },
  "sizing":            { label: "Sizing Question",       emoji: "📏", priority: "low"    },
  "general-inquiry":   { label: "General Inquiry",       emoji: "💬", priority: "low"    },
  "other":             { label: "Other",                 emoji: "🗂️", priority: "low"    },
};

export interface DashboardProduct {
  id: string;
  name: string;
  franchise: string;
  character?: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  scheduledAt?: string;
  isDrop: boolean;
  isLimited: boolean;
  isFeatured: boolean;
  tags: string[];
  views: number;
  orders: number;
  images?: (string | null)[];
}

export interface DashboardTicket {
  id: string;
  user: string;
  avatar: string;
  phone?: string;
  franchise?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  time: string;
  message: string;
  orderRef?: string;
  escalated?: boolean;
  // Extended fields — scalable for WhatsApp Business API + Supabase later
  source?: TicketSource;
  issueType?: IssueType;
  customerName?: string; // full name from contact form
}

export interface DashboardDrop {
  id: string;
  title: string;
  franchise: string;
  emoji: string;
  scheduledAt: string;
  units: number;
  registered: number;
  status: DropStatus;
  description: string;
}

export interface ActivityItem {
  id: string;
  type: "order" | "registration" | "support" | "community" | "restock";
  user: string;
  description: string;
  amount?: number;
  time: string;
  franchise?: string;
}

export interface FranchiseStat {
  name: string;
  pct: number;
  orders: number;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────

export const OVERVIEW_STATS = {
  activeUsers:    1_247,
  ordersToday:    89,
  revenue:        { today: 12_847, month: 89_234, growth: 14.2 },
  pendingDrops:   4,
  supportOpen:    8,
  communitySize:  2_412,
  topProduct:     "Gojo Satoru Figure",
  topProductViews: 342,
};

export const WEEKLY_REVENUE = [8420, 9100, 7650, 11200, 10800, 13400, 12847];
export const WEEKLY_ORDERS  = [62,   71,   55,   88,    82,    103,   89];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const REVENUE_CHART  = WEEKLY_REVENUE.map((v, i) => ({ day: DAYS[i], revenue: v, orders: WEEKLY_ORDERS[i] }));

export const FRANCHISE_STATS: FranchiseStat[] = [
  { name: "Naruto",        pct: 24, orders: 312, color: "oklch(0.72 0.16 130)" },
  { name: "One Piece",     pct: 19, orders: 247, color: "oklch(0.68 0.19 44)"  },
  { name: "Jujutsu Kaisen",pct: 17, orders: 221, color: "oklch(0.55 0.22 280)" },
  { name: "Demon Slayer",  pct: 12, orders: 156, color: "oklch(0.62 0.20 20)"  },
  { name: "Bleach",        pct: 11, orders: 143, color: "oklch(0.58 0.18 240)" },
  { name: "Ghibli",        pct:  9, orders: 117, color: "oklch(0.64 0.14 160)" },
  { name: "Others",        pct:  8, orders: 104, color: "oklch(0.75 0.04 260)" },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  { id:"a1", type:"order",        user:"Kira M.",   description:"Ordered Gojo Satoru Figure",         amount:89.99, time:"2m ago",  franchise:"JJK"          },
  { id:"a2", type:"registration", user:"Ryuu K.",   description:"Registered for Gear 5 Luffy drop",               time:"5m ago",  franchise:"One Piece"    },
  { id:"a3", type:"order",        user:"Suki T.",   description:"Ordered Akatsuki Cloak + Ring Set",   amount:124.98,time:"11m ago", franchise:"Naruto"       },
  { id:"a4", type:"community",    user:"Nova X.",   description:"Joined the WhatsApp community",                  time:"18m ago"                            },
  { id:"a5", type:"order",        user:"Hana L.",   description:"Ordered Nezuko Collector Pre-order",  amount:59.99, time:"24m ago", franchise:"Demon Slayer" },
  { id:"a6", type:"support",      user:"Ren A.",    description:"Opened support ticket #TKT-008",                 time:"31m ago"                            },
  { id:"a7", type:"order",        user:"Miko P.",   description:"Ordered Totoro XL Plush",             amount:34.99, time:"38m ago", franchise:"Ghibli"       },
  { id:"a8", type:"registration", user:"Zane W.",   description:"Registered for Nezuko Collector Box",            time:"45m ago", franchise:"Demon Slayer"  },
  { id:"a9", type:"order",        user:"Aiko S.",   description:"Ordered Ichigo Bankai Figure",        amount:99.99, time:"52m ago", franchise:"Bleach"       },
  { id:"a10",type:"restock",      user:"System",    description:"Itachi Uchiha Figure restocked (50)",            time:"1h ago",  franchise:"Naruto"       },
];

export const DASHBOARD_PRODUCTS: DashboardProduct[] = [
  { id:"p1",  name:"Gojo Satoru Figure",       franchise:"Jujutsu Kaisen", category:"figures",      price:89.99,  stock:14, status:"listed",   isDrop:false, isLimited:false, isFeatured:true,  tags:["jjk","gojo","figure"],     views:342, orders:28 },
  { id:"p2",  name:"Gear 5 Luffy Figure",      franchise:"One Piece",      category:"figures",      price:79.99,  stock:300,status:"scheduled", isDrop:true,  isLimited:true,  isFeatured:true,  tags:["one piece","luffy","drop"], views:891, orders:0  },
  { id:"p3",  name:"Tanjiro Haori",            franchise:"Demon Slayer",   category:"apparel",      price:54.99,  stock:43, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["demon slayer","haori"],     views:156, orders:19 },
  { id:"p4",  name:"Survey Corps Jacket",      franchise:"Attack on Titan",category:"apparel",      price:74.99,  stock:0,  status:"unlisted",  isDrop:false, isLimited:false, isFeatured:false, tags:["aot","jacket"],             views:89,  orders:0  },
  { id:"p5",  name:"Akatsuki Ring Set",        franchise:"Naruto",         category:"accessories",  price:34.99,  stock:62, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["naruto","rings"],           views:204, orders:47 },
  { id:"p6",  name:"Pochita Plush",            franchise:"Chainsaw Man",   category:"collectibles", price:24.99,  stock:88, status:"listed",   isDrop:false, isLimited:false, isFeatured:true,  tags:["csm","pochita","plush"],    views:278, orders:61 },
  { id:"p7",  name:"Itachi Uchiha Figure",     franchise:"Naruto",         category:"figures",      price:94.99,  stock:50, status:"listed",   isDrop:false, isLimited:false, isFeatured:true,  tags:["naruto","itachi"],          views:319, orders:22 },
  { id:"p8",  name:"Akatsuki Cloak",           franchise:"Naruto",         category:"apparel",      price:89.99,  stock:31, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["naruto","cloak"],           views:187, orders:14 },
  { id:"p9",  name:"Minato Namikaze Figure",   franchise:"Naruto",         category:"figures",      price:89.99,  stock:300,status:"scheduled", isDrop:true,  isLimited:true,  isFeatured:false, tags:["naruto","minato","drop"],   views:447, orders:0  },
  { id:"p10", name:"Ichigo Bankai Figure",     franchise:"Bleach",         category:"figures",      price:99.99,  stock:9,  status:"listed",   isDrop:false, isLimited:false, isFeatured:true,  tags:["bleach","ichigo"],          views:233, orders:17 },
  { id:"p11", name:"Soul Reaper Shihakushō",   franchise:"Bleach",         category:"apparel",      price:64.99,  stock:27, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["bleach","uniform"],         views:118, orders:9  },
  { id:"p12", name:"Zoro Three-Sword Set",     franchise:"One Piece",      category:"accessories",  price:49.99,  stock:38, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["one piece","zoro","swords"],views:162, orders:21 },
  { id:"p13", name:"Denji Nendoroid",          franchise:"Chainsaw Man",   category:"figures",      price:74.99,  stock:22, status:"listed",   isDrop:false, isLimited:false, isFeatured:true,  tags:["csm","denji","nendoroid"],  views:198, orders:15 },
  { id:"p14", name:"Totoro XL Garden Plush",   franchise:"Studio Ghibli",  category:"collectibles", price:34.99,  stock:56, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["ghibli","totoro","plush"],  views:209, orders:33 },
  { id:"p15", name:"No-Face Collector Piece",  franchise:"Studio Ghibli",  category:"collectibles", price:59.99,  stock:200,status:"scheduled", isDrop:true,  isLimited:true,  isFeatured:false, tags:["ghibli","no-face","drop"],  views:334, orders:0  },
  { id:"p16", name:"Sukuna Finger Ring Set",   franchise:"Jujutsu Kaisen", category:"accessories",  price:39.99,  stock:71, status:"listed",   isDrop:false, isLimited:false, isFeatured:false, tags:["jjk","sukuna","rings"],     views:175, orders:26 },
];

export const DASHBOARD_TICKETS: DashboardTicket[] = [
  { id:"TKT-008", user:"Ren A.",    avatar:"R", phone:"+234-803-***-7821", franchise:"Jujutsu Kaisen", subject:"Wrong figure in box — received Ichigo instead of Gojo",       status:"open",        priority:"high",   time:"31m ago",  message:"Hi, I ordered the Gojo Satoru Figure but received the Ichigo Bankai Figure instead. Order #YAA-2891. Please advise on exchange process.", orderRef:"YAA-2891", escalated:true,  source:"manual", issueType:"wrong-item"        },
  { id:"TKT-007", user:"Sumi K.",   avatar:"S", phone:"+234-801-***-4409", franchise:"Demon Slayer",   subject:"Haori sizing — medium too large, can I exchange for small?",  status:"open",        priority:"medium", time:"2h ago",   message:"The Tanjiro Haori medium is quite oversized. Is there an exchange policy? I'd like a small if possible.", orderRef:"YAA-2847", escalated:false, source:"manual", issueType:"sizing"            },
  { id:"TKT-006", user:"Dex M.",    avatar:"D", phone:"+234-706-***-2230", franchise:"One Piece",      subject:"Drop registration not confirmed — no email received",         status:"in-progress", priority:"medium", time:"4h ago",   message:"I registered for the Gear 5 Luffy drop 3 days ago but never received a confirmation email. Can you check my registration?", escalated:false, source:"manual", issueType:"drop-registration" },
  { id:"TKT-005", user:"Yuki P.",   avatar:"Y", phone:"+234-815-***-9982", franchise:"Chainsaw Man",   subject:"Pochita plush arrived with torn seam on left ear",            status:"in-progress", priority:"high",   time:"6h ago",   message:"The plush arrived with a visible tear on the left ear seam. Would like a replacement or refund.", orderRef:"YAA-2801", escalated:false, source:"manual", issueType:"damaged"           },
  { id:"TKT-004", user:"Arlo T.",   avatar:"A", phone:"+234-807-***-6641", franchise:"Naruto",         subject:"When does the Naruto Minato drop go live?",                  status:"resolved",    priority:"low",    time:"1d ago",   message:"Could you tell me the exact time the Minato Figure drop goes live? The page just says 'coming soon'.", escalated:false, source:"manual", issueType:"general-inquiry"   },
  { id:"TKT-003", user:"Mara J.",   avatar:"M", phone:"+234-802-***-3375", franchise:"Naruto",         subject:"Akatsuki Ring Set — missing ring number 7 (Zetsu)",          status:"resolved",    priority:"medium", time:"2d ago",   message:"The complete set says 10 rings but mine only has 9. Ring number 7 associated with Zetsu appears to be missing.", orderRef:"YAA-2734", escalated:false, source:"manual", issueType:"wrong-item"        },
  { id:"TKT-002", user:"Finn B.",   avatar:"F", phone:"+61-04-***-55120",  franchise:undefined,        subject:"Shipping to Australia — estimated delivery?",                status:"closed",      priority:"low",    time:"3d ago",   message:"What is the estimated delivery time to Melbourne, Australia? The checkout shows 'international' but no timeframe.", escalated:false, source:"manual", issueType:"general-inquiry"   },
  { id:"TKT-001", user:"Cleo H.",   avatar:"C", phone:"+234-809-***-8843", franchise:undefined,        subject:"Can I request a custom franchise for a group order?",        status:"closed",      priority:"low",    time:"5d ago",   message:"We have 12 people interested in a Dragon Ball merch bundle. Is custom/group ordering available?", escalated:false, source:"manual", issueType:"general-inquiry"   },
];

export const DASHBOARD_DROPS: DashboardDrop[] = [
  { id:"d1", title:"Gear 5 Luffy Figure",      franchise:"One Piece",     emoji:"⚡", scheduledAt:"2025-06-15T18:00:00Z", units:300, registered:1_247, status:"scheduled", description:"1/8 scale hand-painted figure. Pre-registration closes 48h before drop." },
  { id:"d2", title:"YAA Summer Haori Collection",franchise:"Original",    emoji:"🎌", scheduledAt:"2025-06-22T12:00:00Z", units:150, registered:892,   status:"scheduled", description:"8 exclusive designs in collaboration with independent Japanese artists." },
  { id:"d3", title:"Nezuko Collector Box",      franchise:"Demon Slayer",  emoji:"🌸", scheduledAt:"2025-07-05T15:00:00Z", units:200, registered:543,   status:"scheduled", description:"Premium bundle: hand-painted figure, 3 art prints, exclusive stickers." },
  { id:"d4", title:"Minato Namikaze Figure",    franchise:"Naruto",        emoji:"🍃", scheduledAt:"2025-07-18T18:00:00Z", units:300, registered:284,   status:"draft",     description:"4th Hokage in Anbu pose. Strictly limited, no restock planned." },
];

export const COMMUNITY_STATS = {
  totalMembers:  2_412,
  activeToday:   184,
  newThisWeek:   67,
  messages30d:   4_891,
  topContributor:"Kira M.",
  alerts:        3,
};

export const ANEMONE_STATS = {
  conversationsToday: 47,
  avgMessagesPerSession: 4.2,
  topIntent: "drops",
  topSeries: "Naruto",
  mockResponseRate: 100,
  satisfactionPct: 91,
};

// ─── Category ─────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  emoji: string;
  active: boolean;
}

export const SEED_CATEGORIES: Category[] = [
  { id: "cat1", name: "Figures",            emoji: "🗿", active: true  },
  { id: "cat2", name: "Apparel",            emoji: "👗", active: true  },
  { id: "cat3", name: "Accessories",        emoji: "💍", active: true  },
  { id: "cat4", name: "Collectibles",       emoji: "📦", active: true  },
  { id: "cat5", name: "Oversized T-Shirts", emoji: "👕", active: true  },
  { id: "cat6", name: "Hoodies",            emoji: "🧥", active: true  },
  { id: "cat7", name: "Posters",            emoji: "🖼️", active: true  },
  { id: "cat8", name: "Keychains",          emoji: "🔑", active: true  },
];

// ─── WhatsApp Community types ──────────────────────────────────────

export type WaDateRange = "7d" | "30d" | "90d";

export interface WaGroup {
  id: string;
  name: string;
  emoji: string;
  type: "community" | "group" | "broadcast" | "dms";
  members: number;
  color: string;
  description: string;
}

export interface WaGroupStats {
  messages: number;
  activeMembers: number;
  supportInquiries: number;
  engagementScore: number;   // 0–100
  newMembers: number;
  topFranchise: string;
  messageTrend: number[];    // 7 data points for sparkline
  franchiseBreakdown: Array<{ franchise: string; messages: number; color: string }>;
  topCollectors: Array<{ name: string; avatar: string; messages: number; orders: number; franchise: string }>;
  dropInterest: Array<{ title: string; emoji: string; mentions: number; registrations: number }>;
}

// ─── WhatsApp groups mock data ─────────────────────────────────────

export const WA_GROUPS: WaGroup[] = [
  { id: "all",  name: "All Sources",       emoji: "🌍", type: "community", members: 4_620, color: "oklch(0.68 0.19 44)",  description: "Aggregate across all groups, DMs and broadcast channels"    },
  { id: "g1",   name: "YAA Main Community",emoji: "🎌", type: "community", members: 2_412, color: "oklch(0.68 0.19 44)",  description: "Primary WhatsApp community — open to all fans and customers" },
  { id: "g2",   name: "Drop Alert Squad",  emoji: "⚡", type: "group",     members: 1_087, color: "oklch(0.55 0.22 280)", description: "High-signal group for registered drop customers only"         },
  { id: "g3",   name: "Naruto Fans NG",    emoji: "🍃", type: "group",     members: 683,   color: "oklch(0.72 0.16 130)", description: "Franchise-specific group for Naruto collectors"              },
  { id: "g4",   name: "One Piece Crew",    emoji: "🏴‍☠️", type: "group",   members: 541,   color: "oklch(0.62 0.16 50)",  description: "One Piece fans and Luffy drop enthusiasts"                   },
  { id: "g5",   name: "JJK Fan Circle",    emoji: "🔵", type: "group",     members: 421,   color: "oklch(0.55 0.22 280)", description: "Jujutsu Kaisen collectors and discussion"                    },
  { id: "g6",   name: "Broadcast Channel", emoji: "📣", type: "broadcast",  members: 1_804, color: "oklch(0.64 0.14 160)", description: "One-way announcements — drops, restocks, events"             },
];

// Stats indexed by [groupId][range] — replace with API call in production
const _S: Record<string, Record<WaDateRange, WaGroupStats>> = {
  all: {
    "7d":  { messages:1_340, activeMembers:312, supportInquiries:7,  engagementScore:76, newMembers:18, topFranchise:"One Piece",  messageTrend:[148,162,185,210,198,214,223], franchiseBreakdown:[{franchise:"One Piece",messages:312,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:278,color:"oklch(0.72 0.16 130)"},{franchise:"Jujutsu Kaisen",messages:241,color:"oklch(0.55 0.22 280)"},{franchise:"Demon Slayer",messages:187,color:"oklch(0.62 0.20 20)"},{franchise:"Bleach",messages:162,color:"oklch(0.58 0.18 240)"},{franchise:"Studio Ghibli",messages:110,color:"oklch(0.64 0.14 160)"}],topCollectors:[{name:"Kira M.",avatar:"K",messages:94,orders:3,franchise:"One Piece"},{name:"Ryuu K.",avatar:"R",messages:81,orders:2,franchise:"Naruto"},{name:"Suki T.",avatar:"S",messages:68,orders:2,franchise:"Demon Slayer"},{name:"Nova X.",avatar:"N",messages:57,orders:1,franchise:"JJK"},{name:"Hana L.",avatar:"H",messages:49,orders:1,franchise:"Demon Slayer"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:84,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:51,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:37,registrations:892}]},
    "30d": { messages:4_891, activeMembers:496, supportInquiries:23, engagementScore:78, newMembers:67, topFranchise:"One Piece",  messageTrend:[580,620,710,810,740,820,891], franchiseBreakdown:[{franchise:"One Piece",messages:891,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:742,color:"oklch(0.72 0.16 130)"},{franchise:"Jujutsu Kaisen",messages:618,color:"oklch(0.55 0.22 280)"},{franchise:"Demon Slayer",messages:441,color:"oklch(0.62 0.20 20)"},{franchise:"Bleach",messages:387,color:"oklch(0.58 0.18 240)"},{franchise:"Studio Ghibli",messages:312,color:"oklch(0.64 0.14 160)"}],topCollectors:[{name:"Kira M.",avatar:"K",messages:284,orders:12,franchise:"One Piece"},{name:"Ryuu K.",avatar:"R",messages:231,orders:9,franchise:"Naruto"},{name:"Suki T.",avatar:"S",messages:198,orders:7,franchise:"Demon Slayer"},{name:"Nova X.",avatar:"N",messages:167,orders:5,franchise:"JJK"},{name:"Hana L.",avatar:"H",messages:143,orders:11,franchise:"Demon Slayer"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:312,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:198,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:154,registrations:892}]},
    "90d": { messages:14_280,activeMembers:681, supportInquiries:68, engagementScore:81, newMembers:182,topFranchise:"Naruto",     messageTrend:[1240,1380,1510,1820,1680,1940,2020],franchiseBreakdown:[{franchise:"Naruto",messages:3140,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:2890,color:"oklch(0.68 0.19 44)"},{franchise:"Jujutsu Kaisen",messages:2340,color:"oklch(0.55 0.22 280)"},{franchise:"Demon Slayer",messages:1820,color:"oklch(0.62 0.20 20)"},{franchise:"Bleach",messages:1540,color:"oklch(0.58 0.18 240)"},{franchise:"Studio Ghibli",messages:1100,color:"oklch(0.64 0.14 160)"}],topCollectors:[{name:"Kira M.",avatar:"K",messages:841,orders:28,franchise:"One Piece"},{name:"Ryuu K.",avatar:"R",messages:712,orders:19,franchise:"Naruto"},{name:"Suki T.",avatar:"S",messages:598,orders:14,franchise:"Demon Slayer"},{name:"Hana L.",avatar:"H",messages:521,orders:21,franchise:"Demon Slayer"},{name:"Zane W.",avatar:"Z",messages:487,orders:11,franchise:"Bleach"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:891,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:624,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:512,registrations:543}]},
  },
  g1: {
    "7d":  { messages:784,  activeMembers:198, supportInquiries:4,  engagementScore:82, newMembers:12, topFranchise:"Naruto",     messageTrend:[89,98,108,122,115,128,124],   franchiseBreakdown:[{franchise:"Naruto",messages:198,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:172,color:"oklch(0.68 0.19 44)"},{franchise:"JJK",messages:141,color:"oklch(0.55 0.22 280)"},{franchise:"Demon Slayer",messages:112,color:"oklch(0.62 0.20 20)"},{franchise:"Bleach",messages:98,color:"oklch(0.58 0.18 240)"},{franchise:"Studio Ghibli",messages:63,color:"oklch(0.64 0.14 160)"}],topCollectors:[{name:"Kira M.",avatar:"K",messages:52,orders:2,franchise:"One Piece"},{name:"Suki T.",avatar:"S",messages:41,orders:2,franchise:"Demon Slayer"},{name:"Ryuu K.",avatar:"R",messages:38,orders:1,franchise:"Naruto"},{name:"Nova X.",avatar:"N",messages:34,orders:1,franchise:"JJK"},{name:"Miko P.",avatar:"M",messages:28,orders:2,franchise:"Ghibli"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:48,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:31,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:24,registrations:543}]},
    "30d": { messages:2_841, activeMembers:412, supportInquiries:15, engagementScore:82, newMembers:41, topFranchise:"Naruto",     messageTrend:[321,348,389,420,401,452,510],  franchiseBreakdown:[{franchise:"Naruto",messages:712,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:581,color:"oklch(0.68 0.19 44)"},{franchise:"JJK",messages:421,color:"oklch(0.55 0.22 280)"},{franchise:"Demon Slayer",messages:312,color:"oklch(0.62 0.20 20)"},{franchise:"Bleach",messages:248,color:"oklch(0.58 0.18 240)"},{franchise:"Studio Ghibli",messages:198,color:"oklch(0.64 0.14 160)"}],topCollectors:[{name:"Kira M.",avatar:"K",messages:184,orders:8,franchise:"One Piece"},{name:"Suki T.",avatar:"S",messages:142,orders:5,franchise:"Demon Slayer"},{name:"Ryuu K.",avatar:"R",messages:128,orders:5,franchise:"Naruto"},{name:"Nova X.",avatar:"N",messages:108,orders:3,franchise:"JJK"},{name:"Miko P.",avatar:"M",messages:91,orders:6,franchise:"Ghibli"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:184,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:112,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:88,registrations:543}]},
    "90d": { messages:8_124, activeMembers:534, supportInquiries:42, engagementScore:84, newMembers:114,topFranchise:"Naruto",     messageTrend:[820,910,980,1140,1020,1180,1280],franchiseBreakdown:[{franchise:"Naruto",messages:2140,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:1820,color:"oklch(0.68 0.19 44)"},{franchise:"JJK",messages:1380,color:"oklch(0.55 0.22 280)"},{franchise:"Demon Slayer",messages:1020,color:"oklch(0.62 0.20 20)"},{franchise:"Bleach",messages:840,color:"oklch(0.58 0.18 240)"},{franchise:"Studio Ghibli",messages:620,color:"oklch(0.64 0.14 160)"}],topCollectors:[{name:"Kira M.",avatar:"K",messages:521,orders:18,franchise:"One Piece"},{name:"Suki T.",avatar:"S",messages:412,orders:11,franchise:"Demon Slayer"},{name:"Ryuu K.",avatar:"R",messages:398,orders:12,franchise:"Naruto"},{name:"Hana L.",avatar:"H",messages:342,orders:14,franchise:"Demon Slayer"},{name:"Nova X.",avatar:"N",messages:287,orders:7,franchise:"JJK"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:512,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:398,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:284,registrations:543}]},
  },
  g2: {
    "7d":  { messages:198,  activeMembers:94,  supportInquiries:1,  engagementScore:91, newMembers:3,  topFranchise:"One Piece",  messageTrend:[22,28,31,34,29,38,36],        franchiseBreakdown:[{franchise:"One Piece",messages:84,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:52,color:"oklch(0.72 0.16 130)"},{franchise:"Demon Slayer",messages:34,color:"oklch(0.62 0.20 20)"},{franchise:"JJK",messages:28,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"Zane W.",avatar:"Z",messages:28,orders:3,franchise:"One Piece"},{name:"Ryuu K.",avatar:"R",messages:22,orders:2,franchise:"Naruto"},{name:"Hana L.",avatar:"H",messages:19,orders:4,franchise:"Demon Slayer"},{name:"Aiko S.",avatar:"A",messages:16,orders:1,franchise:"Bleach"},{name:"Kira M.",avatar:"K",messages:14,orders:2,franchise:"One Piece"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:54,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:38,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:29,registrations:892}]},
    "30d": { messages:782,  activeMembers:281, supportInquiries:4,  engagementScore:91, newMembers:9,  topFranchise:"One Piece",  messageTrend:[82,94,108,118,101,134,145],   franchiseBreakdown:[{franchise:"One Piece",messages:284,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:198,color:"oklch(0.72 0.16 130)"},{franchise:"Demon Slayer",messages:142,color:"oklch(0.62 0.20 20)"},{franchise:"JJK",messages:98,color:"oklch(0.55 0.22 280)"},{franchise:"Bleach",messages:60,color:"oklch(0.58 0.18 240)"}],topCollectors:[{name:"Zane W.",avatar:"Z",messages:94,orders:8,franchise:"One Piece"},{name:"Ryuu K.",avatar:"R",messages:78,orders:5,franchise:"Naruto"},{name:"Hana L.",avatar:"H",messages:64,orders:7,franchise:"Demon Slayer"},{name:"Aiko S.",avatar:"A",messages:51,orders:3,franchise:"Bleach"},{name:"Kira M.",avatar:"K",messages:43,orders:4,franchise:"One Piece"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:198,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:142,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:104,registrations:892}]},
    "90d": { messages:2_180, activeMembers:394, supportInquiries:11, engagementScore:93, newMembers:22, topFranchise:"One Piece",  messageTrend:[198,224,248,281,258,312,334],  franchiseBreakdown:[{franchise:"One Piece",messages:812,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:614,color:"oklch(0.72 0.16 130)"},{franchise:"Demon Slayer",messages:428,color:"oklch(0.62 0.20 20)"},{franchise:"JJK",messages:214,color:"oklch(0.55 0.22 280)"},{franchise:"Bleach",messages:112,color:"oklch(0.58 0.18 240)"}],topCollectors:[{name:"Zane W.",avatar:"Z",messages:284,orders:18,franchise:"One Piece"},{name:"Hana L.",avatar:"H",messages:231,orders:16,franchise:"Demon Slayer"},{name:"Ryuu K.",avatar:"R",messages:198,orders:12,franchise:"Naruto"},{name:"Aiko S.",avatar:"A",messages:167,orders:9,franchise:"Bleach"},{name:"Kira M.",avatar:"K",messages:142,orders:10,franchise:"One Piece"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:598,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:412,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:341,registrations:543}]},
  },
  g3: {
    "7d":  { messages:198,  activeMembers:68,  supportInquiries:2,  engagementScore:85, newMembers:4,  topFranchise:"Naruto",     messageTrend:[24,29,31,28,32,27,27],        franchiseBreakdown:[{franchise:"Naruto",messages:168,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:18,color:"oklch(0.68 0.19 44)"},{franchise:"JJK",messages:12,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"Ryuu K.",avatar:"R",messages:38,orders:3,franchise:"Naruto"},{name:"Nova X.",avatar:"N",messages:28,orders:1,franchise:"Naruto"},{name:"Mara J.",avatar:"M",messages:21,orders:2,franchise:"Naruto"},{name:"Arlo T.",avatar:"A",messages:18,orders:1,franchise:"Naruto"},{name:"Kira M.",avatar:"K",messages:14,orders:1,franchise:"Naruto"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:12,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:28,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:8,registrations:543}]},
    "30d": { messages:742,  activeMembers:198, supportInquiries:6,  engagementScore:85, newMembers:14, topFranchise:"Naruto",     messageTrend:[84,98,108,118,101,124,109],   franchiseBreakdown:[{franchise:"Naruto",messages:612,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:64,color:"oklch(0.68 0.19 44)"},{franchise:"JJK",messages:42,color:"oklch(0.55 0.22 280)"},{franchise:"Bleach",messages:24,color:"oklch(0.58 0.18 240)"}],topCollectors:[{name:"Ryuu K.",avatar:"R",messages:128,orders:7,franchise:"Naruto"},{name:"Nova X.",avatar:"N",messages:94,orders:3,franchise:"Naruto"},{name:"Mara J.",avatar:"M",messages:78,orders:5,franchise:"Naruto"},{name:"Arlo T.",avatar:"A",messages:62,orders:2,franchise:"Naruto"},{name:"Kira M.",avatar:"K",messages:41,orders:2,franchise:"Naruto"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:42,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:98,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:28,registrations:543}]},
    "90d": { messages:2_284, activeMembers:284, supportInquiries:17, engagementScore:87, newMembers:38, topFranchise:"Naruto",     messageTrend:[212,248,278,320,298,342,318],  franchiseBreakdown:[{franchise:"Naruto",messages:1940,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:184,color:"oklch(0.68 0.19 44)"},{franchise:"JJK",messages:98,color:"oklch(0.55 0.22 280)"},{franchise:"Bleach",messages:62,color:"oklch(0.58 0.18 240)"}],topCollectors:[{name:"Ryuu K.",avatar:"R",messages:398,orders:14,franchise:"Naruto"},{name:"Mara J.",avatar:"M",messages:284,orders:9,franchise:"Naruto"},{name:"Nova X.",avatar:"N",messages:241,orders:7,franchise:"Naruto"},{name:"Arlo T.",avatar:"A",messages:198,orders:5,franchise:"Naruto"},{name:"Kira M.",avatar:"K",messages:142,orders:4,franchise:"Naruto"}],dropInterest:[{title:"YAA Summer Haori",emoji:"🎌",mentions:341,registrations:892},{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:124,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:84,registrations:543}]},
  },
  g4: {
    "7d":  { messages:241,  activeMembers:74,  supportInquiries:1,  engagementScore:88, newMembers:3,  topFranchise:"One Piece",  messageTrend:[28,34,38,42,36,48,45],        franchiseBreakdown:[{franchise:"One Piece",messages:221,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:12,color:"oklch(0.72 0.16 130)"},{franchise:"JJK",messages:8,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"Zane W.",avatar:"Z",messages:48,orders:3,franchise:"One Piece"},{name:"Kira M.",avatar:"K",messages:38,orders:2,franchise:"One Piece"},{name:"Hana L.",avatar:"H",messages:28,orders:3,franchise:"One Piece"},{name:"Aiko S.",avatar:"A",messages:21,orders:1,franchise:"One Piece"},{name:"Dex M.",avatar:"D",messages:17,orders:1,franchise:"One Piece"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:78,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:14,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:8,registrations:543}]},
    "30d": { messages:891,  activeMembers:218, supportInquiries:4,  engagementScore:88, newMembers:11, topFranchise:"One Piece",  messageTrend:[98,112,124,138,118,148,153],  franchiseBreakdown:[{franchise:"One Piece",messages:812,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:48,color:"oklch(0.72 0.16 130)"},{franchise:"JJK",messages:31,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"Zane W.",avatar:"Z",messages:168,orders:9,franchise:"One Piece"},{name:"Kira M.",avatar:"K",messages:128,orders:6,franchise:"One Piece"},{name:"Hana L.",avatar:"H",messages:104,orders:8,franchise:"One Piece"},{name:"Aiko S.",avatar:"A",messages:78,orders:4,franchise:"One Piece"},{name:"Dex M.",avatar:"D",messages:54,orders:2,franchise:"One Piece"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:284,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:42,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:24,registrations:543}]},
    "90d": { messages:2_624, activeMembers:312, supportInquiries:12, engagementScore:90, newMembers:28, topFranchise:"One Piece",  messageTrend:[248,284,312,358,328,398,412],  franchiseBreakdown:[{franchise:"One Piece",messages:2480,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:98,color:"oklch(0.72 0.16 130)"},{franchise:"JJK",messages:46,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"Zane W.",avatar:"Z",messages:498,orders:19,franchise:"One Piece"},{name:"Kira M.",avatar:"K",messages:384,orders:14,franchise:"One Piece"},{name:"Hana L.",avatar:"H",messages:312,orders:16,franchise:"One Piece"},{name:"Aiko S.",avatar:"A",messages:241,orders:9,franchise:"One Piece"},{name:"Dex M.",avatar:"D",messages:184,orders:6,franchise:"One Piece"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:841,registrations:1247},{title:"YAA Summer Haori",emoji:"🎌",mentions:128,registrations:892},{title:"Nezuko Collector Box",emoji:"🌸",mentions:84,registrations:543}]},
  },
  g5: {
    "7d":  { messages:168,  activeMembers:54,  supportInquiries:1,  engagementScore:84, newMembers:2,  topFranchise:"Jujutsu Kaisen",messageTrend:[21,24,28,26,24,22,23],     franchiseBreakdown:[{franchise:"Jujutsu Kaisen",messages:148,color:"oklch(0.55 0.22 280)"},{franchise:"Naruto",messages:12,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:8,color:"oklch(0.68 0.19 44)"}],topCollectors:[{name:"Nova X.",avatar:"N",messages:38,orders:2,franchise:"JJK"},{name:"Kira M.",avatar:"K",messages:28,orders:1,franchise:"JJK"},{name:"Suki T.",avatar:"S",messages:22,orders:1,franchise:"JJK"},{name:"Miko P.",avatar:"M",messages:18,orders:2,franchise:"JJK"},{name:"Ren A.",avatar:"R",messages:14,orders:1,franchise:"JJK"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:8,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:12,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:18,registrations:892}]},
    "30d": { messages:618,  activeMembers:164, supportInquiries:4,  engagementScore:84, newMembers:8,  topFranchise:"Jujutsu Kaisen",messageTrend:[64,72,84,94,88,102,114],   franchiseBreakdown:[{franchise:"Jujutsu Kaisen",messages:558,color:"oklch(0.55 0.22 280)"},{franchise:"Naruto",messages:34,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:26,color:"oklch(0.68 0.19 44)"}],topCollectors:[{name:"Nova X.",avatar:"N",messages:124,orders:6,franchise:"JJK"},{name:"Kira M.",avatar:"K",messages:98,orders:4,franchise:"JJK"},{name:"Suki T.",avatar:"S",messages:84,orders:3,franchise:"JJK"},{name:"Miko P.",avatar:"M",messages:62,orders:5,franchise:"JJK"},{name:"Ren A.",avatar:"R",messages:48,orders:2,franchise:"JJK"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:28,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:42,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:64,registrations:892}]},
    "90d": { messages:1_842, activeMembers:241, supportInquiries:12, engagementScore:86, newMembers:21, topFranchise:"Jujutsu Kaisen",messageTrend:[168,198,228,262,244,284,312],franchiseBreakdown:[{franchise:"Jujutsu Kaisen",messages:1684,color:"oklch(0.55 0.22 280)"},{franchise:"Naruto",messages:98,color:"oklch(0.72 0.16 130)"},{franchise:"One Piece",messages:60,color:"oklch(0.68 0.19 44)"}],topCollectors:[{name:"Nova X.",avatar:"N",messages:368,orders:14,franchise:"JJK"},{name:"Kira M.",avatar:"K",messages:298,orders:9,franchise:"JJK"},{name:"Suki T.",avatar:"S",messages:254,orders:8,franchise:"JJK"},{name:"Miko P.",avatar:"M",messages:198,orders:12,franchise:"JJK"},{name:"Ren A.",avatar:"R",messages:142,orders:5,franchise:"JJK"}],dropInterest:[{title:"Nezuko Collector Box",emoji:"🌸",mentions:128,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:198,registrations:892},{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:84,registrations:1247}]},
  },
  g6: {
    "7d":  { messages:84,   activeMembers:12,  supportInquiries:0,  engagementScore:45, newMembers:8,  topFranchise:"One Piece",  messageTrend:[8,12,10,14,11,16,13],         franchiseBreakdown:[{franchise:"One Piece",messages:42,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:24,color:"oklch(0.72 0.16 130)"},{franchise:"JJK",messages:18,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"System",avatar:"📣",messages:84,orders:0,franchise:"All"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:42,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:28,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:14,registrations:892}]},
    "30d": { messages:241,  activeMembers:22,  supportInquiries:1,  engagementScore:45, newMembers:28, topFranchise:"One Piece",  messageTrend:[28,32,34,38,33,42,34],        franchiseBreakdown:[{franchise:"One Piece",messages:124,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:68,color:"oklch(0.72 0.16 130)"},{franchise:"JJK",messages:49,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"System",avatar:"📣",messages:241,orders:0,franchise:"All"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:128,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:84,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:29,registrations:892}]},
    "90d": { messages:698,  activeMembers:38,  supportInquiries:2,  engagementScore:47, newMembers:72, topFranchise:"One Piece",  messageTrend:[64,72,80,92,84,102,98],       franchiseBreakdown:[{franchise:"One Piece",messages:348,color:"oklch(0.68 0.19 44)"},{franchise:"Naruto",messages:214,color:"oklch(0.72 0.16 130)"},{franchise:"JJK",messages:136,color:"oklch(0.55 0.22 280)"}],topCollectors:[{name:"System",avatar:"📣",messages:698,orders:0,franchise:"All"}],dropInterest:[{title:"Gear 5 Luffy Figure",emoji:"⚡",mentions:382,registrations:1247},{title:"Nezuko Collector Box",emoji:"🌸",mentions:198,registrations:543},{title:"YAA Summer Haori",emoji:"🎌",mentions:118,registrations:892}]},
  },
};

export function getWaStats(groupId: string, range: WaDateRange): WaGroupStats {
  return _S[groupId]?.[range] ?? _S["all"]["30d"];
}

// ─── WhatsApp acknowledgement generator ───────────────────────────
// Replace with WhatsApp Business API template call in production

export function generateWaAck(ticket: DashboardTicket): string {
  const firstName   = ticket.customerName?.split(" ")[0] ?? ticket.user.split(" ")[0];
  const issueCfg    = ISSUE_TYPE_CONFIG[ticket.issueType ?? "general-inquiry"];
  const orderLine   = ticket.orderRef ? `\n📋 *Order:* ${ticket.orderRef}` : "";
  const frLine      = ticket.franchise ? `\n🎌 *Series:* ${ticket.franchise}` : "";
  return [
    `Hi ${firstName}! 👋`,
    ``,
    `We've received your support request and created ticket *${ticket.id}*.`,
    ``,
    `${issueCfg.emoji} *Issue type:* ${issueCfg.label}${orderLine}${frLine}`,
    ``,
    `Our team is reviewing it now. You'll hear from us via WhatsApp within *24 hours*. ⚡`,
    ``,
    `Thank you for shopping with YAA Store 🙏`,
    `_— YAA Store Support_`,
  ].join("\n");
}
