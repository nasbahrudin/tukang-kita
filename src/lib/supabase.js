import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUp = async (email, password, name, phone, role) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        phone,
        role,
        verified: false,
        profile_completed: false,
      })

    if (profileError) throw profileError

    return { success: true, user: authData.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const postJob = async (customerId, jobType, address, dateNeeded, description) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        job_type: jobType,
        address,
        date_needed: dateNeeded,
        description,
        status: 'available',
      })
      .select()

    if (error) throw error
    return { success: true, booking: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getAvailableJobs = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id(name, phone, verified)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, jobs: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

# Tukang Kita — Fly-By Thoughts (Master Idea Log)

_A running log of day-to-day ideas, captured so nothing gets lost. Consolidated from three earlier notes on 23 June 2026. Newest strategic thinking is in the Strategy Note at the bottom._

_Guiding philosophy throughout: launch fast, validate demand early, avoid over-engineering, build lean first and optimize later. Batam-first; Indonesia-first; trust + community presence + grassroots growth._

---

## PRODUCT / FEATURE IDEAS

### 1. Tukang Upskilling Ecosystem
A learning/upskilling section where tukang can learn new trades, access simple practical courses/tutorials, build skill credibility over time, and potentially unlock higher-paying jobs.
Long-term: certification badges, skill rankings, sponsored training partnerships.

### 4. Expand Job Categories
Near-term new vertical: **pest control** (high recurring demand, fits homeowner pain points, easy to slot into the existing model).
Future adjacent categories: cleaning, home disinfection, gardening, moving services, small renovations.

### 5. Anti-Scammer / Fake Customer Verification
Partner or integrate with Getcontact (or similar) to identify suspicious users. Goal: reduce fake job postings, time-wasters, scams, and unsafe situations for tukang.
Possible tools: phone reputation scoring, risk indicators, verified-customer badges, internal blacklist, tukang reporting system.
Long-term vision: become trust infrastructure for Indonesia's informal service economy.

### 6. Donation / "Donate a Task" Feature (Social Good)
A "Donate" section where the public can fund help for people in need — turning the marketplace into a force for community good, not just commerce. Promote via TikTok with a clear "Donate" button.
Who it helps: elderly people needing help with anything, single parents, single mothers; or "Donate a Task" — sponsor a task for someone who can't afford it.
Why it matters: builds goodwill/trust, strong shareable TikTok narrative, differentiates as community-first, blends with the 0%-commission merakyat positioning.
Open questions: how funds are held/disbursed (escrow? direct to tukang?); how recipients are verified as genuinely in need; whether donors pick a specific person/task or give to a pool; tax/legal side of collecting public donations in Indonesia.

---

## MARKETING / GROWTH IDEAS

### 2. Grassroots Marketing via Cultural Events
Use local community and cultural events as hyperlocal marketing channels — e.g. sponsor Kuda Lumping events, banners/flyers around event areas, SPGs/promoters educating people about the app. Focus on kampung/community penetration before expensive digital ads. Core idea: build familiarity and trust among blue-collar communities first.

### 3. Community Goodwill Projects
Community-driven initiatives like crowdfunded pothole repairs or small infrastructure fixes. Purpose: build public goodwill, position the platform as community-oriented, generate viral/local-media attention, show fast action where government is slow.
Could evolve into: a "Lapor Kerusakan" feature, community voting, sponsored repairs by local businesses.

---

## OVERALL STRATEGIC DIRECTION

The vision is bigger than a simple handyman marketplace. Core direction: a hyperlocal service ecosystem and community-trusted infrastructure; a blue-collar empowerment platform; Indonesia-first operations; low-friction MVP first, scale later.
Key themes: trust, community presence, operational simplicity, grassroots growth, real-world problem solving.
Context: initial launch focus is Batam; long-term scaling possible to Bandung and other cities; designed around homeowner ↔ tukang matching.
_(Historical note: originally built in Glide; since migrated to a coded stack — React + Vite + Supabase + Vercel.)_

---

═══════════════════════════════════════════════════
## 7. STRATEGY NOTE — Survey-First Flow, Multi-Tukang & Materials Marketplace
_(captured 23 June 2026)_
═══════════════════════════════════════════════════

**THE BIG REALIZATION:**
A job is often NOT fully defined when posted. Many real jobs (ceiling repair, renovation, leaks) need a physical site visit before anyone knows scope, number of tukang, materials, or price. This breaks the current assumption that "a posted job = a complete, quotable job." This single insight ripples into everything below, so it's foundational — not a side feature.

**A) SURVEY-FIRST / ON-SITE ASSESSMENT FLOW**
- Some jobs need a tukang to come look BEFORE the job is scoped/priced.
- Possible flow: customer posts → tukang does a survey visit → tukang defines scope (hands needed, materials, time, price) → job becomes a real, priced job → work proceeds.
- Affects pricing AND payments: you can't escrow a price you don't know yet. So this must be settled BEFORE Midtrans/payment design.

