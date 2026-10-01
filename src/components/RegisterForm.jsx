import { useState } from 'react'
import assets from '../data/assets'
import { brand, registerInterest } from '../data/site'
import CustomSelect from './CustomSelect'

const pad = (i) => `${String(i + 1).padStart(2, '0')}.`

export default function RegisterForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const fields = registerInterest.fields

  // Required fields are marked `required` and typed, so the browser
  // blocks an incomplete submit with its own accessible messages. This
  // handler only ever runs on a well-formed submission, and `error` is
  // reserved for the request itself failing.
  const onSubmit = async (e) => {
    e.preventDefault()
    setError(false)
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      // wire this to your CRM / form endpoint
      console.log('register interest', data)
      setSent(true)
    } catch {
      setError(true)
    }
  }

  return (
    <div id="cta" className="cta-wrap">
      <div className="grid">
        <div className="cta-wrap_title text-center">
          <div className="mb-176">
            <h2 className="h1 text-relative">
              <span className="text-grey-15">
                Join
                <br />the Future
              </span>
            </h2>
          </div>
        </div>
      </div>

      {sent ? (
        <div className="form_success" role="status">
          <p className="h3">Thank you. Your submission has been received.</p>
        </div>
      ) : (
        <form className="cta-wrap_form form" onSubmit={onSubmit} noValidate={false}>
          {fields.map((field, i) => (
            <div className="form_item" key={field.name}>
              <div className="grid">
                <div className="input-num desk-only">
                  <span className="p1 text-grey-40">{pad(i)}</span>
                </div>
                <label className="input-label p1 text-grey-40" htmlFor={field.name}>
                  {field.label}
                </label>
                <div className="input-wrap">
                  {field.type === 'select' ? (
                    <CustomSelect
                      name={field.name}
                      label={field.label}
                      placeholder={field.placeholder}
                      options={field.options}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="input input-area"
                      id={field.name}
                      name={field.name}
                      maxLength={5000}
                      required={field.required}
                    />
                  ) : (
                    <input
                      className="input"
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      required={field.required}
                    />
                  )}
                </div>
              </div>
              <div className="line-h form_item_line bleed" />
            </div>
          ))}

          {/* The reference seats the submit row below a reCAPTCHA badge.
              No badge is wired up here, so the slot is kept at the size the
              reference reserves for it to hold the layout in place. */}
          <div className="grid">
            <div className="form_re-captcha" aria-hidden="true" />
          </div>

          <div className="grid submit-row">
            <div className="btn-submit-wrap">
              <button type="submit" id="register-interest-submit" className="submit-btn prim-on-white p1 text-bold">
                {registerInterest.submit}
              </button>
              <div className="btn-submit-wrap_legal-wrap">
                <div className="p1 text-grey-40">
                  By clicking the button, you agree to {brand.name}{' '}
                  <a href={assets.termsPdf} target="_blank" rel="noreferrer" className="text-link">
                    Terms of Use
                  </a>{' '}
                  and{' '}
                  <a href={assets.privacyPdf} target="_blank" rel="noreferrer" className="text-link">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="form_error" role="alert">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          ) : null}
        </form>
      )}
    </div>
  )
}
