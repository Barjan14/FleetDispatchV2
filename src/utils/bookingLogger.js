import { supabase } from '../supabaseClient';

/**
 * Log a booking status change using trip_logs table
 * @param {number} bookingId - The booking ID
 * @param {string} previousStatus - The previous status
 * @param {string} newStatus - The new status (Accepted/Approved, Ongoing, Returned, Rejected, etc.)
 * @param {string} adminId - The admin user ID or username
 * @param {string} notes - Additional notes about the status change
 * @param {object} booking - The booking object for context
 */
export async function logBookingStatusChange(
  bookingId,
  previousStatus,
  newStatus,
  adminId,
  notes = '',
  booking = null
) {
  try {
    const logData = {
      vehicle_id: booking?.vehicle_id || null,
      driver_id: booking?.driver_id || null,
      origin: booking?.origin || '',
      destination: booking?.destination || '',
      purpose: `${booking?.purpose || ''} (Booking #${bookingId})`,
      status: newStatus,
      start_datetime: booking?.start_datetime || new Date().toISOString(),
      end_datetime: booking?.end_datetime || null,
      odometer_start: null,
      odometer_end: null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('trip_logs').insert([logData]);

    if (error) {
      console.error('Error logging booking status change to trip_logs:', error);
    }
  } catch (err) {
    console.error('Error logging booking status change:', err);
  }
}

/**
 * Log booking acceptance (approved status with vehicle & driver assignment)
 */
export async function logBookingAccepted(bookingId, adminId, vehicleId, driverId, booking) {
  await logBookingStatusChange(
    bookingId,
    'Pending',
    'Approved',
    adminId,
    `Approved by admin. Vehicle #${vehicleId} assigned to Driver #${driverId}`,
    { ...booking, vehicle_id: vehicleId, driver_id: driverId }
  );
}

/**
 * Log booking marked as ongoing
 */
export async function logBookingOngoing(bookingId, adminId, booking) {
  await logBookingStatusChange(
    bookingId,
    'Approved',
    'Ongoing',
    adminId,
    'Trip started - booking marked as ongoing',
    booking
  );
}

/**
 * Log booking marked as returned
 */
export async function logBookingReturned(bookingId, adminId, booking) {
  const actualReturn = new Date().toISOString();
  await logBookingStatusChange(
    bookingId,
    'Ongoing',
    'Returned',
    adminId,
    `Trip completed. Vehicle returned at ${new Date(actualReturn).toLocaleString()}`,
    { ...booking, actual_return: actualReturn }
  );
}

/**
 * Log booking rejection
 */
export async function logBookingRejected(bookingId, adminId, notes = '', booking) {
  await logBookingStatusChange(
    bookingId,
    'Pending',
    'Rejected',
    adminId,
    `Rejected by admin. Reason: ${notes || 'No reason provided'}`,
    booking
  );
}

/**
 * Fetch all booking logs from trip_logs
 */
export async function fetchBookingLogs(bookingId = null) {
  try {
    let query = supabase.from('trip_logs').select('*');

    if (bookingId) {
      query = query.ilike('purpose', `%Booking #${bookingId}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching booking logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching booking logs:', err);
    return [];
  }
}

/**
 * Fetch booking logs for ongoing trips (fleet assignment)
 */
export async function fetchFleetBookingLogs() {
  try {
    const { data, error } = await supabase
      .from('trip_logs')
      .select('*')
      .eq('status', 'Ongoing')
      .order('start_datetime', { ascending: false });

    if (error) {
      console.error('Error fetching fleet booking logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching fleet booking logs:', err);
    return [];
  }
}
