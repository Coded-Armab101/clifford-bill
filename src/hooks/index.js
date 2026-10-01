import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------
   One Lenis instance for the whole page. Kept at module scope because
   several components need to drive scrolling (e.g. the slider dots) and
   threading it through context would add ceremony for no benefit.
   ------------------------------------------------------------------ */
export const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
})

let rafId
function raf(time) {
  lenis.raf(time)
  rafId = requestAnimationFrame(raf)
}

export function useLenis() {
  useEffect(() => {
    rafId = requestAnimationFrame(raf)
    if (import.meta.env.DEV) {
      window.lenis = lenis
      window.ScrollTrigger = ScrollTrigger
    }
    return () => {
      cancelAnimationFrame(rafId)
      delete window.lenis
      delete window.ScrollTrigger
    }
  }, [])
}

/** Scroll the page with Lenis's easing, falling back to native scrolling. */
export function scrollTo(target) {
  if (lenis && !reduced()) lenis.scrollTo(target, { duration: 1.2 })
  else if (target instanceof HTMLElement) target.scrollIntoView({ behavior: 'smooth' })
}

/** Lock body scroll (and stand Lenis down) while an overlay is open. */
export function useScrollLock(locked) {
  useEffect(() => {
    document.body.classList.toggle('no-scroll', locked)
    if (locked) lenis.stop()
    else lenis.start()
    return () => {
      document.body.classList.remove('no-scroll')
      lenis.start()
    }
  }, [locked])
}

/**
 * Runs `fn` inside a gsap context so every trigger/animation it creates is
 * reverted on unmount. No-ops under `prefers-reduced-motion`.
 */
export function useGsap(fn, deps = []) {
  useEffect(() => {
    if (reduced()) return undefined
    const ctx = gsap.context(fn)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap, ScrollTrigger }
