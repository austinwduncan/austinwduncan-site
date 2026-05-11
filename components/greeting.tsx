'use client'

import { useEffect, useState } from 'react'

type Period = 'morning' | 'afternoon' | 'evening' | 'night'
type Season = 'spring' | 'summer' | 'autumn' | 'winter'

function getSeason(month: number): Season {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

function getPeriod(hour: number): Period {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

const greetings: Record<Period, Record<Season, string[]>> = {
  morning: {
    spring: [
      'Good morning. Spring is here — new growth all around.',
      'His mercies are new every morning.',
      'Morning. The world is waking up.',
    ],
    summer: [
      'Good morning. The days are long — make use of them.',
      'His mercies are new every morning.',
      'Morning. Summer light is already bright.',
    ],
    autumn: [
      'Good morning. The leaves are turning — a good season for the Word.',
      'His mercies are new every morning.',
      'Morning. Autumn is a gift.',
    ],
    winter: [
      'Good morning. A lamp to our feet, a light to our path.',
      'His mercies are new every morning.',
      'Morning. Come in from the cold.',
    ],
  },
  afternoon: {
    spring: [
      'Good afternoon. Spring makes everything feel possible.',
      'Welcome. Glad you stopped by.',
      'Afternoon — pull up a chair.',
    ],
    summer: [
      'Good afternoon. The harvest is coming.',
      'Welcome. Glad you stopped by.',
      'Afternoon — pull up a chair.',
    ],
    autumn: [
      'Good afternoon. The harvest is plentiful.',
      'Welcome. Glad you stopped by.',
      'Afternoon — pull up a chair.',
    ],
    winter: [
      'Good afternoon. Shorter days, but the Word endures.',
      'Welcome. Glad you stopped by.',
      'Afternoon — pull up a chair.',
    ],
  },
  evening: {
    spring: [
      'Good evening. The days are growing longer.',
      'Evening. The Word endures.',
      'Welcome this evening.',
    ],
    summer: [
      'Good evening. Long summer day behind you.',
      'Evening. The Word endures.',
      'Welcome this evening.',
    ],
    autumn: [
      'Good evening. The autumn air is settling in.',
      'Evening. The Word endures.',
      'Welcome this evening.',
    ],
    winter: [
      'Good evening. Long winter night — good time to read.',
      'Evening. Light in the darkness.',
      'Welcome this evening.',
    ],
  },
  night: {
    spring: ['Still up? Welcome.', 'The night is yours. Welcome.', 'Welcome — late spring evening.'],
    summer: ['Still up? Welcome.', 'The night is yours. Welcome.', 'Warm summer night. Welcome.'],
    autumn: ['Still up? Welcome.', 'The night is yours. Welcome.', 'Quiet autumn night. Welcome.'],
    winter: ['Still up? Welcome.', 'The night is yours. Welcome.', 'Cold winter night. Welcome.'],
  },
}

export default function Greeting() {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    const now = new Date()
    const period = getPeriod(now.getHours())
    const season = getSeason(now.getMonth())
    const options = greetings[period][season]
    // Rotate daily by day-of-year so it changes each day but is stable per page load
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    )
    setText(options[dayOfYear % options.length])
  }, [])

  if (!text) return null

  return (
    <p
      className="text-sm font-light tracking-wide"
      style={{ color: '#cdb079' }}
    >
      {text}
    </p>
  )
}
