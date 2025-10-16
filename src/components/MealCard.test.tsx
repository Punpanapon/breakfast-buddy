import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MealCard from './MealCard'
import { Meal } from '@/lib/types'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, onError, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      onError={onError}
      {...props}
    />
  )
}))

const mockMeal: Meal = {
  id: '1',
  name: 'Test Meal',
  kcal: 300,
  protein: 20,
  fat: 10,
  carb: 30,
  tags: ['test', 'meal']
}

describe('MealCard', () => {
  it('uses placeholder when no image_url provided', () => {
    const { container } = render(<MealCard meal={mockMeal} />)
    const img = container.querySelector('img')
    expect(img?.src).toContain('/meals/placeholder.png')
  })

  it('uses direct path when image_url starts with /', () => {
    const mealWithLocalImage = { ...mockMeal, image_url: '/meals/test.jpg' }
    const { container } = render(<MealCard meal={mealWithLocalImage} />)
    const img = container.querySelector('img')
    expect(img?.src).toContain('/meals/test.jpg')
  })

  it('uses remote URL when image_url is external', () => {
    const mealWithRemoteImage = { 
      ...mockMeal, 
      image_url: 'https://example.com/image.jpg' 
    }
    const { container } = render(<MealCard meal={mealWithRemoteImage} />)
    const img = container.querySelector('img')
    expect(img?.src).toBe('https://example.com/image.jpg')
  })
})