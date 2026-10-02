import { useState } from 'react'
import assets from '../data/assets'
import { brand } from '../data/site'
import Button from './Button'
import IconButton from './IconButton'
import { scrollTo } from '../hooks'

export default function Footer() {
  const [year] = useState(() => new Date().getFullYear())

  return (
    <section className="section clip">
      <div className="container">
        <div className="footer-wrap">
          <div className="grad-overlay-t" />
          <div className="grad-overlay-t" />
          <div className="grad-overlay-b" />
          <div className="footer-wrap_img-wrap">
            <img
              src={assets.footer}
              loading="lazy"
              alt={`Construction of the ${brand.name} precinct`}
              className="img"
            />
          </div>

          <div className="footer-wrap_content mb-96">
            <div className="grid">
              <div className="footer-wrap_contact">
                <div className="mb-64">
                  <a href={`mailto:${brand.email}`} className="link-h2 w-inline-block">
                    <div className="h2 text-white">{brand.email}</div>
                  </a>
                </div>
                <div className="footer-wrap_contact_item mb-32">
                  <div className="footer-wrap_contact_item_title">
                    <div className="p1 text-white">Location</div>
                  </div>
                  <div className="footer-wrap_contact_item_content">
                    <div className="p1 text-white">
                      {brand.address.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  </div>
                  <div className="footer-wrap_contact_break" />
                  <div className="footer-wrap_contact_item_btn">
                    <Button
                      href={brand.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="prim-on-img"
                      label="See on map"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="footer-wrap_bottom-bar mb-32">
            <div className="footer-wrap_bottom-bar_left">
              <div className="p1">
                &copy; {year} All Right Reserved
              </div>
            </div>
            <div className="footer-wrap_bottom-bar_left">
              <a
                href={assets.privacyPdf}
                target="_blank"
                rel="noreferrer"
                className="link w-inline-block"
              >
                <div className="link_label">
                  <div className="p1">Privacy Policy</div>
                  <div className="p1 label-is-2">Privacy Policy</div>
                </div>
              </a>
              <a href={assets.termsPdf} target="_blank" rel="noreferrer" className="link w-inline-block">
                <div className="link_label">
                  <div className="p1">Terms of Use</div>
                  <div className="p1 label-is-2">Terms of Use</div>
                </div>
              </a>
            </div>
            <div className="footer-wrap_bottom-bar_btn">
              <IconButton
                href="#intro"
                icon={assets.icoArrowTop}
                aria-label="Back to top"
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo('#intro')
                }}
              />
            </div>
          </footer>
        </div>
      </div>
    </section>
  )
}
