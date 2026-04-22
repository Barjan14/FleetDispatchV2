import { supabase } from '../supabaseClient';

/**
 * Log a vehicle change to the vehicle_change_logs table
 * @param {string} changeType - 'create', 'update', or 'delete'
 * @param {number} vehicleId - The vehicle ID
 * @param {string} vehicleName - The vehicle name
 * @param {string} adminId - The admin user ID
 * @param {string} fieldName - The field that changed (optional for create/delete)
 * @param {any} oldValue - The old value (optional for create)
 * @param {any} newValue - The new value (optional for delete)
 */
export async function logVehicleChange(
  changeType,
  vehicleId,
  vehicleName,
  adminId,
  fieldName = null,
  oldValue = null,
  newValue = null
) {
  try {
    const { error } = await supabase.from('vehicle_change_logs').insert({
      vehicle_id: vehicleId,
      vehicle_name: vehicleName,
      change_type: changeType,
      field_name: fieldName,
      old_value: oldValue ? String(oldValue) : null,
      new_value: newValue ? String(newValue) : null,
      admin_id: adminId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging vehicle change:', error);
    }
  } catch (err) {
    console.error('Error logging vehicle change:', err);
  }
}

/**
 * Fetch all vehicle change logs
 */
export async function fetchVehicleChangeLogs() {
  const { data, error } = await supabase
    .from('vehicle_change_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vehicle change logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Compare two vehicle objects and log all differences
 * Used when updating a vehicle
 */
export async function logVehicleUpdate(oldVehicle, newVehicle, adminId) {
  const fieldsToCheck = ['name', 'plate_number', 'model', 'year', 'condition', 'fleet_id', 'is_available'];
  
  for (const field of fieldsToCheck) {
    const oldVal = oldVehicle[field];
    const newVal = newVehicle[field];
    
    if (oldVal !== newVal) {
      await logVehicleChange(
        'update',
        newVehicle.id,
        newVehicle.name,
        adminId,
        field,
        oldVal,
        newVal
      );
    }
  }
}
