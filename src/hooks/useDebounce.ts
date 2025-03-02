import { useCallback, useEffect, useRef, useState } from "react";
import { clearInterval } from "timers";


export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const clearDebounce = useCallback(() => {
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        clearDebounce()

        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return clearDebounce
    },[value, delay, clearDebounce])

    return debouncedValue
}