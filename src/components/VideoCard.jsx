import { useState } from 'react'
import assets from '../data/assets'
import { brand } from '../data/site'
import IconButton from './IconButton'
import { useScrollLock } from '../hooks'

/**
 * The looping aerial film with a play button that opens the full film in
 * a fixed overlay. Kept as its own component because the reference
 * repeats the whole card on desktop and mobile breakpoints.
 */
export default function VideoCard({ onDark = false }) {
  const [open, setOpen] = useState(false)
  useScrollLock(open)

  const close = () => setOpen(false)

  return (
    <div className="video-card mb-8">
      <div className="video-wrap_wrap">
        <video
          className="video"
          poster={assets.videoPoster}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src={assets.videoMp4} type="video/mp4" />
          <source src={assets.videoWebm} type="video/webm" />
        </video>
        <div className="video_overlay-grad" />
        <div className="video-wrap_label">
          <div className="p1 text-white">{brand.name}, {brand.tagline}.</div>
          <IconButton
            href="#"
            icon={assets.icoPlay}
            alt=""
            aria-label={`Play the ${brand.name} film`}
            className="btn-ico-nest"
            onClick={(e) => {
              e.preventDefault()
              setOpen(true)
            }}
          />
        </div>
      </div>

      {open ? (
        <div className={`video-pop-up${onDark ? '' : ''}`} role="dialog" aria-modal="true">
          <div className="video-2">
            <iframe
              className="embedly-embed"
              src={`https://www.youtube.com/embed/${assets.heroFilmId}?autoplay=1&feature=oembed`}
              title={`${brand.name} film`}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="video-pop-up_btn-close">
            <IconButton
              href="#"
              icon={assets.icoClose}
              variant="sec-on-img"
              aria-label="Close film"
              onClick={(e) => {
                e.preventDefault()
                close()
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
