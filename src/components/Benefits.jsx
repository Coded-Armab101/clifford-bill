import { useState } from 'react'
import assets from '../data/assets'
import { benefits } from '../data/site'
import Button from './Button'

/**
 * "Live, Work, Play" — seven statements each paired with an image. The
 * image column is a fixed-height stack; hovering (or focusing) a tab
 * cross-fades the image to the matching card. Card order must stay locked
 * to tab order — the pairing is index-based.
 */
export default function Benefits() {
  const [active, setActive] = useState(0)

  return (
    <section id="benefits" className="section pt-176">
      <div className="container">
        <div className="benefits-wrap">
          <div className="grid">
            <div className="benefits-wrap_title">
              <h2 className="h1">
                Live <span className="text-grey-15">,</span>Work
                <span className="text-grey-15">, </span>Play
              </h2>
            </div>
          </div>

          <div className="benefits-wrap_content mb-32">
            <div className="benefits-cms_list" role="list">
              {benefits.map((b, i) => (
                <div
                  role="listitem"
                  className="benefits-cms_list_item"
                  key={b.key}
                  data-active={i === active || undefined}
                  onPointerEnter={() => setActive(i)}
                >
                  <div className="benefits-card">
                    <div className="grid">
                      <div className="benefits-card_content">
                        <div className="mb-24">
                          <p className="p1">{b.body}</p>
                        </div>
                        <Button href="#cta" label="Register interest" />
                      </div>
                      <div className="benefits-card_img-wrapper">
                        <div
                          className="benefits-card_img-wrap"
                          data-active={i === active || undefined}
                        >
                          <img
                            src={assets.benefits[b.key]}
                            loading="lazy"
                            alt={b.title}
                            className="img"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="benefit-tabs-cms_list" role="tablist" aria-label="Live, Work, Play">
              {benefits.map((b, i) => (
                <div role="listitem" className="benefit-tabs-cms_list_item" key={b.key}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    className="benefit-tab"
                    data-active={i === active || undefined}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                  >
                    <span className="benefit-tab_ico-dot" />
                    <span className="p1">{b.title}</span>
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
