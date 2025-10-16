import { useEffect } from 'react'

/**
 * Хук для обработки кликов вне элемента
 * @param {React.RefObject} ref - реф элемента
 * @param {Function} handler - функция-обработчик
 */
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Если клик внутри элемента - игнорируем
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      // Иначе вызываем обработчик
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}