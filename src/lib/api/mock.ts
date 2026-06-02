import type {
  Alert,
  Article,
  PublishPayload,
  PublishResult,
  Region,
  Title,
} from '@/lib/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const GLOBAL_TITLES: Omit<Title, 'id' | 'region'>[] = [
  {
    headline:
      'Quiet luxury slows down — what brands are pivoting to next',
    rationale:
      'Multiple Q1 earnings calls flagged softening demand for stealth-wealth staples; explore the shift toward expressive minimalism.',
    source: 'Business of Fashion',
  },
  {
    headline:
      "Inside Hermès' Q1: the Birkin waitlist is finally cooling",
    rationale:
      'First measurable softening in resale premiums in three years — angle on whether scarcity strategy has peaked.',
    source: 'WWD',
  },
  {
    headline:
      'Why every fashion CEO is suddenly talking about "experience retail"',
    rationale:
      'Five flagship reopenings in May leaned heavily on cafés, ateliers, and members-only floors. Pattern worth naming.',
    source: 'Vogue Business',
  },
  {
    headline:
      'The Gen Z return-rate problem nobody at Shein wants to discuss',
    rationale:
      'Logistics data leak suggests return rates above 40% on some categories. Tie to sustainability messaging tension.',
    source: 'Reuters',
  },
  {
    headline:
      'Loewe after Jonathan Anderson: five names already on the shortlist',
    rationale:
      'Rumor cycle is heating up post-Cruise; recap who is being floated and what each pick would signal.',
    source: 'Puck',
  },
  {
    headline:
      'Sneakers are over (again). The loafer wars are just beginning.',
    rationale:
      'Lyst Index shows three loafer brands in the top 10 for the first time. Trend story with hard data.',
    source: 'Lyst Index',
  },
  {
    headline:
      'How three indie perfume houses out-marketed LVMH this quarter',
    rationale:
      'TikTok-native scent brands captured share without traditional advertising — case study angle.',
    source: 'The Business of Beauty',
  },
  {
    headline:
      'Resale platforms are quietly raising fees — and sellers are revolting',
    rationale:
      'Vestiaire, The RealReal, and Grailed all changed take rates in the last 60 days. Aggregate the story.',
    source: 'Glossy',
  },
];

const INDIA_TITLES: Omit<Title, 'id' | 'region'>[] = [
  {
    headline:
      'Sabyasachi at 25: how one label rewrote the rules of Indian luxury',
    rationale:
      'Anniversary capsule + Mumbai flagship redesign make this a natural retrospective. Frame around the global-India bridge.',
    source: 'Vogue India',
  },
  {
    headline:
      "Inside Aditya Birla Fashion's demerger: what it means for Pantaloons and Van Heusen",
    rationale:
      'Board approved a split into lifestyle vs. value retail arms — analysts say the value arm will move first. Business angle.',
    source: 'Economic Times',
  },
  {
    headline:
      'The Banarasi revival nobody saw coming — driven entirely by Gen Z brides',
    rationale:
      'GST data shows handloom Banarasi exports up 34% YoY. Pair with new-age weavers on Instagram for a trend piece.',
    source: 'The Voice of Fashion',
  },
  {
    headline:
      'Reliance vs. Aditya Birla: the quiet war for India\'s premium consumer',
    rationale:
      'Tira and Pantaloons Premium are converging on the same Tier-1 shopper. Strategy comparison with hard footprint numbers.',
    source: 'Mint',
  },
  {
    headline:
      'Why every D2C ethnic-wear brand is suddenly opening physical stores',
    rationale:
      'Suta, Anokherang, and Tjori all signed flagship leases in Q2. Counter-narrative to "DTC is dying" — Indian unit economics differ.',
    source: 'YourStory',
  },
  {
    headline:
      'India\'s sneaker culture finally has a Lakmé Fashion Week moment',
    rationale:
      "Bhaane, Comet, and HRX showed alongside couture this season — a first. Tie to India's $1.5B athleisure market projection.",
    source: 'Hindustan Times',
  },
  {
    headline:
      'Manish Malhotra\'s couture export play: Dubai, London, and a New York whisper',
    rationale:
      'Trunk-show calendar leaked. India\'s top couturier is going global at exactly the moment NRI weddings are booming.',
    source: 'Harper\'s Bazaar India',
  },
  {
    headline:
      'GST on apparel above ₹1,000 is back on the table — and the industry is panicking',
    rationale:
      'Council meeting next month. CMAI letter to finance ministry leaked. Hard-news policy angle with margin-math.',
    source: 'Business Standard',
  },
];

