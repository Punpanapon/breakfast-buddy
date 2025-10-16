-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  breakfast_start TIME DEFAULT '06:30',
  breakfast_end TIME DEFAULT '10:30',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meals table
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kcal INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  carb INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ate BOOLEAN NOT NULL,
  meal_id UUID REFERENCES meals(id),
  kcal INTEGER,
  protein INTEGER,
  fat INTEGER,
  carb INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view and edit own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Anyone can view meals" ON meals
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own logs" ON logs
  FOR ALL USING (auth.uid() = user_id);

-- Create view for user days
CREATE VIEW v_user_days AS
SELECT user_id, date, ate
FROM logs;

-- Seed meals
INSERT INTO meals (name, kcal, protein, fat, carb, tags, image_url) VALUES
('Greek Yogurt with Berries', 180, 20, 5, 22, '{"high-protein", "dairy"}', null),
('Scrambled Eggs (2) with Toast', 320, 24, 18, 22, '{"high-protein", "eggs"}', null),
('Protein Smoothie Bowl', 280, 25, 8, 35, '{"high-protein", "smoothie"}', null),
('Oatmeal with Nuts', 350, 12, 15, 45, '{"fiber", "nuts"}', null),
('Avocado Toast with Egg', 380, 22, 22, 28, '{"high-protein", "avocado"}', null),
('Cottage Cheese Bowl', 220, 28, 5, 15, '{"high-protein", "dairy"}', null),
('Protein Pancakes', 290, 20, 8, 32, '{"high-protein", "pancakes"}', null),
('Quinoa Breakfast Bowl', 310, 14, 8, 48, '{"quinoa", "bowl"}', null),
('Chia Pudding', 240, 8, 12, 28, '{"chia", "pudding"}', null),
('Turkey Sausage with Toast', 340, 26, 16, 24, '{"high-protein", "meat"}', null),
('Protein Muffin', 260, 18, 9, 28, '{"high-protein", "muffin"}', null),
('Smoked Salmon Bagel', 420, 24, 18, 38, '{"high-protein", "salmon"}', null);