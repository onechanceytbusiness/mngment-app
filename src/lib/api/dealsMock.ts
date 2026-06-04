import type {
  Audience,
  Deal,
  EnrichDealInput,
  EnrichedDeal,
  PostDealResult,
} from '@/lib/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Best-effort store inference from a product URL host so the mock feels
 * realistic. Real backend has much smarter parsing.
 */
function inferStore(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('amazon')) return 'Amazon';
  if (lower.includes('flipkart')) return 'Flipkart';
  if (lower.includes('myntra')) return 'Myntra';
  if (lower.includes('ajio')) return 'Ajio';
  if (lower.includes('nykaa')) return 'Nykaa';
  if (lower.includes('tatacliq')) return 'Tata CLiQ';
  return input || 'Other';
}

function pickCategory(name: string, audienceHint: Audience): string {
  const lower = name.toLowerCase();
  if (/(hoodie|kurta|tshirt|t-shirt|shirt|jean|dress|saree|sneaker|shoe)/.test(lower)) {
    return 'fashion';
  }
  if (/(airpod|earphone|headphone|mouse|keyboard|tv|monitor|laptop|tablet|phone)/.test(lower)) {
    return 'electronics';
  }
  if (/(cushion|bedsheet|kitchen|cookware|pan|pot|toaster|mixer)/.test(lower)) {
    return 'home';
  }
  if (/(serum|moisturiser|moisturizer|face oil|toner|cleanser)/.test(lower)) {
    return 'skincare';
  }
  if (/(lipstick|mascara|kajal|foundation|blush)/.test(lower)) {
    return 'beauty';
  }
  return audienceHint === 'women' ? 'beauty' : 'fashion';
}

function craftGlowAndPitch(
  name: string,
  store: string,
  discountPct: number,
  audience: Audience,
): { glow: string; pitch: string } {
  const verb = discountPct >= 50 ? 'CRASHED' : discountPct >= 30 ? 'DROP' : 'DEAL';
  const glow = `${name.toUpperCase().slice(0, 38)} — ${verb} ${discountPct}% OFF`;
  const audienceWord = audience === 'women' ? 'her' : 'him';
  const pitch =
    `Quietly one of the best ${store} prices on this in months. ` +
    `${discountPct}% off the MRP, no coupon to clip — ` +
    `worth a look if you're shopping for ${audienceWord} this week.`;
  return { glow, pitch };
}

/**
 * Mock enrich. Mirrors the real webhook's response shape exactly. The mock
 * is deterministic in structure but uses small randomisation so repeated
 * adds look like distinct deals.
 */
export async function enrichDeal(
  input: EnrichDealInput,
): Promise<EnrichedDeal> {
  await delay(randomBetween(800, 1600));

  const store = inferStore(input.store || input.link);
  const isAmazon = store === 'Amazon';
  const mrp = Number(input.mrp);
  const price = Number(input.price);
  const discountPct = mrp > 0 ? Math.round((1 - price / mrp) * 100) : 0;

  const category = pickCategory(input.name, input.audienceHint);
  const { glow, pitch } = craftGlowAndPitch(
    input.name,
    store,
    discountPct,
    input.audienceHint,
  );

  return {
    audience: input.audienceHint,
    category,
    store,
    product_name: input.name,
    mrp,
    price,
    discount_pct: discountPct,
    image_url: input.image || null,
    raw_link: input.link,
    affiliate_link: isAmazon ? `${input.link}?tag=mock-mngmnt-21` : null,
    link_status: isAmazon ? 'auto' : 'manual',
    glow_title: glow,
    pitch,
    status: 'found',
  };
}

/**
 * Mock post. Does NOT actually hit Telegram — returns a fake message id
 * so the rest of the UI flow works in dev.
 */
export async function postDeal(deal: Deal): Promise<PostDealResult> {
  await delay(randomBetween(500, 900));
  return {
    ok: true,
    channel:
      deal.audience === 'women' ? '@priyapandeyTG (mock)' : '@onechanceTG (mock)',
    message_id: randomBetween(1000, 99999),
    message: 'Posted to Telegram (mock).',
  };
}
