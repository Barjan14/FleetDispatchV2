-- Vehicle Change Logs Table
-- This table tracks all changes made to vehicles in the admin dashboard

CREATE TABLE IF NOT EXISTS vehicle_change_logs (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_name TEXT,
  change_type VARCHAR(20) NOT NULL DEFAULT 'update', -- 'create', 'update', 'delete'
  field_name VARCHAR(100), -- The field that changed (null for create/delete)
  old_value TEXT, -- Previous value (null for create)
  new_value TEXT, -- New value (null for delete)
  admin_id VARCHAR(255), -- Admin user ID or username
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common queries
CREATE INDEX idx_vehicle_change_logs_vehicle_id ON vehicle_change_logs(vehicle_id);
CREATE INDEX idx_vehicle_change_logs_created_at ON vehicle_change_logs(created_at DESC);
CREATE INDEX idx_vehicle_change_logs_change_type ON vehicle_change_logs(change_type);

-- Enable Row Level Security
ALTER TABLE vehicle_change_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated admins to read logs
CREATE POLICY "Admin can read vehicle change logs" 
  ON vehicle_change_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy to allow system to insert logs
CREATE POLICY "System can insert vehicle change logs" 
  ON vehicle_change_logs FOR INSERT 
  WITH CHECK (true);
