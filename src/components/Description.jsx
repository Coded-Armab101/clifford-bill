import { Fragment } from 'react'
import { description } from '../data/site'
import Button from './Button'

export default function Description() {
  return (
    <section className="section mt-20vh">
      <div className="container">
        <div className="description-wrap">
          <div className="grid mb-128">
            {description.map((column, i) => (
              <div
                className={`description-wrap_colum ${i === 0 ? 'description-wrap_colum-1' : 'description-wrap_colum-2'}`}
                key={i}
              >
                <div className="mb-24">
                  <p className="p1">
                    {column.split('\n\n').map((para, j) => (
                      <Fragment key={j}>
                        {j > 0 && (
                          <>
                            <br />
                            <br />
                          </>
                        )}
                        {para}
                      </Fragment>
                    ))}
                    {/* the reference pads the leading column with two blank
                        lines so it reads as the taller of the pair */}
                    {i === 0 && (
                      <>
                        <br />
                        <br />
                        {'\u200d'}
                        <br />
                      </>
                    )}
                  </p>
                </div>
                {/* the CTA sits under the leading column on desktop, the trailing one on mobile */}
                <div className={i === 0 ? 'desk-only' : 'mob-only'}>
                  <Button href="#cta" label="Register interest" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
