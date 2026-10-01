import { useEffect, useRef, useState } from 'react'
import assets from '../data/assets'
import { infrastructure } from '../data/site'
import Button from './Button'
import { gsap, ScrollTrigger, reduced } from '../hooks'

/**
 * Seven full-height cards pinned in a 300vh track and translated
 * horizontally as you scroll. The list is offset by 100vw at its start so
 * the first card enters from off-screen right, as in the reference.
 *
 * Falls back to a plain vertical stack when the visitor prefers reduced
 * motion, and on mobile the CSS collapses it to that same stack.
 */
export default function Infrastructure() {
  const trackRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (reduced()) return undefined
    const track = trackRef.current
    const list = listRef.current
    if (!track || !list) return undefined

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, list.scrollWidth - window.innerWidth)

      gsap.to(list, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
    }, track)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  return (
    <section id="infrastructure" className="section">
      <div className="container">
        <div className="infra-wrap" ref={trackRef}>
          <div className="infra-cms">
            <div className="infra-cms_list" ref={listRef} role="list">
              {infrastructure.map((card, i) => (
                <div role="listitem" className="infra-cms_list_item" key={card.key}>
                  <div
                    className="infra-card"
                    data-open={open === i || undefined}
                    tabIndex={0}
                    aria-expanded={open === i}
                    onClick={(e) => {
                      if (e.target.closest('a, button')) return
                      setOpen((v) => (v === i ? null : i))
                    }}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      setOpen((v) => (v === i ? null : i))
                    }}
                  >
                    <div className="infra-card_img-wrap">
                      <div className="infra-card_grad-overlay" />
                      <img
                        src={assets.infrastructure[card.key]}
                        loading="lazy"
                        alt={card.title}
                        className="img2"
                      />
                    </div>
                    <div className="infra-card_title">
                      <div className="h2 text-white">{card.title}</div>
                    </div>
                    <div className="infra-card_desc">
                      <div className="infra-card_desc_content">
                        <div className="mb-24">
                          <p>{card.body}</p>
                        </div>
                        <Button href="#cta" label="Register interest" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
