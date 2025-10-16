import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const meals = [
  { name: 'Greek Yogurt with Berries', kcal: 180, protein: 20, fat: 5, carb: 22, tags: ['high-protein', 'dairy'], image_url: null },
  { name: 'Scrambled Eggs (2) with Toast', kcal: 320, protein: 24, fat: 18, carb: 22, tags: ['high-protein', 'eggs'], image_url: null },
  { name: 'Protein Smoothie Bowl', kcal: 280, protein: 25, fat: 8, carb: 35, tags: ['high-protein', 'smoothie'], image_url: null },
  { name: 'Oatmeal with Nuts', kcal: 350, protein: 12, fat: 15, carb: 45, tags: ['fiber', 'nuts'], image_url: null },
  { name: 'Avocado Toast with Egg', kcal: 380, protein: 22, fat: 22, carb: 28, tags: ['high-protein', 'avocado'], image_url: null },
  { name: 'Cottage Cheese Bowl', kcal: 220, protein: 28, fat: 5, carb: 15, tags: ['high-protein', 'dairy'], image_url: null },
  { name: 'Protein Pancakes', kcal: 290, protein: 20, fat: 8, carb: 32, tags: ['high-protein', 'pancakes'], image_url: null },
  { name: 'Quinoa Breakfast Bowl', kcal: 310, protein: 14, fat: 8, carb: 48, tags: ['quinoa', 'bowl'], image_url: null },
  { name: 'Chia Pudding', kcal: 240, protein: 8, fat: 12, carb: 28, tags: ['chia', 'pudding'], image_url: null },
  { name: 'Turkey Sausage with Toast', kcal: 340, protein: 26, fat: 16, carb: 24, tags: ['high-protein', 'meat'], image_url: null },
  { name: 'Protein Muffin', kcal: 260, protein: 18, fat: 9, carb: 28, tags: ['high-protein', 'muffin'], image_url: null },
  { name: 'Smoked Salmon Bagel', kcal: 420, protein: 24, fat: 18, carb: 38, tags: ['high-protein', 'salmon'], image_url: null },
  { name: 'Peanut Butter Toast', kcal: 380, protein: 16, fat: 20, carb: 36, tags: ['nuts', 'toast'], image_url: null },
  { name: 'Breakfast Burrito', kcal: 450, protein: 22, fat: 24, carb: 38, tags: ['eggs', 'wrap'], image_url: null },
  { name: 'Protein Overnight Oats', kcal: 320, protein: 20, fat: 10, carb: 42, tags: ['high-protein', 'oats'], image_url: null },
  { name: 'Egg White Omelet', kcal: 180, protein: 24, fat: 2, carb: 8, tags: ['high-protein', 'low-fat'], image_url: null },
  { name: 'Banana Protein Smoothie', kcal: 300, protein: 25, fat: 6, carb: 40, tags: ['high-protein', 'fruit'], image_url: null },
  { name: 'Whole Grain Cereal with Milk', kcal: 280, protein: 12, fat: 8, carb: 45, tags: ['cereal', 'dairy'], image_url: null },
  { name: 'Breakfast Quinoa Salad', kcal: 350, protein: 15, fat: 12, carb: 48, tags: ['quinoa', 'salad'], image_url: null },
  { name: 'Protein French Toast', kcal: 340, protein: 22, fat: 12, carb: 36, tags: ['high-protein', 'french-toast'], image_url: null }
]

async function seedMeals() {
  console.log('Seeding meals...')
  
  const { data, error } = await supabase
    .from('meals')
    .insert(meals)
    .select()

  if (error) {
    console.error('Error seeding meals:', error)
    process.exit(1)
  }

  console.log(`Successfully seeded ${data.length} meals`)
  process.exit(0)
}

seedMeals()