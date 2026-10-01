import assets from '../data/assets'
import { brand, intro } from '../data/site'
import VideoCard from './VideoCard'
import Commencing from './Commencing'

/**
 * Infinite logo marquee. The reference pins each copy to a fixed width, runs
 * a single CSS keyframe on the list, and fades the ends with a PNG mask
 * (`mask-size: cover`) rather than gradients — all reproduced here. There is
 * no hover pause in the original, so none is added.
 */
function PartnersTicker() {
  return (
    <div
      className="partners-ticker mask-fade"
      style={{ '--mask-logo': `url(${assets.maskLogo})` }}
    >
      <div className="partners-ticker_list masked">
        {[0, 1].map((copy) => (
          <div className="partners-cms" key={copy} aria-hidden={copy === 1 || undefined}>
            <div className="partners-cms_list" role="list">
              {assets.partners.map((p) => (
                <div role="listitem" className="partners-cms_list_item" key={p.name}>
                  <div className="partners-card">
                    <img src={p.src} loading="eager" alt={p.name} className="partners-logo" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InfoStrip() {
  return (
    <section className="section">
      <div className="container">
        <div className="info-wrap">
          <div className="intro-wrap_content">
            <div className="grid">
              <div className="intro-wrap_loc">
                <div className="p1 text-grey-40">Location</div>
                <div className="p1">{brand.street}</div>
              </div>

              <div className="intro-wrap_partners">
                <PartnersTicker />
              </div>

              <div className="intro-wrap_dev">
                <div className="p1 text-grey-40">Development</div>
                <div className="p1">
                  {brand.development[0]} <span className="font-inter">+</span>{' '}
                  {brand.development[1]}
                </div>
              </div>

              {/* the reference hides this hairline on mobile via mob_hide */}
              <div className="line-h intro-wrap_line desk-only" />
            </div>

            {/* Below 768px the hero drops its film and summary, and they are
                picked up here — inside the same content column, as in the
                original. `desk_hide` reads inverted but is correct: the
                original's single breakpoint is max-width 767px, so this block
                is hidden on desktop and shown on mobile. */}
            <div className="mob-only">
              <div className="grid pt-32 mob_first">
                <div className="intro-wrap_content_desc">
                  <p className="p1">{intro.summary}</p>
                </div>
                <div className="intro-wrap_content_widgets">
                  <VideoCard />
                  {/* the reference keeps the commencing bar inside the widgets
                      column, not after the grid — moving it out changes the
                      column height and the whole strip's height on mobile */}
                  <Commencing />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
