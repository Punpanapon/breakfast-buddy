-- Create RPG tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT
);

CREATE TABLE breakfasts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  protein_g INTEGER,
  carbs_g INTEGER,
  fiber_g INTEGER,
  water_ml INTEGER,
  variety_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day)
);

CREATE TABLE rpg_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INTEGER DEFAULT 0,
  last_log DATE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  freeze_used_month TEXT
);

CREATE TABLE fights (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE,
  boss_name TEXT,
  win BOOLEAN,
  xp_awarded INTEGER,
  m NUMERIC(3,1),
  str INTEGER,
  sta INTEGER,
  def INTEGER,
  luck INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cosmetics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  rarity TEXT,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakfasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpg_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own breakfasts" ON breakfasts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own rpg_state" ON rpg_state FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own fights" ON fights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cosmetics" ON cosmetics FOR ALL USING (auth.uid() = user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION compute_stats(
  protein INTEGER,
  carbs INTEGER,
  fiber INTEGER,
  variety INTEGER,
  streak INTEGER
) RETURNS TABLE(
  str INTEGER,
  sta INTEGER,
  def INTEGER,
  luck INTEGER,
  m NUMERIC,
  xp_today INTEGER
) AS $$
DECLARE
  calc_str INTEGER;
  calc_sta INTEGER;
  calc_def INTEGER;
  calc_luck INTEGER;
  calc_m NUMERIC;
  calc_xp INTEGER;
BEGIN
  calc_str := ROUND(protein / 10.0);
  calc_sta := ROUND(carbs / 25.0);
  calc_def := GREATEST(1, ROUND(fiber / 5.0));
  calc_luck := LEAST(5, GREATEST(0, FLOOR(variety / 3.0)));
  calc_m := 1 + 0.1 * FLOOR(streak / 7.0);
  calc_xp := ROUND(30 * calc_m);
  
  RETURN QUERY SELECT calc_str, calc_sta, calc_def, calc_luck, calc_m, calc_xp;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION week_boss_name(d DATE) RETURNS TEXT AS $$
DECLARE
  week_num INTEGER;
  bosses TEXT[] := ARRAY['Morning Fog', 'Decision Fatigue', 'Lecture Slump'];
BEGIN
  week_num := EXTRACT(week FROM d);
  RETURN bosses[(week_num % 3) + 1];
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_breakfast_and_fight(
  p_day DATE,
  p_protein INTEGER,
  p_carbs INTEGER,
  p_fiber INTEGER,
  p_water INTEGER,
  p_variety INTEGER
) RETURNS TABLE(
  new_streak INTEGER,
  xp_gain INTEGER,
  win BOOLEAN,
  boss TEXT,
  str INTEGER,
  sta INTEGER,
  def INTEGER,
  luck INTEGER,
  m NUMERIC,
  drop_name TEXT,
  drop_rarity TEXT
) AS $$
DECLARE
  current_state rpg_state%ROWTYPE;
  stats_result RECORD;
  boss_name TEXT;
  player_power INTEGER;
  boss_power INTEGER;
  battle_win BOOLEAN;
  xp_awarded INTEGER;
  cosmetic_roll INTEGER;
  cosmetic_name TEXT;
  cosmetic_rarity TEXT;
  current_month TEXT;
  gap_days INTEGER;
  can_use_freeze BOOLEAN := FALSE;
BEGIN
  -- Get current RPG state
  SELECT * INTO current_state FROM rpg_state WHERE user_id = auth.uid();
  
  -- Initialize if not exists
  IF current_state IS NULL THEN
    INSERT INTO rpg_state (user_id) VALUES (auth.uid());
    SELECT * INTO current_state FROM rpg_state WHERE user_id = auth.uid();
  END IF;
  
  -- Upsert breakfast
  INSERT INTO breakfasts (user_id, day, protein_g, carbs_g, fiber_g, water_ml, variety_score)
  VALUES (auth.uid(), p_day, p_protein, p_carbs, p_fiber, p_water, p_variety)
  ON CONFLICT (user_id, day) DO UPDATE SET
    protein_g = EXCLUDED.protein_g,
    carbs_g = EXCLUDED.carbs_g,
    fiber_g = EXCLUDED.fiber_g,
    water_ml = EXCLUDED.water_ml,
    variety_score = EXCLUDED.variety_score;
  
  -- Calculate streak
  current_month := TO_CHAR(p_day, 'YYYY-MM');
  
  IF current_state.last_log IS NULL THEN
    new_streak := 1;
  ELSE
    gap_days := p_day - current_state.last_log;
    IF gap_days = 1 THEN
      new_streak := current_state.streak + 1;
    ELSIF gap_days > 1 AND current_state.freeze_used_month != current_month THEN
      can_use_freeze := TRUE;
      new_streak := current_state.streak; -- Preserve streak with freeze
    ELSE
      new_streak := 1; -- Reset streak
    END IF;
  END IF;
  
  -- Compute stats
  SELECT * INTO stats_result FROM compute_stats(p_protein, p_carbs, p_fiber, p_variety, new_streak);
  str := stats_result.str;
  sta := stats_result.sta;
  def := stats_result.def;
  luck := stats_result.luck;
  m := stats_result.m;
  
  -- Get boss
  boss_name := week_boss_name(p_day);
  boss := boss_name;
  
  -- Simple battle simulation
  player_power := str + sta + def + luck;
  boss_power := 15 + (EXTRACT(week FROM p_day) % 5); -- Varies by week
  
  battle_win := player_power >= boss_power;
  
  IF battle_win THEN
    xp_awarded := stats_result.xp_today;
  ELSE
    xp_awarded := FLOOR(stats_result.xp_today / 4.0);
  END IF;
  
  win := battle_win;
  xp_gain := xp_awarded;
  
  -- Cosmetic drop
  cosmetic_roll := FLOOR(RANDOM() * 100) + 1 + luck * 5; -- Luck increases chance
  
  IF cosmetic_roll >= 95 THEN
    cosmetic_name := CASE FLOOR(RANDOM() * 2) + 1
      WHEN 1 THEN 'Chula-Pink Trail'
      ELSE 'Hollow-Body Guitar'
    END;
    cosmetic_rarity := 'rare';
  ELSIF cosmetic_roll >= 70 THEN
    cosmetic_name := CASE FLOOR(RANDOM() * 3) + 1
      WHEN 1 THEN 'Chef Hat'
      WHEN 2 THEN 'Protein Token'
      ELSE 'Bottle of Water'
    END;
    cosmetic_rarity := 'common';
  ELSE
    cosmetic_name := NULL;
    cosmetic_rarity := NULL;
  END IF;
  
  -- Insert cosmetic if dropped and new
  IF cosmetic_name IS NOT NULL THEN
    INSERT INTO cosmetics (user_id, name, rarity)
    VALUES (auth.uid(), cosmetic_name, cosmetic_rarity)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Check if it was actually inserted (new)
    IF NOT FOUND THEN
      cosmetic_name := NULL;
      cosmetic_rarity := NULL;
    END IF;
  END IF;
  
  drop_name := cosmetic_name;
  drop_rarity := cosmetic_rarity;
  
  -- Update RPG state
  UPDATE rpg_state SET
    streak = new_streak,
    last_log = p_day,
    xp = xp + xp_awarded,
    level = GREATEST(1, FLOOR((xp + xp_awarded) / 100.0) + 1),
    freeze_used_month = CASE WHEN can_use_freeze THEN current_month ELSE freeze_used_month END
  WHERE user_id = auth.uid();
  
  -- Insert fight record
  INSERT INTO fights (user_id, day, boss_name, win, xp_awarded, m, str, sta, def, luck)
  VALUES (auth.uid(), p_day, boss_name, battle_win, xp_awarded, m, str, sta, def, luck);
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;