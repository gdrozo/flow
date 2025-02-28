import { useRef } from 'react'
import { handler } from 'tailwindcss-animate'

export default function useValue(startingValue, handler) {
  const value = useRef(startingValue)

  function setValue(newValue) {
    value.current = newValue
    onChange()
  }

  function onChange() {
    if (!handler) return

    handler(value.current)
  }

  return [value.current, setValue]
}
