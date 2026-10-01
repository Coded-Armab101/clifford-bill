import { metrics } from '../data/site'

/** Four headline figures, divided by the house hairline. */
export default function Metrics() {
  return (
    <section className="section pt-32 section-on">
      <div className="container">
        <div className="metrics-wrap">
          <div className="line-h metrics_line" />
          <div className="grid">
            {metrics.map((m, i) => (
              <div
                className={`metrics-wrap_item${
                  i === metrics.length - 1 ? ' last' : i === 1 ? ' is-2' : ''
                }`}
                key={m.label}
              >
                <div className="metrics-wrap_item_title">
                  <div className="p1">{m.label}</div>
                </div>
                <div className="h2">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
