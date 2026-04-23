import { supabase } from '../supabaseClient';

// ============ VEHICLES ============
export const vehicleService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(vehicle) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, vehicle) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(vehicle)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ============ VEHICLE BOOKINGS ============
export const vehicleBookingService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vehicle_bookings')
      .select(`
        id,
        vehicle_id,
        user_id,
        purpose,
        destination,
        start_datetime,
        end_datetime,
        actual_return,
        status,
        admin_notes,
        created_at,
        email,
        vehicles(id, name, plate_number, image_url),
        auth.users(id, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('vehicle_bookings')
      .select(`
        *,
        vehicles(*),
        auth.users(id, email)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(booking) {
    const { data, error } = await supabase
      .from('vehicle_bookings')
      .insert([booking])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, booking) {
    const { data, error } = await supabase
      .from('vehicle_bookings')
      .update(booking)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateStatus(id, status, adminNotes = '') {
    const { data, error } = await supabase
      .from('vehicle_bookings')
      .update({ status, admin_notes: adminNotes })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ TRIP LOGS ============
export const tripLogService = {
  async getAll() {
    const { data, error } = await supabase
      .from('trip_logs')
      .select('*, vehicles(name, plate_number)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(tripLog) {
    const { data, error } = await supabase
      .from('trip_logs')
      .insert([tripLog])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, tripLog) {
    const { data, error } = await supabase
      .from('trip_logs')
      .update(tripLog)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ FUEL RECORDS ============
export const fuelRecordService = {
  async getAll() {
    const { data, error } = await supabase
      .from('fuel_records')
      .select('*, vehicles(name, plate_number)')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('fuel_records')
      .insert([record])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('fuel_records')
      .update(record)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ REPAIR RECORDS ============
export const repairRecordService = {
  async getAll() {
    const { data, error } = await supabase
      .from('repair_records')
      .select('*, vehicles(name, plate_number)')
      .order('date_reported', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('repair_records')
      .insert([record])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('repair_records')
      .update(record)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ DRIVER PROFILES ============
export const driverProfileService = {
  async getAll() {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // SIMPLE CREATE: No Auth, no email/password needed
  async create(profileData) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .insert([profileData]) 
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id, profileData) {
    // Remove ID from the update payload to prevent PK errors
    const { id: _id, ...updateData } = profileData;
    
    const { data, error } = await supabase
      .from('driver_profiles')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }
};

// ============ DRIVER VIOLATIONS ============
export const driverViolationService = {
  async getByDriver(driverId) {
    const { data, error } = await supabase
      .from('driver_violations')
      .select('*')
      .eq('driver_id', driverId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(violation) {
    const { data, error } = await supabase
      .from('driver_violations')
      .insert([violation])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, violation) {
    const { data, error } = await supabase
      .from('driver_violations')
      .update(violation)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ EMPLOYEE PROFILES ============
export const employeeProfileService = {
  async getAll() {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(profile) {
    const { data, error } = await supabase
      .from('employee_profiles')
      .insert([profile])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, profile) {
    const { data, error } = await supabase
      .from('employee_profiles')
      .update(profile)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ FLEETS ============
export const fleetService = {
  async getAll() {
    const { data, error } = await supabase
      .from('fleets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(fleet) {
    const { data, error } = await supabase
      .from('fleets')
      .insert([fleet])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, fleet) {
    const { data, error } = await supabase
      .from('fleets')
      .update(fleet)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ MAINTENANCE COSTS ============
export const maintenanceCostService = {
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('maintenance_costs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('maintenance_costs')
      .select('*, vehicles(name, plate_number)')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(cost) {
    const { data, error } = await supabase
      .from('maintenance_costs')
      .insert([cost])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, cost) {
    const { data, error } = await supabase
      .from('maintenance_costs')
      .update(cost)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ REGISTRATION RECORDS ============
export const registrationRecordService = {
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('registration_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('registered_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('registration_records')
      .insert([record])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('registration_records')
      .update(record)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ REPAIR PARTS ============
export const repairPartService = {
  async getByRepair(repairId) {
    const { data, error } = await supabase
      .from('repair_parts')
      .select('*')
      .eq('repair_id', repairId);
    if (error) throw error;
    return data;
  },

  async create(part) {
    const { data, error } = await supabase
      .from('repair_parts')
      .insert([part])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, part) {
    const { data, error } = await supabase
      .from('repair_parts')
      .update(part)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('repair_parts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ============ INSURANCE RECORDS ============
export const insuranceRecordService = {
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('insurance_records')
      .select('*')
      .eq('vehicle_id', vehicleId);
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('insurance_records')
      .select('*, vehicles(name, plate_number)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('insurance_records')
      .insert([record])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('insurance_records')
      .update(record)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ SAFETY CHECKS ============
export const safetyCheckService = {
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('safety_checks')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('check_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('safety_checks')
      .select('*, vehicles(name, plate_number)')
      .order('check_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('safety_checks')
      .insert([record])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('safety_checks')
      .update(record)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ SPARE PARTS ============
export const sparePartService = {
  async getAll() {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*, suppliers(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(part) {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert([part])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, part) {
    const { data, error } = await supabase
      .from('spare_parts')
      .update(part)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ SUPPLIERS ============
export const supplierService = {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(supplier) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, supplier) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ DISPATCH RECORDS ============
export const dispatchRecordService = {
  async getAll() {
    const { data, error } = await supabase
      .from('dispatch_records')
      .select('*, vehicles(name, plate_number)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from('dispatch_records')
      .insert([record])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('dispatch_records')
      .update(record)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ VEHICLE CHANGE LOGS ============
export const vehicleChangeLogService = {
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('vehicle_change_logs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(log) {
    const { data, error } = await supabase
      .from('vehicle_change_logs')
      .insert([log])
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============ VEHICLE DEPRECIATION ============
export const vehicleDepreciationService = {
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('vehicle_depreciation')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(depreciation) {
    const { data, error } = await supabase
      .from('vehicle_depreciation')
      .insert([depreciation])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, depreciation) {
    const { data, error } = await supabase
      .from('vehicle_depreciation')
      .update(depreciation)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};
