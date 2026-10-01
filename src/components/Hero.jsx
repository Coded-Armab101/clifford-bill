import assets from '../data/assets'
import { brand, intro } from '../data/site'
import VideoCard from './VideoCard'
import Commencing from './Commencing'

export default function Hero() {
  return (
    <section className="section clip">
      <div className="container">
        <div id="intro" className="intro-wrap">
          <div className="intro-wrap_img-wrap">
            <div className="grad-overlay-b desk-only" />
            <img
              src={assets.hero}
              loading="eager"
              alt={`${brand.name} — ${intro.summary}`}
              className="img intro"
            />
          </div>

          <div className="grid">
            <div className="intro-wrap_title">
              <h1 className="h1-n display-inline mode-color-b">{intro.heading}</h1>
              <span
                className="horse intro"
                style={{ backgroundImage: `url(${assets.horse})` }}
                aria-hidden="true"
              />
              <h1 className="h1-n display-inline mode-color-b r-symbol">®</h1>
            </div>
          </div>

          <div className="desk-only">
            <div className="intro-wrap_content">
              <div className="grid mb-32">
                <div className="intro-wrap_content_desc-2">
                  <p className="p1 text-white">{intro.summary}</p>
                </div>
                <div className="intro-wrap_content_widgets">
                  <VideoCard />
                  <Commencing onImage />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