**B) MULTI-TUKANG** (originally a standalone topic — now seen as downstream of A)
- A customer (e.g. an elderly lady) usually CAN'T judge if a job needs 1 or 2 tukang. Don't ask her at posting time.
- Best judge = the tukang physically on site.
- Preferred design: default every job to 1 tukang; a tukang already on the job can request "butuh tukang tambahan" (backup), which reopens the job for a second tukang. This = the survey insight in miniature.
- DB foundation already partly exists: job_assignments table + sequence field.
- Build in 2 stages when ready:
  - Stage 1 (contained): DB column for tukang_needed + slot-counting so a job only closes when full. Default 1 = nothing changes for normal jobs.
  - Stage 2 (needs care): the "request backup mid-job" trigger + reopening.

**C) EMERGENCY / CAN'T-COMPLETE** (separate problem — a REPLACEMENT, not an addition)
- A tukang or customer can't continue midway (emergency, multi-day job).
- This is cancellation/replacement logic, NOT "more hands." Design it deliberately on its own later.

**D) MATERIALS MARKETPLACE** (the "all-in-one app" vision)
- App also sells the materials a job needs (cement, pipes, paint, etc).
- Powerful, but arguably a SECOND business (inventory, suppliers, delivery, margins) bolted onto the first. Phase 4-type expansion.
- EARN it after the core help-matching loop has real users. Building it now = the over-engineering trap (same reason Midtrans is paused).

**E) DISINTERMEDIATION** (keeping tukang + customer ON the app for repeat jobs)
- Every marketplace fights this; you can't fully stop offline deals.
- Win by making the app MORE attractive than going around it: rebooking ("rebook Pak Budi"), on-platform ratings/reputation, payment protection (escrow), dispute support, loyalty perks for repeat on-app bookings.
- Carrots, not sticks. Heavy-handed blocking backfires early.

**THE KEY QUESTION TO SETTLE FIRST** (when fresh, not mid-build):
_"Is Tukang Kita a quick-help app, or a survey → quote → fulfil app with a materials store?"_

And before building any of the above:
_"What's the SMALLEST version worth validating with real Batam users first?"_
Current instinct: it's still the simple help-matching loop that already exists. Get real tukang + customers using it, and let THEM reveal whether surveys and materials are needed — rather than guessing now.

export const createDeliveryOrder = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('delivery_orders')
      .insert({
        booking_id: bookingId,
        status: 'pending',
      })
      .select()

    if (error) throw error
    return { success: true, order: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const confirmJobComplete = async (bookingId, userId, role) => {
  try {
    const updateData = {}
    if (role === 'tukang') {
      updateData.tukang_confirmed_at = new Date().toISOString()
    } else {
      updateData.customer_confirmed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('delivery_orders')
      .update(updateData)
      .eq('booking_id', bookingId)

    if (error) throw error

    const { data: order, error: getError } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (getError) throw getError

    if (order.tukang_confirmed_at && order.customer_confirmed_at) {
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)

      await supabase
        .from('payments')
        .update({ status: 'paid' })
        .eq('booking_id', bookingId)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const addRating = async (bookingId, ratedUserId, score, feedback) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('ratings')
      .insert({
        booking_id: bookingId,
        rated_by_id: user.id,
        rated_user_id: ratedUserId,
        score,
        feedback,
      })
      .select()

    if (error) throw error
    return { success: true, rating: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserRating = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_user_id', userId)

    if (error) throw error

    if (data.length === 0) return { rating: 0, count: 0 }

    const avgScore = data.reduce((sum, r) => sum + r.score, 0) / data.length
    return { rating: Math.round(avgScore * 10) / 10, count: data.length }
  } catch (error) {
    return { rating: 0, count: 0 }
  }
}

export default supabase
