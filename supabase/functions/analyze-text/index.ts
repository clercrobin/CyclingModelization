// Cycling Aladdin: NLP Text Analysis Engine
// Extracts rider traits from race reports, news, and comments
// Inspired by BlackRock Aladdin's sentiment and news analysis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =============================================================================
// TRAIT EXTRACTION PATTERNS
// Keywords and phrases that indicate specific rider characteristics
// =============================================================================

interface TraitPattern {
  dimension: string
  keywords: string[]
  weight: number  // How much this pattern affects the rating
  sentiment: 'positive' | 'negative' | 'neutral'
}

const TRAIT_PATTERNS: TraitPattern[] = [
  // Power Profile
  { dimension: 'power_sprint_5s', keywords: ['explosive sprint', 'massive kick', 'pure sprinter', 'sprint power', 'fastest in the bunch', 'won the sprint', 'sprint win', 'bunch sprint victory'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'power_sprint_5s', keywords: ['outsprinted', 'beaten in sprint', 'no sprint left', 'sprint fade'], weight: -0.5, sentiment: 'negative' },
  { dimension: 'power_anaerobic_1m', keywords: ['punchy', 'short steep efforts', 'explosive acceleration', 'repeated attacks', 'punch'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'power_vo2max_5m', keywords: ['vo2max', 'sustained power', 'climbing power', '5 minute power', 'aerobic capacity'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'power_threshold_20m', keywords: ['threshold power', 'sustained effort', 'tempo riding', 'ftp', 'time trial power'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'power_ftp_60m', keywords: ['hour record', 'sustained power', 'incredible ftp', 'time trial machine'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'power_endurance_2h', keywords: ['endurance', 'long distance', 'marathon effort', 'lasted the distance', 'never tired'], weight: 0.6, sentiment: 'positive' },

  // Terrain
  { dimension: 'terrain_flat', keywords: ['flat roads', 'pancake flat', 'rouleur territory', 'flat specialist'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'terrain_rolling', keywords: ['rolling terrain', 'undulating', 'hilly course', 'rolling hills'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'terrain_punch_climbs', keywords: ['punch climbs', 'short steep', 'mur', 'hellingen', 'bergs', 'wall', 'koppenberg', 'paterberg', 'oude kwaremont'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'terrain_medium_climbs', keywords: ['medium climbs', 'hc climb', 'category 1', 'hors catégorie'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'terrain_long_climbs', keywords: ['long climb', 'mountain climb', 'col', 'alpe', 'tourmalet', 'galibier', 'ventoux', 'angliru', 'mortirolo', 'stelvio', 'zoncolan'], weight: 0.9, sentiment: 'positive' },
  { dimension: 'terrain_altitude', keywords: ['high altitude', 'altitude performance', '2000m', 'thin air', 'mountain top'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'terrain_cobbles', keywords: ['cobbles', 'pavé', 'cobblestones', 'roubaix', 'arenberg', 'carrefour de larbre', 'haveluy'], weight: 0.9, sentiment: 'positive' },
  { dimension: 'terrain_cobbles', keywords: ['struggled on cobbles', 'crashed on pavé', 'punctured on cobbles'], weight: -0.6, sentiment: 'negative' },
  { dimension: 'terrain_gravel', keywords: ['gravel', 'strade bianche', 'white roads', 'sterrato', 'gravel sector'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'terrain_descending', keywords: ['descending', 'downhill', 'technical descent', 'fearless descender', 'gained time descending'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'terrain_descending', keywords: ['crashed descending', 'lost time downhill', 'cautious descender'], weight: -0.5, sentiment: 'negative' },
  { dimension: 'terrain_crosswinds', keywords: ['crosswinds', 'echelons', 'guttered', 'wind', 'bordures', 'waaiers'], weight: 0.7, sentiment: 'positive' },

  // Race Type Performance
  { dimension: 'race_sprint_finish', keywords: ['sprint finish', 'bunch sprint', 'won the sprint', 'fastest wheels', 'sprint victory'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'race_leadout', keywords: ['leadout', 'lead out', 'piloted', 'delivered the sprinter', 'perfect leadout'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'race_breakaway', keywords: ['breakaway', 'solo attack', 'escaped', 'went clear', 'long range attack', 'rode away'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'race_itt_flat', keywords: ['time trial', 'against the clock', 'tt specialist', 'chrono', 'individual time trial', 'itt'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'race_itt_mountain', keywords: ['mountain time trial', 'uphill tt', 'climbing time trial'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'race_gc', keywords: ['gc contender', 'general classification', 'overall leader', 'yellow jersey', 'maglia rosa', 'leader jersey', 'gc ambitions'], weight: 0.9, sentiment: 'positive' },
  { dimension: 'race_oneday', keywords: ['one day specialist', 'classics rider', 'monument hunter', 'one-day race'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'race_stagerace', keywords: ['stage race', 'week-long race', 'multi-day event', 'consistent through stages'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'race_grandtour', keywords: ['grand tour', 'tour de france', 'giro', 'vuelta', 'three week race', '21 stages'], weight: 0.9, sentiment: 'positive' },

  // Classics
  { dimension: 'classics_cobbled', keywords: ['flanders', 'roubaix', 'cobbled classics', 'flandrien', 'e3', 'gent-wevelgem', 'dwars door vlaanderen'], weight: 0.9, sentiment: 'positive' },
  { dimension: 'classics_ardennes', keywords: ['ardennes', 'liège', 'amstel', 'flèche wallonne', 'la doyenne', 'cauberg', 'mur de huy'], weight: 0.9, sentiment: 'positive' },
  { dimension: 'classics_italian', keywords: ['sanremo', 'lombardia', 'strade bianche', 'italian classics', 'la primavera', 'cipressa', 'poggio', 'san remo'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'classics_spring', keywords: ['spring classics', 'opening weekend', 'omloop', 'kuurne', 'spring campaign'], weight: 0.7, sentiment: 'positive' },

  // Tactical
  { dimension: 'tactical_positioning', keywords: ['positioning', 'always at the front', 'well positioned', 'perfect position', 'never out of position'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'tactical_positioning', keywords: ['caught out', 'wrong position', 'too far back', 'missed the split'], weight: -0.5, sentiment: 'negative' },
  { dimension: 'tactical_race_iq', keywords: ['race intelligence', 'race iq', 'smart racing', 'tactical nous', 'read the race', 'clever move'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'tactical_attacking', keywords: ['attacked', 'launched attack', 'went on the attack', 'aggressive', 'animated the race'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'tactical_defensive', keywords: ['defensive', 'marked', 'covered attacks', 'controlled', 'neutralized'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'tactical_leadership', keywords: ['team leader', 'captain', 'protected leader', 'gc leader', 'leader role'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'tactical_domestique', keywords: ['domestique', 'team work', 'sacrificed', 'worked for leader', 'super domestique', 'road captain'], weight: 0.6, sentiment: 'positive' },

  // Physical
  { dimension: 'physical_acceleration', keywords: ['acceleration', 'explosive', 'snap', 'kicked hard', 'sudden burst'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'physical_topspeed', keywords: ['top speed', 'fastest', 'pure speed', 'hit 70km/h', 'incredible speed'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'physical_aero', keywords: ['aerodynamic', 'aero position', 'slippery', 'wind tunnel', 'aero gains'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'physical_recovery', keywords: ['recovery', 'fresh legs', 'recovered well', 'bounced back', 'resilient'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'physical_recovery', keywords: ['tired', 'fatigued', 'empty legs', 'struggled to recover'], weight: -0.5, sentiment: 'negative' },
  { dimension: 'physical_fatigue_resist', keywords: ['fatigue resistance', 'never cracked', 'stayed strong', 'dug deep', 'mental strength'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'physical_fatigue_resist', keywords: ['cracked', 'blew up', 'bonked', 'hit the wall', 'collapsed'], weight: -0.6, sentiment: 'negative' },
  { dimension: 'physical_handling', keywords: ['bike handling', 'technical skills', 'cornering', 'skilled in the bunch', 'safe hands'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'physical_handling', keywords: ['crashed', 'fell', 'lost control', 'slipped'], weight: -0.4, sentiment: 'negative' },

  // Weather
  { dimension: 'weather_heat', keywords: ['hot conditions', 'heat specialist', 'performed in heat', 'warm weather'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'weather_heat', keywords: ['struggled in heat', 'overheated', 'suffered in sun'], weight: -0.4, sentiment: 'negative' },
  { dimension: 'weather_cold', keywords: ['cold weather', 'freezing conditions', 'handles cold well', 'cold specialist'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'weather_rain', keywords: ['rain', 'wet conditions', 'wet roads', 'rainy day specialist'], weight: 0.6, sentiment: 'positive' },
  { dimension: 'weather_rain', keywords: ['struggled in rain', 'slipped in wet'], weight: -0.4, sentiment: 'negative' },
  { dimension: 'weather_wind', keywords: ['windy', 'strong wind', 'headwind', 'crosswind specialist'], weight: 0.6, sentiment: 'positive' },

  // Consistency
  { dimension: 'consistency_daily', keywords: ['consistent', 'reliable', 'always there', 'day after day', 'dependable'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'consistency_daily', keywords: ['inconsistent', 'unpredictable', 'off day', 'bad day'], weight: -0.5, sentiment: 'negative' },
  { dimension: 'consistency_seasonal', keywords: ['season-long form', 'peaked perfectly', 'good form all year'], weight: 0.7, sentiment: 'positive' },
  { dimension: 'consistency_clutch', keywords: ['clutch performance', 'delivered when it mattered', 'big race performance', 'rose to the occasion'], weight: 0.8, sentiment: 'positive' },
  { dimension: 'consistency_clutch', keywords: ['choked', 'cracked under pressure', 'failed to deliver'], weight: -0.6, sentiment: 'negative' },
  { dimension: 'consistency_reliability', keywords: ['reliable', 'finisher', 'always finishes', 'completed'], weight: 0.5, sentiment: 'positive' },
  { dimension: 'consistency_reliability', keywords: ['dnf', 'abandoned', 'withdrew', 'did not finish'], weight: -0.4, sentiment: 'negative' },

  // Comparative statements (rider A vs rider B)
  { dimension: 'overall', keywords: ['best in the world', 'world champion', 'dominated', 'untouchable', 'unbeatable', 'masterclass'], weight: 1.0, sentiment: 'positive' },
  { dimension: 'overall', keywords: ['defeated', 'beaten', 'struggled', 'disappointing'], weight: -0.3, sentiment: 'negative' },
]

// Rider name patterns for entity recognition
interface RiderMention {
  name: string
  riderId?: number
  startIndex: number
  endIndex: number
}

// =============================================================================
// TEXT ANALYSIS FUNCTIONS
// =============================================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ')     // Remove special chars
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim()
}

function findRiderMentions(text: string, riderNames: Map<string, number>): RiderMention[] {
  const mentions: RiderMention[] = []
  const normalizedText = normalizeText(text)

  for (const [name, riderId] of riderNames) {
    const normalizedName = normalizeText(name)
    const nameParts = normalizedName.split(' ')

    // Try full name match
    let index = normalizedText.indexOf(normalizedName)
    while (index !== -1) {
      mentions.push({
        name,
        riderId,
        startIndex: index,
        endIndex: index + normalizedName.length
      })
      index = normalizedText.indexOf(normalizedName, index + 1)
    }

    // Try last name match (for names with 2+ parts)
    if (nameParts.length >= 2) {
      const lastName = nameParts[nameParts.length - 1]
      if (lastName.length >= 4) {  // Avoid short common names
        index = normalizedText.indexOf(lastName)
        while (index !== -1) {
          // Check if not already matched by full name
          const alreadyMatched = mentions.some(m =>
            m.riderId === riderId &&
            index >= m.startIndex &&
            index < m.endIndex
          )
          if (!alreadyMatched) {
            mentions.push({
              name,
              riderId,
              startIndex: index,
              endIndex: index + lastName.length
            })
          }
          index = normalizedText.indexOf(lastName, index + 1)
        }
      }
    }
  }

  return mentions.sort((a, b) => a.startIndex - b.startIndex)
}

interface TraitExtraction {
  riderId: number
  riderName: string
  dimension: string
  weight: number
  sentiment: 'positive' | 'negative' | 'neutral'
  matchedKeyword: string
  context: string
}

function extractTraits(
  text: string,
  riderMentions: RiderMention[]
): TraitExtraction[] {
  const extractions: TraitExtraction[] = []
  const normalizedText = normalizeText(text)
  const sentences = text.split(/[.!?]+/)

  for (const pattern of TRAIT_PATTERNS) {
    for (const keyword of pattern.keywords) {
      const normalizedKeyword = normalizeText(keyword)
      let keywordIndex = normalizedText.indexOf(normalizedKeyword)

      while (keywordIndex !== -1) {
        // Find the sentence containing this keyword
        let sentenceStart = normalizedText.lastIndexOf('.', keywordIndex)
        sentenceStart = sentenceStart === -1 ? 0 : sentenceStart + 1
        let sentenceEnd = normalizedText.indexOf('.', keywordIndex)
        sentenceEnd = sentenceEnd === -1 ? normalizedText.length : sentenceEnd

        const context = normalizedText.substring(sentenceStart, sentenceEnd).trim()

        // Find riders mentioned near this keyword (within same sentence)
        const nearbyRiders = riderMentions.filter(m =>
          m.startIndex >= sentenceStart - 50 &&
          m.endIndex <= sentenceEnd + 50
        )

        // If riders found, attribute trait to them
        if (nearbyRiders.length > 0) {
          for (const rider of nearbyRiders) {
            extractions.push({
              riderId: rider.riderId!,
              riderName: rider.name,
              dimension: pattern.dimension,
              weight: pattern.weight,
              sentiment: pattern.sentiment,
              matchedKeyword: keyword,
              context
            })
          }
        }

        keywordIndex = normalizedText.indexOf(normalizedKeyword, keywordIndex + 1)
      }
    }
  }

  return extractions
}

// Aggregate extractions into rating adjustments
interface RatingAdjustment {
  riderId: number
  riderName: string
  adjustments: Record<string, number>
  sources: string[]
}

function aggregateExtractions(extractions: TraitExtraction[]): RatingAdjustment[] {
  const byRider = new Map<number, RatingAdjustment>()

  for (const extraction of extractions) {
    if (!byRider.has(extraction.riderId)) {
      byRider.set(extraction.riderId, {
        riderId: extraction.riderId,
        riderName: extraction.riderName,
        adjustments: {},
        sources: []
      })
    }

    const adj = byRider.get(extraction.riderId)!

    // Accumulate adjustments (with diminishing returns)
    const currentAdj = adj.adjustments[extraction.dimension] || 0
    const newAdj = extraction.weight * (extraction.sentiment === 'negative' ? -1 : 1)

    // Apply diminishing returns for multiple mentions of same trait
    const diminishingFactor = 1 / (1 + Math.abs(currentAdj) / 10)
    adj.adjustments[extraction.dimension] = currentAdj + (newAdj * diminishingFactor * 10)

    // Track sources
    if (!adj.sources.includes(extraction.context)) {
      adj.sources.push(extraction.context.substring(0, 100))
    }
  }

  return Array.from(byRider.values())
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      text,
      texts,  // Array of texts for batch processing
      source_type = 'report',  // 'report', 'news', 'comment', 'social'
      source_url,
      apply_updates = false,  // Whether to actually update ratings
      confidence_threshold = 0.5
    } = await req.json()

    const textsToProcess = texts || (text ? [text] : [])

    if (textsToProcess.length === 0) {
      throw new Error('text or texts array is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all riders for entity recognition
    const { data: riders, error: ridersError } = await supabase
      .from('riders')
      .select('id, name')

    if (ridersError) {
      throw new Error(`Failed to fetch riders: ${ridersError.message}`)
    }

    const riderNames = new Map<string, number>(
      riders?.map(r => [r.name, r.id]) || []
    )

    // Process all texts
    const allExtractions: TraitExtraction[] = []
    const processedTexts: Array<{
      text: string
      mentions: RiderMention[]
      extractions: TraitExtraction[]
    }> = []

    for (const textItem of textsToProcess) {
      const mentions = findRiderMentions(textItem, riderNames)
      const extractions = extractTraits(textItem, mentions)

      allExtractions.push(...extractions)
      processedTexts.push({
        text: textItem.substring(0, 200) + '...',
        mentions,
        extractions
      })
    }

    // Aggregate all extractions
    const adjustments = aggregateExtractions(allExtractions)

    // Apply updates if requested
    const appliedUpdates: Array<{
      riderId: number
      riderName: string
      dimensionsUpdated: string[]
      overallChange: number
    }> = []

    if (apply_updates && adjustments.length > 0) {
      // Get current ratings for affected riders
      const riderIds = adjustments.map(a => a.riderId)
      const { data: currentRatings } = await supabase
        .from('rider_ratings')
        .select('*')
        .in('rider_id', riderIds)

      const ratingsMap = new Map(currentRatings?.map(r => [r.rider_id, r]) || [])

      // Source type weight multiplier
      const sourceMultiplier = {
        'report': 1.0,      // Race reports are most reliable
        'news': 0.8,        // News articles
        'comment': 0.3,     // Comments are less reliable
        'social': 0.2       // Social media even less
      }[source_type] || 0.5

      for (const adj of adjustments) {
        const current = ratingsMap.get(adj.riderId)
        if (!current) continue

        // Only apply adjustments above confidence threshold
        const significantAdjustments = Object.entries(adj.adjustments)
          .filter(([_, value]) => Math.abs(value) >= confidence_threshold)

        if (significantAdjustments.length === 0) continue

        const updates: Record<string, number> = {}
        for (const [dim, value] of significantAdjustments) {
          const currentValue = current[dim] || 1500
          // Apply with source multiplier and cap the change
          const cappedChange = Math.max(-50, Math.min(50, value * sourceMultiplier))
          updates[dim] = Math.max(1000, Math.min(2800, Math.round(currentValue + cappedChange)))
        }

        if (Object.keys(updates).length > 0) {
          // Update ratings
          const { error: updateError } = await supabase
            .from('rider_ratings')
            .update({
              ...updates,
              rating_confidence: Math.min(1.0, (current.rating_confidence || 0.5) + 0.01)
            })
            .eq('rider_id', adj.riderId)

          if (!updateError) {
            // Calculate overall change
            const overallChange = Object.values(updates).reduce((sum, v) => sum + v, 0) / Object.keys(updates).length - 1500

            appliedUpdates.push({
              riderId: adj.riderId,
              riderName: adj.riderName,
              dimensionsUpdated: Object.keys(updates),
              overallChange: Math.round(overallChange)
            })

            // Log to history
            await supabase
              .from('rating_history')
              .insert({
                rider_id: adj.riderId,
                date: new Date().toISOString(),
                ratings: updates,
                overall_change: Math.round(overallChange),
                change_reason: `Text analysis (${source_type}): ${adj.sources[0]?.substring(0, 100)}...`
              })
          }
        }
      }
    }

    // Build response
    const response = {
      success: true,
      texts_processed: textsToProcess.length,
      total_extractions: allExtractions.length,
      riders_found: new Set(allExtractions.map(e => e.riderId)).size,
      adjustments: adjustments.map(a => ({
        riderId: a.riderId,
        riderName: a.riderName,
        dimensions: Object.entries(a.adjustments)
          .filter(([_, v]) => Math.abs(v) >= 0.1)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 10)
          .map(([dim, value]) => ({
            dimension: dim,
            adjustment: Math.round(value * 10) / 10,
            direction: value > 0 ? 'positive' : 'negative'
          })),
        sources: a.sources.slice(0, 3)
      })),
      updates_applied: apply_updates,
      applied_updates: appliedUpdates,
      sample_extractions: allExtractions.slice(0, 20).map(e => ({
        rider: e.riderName,
        dimension: e.dimension,
        keyword: e.matchedKeyword,
        sentiment: e.sentiment
      }))
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error analyzing text:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
