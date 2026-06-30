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

export const cancelJob = async (bookingId) => {
  try {
    // Soft cancel: keep the row, set status to 'cancelled'. The row stays
    // for records/metrics; every view filters 'cancelled' out. We never
    // hard-delete. Only call this for jobs no tukang has accepted —
    // accepted jobs go through the admin (WhatsApp) instead, for fairness.
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getAvailableJobs = async () => {
  try {
    // FEED WINDOW: jobs posted in the last 14 days stay in Loker. At soft
    // launch this keeps the feed lively (incl. seeded "already transacted"
    // jobs as social proof). Tighten back to 7 once real activity exists.
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

    // Pull the candidate set on the cheap server-side filters, then apply the
    // "hide dead jobs" rule in JS so we can express it as:
    //   show if (needed-date NOT passed) OR (someone has accepted it)
    // i.e. an untaken job whose date has passed is dead noise and hidden,
    // but a TAKEN job stays visible (greyed) even after its date — that's
    // the "look, jobs are getting done" social proof.
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id(name, phone, verified),
        assignments:job_assignments(
          sequence,
          accepted_at,
          tukang:tukang_id(name)
        )
      `)
      .in('status', ['available', 'accepted'])
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: false })

    if (error) throw error

    const visible = (data || []).filter(job => {
      const taken = (job.assignments || []).length > 0 || job.status === 'accepted'
      if (taken) return true
      // untaken: only show if its needed-date hasn't passed
      if (!job.date_needed) return true
      const needed = new Date(job.date_needed)
      needed.setHours(0, 0, 0, 0)
      return needed >= startOfToday
    })

    return { success: true, jobs: visible }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const acceptJob = async (bookingId, tukangId) => {
  try {
    // 1. How many tukang does this job need?
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('tukang_needed, status')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    const tukangNeeded = booking.tukang_needed || 1

    // 2. Who has already accepted this job?
    const { data: existing, error: existingError } = await supabase
      .from('job_assignments')
      .select('tukang_id')
      .eq('booking_id', bookingId)

    if (existingError) throw existingError

    const currentCount = existing?.length || 0

    // Guard: this tukang already accepted this job
    if (existing?.some(a => a.tukang_id === tukangId)) {
      return { success: false, error: 'Kamu sudah menerima pekerjaan ini.' }
    }

    // Guard: job is already full
    if (currentCount >= tukangNeeded) {
      return { success: false, error: 'Pekerjaan ini sudah penuh.' }
    }

    // 3. Insert this tukang's assignment with the next sequence number.
    //    A UNIQUE(booking_id, sequence) constraint guards against the
    //    acceptance race: if two tukang both compute sequence=1 at the same
    //    instant, the DB lets the first insert win and rejects the second
    //    with a unique-violation (Postgres code 23505). We catch that and
    //    return a clean message rather than a raw DB error.
    const { data: assignment, error: assignError } = await supabase
      .from('job_assignments')
      .insert({
        booking_id: bookingId,
        tukang_id: tukangId,
        sequence: currentCount + 1,
        accepted_at: new Date().toISOString(),
      })
      .select()

    if (assignError) {
      if (assignError.code === '23505') {
        // Someone else grabbed this slot a split second earlier.
        return { success: false, error: 'Pekerjaan ini baru saja diambil tukang lain.' }
      }
      throw assignError
    }

    // 4. Only close the job when slots are now full
    const newCount = currentCount + 1
    if (newCount >= tukangNeeded) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'accepted' })
        .eq('id', bookingId)

      if (updateError) throw updateError
    }

    return {
      success: true,
      assignment: assignment[0],
      slotsFilled: newCount,
      slotsTotal: tukangNeeded,
      jobFull: newCount >= tukangNeeded,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

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

export const getRecentActivity = async () => {
  try {
    // Calls the SECURITY DEFINER function recent_activity(), which returns
    // ONLY sanitized, seed-only social proof (job type, area, first name,
    // days_ago) — no addresses, phones, or real customer data.
    const { data, error } = await supabase.rpc('recent_activity')
    if (error) throw error
    return { success: true, activity: data || [] }
  } catch (error) {
    return { success: false, activity: [], error: error.message }
  }
}

export default supabase