function titlesFor(region: Region) {
  return region === 'india' ? INDIA_TITLES : GLOBAL_TITLES;
}

export async function generateTitles(
  count = 6,
  region: Region = 'global',
): Promise<Title[]> {
  await delay(randomBetween(1500, 3000));

  const pool = titlesFor(region);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));

  return picked.map((t, i) => ({
    id: `mock-${Date.now()}-${i}`,
    region,
    ...t,
  }));
}

export async function generateArticle(
  title: string,
  region: Region = 'global',
): Promise<Article> {
  await delay(randomBetween(1500, 3000));

  const content_html =
    region === 'india' ? indiaArticleHtml(title) : globalArticleHtml(title);

  const excerpt =
    region === 'india'
      ? 'Three signals from the Indian market in the last sixty days suggest the playbook for fashion in India is being rewritten — and most national coverage is missing the structural shift.'
      : 'Three data points from the last sixty days suggest the post-2021 luxury playbook is quietly being rewritten — and most takes are missing the structural shift underneath.';

  return {
    title,
    content_html,
    excerpt,
  };
}

export async function publish(
  payload: PublishPayload,
): Promise<PublishResult> {
  await delay(randomBetween(500, 700));

  const postId = randomBetween(1000, 99999);
  return {
    ok: true,
    postId,
    postUrl: `https://example.com/?p=${postId}`,
    message: `Mock ${payload.status === 'publish' ? 'published' : 'saved as draft'} successfully.`,
  };
}

function globalArticleHtml(title: string): string {
  return `
<h2>The headline everyone is reading wrong</h2>
<p>${escapeHtml(title)} sounds, at first, like another cyclical fashion-industry refrain. It is not. Three data points from the last sixty days suggest something structural is shifting underneath the trend coverage — and most newsroom takes are missing it.</p>

<p>Across LVMH, Kering, and Richemont's most recent quarterly updates, leadership used some variation of the phrase "consumer recalibration" at least nine times. That language matters: it is the polite, investor-friendly way of admitting the post-2021 luxury bull run is over, and the playbook needs to change.</p>

<h2>What the numbers actually say</h2>
<p>Resale data from the past two quarters shows premiums on the most-hyped handbags compressing by 12–18%. Wait times on category-defining items — once a marketing weapon — are quietly shortening. Meanwhile, search interest for "investment piece" is down year-over-year for the first time since 2019.</p>

<blockquote>"We mistook scarcity for desire," one merchandising director at a top European maison told me, on condition of anonymity. "Desire has moved. Scarcity is just operational now."</blockquote>

<p>That quote captures it. The brands moving fastest are the ones reframing exclusivity as participation: members-only floors, capsule pre-orders that close in minutes, fragrance ateliers staffed by the perfumer themselves. The story is no longer "you cannot have this." It is "you had to be there."</p>

<h2>Where this leads next</h2>
<p>Expect three things over the next two quarters. First, a wave of flagship redesigns that look more like hotels than stores. Second, a quieter retreat from heritage-only marketing in favor of designer-as-protagonist storytelling. Third — and this is the one most analysts will miss — a real test of whether mid-tier luxury (the $800–$2,500 band) can survive as a category at all.</p>

<p>The brands that read this moment correctly will spend the rest of the year hiring storytellers, not just merchandisers. The ones that do not will spend it discounting.</p>
`.trim();
}

