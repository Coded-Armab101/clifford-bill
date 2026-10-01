import { useRef, useState } from 'react'
import assets from '../data/assets'
import { townCentre } from '../data/site'
import { gsap, useGsap } from '../hooks'

/**
 * The render with three overlaid figures. Hovering a row lifts its dot and
 * rule; the figures are also selectable by click so the interaction works
 * on touch.
 *
 * The panel widens from 40% to full bleed as the section rises from the
 * bottom of the viewport to the top, matching the reference.
 */
export default function Areas() {
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)

  useGsap(() => {
    const el = wrapRef.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      gsap.fromTo(
        el,
        { width: '40%' },
        {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        },
      )
    })
  }, [])

  return (
    <section id="town-centre" className="section pt-32">
      <div className="container">
        <div className="areas-wrap" ref={wrapRef}>
          <div className="areas-wrap_img-wrap">
            <img
              src={assets.areasRender}
              loading="lazy"
              alt={`${townCentre.title} render`}
              className="render-img"
            />
            <div className="grad-overlay-t" />
          </div>

          <div className="areas-wrap_tabs">
            <div className="areas-wrap_tabs_title mb-16">
              <h2 className="h3 text-white">{townCentre.title}</h2>
            </div>
            <div className="area-tabs-cms_list" role="list">
              {townCentre.stats.map((s, i) => (
                <div
                  role="listitem"
                  className="area-tabs-cms_list_item"
                  key={s.label}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <button
                    type="button"
                    className="area-tab"
                    data-active={i === active || undefined}
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                  >
                    <span className="grid">
                      <span className="area-tab_name">
                        <span className="area-tab_ico-dot" />
                        <span className="p1">{s.label}</span>
                      </span>
                      <span className="area-tab_area">
                        <span className="p1">{s.value}</span>
                      </span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
