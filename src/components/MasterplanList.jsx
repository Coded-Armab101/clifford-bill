import { masterplan } from '../data/site'

/**
 * The seven precincts as a plain list. The interactive map carries
 * meaningless spatial positions on a narrow screen, so touch devices get
 * this instead.
 */
export default function MasterplanList() {
  return (
    <section className="section mob-only">
      <div className="container">
        <div className="pins-wrap">
          <div className="grid mb-128">
            {masterplan.pins.map((pin) => (
              <div className="pin-item" key={pin.id}>
                <div className="mb-8">
                  <div className="p1 text-bold">{pin.title}</div>
                </div>
                <div className="mb-16">
                  <div className="p1 text-grey-40">{pin.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
