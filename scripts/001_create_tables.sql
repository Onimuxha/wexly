-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_kh TEXT NOT NULL,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create day_schedules table for storing day off state and scheduled activities
CREATE TABLE IF NOT EXISTS day_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL UNIQUE,
  is_day_off BOOLEAN DEFAULT FALSE,
  activities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table for language preference
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default activities
INSERT INTO activities (name, name_kh, duration, sort_order) VALUES
  ('Learn C Programming', 'រៀនភាសា C', 60, 0),
  ('Exercise', 'ហាត់ប្រាណ', 30, 1),
  ('Relax', 'សម្រាក', 20, 2),
  ('Post a Video', 'បង្ហោះវីដេអូ', 45, 3),
  ('Wash Dishes', 'លាងចាន', 15, 4),
  ('Mop the Floor', 'ជូតជាន់ផ្ទះ', 20, 5),
  ('Do Laundry', 'បោកខោអាវ', 30, 6),
  ('Learn from Udemy', 'រៀនពី Udemy', 60, 7)
ON CONFLICT DO NOTHING;

-- Insert default language setting
INSERT INTO user_settings (setting_key, setting_value) VALUES ('language', 'en')
ON CONFLICT (setting_key) DO NOTHING;
