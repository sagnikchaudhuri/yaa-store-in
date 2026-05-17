// ─────────────────────────────────────────────────────────────────────────────
// Anemone conversation engine
//
// Architecture:
//   getMockResponse(messages) → string
//     Used by the API route when ANTHROPIC_API_KEY is absent.
//     Plug in the real Claude call in /api/anemone/route.ts when ready.
//
// Extension points are marked with ── PLUG-IN POINT ── comments.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared types ────────────────────────────────────────────────────────────
export interface AnemoneMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Greeting / widget constants ─────────────────────────────────────────────
export const GREETING_CONTENT =
  "Nyan~ I'm **Anemone**! 🐱✨\n\nYour fandom guide and YAA Store's resident anime-obsessed cat. I know every drop, every series, every collector piece on the site.\n\nWhat are we vibing with today?";

export const IDLE_PROMPTS = [
  "Gear 5 Luffy drop in 18 days — register now~ ⚡",
  "Gojo's Six Eyes make every curse look like slow-motion 👁️",
  "Tanjiro's haori: ichimatsu checkers = family legacy 🔥",
  "What's your spirit anime? I'll find your perfect merch 🐱",
  "One Piece: 27 years, 1100+ chapters, still going 🏴‍☠️",
  "Nezuko Collector Box drops July 5 — only 200 units 🌸",
  "2,400+ fans in the YAA community. Join up! 🐾",
  "Itachi's Tsukuyomi: 72 hours of illusion in one instant ⚔️",
  "Pochita plush is criminally soft. Just saying 🪚",
  "Zoro gets lost on straight roads. Still the greatest swordsman 🗡️",
  "Ask me anything — I live for this stuff 😺",
  "No-Face Ceramic Figure dropping soon. 200 units. Don't sleep 🌿",
];

// Shown before user sends first message — picked randomly each session open.
// The widget picks 4 from this pool.
export const ALL_STARTERS = [
  { emoji: "🛍️", label: "Recommend merch",    msg: "What merch would you recommend for me?" },
  { emoji: "⚡", label: "Upcoming drops",      msg: "What drops are coming up soon?" },
  { emoji: "🎲", label: "Anime trivia",        msg: "Hit me with a random anime trivia fact!" },
  { emoji: "🗿", label: "Best figures",        msg: "What are your best figures right now?" },
  { emoji: "🌸", label: "Demon Slayer drops",  msg: "What Demon Slayer drops do you have?" },
  { emoji: "🏴‍☠️", label: "One Piece section", msg: "Tell me about the One Piece collection" },
  { emoji: "📦", label: "Shipping info",       msg: "Do you ship internationally?" },
  { emoji: "💰", label: "Price range",         msg: "What's the price range at YAA Store?" },
  { emoji: "🤝", label: "Order help",          msg: "I need help with my order" },
  { emoji: "🐾", label: "About YAA Store",     msg: "Tell me about YAA Store" },
  { emoji: "👗", label: "Apparel picks",       msg: "What anime apparel do you sell?" },
  { emoji: "🔵", label: "JJK collection",      msg: "What JJK merchandise do you have?" },
];

