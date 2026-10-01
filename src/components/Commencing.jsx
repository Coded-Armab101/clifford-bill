import { brand } from '../data/site'

/**
 * The "Commencing q4 2025" status bar. Appears twice on the page: once
 * reversed out of the page, once flipped light where it sits over imagery.
 */
export default function Commencing({ onImage = false }) {
  return (
    <div className={`commencing ${onImage ? 'on-img' : ''}`}>
      <div className="commencing_left">
        <div className="commencing_label">
          <div className={`p1 ${onImage ? 'text-grey-40' : 'text-white'}`}>Commencing</div>
          <div className="indicator">
            <div className="indicator_puls" />
            <div className="indicator_dot" />
          </div>
        </div>
      </div>
      <div className={`commencing_right ${onImage ? 'on-img' : ''}`}>
        <div className="commencing_right_wrap">
          <div className={`l1-a text-inline ${onImage ? '' : 'text-white'}`}>
            {brand.commencement.quarter}
          </div>
          <div className={`p1 text-inline ${onImage ? '' : 'text-white'}`}>
            {brand.commencement.year}
          </div>
        </div>
      </div>
    </div>
  )
}
