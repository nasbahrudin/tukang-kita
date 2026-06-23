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

    // 3. Insert this tukang's assignment with the next sequence number
    const { data: assignment, error: assignError } = await supabase
      .from('job_assignments')
      .insert({
        booking_id: bookingId,
        tukang_id: tukangId,
        sequence: currentCount + 1,
        accepted_at: new Date().toISOString(),
      })
      .select()

    if (assignError) throw assignError

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

export default supabase