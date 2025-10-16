'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Meal } from '@/lib/types';

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

// 8×8 gray PNG so we don't depend on /public/meals/placeholder.png
const PLACEHOLDER_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPUlEQVQoU2NkYGD4z0AEYBxVSFQGJgYGBmZgYGB4ZGBgYJgY2AAmQJgxYhJgYGBgYGQwMDA8DAwMAAAHqgQ2X0p3c2gAAAABJRU5ErkJggg==';

export default function MealCard({ meal, onClick }: MealCardProps) {
  const initialSrc =
    meal.image_url && meal.image_url.trim() !== '' ? meal.image_url : PLACEHOLDER_DATA_URL;

  const [src, setSrc] = useState<string>(initialSrc);
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={`card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={meal.name}
            fill
            sizes="64px"
            className="object-cover rounded-lg"
            loading="lazy"
            // If a remote URL fails, swap to the inline PNG exactly once
            onError={() => {
              if (!errored) {
                setSrc(PLACEHOLDER_DATA_URL);
                setErrored(true);
              }
            }}
            // Let Next.js optimize remote images; skip optimization for the data URL
            unoptimized={src.startsWith('data:')}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1 truncate">{meal.name}</h3>
          <div className="text-sm text-gray-600">
            {meal.kcal} kcal • {meal.protein}g protein
          </div>
        </div>
      </div>
    </div>
  );
}
