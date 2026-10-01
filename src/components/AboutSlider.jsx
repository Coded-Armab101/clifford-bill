import { useEffect, useMemo, useRef, useState } from 'react'
import { aboutEyebrow, aboutSlides } from '../data/site'
import { ScrollTrigger, scrollTo, reduced } from '../hooks'

/**
 * Splits a string into per-character spans so the headline can be revealed
 * left-to-right as its slide becomes active.
 */
function SplitText({ text, active }) {
  const chars = useMemo(() => Array.from(text), [text])

  return (
    <p className="h2 anim-text" aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="anim-char"
          aria-hidden="true"
          data-on={active || undefined}
        >
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </p>
  )
}

/**
 * "A new beginning" — a horizontal statement rail. Five full-width slides sit
 * in a nowrap mask; scroll position across the 450vh track selects the active
 * slide and the rail translates by one viewport per step. Inactive headlines
 * stay on screen and dim to 15%, mirroring the reference's character reveal.
 */
export default function AboutSlider({ children }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const total = aboutSlides.length

  useEffect(() => {
    if (reduced()) return undefined
    const track = trackRef.current
    if (!track) return undefined

    let last = -1
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: () => '+=' + Math.max(1, track.offsetHeight - window.innerHeight),
      onUpdate(self) {
        const next = Math.min(total - 1, Math.floor(self.progress * total))
        if (next !== last) {
          last = next
          setIndex(next)
        }
      },
    })

    return () => {
      st.kill()
      ScrollTrigger.refresh()
    }
  }, [total])

  const jumpTo = (i) => {
    const track = trackRef.current
    if (!track) return
    const distance = track.offsetHeight - window.innerHeight
    scrollTo(track.offsetTop + (distance * (i + 0.5)) / total)
  }

  return (
    <div className="sticky-wrap-outer" ref={trackRef}>
      <div className="sticky-wrap-inner-1">
        <section id="about" className="section clip sticky">
          <div className="container">
            <div className="about-wrap">
              <div className="about-slider">
                <div className="about-slider_mask">
                  <div
                    className="about-slider_track"
                    style={{ '--slide-index': index }}
                  >
                    {aboutSlides.map((slide, i) => (
                      <div
                        className="about-slide text-center"
                        key={slide.headline}
                        aria-hidden={i !== index || undefined}
                        data-active={i === index || undefined}
                      >
                        <div className="grid">
                          <div className="about-slide_headline">
                            <div className="mb-32">
                              <div className="p1">{aboutEyebrow}</div>
                            </div>
                            <div className="mb-48">
                              <SplitText text={slide.headline} active={i === index} />
                            </div>
                          </div>
                        </div>
                        <div className="about-slide_desc">
                          <div className="grid">
                            <div className="about-slide_desc_inner mb-48">
                              <p className="p1">{slide.body}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="about-slider_nav" role="tablist" aria-label="Statements">
                  {aboutSlides.map((slide, i) => (
                    <button
                      key={slide.headline}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Statement ${i + 1} of ${total}`}
                      className="about-slider_dot"
                      data-active={i === index || undefined}
                      onClick={() => jumpTo(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky-wrap-inner mt-100-vh">{children}</div>
    </div>
  )
}