// ─── Product catalogue (source of truth for mock engine) ─────────────────────
// ── PLUG-IN POINT: Replace with live Supabase/API fetch when ready ──
export const PRODUCTS_IN_STOCK = [
  { name: "Gojo Satoru Figure",      series: "jjk",           price: 89.99,  stock: 14,  category: "figure",    tags: ["blindfold","six eyes","fan fave"] },
  { name: "Tanjiro Haori",           series: "demon-slayer",   price: 54.99,  stock: 43,  category: "apparel",   tags: ["haori","checkered","wearable"] },
  { name: "Akatsuki Ring Set",       series: "naruto",         price: 34.99,  stock: 62,  category: "accessory", tags: ["10 rings","zinc alloy","villain"] },
  { name: "Pochita Plush",           series: "chainsaw-man",   price: 24.99,  stock: 88,  category: "plush",     tags: ["soft","best seller","cozy"] },
  { name: "Itachi Uchiha Figure",    series: "naruto",         price: 94.99,  stock: 50,  category: "figure",    tags: ["anbu","sharingan","fan fave"] },
  { name: "Akatsuki Cloak",          series: "naruto",         price: 89.99,  stock: 31,  category: "apparel",   tags: ["full length","red clouds","villain"] },
  { name: "Ichigo Bankai Figure",    series: "bleach",         price: 99.99,  stock: 9,   category: "figure",    tags: ["hollow mask","tensa zangetsu","statement"] },
  { name: "Soul Reaper Shihakushō",  series: "bleach",         price: 64.99,  stock: 27,  category: "apparel",   tags: ["uniform","satin","soul society"] },
  { name: "Zoro Three-Sword Set",    series: "one-piece",      price: 49.99,  stock: 38,  category: "accessory", tags: ["swords","display stand","wado"] },
  { name: "Denji Nendoroid",         series: "chainsaw-man",   price: 74.99,  stock: 22,  category: "figure",    tags: ["nendoroid","chainsaws","pochita included"] },
  { name: "Totoro XL Garden Plush",  series: "ghibli",         price: 34.99,  stock: 56,  category: "plush",     tags: ["45cm","licensed","velboa"] },
  { name: "Sukuna Finger Ring Set",  series: "jjk",            price: 39.99,  stock: 71,  category: "accessory", tags: ["3 rings","sterling silver","cursed"] },
  { name: "Minato Namikaze Figure",  series: "naruto",         price: 89.99,  stock: 300, category: "figure",    tags: ["4th hokage","anbu","limited"],  drop: true, dropDate: "Jul 18" },
  { name: "Gear 5 Luffy Figure",     series: "one-piece",      price: 79.99,  stock: 300, category: "figure",    tags: ["gear 5","grin","hand painted"], drop: true, dropDate: "Jun 15" },
  { name: "YAA Summer Haori",        series: "original",       price: 0,      stock: 150, category: "apparel",   tags: ["collab","japanese artists"],    drop: true, dropDate: "Jun 22" },
  { name: "Nezuko Collector Box",    series: "demon-slayer",   price: 0,      stock: 200, category: "collector", tags: ["figure","art prints","stickers"], drop: true, dropDate: "Jul 5"  },
  { name: "No-Face Collector Piece", series: "ghibli",         price: 59.99,  stock: 200, category: "collector", tags: ["ceramic","hand painted"],        drop: true, dropDate: "TBA"    },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Shuffle array (Fisher-Yates) — used by widget to rotate starters
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Series keyword map ───────────────────────────────────────────────────────
const SERIES_HINTS: Array<{ id: string; keywords: string[] }> = [
  { id: "naruto",       keywords: ["naruto","itachi","sasuke","akatsuki","minato","hokage","konoha","hinata","kakashi","obito","pain","jiraiya","tsunade","orochimaru","shikamaru","rock lee","neji","gaara","sharingan","rasengan","chidori","byakugan","nine tails","uchiha","uzumaki"] },
  { id: "one-piece",    keywords: ["one piece","luffy","zoro","gear 5","pirate","shanks","nami","sanji","usopp","robin","chopper","brook","franky","ace","whitebeard","kaido","big mom","doflamingo","law","straw hat","grand line","devil fruit","haki","wano"] },
  { id: "jjk",         keywords: ["jujutsu","jjk","gojo","sukuna","yuji","megumi","nobara","nanami","choso","toji","yuta","maki","panda","cursed energy","cursed technique","domain expansion","shibuya"] },
  { id: "demon-slayer", keywords: ["demon slayer","kimetsu","tanjiro","nezuko","rengoku","zenitsu","inosuke","haori","breathing","shinobu","tengen","muzan","giyu","kanao","genya","hashira","muichiro","sun breathing","water breathing"] },
  { id: "bleach",       keywords: ["bleach","ichigo","bankai","zangetsu","rukia","byakuya","soul reaper","hollow","aizen","urahara","orihime","chad","renji","kenpachi","yoruichi","quincy","arrancar","tybw","thousand year blood war","shikai","vizard"] },
  { id: "chainsaw-man", keywords: ["chainsaw man","denji","pochita","power","makima","aki","chainsaw","devil","kobeni","yoshida","fujimoto","nayuta","gun devil","fiend"] },
  { id: "ghibli",       keywords: ["ghibli","totoro","spirited away","no-face","miyazaki","howl","nausicaa","mononoke","kiki","chihiro","yubaba","san","ashitaka","calcifer","sophie","no face"] },
  { id: "aot",          keywords: ["attack on titan","aot","eren","mikasa","armin","levi","survey corps","titan","shingeki","paradis","marley","colossus","founding titan"] },
];

function getContextSeries(text: string): string | null {
  const lower = text.toLowerCase();
  for (const { id, keywords } of SERIES_HINTS) {
    if (keywords.some(k => lower.includes(k))) return id;
  }
  return null;
}

// ─── Specific product lookup ──────────────────────────────────────────────────
const PRODUCT_KEYWORDS: Array<{ keys: string[]; productName: string; series: string }> = [
  { keys: ["gojo","six eyes","satoru"],            productName: "Gojo Satoru Figure",     series: "jjk" },
  { keys: ["itachi","uchiha"],                     productName: "Itachi Uchiha Figure",   series: "naruto" },
  { keys: ["ichigo","bankai","zangetsu"],           productName: "Ichigo Bankai Figure",   series: "bleach" },
  { keys: ["luffy","gear 5","gear5"],              productName: "Gear 5 Luffy Figure",    series: "one-piece" },
  { keys: ["minato","4th hokage","namikaze"],      productName: "Minato Namikaze Figure", series: "naruto" },
  { keys: ["tanjiro","haori","checkered"],         productName: "Tanjiro Haori",          series: "demon-slayer" },
  { keys: ["nezuko","collector box"],              productName: "Nezuko Collector Box",   series: "demon-slayer" },
  { keys: ["pochita","plush"],                     productName: "Pochita Plush",          series: "chainsaw-man" },
  { keys: ["denji","nendoroid"],                   productName: "Denji Nendoroid",        series: "chainsaw-man" },
  { keys: ["totoro","garden plush"],               productName: "Totoro XL Garden Plush", series: "ghibli" },
  { keys: ["no-face","no face","kaonashi"],        productName: "No-Face Collector Piece",series: "ghibli" },
  { keys: ["akatsuki cloak","cloak"],              productName: "Akatsuki Cloak",         series: "naruto" },
  { keys: ["akatsuki ring","ring set","10 ring"],  productName: "Akatsuki Ring Set",      series: "naruto" },
  { keys: ["sukuna ring","finger ring"],           productName: "Sukuna Finger Ring Set", series: "jjk" },
  { keys: ["zoro sword","three sword","wado"],     productName: "Zoro Three-Sword Set",   series: "one-piece" },
  { keys: ["shihakush","soul reaper uniform"],     productName: "Soul Reaper Shihakushō", series: "bleach" },
  { keys: ["summer haori","yaa haori"],            productName: "YAA Summer Haori",       series: "original" },
];

function detectProductInquiry(q: string): string | null {
  for (const { keys, productName } of PRODUCT_KEYWORDS) {
    if (keys.some(k => q.includes(k))) return productName;
  }
  return null;
}

function getProductDetail(name: string): string {
  const p = PRODUCTS_IN_STOCK.find(x => x.name === name);
  if (!p) return pick(GENERAL_RESPONSES);

  const isDrop = "drop" in p && p.drop;
  const stockLine = isDrop
    ? `📅 **Dropping ${(p as {dropDate?: string}).dropDate}** — ${p.stock} units available. Register on the homepage!`
    : p.stock < 15
    ? `⚠️ Only **${p.stock} left in stock** — moving fast.`
    : `✅ **In stock** (${p.stock} units)`;

  const priceStr = p.price > 0 ? `**₹${p.price.toFixed(2)}**` : "Price announced at drop";

  const tagStr = p.tags.slice(0, 3).join(", ");

  return `**${p.name}** ${isDrop ? "🔥" : "✨"}\n\n${stockLine}\nPrice: ${priceStr}\nVibes: ${tagStr}\n\nWant to know more about it, or shall I show you what pairs well? 🐾`;
}

// ─── Intent detection ─────────────────────────────────────────────────────────
type Intent =
  | "greeting" | "drops" | "availability" | "recommend" | "trivia" | "about"
  | "community" | "pricing" | "figures" | "apparel" | "comparison" | "thanks"
  | "support-help" | "navigate" | "sizing" | "shipping" | "accessories" | "plush"
  | "naruto" | "one-piece" | "jjk" | "demon-slayer" | "bleach" | "chainsaw-man" | "ghibli" | "aot"
  | "followup" | "affirmative" | "general";

function getIntent(q: string): Intent {
  // Greetings
  if (/\b(hello|hi|hey|hii|yo|sup|nyan|heya|wassup|what'?s up|howdy|hola)\b/.test(q)) return "greeting";

  // Support / help with order
  if (/\b(help|issue|problem|broken|damaged|wrong|missing|refund|exchange|return|complaint|stuck|not received|haven'?t received|order|receipt|where is my|whats wrong|something wrong)\b/.test(q)) return "support-help";

  // Navigation / browsing
  if (/\b(where (can i|do i|is|are)|how (do i|to) (find|browse|see|view|get to|navigate)|show me|take me to|browse|explore|find|collection page|collections page|shop page)\b/.test(q)) return "navigate";

  // Sizing
  if (/\b(size|sizing|measurements?|fit|fits|small|medium|large|xl|xxl|what size|which size|size guide|size chart|run (big|small|true))\b/.test(q)) return "sizing";

  // Shipping / delivery
  if (/\b(ship|shipping|delivery|deliver|international|worldwide|how long|when (will|does)|arrival|arrive|track|tracking|dispatch)\b/.test(q)) return "shipping";

  // Drops
  if (/\b(drop|drops|upcoming|release|when|restock|coming soon|limited|register|pre.?register|early access)\b/.test(q)) return "drops";

  // Stock / availability
  if (/\b(in stock|available|do you (have|carry|sell|stock)|got any|is there|any (more|left)|out of stock|sold out|still have)\b/.test(q)) return "availability";

  // Recommendations / purchase intent
  if (/\b(recommend|suggest|what (should|do) i (get|buy|grab|order)|gift|looking for|best|which (one|should)|help me (find|pick|choose|decide)|what'?s (good|popular|worth)|top pick|hot right now)\b/.test(q)) return "recommend";

  // Trivia / facts
  if (/\b(trivia|fact|random|fun fact|tell me something|did you know|something cool|knowledge|quiz)\b/.test(q)) return "trivia";

  // About the store
  if (/\b(about|what is yaa|who are you|what do you do|tell me about (yaa|the store)|how does|what kind|what'?s yaa|yaa store)\b/.test(q)) return "about";

  // Community
  if (/\b(community|whatsapp|group|join|discord|newsletter|notify me|alert|updates?|news)\b/.test(q)) return "community";

  // Pricing
  if (/\b(price|cost|how much|expensive|cheap|worth it|budget|afford|value)\b/.test(q)) return "pricing";

  // Figures (category)
  if (/\b(figure|figures|statue|scale|nendoroid|funko|poseable|articulated|diorama|scale figure)\b/.test(q)) return "figures";

  // Plush / soft toys
  if (/\b(plush|plushie|stuffed|soft toy|plush toy|cuddly)\b/.test(q)) return "plush";

  // Accessories / rings
  if (/\b(accessor|ring|rings|keychain|pin|badge|enamel|wallet|lanyard|pendant|necklace|bracelet)\b/.test(q)) return "accessories";

  // Apparel
  if (/\b(apparel|clothes|clothing|hoodie|shirt|jacket|cloak|haori|uniform|wear|fashion|outfit|streetwear|tee|t.shirt)\b/.test(q)) return "apparel";

  // Comparisons
  if (/\b(better|vs\.?|versus|compare|or |which is|prefer|favourite|favorite)\b/.test(q) && q.length < 100) return "comparison";

  // Thanks
  if (/\b(thanks|thank you|tysm|ty|thx|bye|goodbye|cya|appreciate|perfect|exactly|nailed it|that'?s (all|it)|done)\b/.test(q)) return "thanks";

  // Series-specific
  if (/\b(naruto|itachi|sasuke|akatsuki|minato|kakashi|jiraiya|obito|uchiha|konoha)\b/.test(q)) return "naruto";
  if (/\b(one piece|luffy|zoro|gear 5|straw hat|sanji|usopp|shanks|ace|pirates?)\b/.test(q)) return "one-piece";
  if (/\b(jjk|jujutsu|gojo|sukuna|yuji|megumi|nobara|nanami|cursed)\b/.test(q)) return "jjk";
  if (/\b(demon slayer|kimetsu|tanjiro|nezuko|rengoku|shinobu|zenitsu|inosuke|hashira)\b/.test(q)) return "demon-slayer";
  if (/\b(bleach|ichigo|bankai|zangetsu|rukia|byakuya|aizen|kenpachi|tybw|soul reaper)\b/.test(q)) return "bleach";
  if (/\b(chainsaw man|denji|pochita|makima|power|kobeni|fujimoto)\b/.test(q)) return "chainsaw-man";
  if (/\b(ghibli|totoro|spirited|no.face|miyazaki|howl|kiki|chihiro)\b/.test(q)) return "ghibli";
  if (/\b(attack on titan|aot|eren|mikasa|levi|survey corps)\b/.test(q)) return "aot";

  // Follow-up patterns
  if (/\b(what about|what else|more|anything else|and the|which one|how about|any other|tell me more|keep going|go on|and\??$|more info|show more)\b/.test(q)) return "followup";

  // Short affirmatives
  if (/^(ok|okay|cool|nice|great|love it|sounds good|awesome|sick|fire|based|true|facts|yeah|yep|yup|sure|alright|word|oof|lol|haha|omg|ngl|fr|goated|mid|hype|bet|aight|got it|noted)[\s!.~]*$/.test(q)) return "affirmative";

  return "general";
}

// ─── Response banks ───────────────────────────────────────────────────────────

const GREETING_RESPONSES = [
  "Nyan hey!! 😸 I was hoping you'd say something~\n\nI'm **Anemone**, YAA Store's fandom guide. I know every drop date, every figure, every series we carry.\n\nAsk me about merch, upcoming drops, or just start an anime argument — I'm fully here for it 🐾",
  "Hiii!! 😺 Welcome welcome~\n\nI'm **Anemone** — part mascot, part fandom encyclopedia, part personal shopper. The cat who lives in the vault.\n\nWhat brings you here today? Browsing? Hunting something specific? Or just vibing? All valid 🐱",
  "Heyyyy~ 🐱 You caught me mid trivia spiral but I'm very happy to be interrupted.\n\nI'm **Anemone**! Ask me about drops, series, merch recs, or honestly just chat — I'm always here nyan~",
];

const DROPS_RESPONSES = [
  "Three drops on the radar right now~ 🔥\n\n**⚡ Gear 5 Luffy Figure** — Jun 15 · 300 units · register on the homepage!\n**🎌 YAA Summer Haori** — Jun 22 · collab with Japanese artists · 150 units\n**🌸 Nezuko Collector Box** — Jul 5 · figure + prints + stickers · 200 units\n\nEarliest registered = first to cop. Don't wait nyan~",
  "Drop calendar looking spicy 👀\n\n📅 **Jun 15** — Gear 5 Luffy Figure (1/8 scale, 300 units)\n📅 **Jun 22** — YAA Summer Haori Collection (artist collab, 150 units)\n📅 **Jul 5** — Nezuko Collector Box (200 units worldwide)\n📅 **Jul 18** — Minato Namikaze Figure (draft, 300 units)\n\nRegister at the bottom of the homepage for early access 🐾",
  "Okay so drop culture is literally my favourite thing to talk about 😹\n\nThe big three coming up:\n1. **Gear 5 Luffy** (Jun 15) — most hyped figure we've ever dropped\n2. **Nezuko Collector Box** (Jul 5) — 200 units, art prints included, going to vanish in minutes\n3. **YAA Summer Haori** (Jun 22) — artist collab, 8 exclusive designs\n\nScroll to the bottom of the homepage to register ~ it's free and it gets you first access ⚡",
];

const AVAILABILITY_RESPONSES = [
  "In-stock highlights right now:\n\n✅ **Gojo Figure** (JJK) — 14 left, Fan Fave, moving fast\n✅ **Itachi Figure** (Naruto) — 50 units, going consistently\n✅ **Ichigo Bankai Figure** (Bleach) — only 9 left ⚠️\n✅ **Tanjiro Haori**, **Akatsuki Cloak**, **Pochita Plush**, and more~\n\nFor limited drops: register on the homepage. Tell me the specific piece and I'll give you its exact status 🐱",
  "Great question — let me break it down:\n\n**In stock now:** Gojo Figure, Itachi Figure, Ichigo Figure, Tanjiro Haori, Akatsuki Cloak + Ring Set, Pochita Plush, Denji Nendoroid, Totoro Plush, Zoro Sword Set, Sukuna Rings, and more~\n\n**Dropping soon:** Gear 5 Luffy (Jun 15), Summer Haori (Jun 22), Nezuko Box (Jul 5)\n\nWhat series are you shopping for? 😸",
  "Everything live is on the **Collections page** 🛍️\n\nShort version: 12+ in-stock pieces across figures, apparel, accessories, and plushies. Three major drops coming in June and July.\n\nThe **Ichigo Bankai Figure** is the most at-risk right now — only 9 left. Want details on any specific piece? 🐱",
];

const RECOMMEND_RESPONSES = [
  "Oooh this is my favourite question 😸\n\nTell me which series you love and I'll go full shopkeeper mode! We've got **figures, haori, rings, plushies, collector boxes**...\n\nNaruto? One Piece? JJK? Ghibli? Bleach? Chainsaw Man? Just say the word 🐾",
  "Let's build your perfect shelf 🛍️\n\nI give *very specific* recs — I need your fandom first though 😸. Drop your top series or a favourite character and I'll come back with exactly what you need from the vault~\n\nOr tell me your budget and I'll work within it!",
  "Okay — rec mode activated 🐱\n\nQuick filter questions:\n• **Who's your favourite character?** (I'll find their merch)\n• **What are you into** — figures, wearables, plushies, accessories?\n• **Gift or for yourself?** (changes everything)\n\nAnswer any of those and I'll get specific nyan~",
];

const TRIVIA_BANK = [
  "Itachi could have solo'd the entire Leaf Village — he chose to let it live. The weight of that hits differently every single time ⚔️",
  "Luffy's Gear 5 awakening was foreshadowed from **Chapter 1**. Oda planned this from the beginning. He's just built different 🏴‍☠️",
  "Gojo's Infinity is **always** active — he manually lets things through. He's never truly touched anything unintentionally in his life 👁️",
  "Tanjiro's Hinokami Kagura is actually the lost **Sun Breathing**. The most powerful form, hiding in a family dance for generations 🔥",
  "Pochita and Denji literally **share one heart**. The most bonded duo in manga history 🪚",
  "Totoro only appears to children with **pure hearts**. He's been in Satsuki's garden the entire time 🌿",
  "Every Akatsuki ring has a **specific finger assignment** — you can't just wear them in any order 💍",
  "Zoro gets lost even on **straight roads**. His sense of direction is genuinely the greatest mystery in One Piece 🧭",
  "In Bleach, Ichigo's name literally means '**one who protects**' (一護). Kubo planned everything from the start ⚔️",
  "The Chainsaw Devil is feared even in **hell** — devils consumed by Pochita are erased from collective memory entirely 🪚",
  "Kakashi read the same Make-Out Paradise book on loop for **decades**. The real mystery is how he never finished it 📖",
  "Shanks lost his arm the day he gave Luffy his straw hat. He's known about Luffy's potential since the very beginning 🏴‍☠️",
  "The Survey Corps jacket wings represent freedom — left wing says 'freedom of humanity', right wing says 'dedication to humanity' 🦅",
  "Gojo was the **first person born with both the Six Eyes and Limitless** in 400 years. No wonder the curse world panicked 👁️",
  "Rengoku's last words literally fixed an entire generation's relationship with grief 🔥 Ufotable knew exactly what they were doing.",
  "Usopp has the **highest bounty** among the Straw Hats from non-combat actions. He creates fear with lies alone 🎯",
];

const COMPARISON_RESPONSES = [
  "Ooh dangerous question 😹 I'll give you my honest take:\n\nEvery series hits differently — **JJK** for raw hype and animation, **Demon Slayer** for visual storytelling, **One Piece** for world depth, **Naruto** for character arcs that actually land.\n\nBut I'm biased — I love them all. Which two are you actually weighing up? I'll go full debate mode 🐾",
  "The eternal fandom debate 😸 Honest answer: they're all good for different things.\n\nTell me the two series and what you value most — **animation, story, characters, hype** — and I'll give you a real take rather than a cop-out answer~ 🎲",
  "Okay I'll actually answer this instead of dodging 😹\n\nIf it's figure quality: **JJK and Naruto** have the most collector-grade pieces right now.\nIf it's wearables: **Demon Slayer** haori and **Naruto** cloak are the standout pieces.\nIf it's 'best bang for buck': the **Akatsuki Ring Set** at ₹34.99 goes impossibly hard.\n\nWhat's the actual context — merch, or just series ranking? 🐱",
];

const ABOUT_RESPONSES = [
  "YAA Store is anime merch done right 🔥\n\nCollector-grade pieces across **40+ series** — figures, apparel, accessories, plushies. Drop-first culture baked in: limited runs, registered access, real scarcity.\n\nI'm Anemone — the store's fandom guide, mascot, and resident cat. I basically live here~ 🐱\n\nWant to browse the collection or hear about upcoming drops?",
  "YAA Store = premium anime collector culture, not mass-market merch 🎌\n\nEvery piece is curated. Every drop is intentional. We carry things we'd actually collect ourselves — figures, haori, plushies, accessories across 40+ series.\n\n**2,400+ community members**, **3 drops coming this summer**, and I'm here 24/7 to help you find exactly what belongs on your shelf 🐾",
  "So YAA Store started with one core idea: **anime fans deserve collector-grade merch** without hunting three different import sites 😸\n\nWe carry premium pieces — 1/8 scale figures, hand-embroidered apparel, licensed plushies — across 40+ series. And the drop model keeps things actually limited and special.\n\nCurious about any particular section? I can walk you through the vault~",
];

const FIGURES_RESPONSES = [
  "Figures are the backbone of the vault 🗿\n\nTop picks right now:\n• **Gojo Satoru** (JJK) — Fan Fave, 14 left in stock\n• **Itachi Uchiha** (Naruto) — Fan Fave, the Anbu pose is *perfect*\n• **Ichigo Bankai** (Bleach) — only 9 left ⚠️\n• **Gear 5 Luffy** (One Piece) — dropping Jun 15 🔥\n\nAll hand-painted. Tell me which series vibe and I'll narrow it down 😸",
  "Collector figures — my absolute fave topic 😹\n\nThe **Gear 5 Luffy Figure** is the most hyped upcoming drop (Jun 15, 300 units). **Itachi Uchiha** is the perennial Fan Fave — sells out every restock.\n\nPrice range: **₹74.99–₹99.99** for the 1/8 scale pieces. What series or character are you hunting for? I can get *very specific* nyan~",
  "Figure breakdown by series:\n\n🔵 **JJK** — Gojo Satoru Figure (₹89.99, in stock)\n🍃 **Naruto** — Itachi (₹94.99), Minato dropping Jul 18\n⚔️ **Bleach** — Ichigo Bankai (₹99.99, 9 left!)\n🏴‍☠️ **One Piece** — Gear 5 Luffy dropping Jun 15\n🪚 **Chainsaw Man** — Denji Nendoroid (₹74.99, comes with Pochita!)\n\nAll hand-painted, 1/8 scale where applicable 🐾 Which one's calling your name?",
];

const APPAREL_RESPONSES = [
  "Fandom streetwear is SUCH an underrated category and we go hard on it 🎌\n\n• **Tanjiro Haori** (Demon Slayer) — ₹54.99, premium linen blend — *actual wearable quality*\n• **Akatsuki Cloak** (Naruto) — ₹89.99, full length, embroidered red clouds\n• **Soul Reaper Shihakushō** (Bleach) — ₹64.99, satin black cotton\n• **YAA Summer Haori** — dropping Jun 22, artist collab, 150 units\n\nThese aren't costume pieces — they're collector items you can actually wear nyan~",
  "Apparel picks! Here's the real breakdown 😸\n\nFor **premium wearable quality**: Tanjiro Haori (₹54.99) — runs slightly large, size down one\nFor **full villain mode**: Akatsuki Cloak + Ring Set combo\nFor **Soul Society vibes**: Shihakushō (₹64.99, satin weight, legit uniform quality)\n\nAnd the **YAA Summer Haori** collab (Jun 22) is going to be the most design-forward piece we've released 🔥",
];

const PLUSH_RESPONSES = [
  "Plush section is so underrated and I'm here to change that 🧸\n\n• **Pochita Plush** (Chainsaw Man) — ₹24.99, 88 in stock — *criminally* soft, best seller\n• **Totoro XL Garden Plush** (Ghibli) — ₹34.99, 45cm, officially licensed\n• **Denji Nendoroid** — not a plush but comes *with* a Pochita companion figure!\n\nThe Pochita plush is the one I recommend to literally everyone 😸 Cozy in a chaotic way — perfect brand alignment.",
  "Plushies!! 🧸 My heart~\n\n**Pochita Plush** is the king of cozy at ₹24.99 — it's been a best seller since day one. 88 in stock so no rush, but I'd move on it.\n\n**Totoro XL** at ₹34.99 is the more *statement* pick — 45cm, licensed, velboa fabric. Goes on a shelf and commands the room.\n\nWhich vibe? Chaotic comfort (Pochita) or Ghibli calm (Totoro)? 🌿",
];

const ACCESSORIES_RESPONSES = [
  "Accessories section is where I send people when they want maximum impact for budget 💍\n\n• **Akatsuki Ring Set** (Naruto) — ₹34.99, all 10 rings, zinc alloy, villain mode activated\n• **Sukuna Finger Ring Set** (JJK) — ₹39.99, 3 rings, sterling silver, cursed energy engraved\n• **Zoro Three-Sword Set** (One Piece) — ₹49.99, miniature replicas, display stand included\n\nThe ring sets are the most-gifted items in the store. Just saying 🐱",
  "Rings and accessories are *so* good for gift hunting 🎁\n\n**Akatsuki Ring Set** (₹34.99) — 10 specific-finger-assignment rings, zinc alloy. The villain starter pack.\n**Sukuna Ring Set** (₹39.99) — 3 cursed sigil rings, sterling silver. Quieter but more premium.\n**Zoro Sword Set** (₹49.99) — miniature display pieces, perfect desk companion.\n\nBudget-to-impact ratio is unmatched in this category nyan~",
];

const SUPPORT_RESPONSES = [
  "Oh no — let's get this sorted! 🐱\n\nFor order issues, wrong items, refunds, or anything account-related: head to the **Contact page** (/contact) and drop us a message. The team responds within 24 hours via WhatsApp.\n\nIf it's urgent, mention it's time-sensitive and they'll flag it as high priority. Is there anything I can help clarify while you wait? 🐾",
  "That doesn't sound right — let's fix it 😤\n\nBest path forward:\n1. Go to **Contact** (link in the navigation)\n2. Fill in your order reference and what happened\n3. Team responds within 24h on WhatsApp\n\nFor **wrong items** or **damaged goods** — photos help a lot, so snap one before reaching out if you can.\n\nAnything else I can help with right now? 🐱",
  "I'm sorry to hear that! Here's how to get proper support:\n\n📩 **Contact page** — /contact — describe your issue and include your order number\n📲 **WhatsApp community** — join via the homepage for the fastest response channel\n\nThe support team is human, fast, and actually cares — not a bot (unlike me, ha 😹). They'll make it right. Anything I can answer while you get that sorted?",
];

const NAVIGATE_RESPONSES = [
  "Happy to be your guide! 🗺️\n\n• **Collections** — browse everything by franchise and category → tap 'Collection' in the nav\n• **Drops** — register for upcoming limited releases → homepage, scroll to the drops section\n• **Contact / Support** — order issues, questions → 'Contact' in the nav\n• **Community** — WhatsApp group → homepage, 'Join the Community' section\n\nWhere are we headed? 🐾",
  "Navigation tour! 😸\n\n**Homepage (/)** — hero, upcoming drops, community section\n**Collections (/collections)** — full browsable catalogue by series\n**Contact (/contact)** — support and inquiries\n**Drops signup** — scroll to the bottom of the homepage\n\nWhat are you trying to find? I can send you exactly where you need to go~",
];

const SIZING_RESPONSES = [
  "Sizing notes from the vault 📏\n\n• **Tanjiro Haori** — runs slightly large, we recommend **sizing down one**\n• **Akatsuki Cloak** — one size fits most, generous cut\n• **Soul Reaper Shihakushō** — true to size (S–3XL)\n• **YAA Summer Haori** — sizing TBA closer to drop date\n\nFor figures and accessories — no sizing concerns, they're what they are 😸\n\nWhich specific piece are you checking on? I can be more precise 🐱",
  "Great to check before ordering! 😸 Here's the breakdown:\n\n**Tanjiro Haori** — size down one (runs large, linen blend)\n**Akatsuki Cloak** — fits most, very adjustable\n**Soul Reaper Shihakushō** — standard S–3XL sizing, true to size\n\nIf you're between sizes on the Haori, always go smaller — it's the one piece where oversizing makes a difference. Need help with any other item?",
];

const SHIPPING_RESPONSES = [
  "Shipping breakdown 📦\n\n✅ **International shipping** — yes, we ship worldwide!\n📅 **Domestic (UK)** — 3–5 business days\n🌍 **International** — 7–14 business days\n📲 **Tracking** — sent once dispatched\n\nFor drop items — they ship out in batches, so allow a few extra days from drop date. Any specific destination or timeline I can help with? 🐱",
  "We ship worldwide! 🌍\n\n**Estimated delivery times:**\n• Local/domestic — 3–5 business days\n• International — 7–14 business days\n\nOnce your order is dispatched you'll get a tracking number. For drop orders specifically, fulfilment starts immediately after drop close.\n\nAnything time-sensitive? I can point you to the contact page if you need an ETA on a specific order 🐾",
];

const PRICING_RESPONSES = [
  "Price range breakdown 💰\n\n• **Plushies / accessories** — ₹24.99–₹49.99 (most affordable, huge gift potential)\n• **Apparel** — ₹54.99–₹89.99 (haori, cloak, uniform)\n• **Figures** — ₹74.99–₹99.99 (hand-painted, 1/8 scale)\n• **Collector boxes** — bundled pricing, announced at drop\n\nFor the hand-painted detail level? Worth every rupee 🐱",
  "Great question for budget planning! 😸\n\n**Under ₹40** — Ring sets (₹34.99–₹39.99), Pochita Plush (₹24.99)\n**₹40–₹70** — Zoro Sword Set, apparel pieces, Denji Nendoroid\n**₹70–₹100** — Premium figures (Gojo, Itachi, Ichigo)\n\nBest value picks: **Akatsuki Ring Set** (₹34.99 for 10 rings) and **Pochita Plush** (₹24.99) — maximum collector energy per rupee nyan~",
];

const COMMUNITY_RESPONSES = [
  "The community!! 🐾 2,400+ anime fans already.\n\nJoin the WhatsApp group via the **homepage** — drop alerts land **24 hours before the site updates**. First access, every time. Free, no spam, just drop culture and fandom chaos 📲\n\nIt's honestly the best way to not miss a drop. The Gear 5 Luffy registration filled up fast last time~",
  "JOIN THE COMMUNITY 😸 It's where the real fans are.\n\n📲 **WhatsApp group** — scroll to the community section on the homepage\n• 2,400+ members\n• Drop alerts 24h early (before the site even updates)\n• Free, zero spam, maximum fandom energy\n\nThe Gear 5 Luffy drop registration? Community members got in first 🐾",
];

const THANKS_RESPONSES = [
  "Nyan, always!! 😸 That's literally what I'm here for~\n\nIf you need anything else — drops, recs, trivia, just vibing — I'm right here 🐾 Happy collecting!",
  "Of course!! 🐱 Go check the vault and if anything catches your eye, come back and I'll give you the full breakdown~ Nyan!",
  "Anytime!! 😺 Good luck with the haul — and if you end up grabbing something, come back and let me know what you got. I love hearing this stuff 🐾",
];

// ─── Series-specific response banks ──────────────────────────────────────────

const NARUTO_RESPONSES = [
  "NARUTO!! 🍃 My absolute faves section~\n\nCurrent stock:\n• **Itachi Uchiha Figure** — hand-painted, 1/8 scale, Anbu pose, Fan Fave (sells every restock)\n• **Akatsuki Cloak** — full-length, embroidered red clouds, ₹89.99\n• **Akatsuki Ring Set** — all 10 rings, specific finger assignments, ₹34.99\n\nDropping soon:\n• **Minato Namikaze Figure** — Jul 18, 300 units, register on homepage!\n\nItachi is the piece I'd grab first if I were you 👁️",
  "Naruto!! Best arc debate: Chunin Exams, Pain's Assault, or Sasuke Retrieval? 🍃\n\nFor merch — **Itachi Figure** is the crown jewel of our Naruto section. The Anbu pose with the ANBU mask lowered hits different in person. **Akatsuki Cloak + Ring Set** for full villain mode.\n\nAnd the **Minato Figure** is coming in hot. 300 units only. Register now or watch it go 😸",
  "Naruto fandom is DEEP and I respect it 🍃\n\nFrom our vault:\n**Itachi Uchiha Figure** (₹94.99) — Fan Fave for a reason. The detail on the Sharingan is meticulous.\n**Akatsuki Ring Set** (₹34.99) — honestly underrated pick. All 10 rings for under ₹35.\n**Akatsuki Cloak** (₹89.99) — full villain drip, red cloud embroidery.\n\n**Minato Figure** dropping Jul 18 — 300 units, already building hype 👁️",
];

const ONE_PIECE_RESPONSES = [
  "ONE PIECE SUPREMACY 🏴‍☠️\n\nThe **Gear 5 Luffy Figure** is the centrepiece of the vault right now — 1/8 scale, hand-painted, that grin is *perfect*. Dropping Jun 15, only 300 units.\n\nAlso carrying **Zoro's Three Sword Set** for the sword enjoyers — Wado Ichimonji, Sandai Kitetsu, Shusui miniatures with display stand 🗡️🗡️🗡️\n\nRegistered for the Luffy drop yet?",
  "The Straw Hats section is *chefs kiss* right now 🏴‍☠️\n\n• **Gear 5 Luffy Figure** — Jun 15 drop, 300 units, ₹79.99. The most expressive figure we've ever carried.\n• **Zoro Three Sword Set** — ₹49.99, miniature replicas with display stand. The sword-brained pick.\n\nRegister NOW for the Luffy drop — seriously, it's going to be the moment 😭🙏",
  "One Piece!! 27 years later and it's still the best thing happening in manga 🏴‍☠️\n\nStore-wise:\n**Gear 5 Luffy** — Jun 15, 300 units. The Gear 5 awakening sculpted into a figure. Register on the homepage.\n**Zoro Three Swords** (₹49.99) — miniature Wado, Kitetsu, Shusui. Perfect desk companion for sword lore enjoyers.\n\nThe rest of the Straw Hats are planned — stay tuned nyan~",
];

const JJK_RESPONSES = [
  "JJK brainrot detected 😹 Same energy, honestly.\n\nIn stock:\n• **Gojo Satoru Figure** — ₹89.99, 14 left, Fan Fave. The Infinity sculpted into the base, blindfold detail is *chef's kiss*.\n• **Sukuna Finger Ring Set** — ₹39.99, 3 rings, cursed energy sigils engraved, sterling silver.\n\nWhich era hits hardest for you — Hidden Inventory or Shibuya? Eternal debate 👁️",
  "Jujutsu Kaisen!! ⚡\n\n**Gojo Figure** is in stock — the Six Eyes expression they captured is genuinely impressive for the price point.\n**Sukuna Ring Set** — sterling silver, 3 rings, cursed energy vibe. If you've got taste (and possibly 15 fingers), this is the accessory 💍\n\nAsk me about either piece and I'll go full curator mode 😸",
  "JJK collector culture is so good and we're here for it 👁️\n\n• **Gojo Satoru Figure** (₹89.99) — only **14 left in stock**, it's been a consistent Fan Fave. Grab it before it goes.\n• **Sukuna Finger Ring Set** (₹39.99) — quieter pick but incredibly well-made. Sterling silver, curse sigils.\n\nAnything specific you're after from the JJK section? I can pull up full details~",
];

const DEMON_SLAYER_RESPONSES = [
  "Demon Slayer just *hits* every single time 🔥\n\nIn stock:\n• **Tanjiro Haori** — ₹54.99, premium linen blend, breathable, S–3XL. Runs slightly large — size down one!\n\nDropping:\n• **Nezuko Collector Box** — Jul 5, 200 units worldwide! Hand-painted figure + 3 art prints + exclusive stickers. Going to vanish in minutes. Register NOW 🌸",
  "Kimetsu no Yaiba!! 🔥\n\nThe **Nezuko Collector Box** drop (Jul 5) is going to be the highlight of the summer — hand-painted figure, art prints, exclusive stickers. Only 200 units worldwide.\n\nAnd the **Tanjiro Haori** is proper fabric, not cosplay-quality — real collector piece. Premium linen blend, ₹54.99. Size down one if you're between sizes 🎌",
  "Demon Slayer section update 🌸\n\n**Tanjiro Haori** (₹54.99) — in stock now. The ichimatsu checkers on a quality fabric base. This is the piece.\n\n**Nezuko Collector Box** — Jul 5, 200 units. The bundle includes:\n→ Hand-painted Nezuko figure\n→ 3 exclusive art prints\n→ Sticker pack\n\nFor 200 units that's *extremely* limited. Register on the homepage, seriously 🔥",
];

const BLEACH_RESPONSES = [
  "BANKAI!! ⚔️\n\n• **Ichigo Bankai Figure** — hollow mask half-fractured, Tensa Zangetsu raised. ₹99.99, only **9 left in stock** ⚠️. Statement piece and Fan Fave.\n• **Soul Reaper Shihakushō** — ₹64.99, satin black cotton, S–3XL. Authentic weight.\n\nThe Ichigo figure genuinely looks like a manga panel in 3D — that hollow mask fracture detail is unreal 😸",
  "Bleach renaissance is REAL and we're here for it ⚔️\n\n**Ichigo Bankai Figure** — the main character of our Bleach section, hollow mask fracturing mid-fight. **Only 9 units left** so this one's time-sensitive.\n\n**Soul Reaper uniform** for the ones who want to walk the Soul Society vibe IRL 🖤 Satin weight, proper uniform cut.\n\nTYBW arc renewed the fandom and we renewed the collection. Perfect timing nyan~",
  "Bleach collector pieces from the vault ⚔️\n\n**Ichigo Bankai Figure** (₹99.99) — 9 left, genuinely going fast. If you've been thinking about it, now is the time.\n**Soul Reaper Shihakushō** (₹64.99) — available in S–3XL. Satin black cotton, legit uniform weight. It's the kind of piece you wear to an anime event and everyone knows.\n\nTybw arc pushed Bleach back to peak relevance. We planned ahead 😸",
];

const CSM_RESPONSES = [
  "Chainsaw Man eating 🪚\n\n• **Pochita Plush** — ₹24.99, 88 in stock, extra soft, best seller for a reason\n• **Denji Nendoroid** — ₹74.99, chainsaws deployed, *comes with Pochita companion figure!*\n\nThe Pochita plush is cozy in a chaotic way — perfectly on brand for a series that's literally unhinged 😸",
  "CSM GANG 🪚\n\n**Pochita Plush** is the sleeper hit of our entire catalog — it's just *so soft* for something so unhinged. ₹24.99, always in stock.\n\n**Denji Nendoroid** pairs with it perfectly (they're literally inseparable in canon). Chainsaws deployed, Pochita companion included.\n\nIf Makima walked into YAA Store she'd control all of it. But she can't, so it's yours 😹",
];

const GHIBLI_RESPONSES = [
  "Studio Ghibli... *takes a long breath* ...the purest art form 🌿\n\n• **Totoro XL Garden Plush** — ₹34.99, 56 in stock, officially licensed, 45cm, criminally soft\n• **No-Face Collector Piece** — hand-painted ceramic, coming soon, 200 units worldwide\n\nGhibli collector culture is severely underserved and we're fixing that nyan~",
  "Ghibli!! 🌿✨ Welcome to the corner of the store where I cry at least once per day.\n\n**Totoro XL Plush** (₹34.99, licensed, 45cm) is the cozy anchor piece. Always in stock, always the right choice.\n\n**No-Face Ceramic Figure** is *coming soon* — hand-painted, matte black glaze, white mask inlay. 200 units. Most beautiful thing we've released.\n\nMiyazaki-coded collector culture is exactly what we do 🌿",
];

const AOT_RESPONSES = [
  "Attack on Titan! ⚙️\n\nHonestly the merch demand is there and we hear you — we're working on expanding this section.\n\nCurrently the **Survey Corps Jacket** is out of stock (it moves fast when it's live). \n\nFor now — the **Collections page** has everything we currently carry, and we'd recommend joining the **WhatsApp community** for restock alerts 🐾",
];

// ─── Context-aware follow-up banks ───────────────────────────────────────────

const FOLLOWUP_BY_SERIES: Record<string, string> = {
  naruto:
    "On the Naruto front — **Minato Figure** is the incoming drop (Jul 18, 300 units). The **Akatsuki Ring Set** (₹34.99) pairs perfectly with any Naruto figure as a display accessory too 💍",
  "one-piece":
    "For One Piece follow-up: **Zoro Three Sword Set** (₹49.99) goes perfectly alongside the Luffy figure as a display pair. Different crews, same shelf energy 🗡️",
  jjk:
    "JJK-wise: **Sukuna Ring Set** (₹39.99) is a great accessory alongside the Gojo figure. Curse duo energy for your shelf 💍",
  "demon-slayer":
    "Demon Slayer: the **Tanjiro Haori** + **Nezuko Collector Box** is the ultimate combo if you're going all in — wear the series and display it 🔥",
  bleach:
    "Bleach combo: **Ichigo Figure** + **Soul Reaper Shihakushō** = full Gotei 13 energy. Display *and* wear 🖤",
  "chainsaw-man":
    "CSM-wise: **Pochita Plush** + **Denji Nendoroid** are literally a matched set — even canon says they can't be separated 🪚",
  ghibli:
    "For Ghibli: **No-Face Ceramic** is the upcoming drop to register for — 200 units. **Totoro Plush** (₹34.99) is always in stock as the companion display piece 🌿",
};

const AFFIRMATIVE_BY_SERIES: Record<string, string[]> = {
  naruto: [
    "Right?! Naruto hits every time 😸 You looking to grab something from the collection, or just vibing? Either way I'm here 🍃",
    "Naruto nation stays undefeated 🍃 Want me to pull up the full Naruto section? I'll walk you through what's in stock and what's dropping~",
  ],
  "one-piece": [
    "One Piece energy!! 🏴‍☠️ Should we talk the Gear 5 drop or are you already registered? Jun 15 is close~",
    "The Straw Hats section is *chef's kiss* right now 🏴‍☠️ Want the full breakdown of what we carry?",
  ],
  jjk: [
    "JJK fan for life 😹 Want me to walk you through the JJK pieces we have in stock? Gojo figure is going fast~",
    "Based take 👁️ The JJK collection is fire right now — Gojo Figure + Sukuna Rings is the combo. Want details?",
  ],
  "demon-slayer": [
    "Demon Slayer lives in my head rent-free tbh 🔥 Want me to go deeper on the Nezuko drop or the Tanjiro Haori?",
    "Kimetsu nation 🔥 The Jul 5 Nezuko drop is the one to watch — 200 units. Should I tell you more?",
  ],
  bleach: [
    "Bleach renaissance is SO real ⚔️ The Ichigo figure is a statement piece — want the full spec? Only 9 left!",
    "TYBW gave the whole fandom new life ⚔️ Want me to go through the Bleach section with you? We just refreshed it~",
  ],
  "chainsaw-man": [
    "CSM brain permanently 🪚 Want me to go through the Pochita + Denji combo? They literally go together on a shelf~",
    "Fujimoto absolutely cooked with this series 🪚 Pochita Plush is the move — want more info on it?",
  ],
  ghibli: [
    "Ghibli is healing in animated form 🌿 No-Face drop is the one to register for — 200 units. Want the details?",
    "The Totoro Plush is always in stock but the No-Face drop is *coming* 🌿 Want to know more about the Ghibli section?",
  ],
};

const AFFIRMATIVE_NO_CONTEXT = [
  "Glad you're vibing!! 😸 So — are we shopping, talking anime, or both? I'm fully ready for either nyan~",
  "Let's gooo 🐾 What are we getting into — drops, recs, trivia, or just a conversation? All valid~",
  "Nyan~ I love the energy 😺 Tell me what you're into and I'll match it — series, characters, merch, whatever~",
  "Okay energy acquired 😸 Drop me a series name, a vibe, or a character — I'll take it from there nyan~",
];

const CONTEXT_FALLBACK_BY_SERIES: Record<string, string[]> = {
  naruto: [
    "Naruto is such a deep well 🍃 We talking lore, or should I show you what's in the Naruto section of the vault?",
    "Say more! 😸 Are we going into Naruto lore or hunting for merch? I'm equally ready for both~",
  ],
  "one-piece": [
    "One Piece has 1000+ chapters worth of things to talk about 🏴‍☠️ What's the angle — lore, characters, or finding the right piece for your shelf?",
    "I could talk One Piece for hours~ 🏴‍☠️ Lore deep-dive or do we want to look at the collection?",
  ],
  jjk: [
    "JJK brainrot is a lifestyle 👁️ Theory mode or shopping mode? Both are valid right now~",
    "Say more! ⚡ JJK is rich — characters, arcs, merch — what are we on right now?",
  ],
  "demon-slayer": [
    "Demon Slayer has such a specific vibe 🔥 Characters, the Nezuko drop, or the Haori section?",
    "I hear you~ 🔥 Lore conversation or we looking at the Demon Slayer section?",
  ],
  bleach: [
    "Bleach has layers 😸 TYBW theory time or do you want to see the Bleach collection?",
    "The Bleach renaissance is real ⚔️ Characters, arcs, or the Ichigo figure?",
  ],
  "chainsaw-man": [
    "CSM is chaos distilled into manga form 🪚 Lore chat or we looking at Pochita and friends?",
    "Fujimoto designed a world that breaks brains 🪚 Theory mode or merch mode?",
  ],
  ghibli: [
    "Ghibli lives in a category of its own 🌿 Films, characters, or the collector pieces?",
    "Every Ghibli film hits differently 🌿 The No-Face drop, the Totoro section, or just vibing?",
  ],
  aot: [
    "Attack on Titan conversation 👁️ The ending discourse never sleeps, does it... Lore or are we checking inventory?",
    "AoT is genuinely one of the most discussed series of the decade 😸 Character deep-dive or merch hunting?",
  ],
};

const GENERAL_RESPONSES = [
  "Ooh interesting~ 🐱 I'm a cat who knows a *scary* amount about anime and even more about collector merch.\n\nTry asking about a specific series, upcoming drops, or just tell me your favourite character — I'll find something for your shelf nyan!",
  "Hmm, I want to help — can you give me a little more to go on? 🐱\n\nI can help with: **drop dates**, **merch recs by series**, **anime trivia**, **order support**, or just general fandom chat. What are we doing? 🐾",
  "Nyaa~ I might need a hint! 😸\n\nAsk me about a specific series, what drops are coming, what figures are in stock, or hit me with a trivia request — I'll match your energy 🎲\n\nOr just tell me your favourite anime and we'll go from there~",
];

// ─── Main mock response function ─────────────────────────────────────────────
// ── PLUG-IN POINT: This whole function is bypassed when ANTHROPIC_API_KEY
//    is set. Claude handles the response instead.
// ─────────────────────────────────────────────────────────────────────────────
export function getMockResponse(messages: AnemoneMessage[]): string {
  const userMsgs = messages.filter(m => m.role === "user");
  if (!userMsgs.length) return GREETING_CONTENT;

  const lastInput = userMsgs[userMsgs.length - 1].content;
  const q = lastInput.toLowerCase().trim();

  // Full conversation for series context tracking
  const fullCtx = messages.map(m => m.content).join(" ").toLowerCase();
  const ctxSeries = getContextSeries(fullCtx);

  // ── 1. Specific product inquiry (highest priority) ─────────────
  const productName = detectProductInquiry(q);
  if (productName) {
    return getProductDetail(productName);
  }

  const intent = getIntent(q);

  // ── 2. Context-aware affirmative ──────────────────────────────
  if (intent === "affirmative") {
    if (ctxSeries && AFFIRMATIVE_BY_SERIES[ctxSeries]) {
      return pick(AFFIRMATIVE_BY_SERIES[ctxSeries]);
    }
    return pick(AFFIRMATIVE_NO_CONTEXT);
  }

  // ── 3. Follow-up with known series ────────────────────────────
  if (intent === "followup" && ctxSeries && FOLLOWUP_BY_SERIES[ctxSeries]) {
    return FOLLOWUP_BY_SERIES[ctxSeries];
  }

  // ── 4. Very short message with series context → treat as follow-up ──
  if (intent === "general" && q.split(/\s+/).length <= 3 && ctxSeries) {
    if (FOLLOWUP_BY_SERIES[ctxSeries]) return FOLLOWUP_BY_SERIES[ctxSeries];
  }

  // ── 5. General with known series → series-contextual fallback ──
  if (intent === "general" && ctxSeries && CONTEXT_FALLBACK_BY_SERIES[ctxSeries]) {
    return pick(CONTEXT_FALLBACK_BY_SERIES[ctxSeries]);
  }

  // ── 6. Primary intent routing ─────────────────────────────────
  switch (intent) {
    case "greeting":      return pick(GREETING_RESPONSES);
    case "drops":         return pick(DROPS_RESPONSES);
    case "availability":  return pick(AVAILABILITY_RESPONSES);
    case "recommend":     return pick(RECOMMEND_RESPONSES);
    case "trivia":        return pick(TRIVIA_BANK) + "\n\nWant another? I have unlimited trivia~ 🎲";
    case "about":         return pick(ABOUT_RESPONSES);
    case "community":     return pick(COMMUNITY_RESPONSES);
    case "pricing":       return pick(PRICING_RESPONSES);
    case "figures":       return pick(FIGURES_RESPONSES);
    case "apparel":       return pick(APPAREL_RESPONSES);
    case "plush":         return pick(PLUSH_RESPONSES);
    case "accessories":   return pick(ACCESSORIES_RESPONSES);
    case "comparison":    return pick(COMPARISON_RESPONSES);
    case "thanks":        return pick(THANKS_RESPONSES);
    case "support-help":  return pick(SUPPORT_RESPONSES);
    case "navigate":      return pick(NAVIGATE_RESPONSES);
    case "sizing":        return pick(SIZING_RESPONSES);
    case "shipping":      return pick(SHIPPING_RESPONSES);
    case "naruto":        return pick(NARUTO_RESPONSES);
    case "one-piece":     return pick(ONE_PIECE_RESPONSES);
    case "jjk":           return pick(JJK_RESPONSES);
    case "demon-slayer":  return pick(DEMON_SLAYER_RESPONSES);
    case "bleach":        return pick(BLEACH_RESPONSES);
    case "chainsaw-man":  return pick(CSM_RESPONSES);
    case "ghibli":        return pick(GHIBLI_RESPONSES);
    case "aot":           return pick(AOT_RESPONSES);
    case "followup":      return pick(GENERAL_RESPONSES);
    default:              return pick(GENERAL_RESPONSES);
  }
}