function indiaArticleHtml(title: string): string {
  return `
<h2>The story behind the headline</h2>
<p>${escapeHtml(title)} reads, on the surface, like another data point in the long arc of India's fashion ascent. Look closer and a different pattern emerges. Three shifts from the past sixty days — in retail footprint, in capital allocation, and in consumer behaviour — suggest the structure of the Indian fashion market is being rewritten faster than the trade press is tracking.</p>

<p>Conversations with founders, buyers and listed-company analysts converge on the same thesis: the post-pandemic Indian shopper is no longer a "growth narrative". They are a customer with specific, demanding taste — and the brands moving fastest are the ones treating that taste as a moat, not a marketing line.</p>

<h2>What the numbers actually say</h2>
<p>Reliance Retail, Aditya Birla Fashion, and Trent's recent commentary all gesture at the same dynamic: discretionary spend in Tier-1 and Tier-2 cities is shifting up the price ladder, while Tier-3 demand is value-seeking. The bifurcation is sharper than at any point since 2019. GST collections on apparel categories above ₹1,000 are up disproportionately year-on-year — even before any rate change.</p>

<blockquote>"Six years ago we sold to women buying their first occasion-wear piece," a Mumbai-based founder told me last week. "Today the same customer is asking which atelier finished the embroidery. The questions changed before the price points did."</blockquote>

<p>That quote captures the shift. The brands compounding fastest — Sabyasachi, Anita Dongre's couture line, Raw Mango — are the ones treating craft provenance as the product. The ones still selling silhouettes are watching margins compress.</p>

<h2>Where this leads next</h2>
<p>Expect three things over the next two quarters. First, more D2C ethnic-wear brands signing physical flagship leases in Mumbai, Delhi, and Hyderabad as digital CACs keep climbing. Second, a quiet wave of designer-led capsule launches inside large-format premium stores — Tira and Pantaloons Premium will lead. Third, real movement on the long-rumoured GST rationalisation for apparel: industry bodies are aligned for the first time in years, and the Council has the political room.</p>

<p>The brands that read this moment correctly will spend the rest of the year deepening their craft story and locking in retail real estate. The ones that do not will spend it competing on discounts in a market that has stopped rewarding them.</p>
`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----- Live Alerts -----

type AlertTemplate = Omit<Alert, 'createdAt'> & { minutesAgo: number };

const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: 'al-001',
    title: 'Hermès Q2 misses estimates; CFO leaves abruptly',
    reason:
      'First miss since 2020 plus a same-day CFO exit — markets reacted hard. Window for an analysis piece is tight.',
    score: 92,
    source: 'Reuters',
    sourceUrl: 'https://www.reuters.com/business/retail-consumer/',
    status: 'new',
    minutesAgo: 8,
    excerpt:
      'A rare Hermès earnings miss collided with the unexpected exit of its CFO this morning. Three reasons the market is reading this as more than a one-quarter blip.',
    content_html: `
<h2>The miss the market was not pricing in</h2>
<p>Hermès' Q2 revenue came in 3.2% below consensus this morning, the maison's first material miss since 2020. The bigger story arrived in the same release: CFO Eric du Halgouët, in the role since 2019, will step down within thirty days. The combination — a soft quarter and a same-hour leadership change — is what spooked the market.</p>
<h2>What's actually going on</h2>
<p>Three signals worth reading together: leather-goods volumes slowed in mainland China for the second quarter running; the Americas region missed on both top and bottom line; and the maison guided H2 down on FX assumptions analysts call "conservative to a fault." None of these on their own is alarming. Together they suggest the post-pandemic Hermès premium is finally compressing.</p>
<p>Expect a flurry of analyst notes tomorrow morning. The piece worth writing is not "Hermès stumbles" — it is "scarcity-as-strategy is being repriced across luxury."</p>
`.trim(),
  },
  {
    id: 'al-002',
    title: 'LVMH halts Loewe creative director search; surprise pick rumored',
    reason:
      'Three names that were "front-runners" yesterday were dropped overnight. A dark-horse candidate is being floated.',
    score: 88,
    source: 'Puck',
    sourceUrl: 'https://puck.news/',
    status: 'new',
    minutesAgo: 38,
    excerpt:
      'The Loewe succession story shifted overnight. Three publicly-reported front-runners are out, and a name no one was expecting is being floated. Here is what to make of it.',
    content_html: `
<h2>The shortlist just got rewritten</h2>
<p>Three names dominated the Loewe succession coverage for a week — and as of last night, all three are reportedly out of the running. LVMH's internal process has apparently shifted toward a candidate with no prior maison-level experience, a move that would represent a deliberate break with the obvious choices.</p>
<h2>Why this matters</h2>
<p>Loewe under Jonathan Anderson became LVMH's case study in designer-led brand-building. Replacing him with a known operator would have signalled continuity. Picking an unexpected name would signal something else entirely — that LVMH wants the next decade to look different from the last.</p>
<p>Expect official confirmation within ten days. The smart pre-emptive piece is on what each plausible pick would actually mean for the brand's positioning.</p>
`.trim(),
  },
  {
    id: 'al-003',
    title: 'Demna era closes at Balenciaga; Pieter Mulier reportedly succeeds',
    reason:
      'Multi-outlet confirmation overnight. Mulier brings an Alaïa lineage that pivots Balenciaga back toward couture rigour.',
    score: 85,
    source: 'Business of Fashion',
    sourceUrl: 'https://www.businessoffashion.com/',
    status: 'new',
    minutesAgo: 72,
    excerpt:
      'Multiple outlets now confirm Pieter Mulier as Demna\'s successor at Balenciaga. The Alaïa lineage and what it telegraphs about Kering\'s next chapter.',
    content_html: `
<h2>From Alaïa to Cristóbal — the through-line</h2>
<p>Pieter Mulier's eight years at Dior under Raf Simons and his transformative run at Alaïa give him exactly the resume Kering needs at this moment. After the controversies that defined Demna's last two years, Mulier offers a return to atelier rigour without sacrificing the cultural relevance that made Balenciaga unmissable.</p>
<h2>What changes</h2>
<p>Expect a quieter, more couture-forward Balenciaga for the first two collections — Mulier's instinct is restraint. The commercial bet is that Balenciaga's wholesale partners will welcome the recalibration after a turbulent stretch.</p>
`.trim(),
  },
  {
    id: 'al-004',
    title: 'Anthropologie signs Mumbai flagship — first Indian Tier-1 store',
    reason:
      'Major US speciality retailer entering India direct, not via license. Signals a new chapter for the premium-mass segment in Tier-1 cities.',
    score: 74,
    source: 'Mint',
    sourceUrl: 'https://www.livemint.com/',
    status: 'draft',
    minutesAgo: 145,
    excerpt:
      'URBN-owned Anthropologie has signed its first India flagship in Mumbai, going direct rather than through a licensee. What it tells us about the next phase of India\'s premium-mass market.',
    content_html: `
<h2>A direct entry, not a licensed one</h2>
<p>URBN-owned Anthropologie has finalised a 12,000-square-foot flagship in Mumbai's Bandra-Kurla Complex, with an opening targeted for early next quarter. The notable detail: the entry is direct, not through a licensee — a reversal of the playbook most US specialty retailers have used in India for the past decade.</p>
<h2>What this signals</h2>
<p>Three brands have now opted to enter India direct in the past eighteen months — Mango, Sephora, and now Anthropologie. The thesis is that India's Tier-1 premium consumer is now consistent enough in taste and spending to justify the operational complexity of going direct. The brands betting on this are reading the same data.</p>
`.trim(),
  },
  {
    id: 'al-005',
    title: 'Vinted crosses 100M users; targets US push by year-end',
    reason:
      'Reuters confirms the figure. Vinted at 100M reshapes the European resale landscape and threatens The RealReal\'s US lead.',
    score: 71,
    source: 'WWD',
    sourceUrl: 'https://wwd.com/',
    status: 'draft',
    minutesAgo: 240,
    excerpt:
      'Vinted just crossed 100 million users globally and confirmed a US market entry by Q4. The competitive implications for The RealReal, Vestiaire, and the rest of the resale stack.',
    content_html: `
<h2>The European giant goes west</h2>
<p>Vinted's CEO confirmed the 100M-user threshold in an investor call yesterday, alongside a Q4 US launch that has been rumoured for over a year. At 100M active users, Vinted is now the largest dedicated resale platform in the world by a meaningful margin.</p>
<h2>Why this matters for US resale</h2>
<p>The RealReal, Poshmark, and Mercari have shared the US resale market without serious European competition. Vinted's free-to-list, ad-supported model is a fundamentally different cost structure — and the company is bringing €500M of dry powder for the US launch. Margins across the segment are about to compress.</p>
`.trim(),
  },
  {
    id: 'al-006',
    title: 'Three Mexican designers headline NYFW September show',
    reason:
      'CFDA invited three Mexico-City-based labels for the first time. Strong angle on the Latin-American couture pipeline.',
    score: 64,
    source: 'Vogue Business',
    sourceUrl: 'https://www.voguebusiness.com/',
    status: 'published',
    minutesAgo: 360,
    excerpt:
      'For the first time, three Mexico-based designers are on the official NYFW September calendar. A read on the new Latin-American pipeline into the global luxury system.',
    content_html: `
<h2>A first for the CFDA calendar</h2>
<p>Sánchez-Kane, Lorena Saravia, and Bárbara Sánchez-Kane will all show at NYFW in September — the first time three Mexico City-based designers have been on the official calendar in the same season. The CFDA confirmed the slots last week.</p>
<h2>What's actually shifting</h2>
<p>Mexican designers have been on the NYFW periphery for a decade. What's new is the structured pipeline: Mexico City now has a credible feeder system, with the Mercedes-Benz Fashion Week Mexico finals graduating designers into international slots within two seasons. The CFDA's nod ratifies what the market already knew.</p>
`.trim(),
  },
  {
    id: 'al-007',
    title: 'Lyst Q2 index: loafers crack the top 10 hottest products',
    reason:
      'Three loafer brands made the top 10 — first time ever. Confirms the trend piece angle from two weeks ago.',
    score: 58,
    source: 'Lyst',
    sourceUrl: 'https://www.lyst.com/lystindex/',
    status: 'published',
    minutesAgo: 480,
    excerpt:
      "Lyst's Q2 index dropped, and three loafer brands are in the top 10 for the first time. The data backing the 'sneakers are over' thesis.",
    content_html: `
<h2>The first time loafers have outsold sneakers in the index</h2>
<p>The Lyst Q2 2026 index — the most widely-cited fashion shopping indicator — placed three loafer brands in the top ten hottest products this quarter. Aimé Leon Dore took the #2 slot overall with its Penny loafer, with G.H. Bass and Bode also charting.</p>
<h2>The broader story</h2>
<p>Sneaker dominance on the Lyst index has been near-total since 2018. The Q2 reading is the strongest signal yet that the silhouette shift away from athleisure-as-default is happening at scale, not just in editorial.</p>
`.trim(),
  },
];

// Module-state simulation of server-side mutations.
const dismissedIds = new Set<string>();

function pickStatusFor(t: AlertTemplate): Alert['status'] {
  return t.status;
}

export async function getAlerts(): Promise<Alert[]> {
  await delay(randomBetween(400, 900));
  const now = Date.now();
  return ALERT_TEMPLATES.filter((t) => !dismissedIds.has(t.id)).map((t) => ({
    id: t.id,
    title: t.title,
    reason: t.reason,
    score: t.score,
    source: t.source,
    sourceUrl: t.sourceUrl,
    status: pickStatusFor(t),
    excerpt: t.excerpt,
    content_html: t.content_html,
    createdAt: new Date(now - t.minutesAgo * 60_000).toISOString(),
  }));
}

export async function dismissAlert(id: string): Promise<{ ok: true }> {
  await delay(randomBetween(200, 450));
  dismissedIds.add(id);
  return { ok: true };
}
