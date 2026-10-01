import { useState } from 'react'
import assets from '../data/assets'
import { brand, masterplan } from '../data/site'
import Button from './Button'

/**
 * Seven absolutely-positioned pins over the precinct map. Hovering or
 * focusing a pin grows its map label and pops a detail card out to one
 * side. The whole thing is one of two renderings of the same content:
 * this for pointer devices, `MasterplanList` for touch.
 */
function Pins() {
  const [open, setOpen] = useState(null)

  return (
    <div className="genplan-pins-wrap">
      <div className="genplan-wrap_pins desk-only">
        {masterplan.pins.map((pin, i) => (
          <div
            className={`pin-visual ${pin.id}`}
            key={`${pin.id}-label`}
            data-show={open === i || undefined}
            aria-hidden="true"
          >
            <img
              src={assets.genplanLabels[pin.image]}
              alt=""
              className="img-genplan-border"
            />
          </div>
        ))}

        {masterplan.pins.map((pin, i) => (
          <button
            type="button"
            className={`pin prim-on-white ${pin.id}${i % 2 ? ' left' : ' right'}`}
            key={pin.id}
            aria-expanded={open === i}
            onPointerEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onBlur={() => setOpen(null)}
            onClick={() => setOpen((v) => (v === i ? null : i))}
          >
            <span className={`pin-details ${i % 2 ? 'left' : 'right'}`} data-show={open === i || undefined}>
              <span className="pin-details_title">
                <span className="p1 text-bold">{pin.title}</span>
              </span>
              <span className="pin-details_desc">
                <span className="p1 text-grey-40">{pin.body}</span>
              </span>
            </span>
            <img src={assets.icoPlus} alt="" className="btn-icon_ico-24 mode-diff" />
          </button>
        ))}
      </div>

      <div className="genplan-wrap_border">
        <img
          src={assets.genplanBorder}
          loading="lazy"
          alt={`The boundary of the entire project area, ${masterplan.boundary}`}
          className="img-genplan-border"
        />
        <div className="area-pin">
          <div className="area-pin_label mb-16">
            <div className="p1 text-bold not-wrap">{masterplan.boundary}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Masterplan() {
  return (
    <section id="masterplan" className="section">
      <div className="container">
        <div className="genplan-wrap bleed-x">
          <div className="genplan-wrap_visual">
            <div className="genplan-wrap_img-wrap_overlay-wrap">
              <div className="genplan-wrap_img-wrap_overlay" />
            </div>
            <div className="genplan-wrap_img-wrap">
              <img
                src={assets.genplan}
                loading="lazy"
                alt={`${brand.name} general plan`}
                className="img-genplan"
              />
            </div>
          </div>

          <div className="genplan-wrap_interaction">
            <div className="genplan-wrap_img-wrap_overlay-wrap">
              <div className="grad-overlay-b" />
            </div>

            <Pins />

            <div className="genplan-wrap_interaction_title">
              <div className="connection-wrap">
                <div className="h2 text-white">{masterplan.titleTop}</div>
              </div>
              <div className="nature-wrap">
                <div className="h2 text-white">{masterplan.titleBottom}</div>
              </div>
            </div>

            <div className="genplan-wrap_interaction_footer mb-32">
              <div className="grid">
                <div className="genplan-wrap_interaction_loc desk-only">
                  <div className="p1 text-white text-grey-50--on-img">Location</div>
                  <div className="p1 text-white">{brand.street}</div>
                </div>
                <div className="genplan-wrap_interaction_desc text-center">
                  <div className="p1 text-white">{masterplan.openSpace}</div>
                </div>
                <div className="genplan-wrap_interaction_btns">
                  <Button
                    href={assets.masterplanPdf}
                    target="_blank"
                    rel="noreferrer"
                    variant="sec-on-img"
                    label={masterplan.cta[0]}
                  />
                  <Button
                    href={brand.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="prim-on-img"
                    label={masterplan.cta[1]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
