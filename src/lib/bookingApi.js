import { supabase } from './supabase'

// Default fallback services if table is not yet seeded
export const FALLBACK_SERVICES = [
  {
    id: 1,
    name: 'General Consultation',
    description: 'Get professional medical advice, comprehensive assessment, and expert guidance from certified physicians.',
    duration_minutes: 45,
    price: 25.0,
    image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    is_active: true,
  },
  {
    id: 2,
    name: 'Dental Care & Checkup',
    description: 'Comprehensive oral examination, hygiene cleaning, digital x-rays, and specialized dental treatment.',
    duration_minutes: 60,
    price: 35.0,
    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    is_active: true,
  },
  {
    id: 3,
    name: 'Full Body Health Checkup',
    description: 'Complete vital statistics evaluation, blood pressure monitoring, heart screening, and laboratory diagnostics.',
    duration_minutes: 90,
    price: 45.0,
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    is_active: true,
  },
  {
    id: 4,
    name: 'Dermatology & Skin Care',
    description: 'Specialized dermatological consultations, advanced skin analysis, allergy treatments, and skincare plans.',
    duration_minutes: 45,
    price: 30.0,
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    is_active: true,
  },
  {
    id: 5,
    name: 'Cardiology Consultation',
    description: 'Advanced cardiovascular screening, ECG tests, blood vessel health, and personalized preventive therapy.',
    duration_minutes: 60,
    price: 50.0,
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    is_active: true,
  },
  {
    id: 6,
    name: 'Mental Health & Therapy',
    description: 'Confidential, supportive, and compassionate sessions with experienced clinical psychologists.',
    duration_minutes: 60,
    price: 40.0,
    image_url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    is_active: true,
  },
]

// Standard time slots fallback matching the DB time_slots table
export const DEFAULT_TIME_SLOTS = [
  { id: 1, start_time: '09:00:00', end_time: '10:00:00', label: '09:00 AM – 10:00 AM' },
  { id: 2, start_time: '10:00:00', end_time: '11:00:00', label: '10:00 AM – 11:00 AM' },
  { id: 3, start_time: '11:00:00', end_time: '12:00:00', label: '11:00 AM – 12:00 PM' },
  { id: 4, start_time: '13:00:00', end_time: '14:00:00', label: '01:00 PM – 02:00 PM' },
  { id: 5, start_time: '14:00:00', end_time: '15:00:00', label: '02:00 PM – 03:00 PM' },
  { id: 6, start_time: '15:00:00', end_time: '16:00:00', label: '03:00 PM – 04:00 PM' },
  { id: 7, start_time: '16:00:00', end_time: '17:00:00', label: '04:00 PM – 05:00 PM' },
]

/**
 * Format 24-hr time string (e.g. "09:00:00") into 12-hr label (e.g. "09:00 AM – 10:00 AM")
 */
export function formatTimeRange(startTime, endTime) {
  const formatSingle = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    let h = parseInt(parts[0], 10)
    const m = parts[1] || '00'
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    h = h ? h : 12
    const hStr = h < 10 ? `0${h}` : `${h}`
    return `${hStr}:${m} ${ampm}`
  }

  if (!endTime) return formatSingle(startTime)
  return `${formatSingle(startTime)} – ${formatSingle(endTime)}`
}

/**
 * Normalize time string to HH:MM:SS format
 */
export function normalizeTime(t) {
  if (!t) return ''
  const parts = t.split(':')
  const h = parts[0].padStart(2, '0')
  const m = (parts[1] || '00').padStart(2, '0')
  const s = (parts[2] || '00').padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * Fetch all active services from Supabase
 */
export async function getActiveServices() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (error) {
      console.warn('Supabase services fetch notice:', error.message)
      return { data: FALLBACK_SERVICES, isFallback: true }
    }

    if (!data || data.length === 0) {
      return { data: FALLBACK_SERVICES, isFallback: true }
    }

    return { data, isFallback: false }
  } catch (err) {
    console.error('Failed to load services:', err)
    return { data: FALLBACK_SERVICES, isFallback: true }
  }
}

/**
 * Fetch time slots from Supabase time_slots table
 */
export async function getTimeSlots() {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('start_time', { ascending: true })

    if (error || !data || data.length === 0) {
      return DEFAULT_TIME_SLOTS
    }

    return data.map((slot) => ({
      ...slot,
      label: formatTimeRange(slot.start_time, slot.end_time),
    }))
  } catch (err) {
    console.error('Failed to load time slots:', err)
    return DEFAULT_TIME_SLOTS
  }
}

/**
 * Fetch booked appointment times for a selected date
 */
export async function getBookedSlotsForDate(dateStr) {
  if (!dateStr) return []

  try {
    // 1. Try RPC function if created
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_booked_slots', {
      p_date: dateStr,
    })

    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData.map((item) => normalizeTime(item.booked_time || item.appointment_time || item))
    }

    // 2. Query appointments table directly
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_time, status')
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled')

    if (error) {
      console.warn('Appointments fetch notice:', error.message)
      return []
    }

    return (data || []).map((a) => normalizeTime(a.appointment_time))
  } catch (err) {
    console.warn('Could not query booked slots:', err)
    return []
  }
}

/**
 * Save appointment into Supabase appointments table
 */
export async function createAppointment({
  userId,
  serviceId,
  appointmentDate,
  appointmentTime,
  notes = '',
  status = 'confirmed',
}) {
  if (!userId) {
    throw new Error('User must be logged in to book an appointment.')
  }
  if (!serviceId) {
    throw new Error('Please select a service.')
  }
  if (!appointmentDate) {
    throw new Error('Please select an appointment date.')
  }
  if (!appointmentTime) {
    throw new Error('Please select an appointment time slot.')
  }

  // Pre-check if slot is already booked for this date
  const booked = await getBookedSlotsForDate(appointmentDate)
  if (booked.includes(normalizeTime(appointmentTime))) {
    throw new Error('This time slot has already been reserved. Please pick another time.')
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: userId,
      service_id: serviceId,
      appointment_date: appointmentDate,
      appointment_time: normalizeTime(appointmentTime),
      status: status || 'confirmed',
      notes: notes || '',
    })
    .select('*, services(*)')
    .single()

  if (error) {
    // Postgres unique violation code 23505
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      throw new Error('This time slot was just booked by another user. Please choose a different slot.')
    }
    throw error
  }

  return data
}

/**
 * Fetch all appointments for a user with joined service details
 */
export async function getUserAppointments(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(*)')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  if (error) {
    console.error('Error fetching user appointments:', error)
    throw error
  }

  return data || []
}

/**
 * Cancel an appointment (update status to 'cancelled')
 */
export async function cancelAppointment(appointmentId, userId) {
  if (!appointmentId) throw new Error('Appointment ID is required.')

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error cancelling appointment:', error)
    throw error
  }

  return data
}
