import { useEffect, useState } from 'react'
import assets from '../data/assets'
import { brand } from '../data/site'
import Button from './Button'
import { useScrollLock } from '../hooks'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Town Centre', href: '#town-centre' },
  { label: 'Master Plan', href: '#masterplan' },
  { label: 'Infrastructure', href: '#infrastructure' },
  { label: 'Live, Work, Play', href: '#benefits' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  useScrollLock(open)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <nav className="header" aria-label="Primary">
        <div className="header_left desk-only">
          <div className="header_left_phone">
            <a href={brand.phoneHref} className="link w-inline-block">
              <div className="link_label">
                <div className="p1 text-bold">{brand.phone}</div>
                <div className="p1 label-is-2 text-bold">{brand.phone}</div>
              </div>
            </a>
          </div>
          <div className="header_left_mail">
            <a href={`mailto:${brand.email}`} className="link w-inline-block">
              <div className="link_label">
                <div className="p1 text-bold">{brand.email}</div>
                <div className="p1 label-is-2 text-bold">{brand.email}</div>
              </div>
            </a>
          </div>
        </div>

        <div className="header_logo-wrap">
          <a href="#intro" className="link-logo w-inline-block" onClick={() => setOpen(false)}>
            <img src={assets.logo} loading="eager" alt={`${brand.name} logo`} className="logo" />
          </a>
        </div>

        <div className="header_right">
          <div className="header_right_location desk-only">
            <a
              href={brand.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="link w-inline-block"
            >
              <div className="link_label">
                <div className="p1 text-bold">{brand.street}</div>
                <div className="p1 label-is-2 text-bold">{brand.street}</div>
              </div>
            </a>
          </div>
          {/* shown at every width, as in the reference */}
          <Button href="#cta" label="Register interest" onClick={() => setOpen(false)} />
          <button
            type="button"
            className={`header_burger${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <div className="menu_list">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="menu_link"
              style={{ transitionDelay: open ? `${80 + i * 40}ms` : '0ms' }}
              onClick={() => setOpen(false)}
            >
              <span className="menu_link_num p1 text-grey-40">{String(i + 1).padStart(2, '0')}</span>
              <span className="h3">{l.label}</span>
            </a>
          ))}
        </div>
        <div className="menu_foot">
          <a href={brand.phoneHref} className="p1 text-grey-40">
            {brand.phone}
          </a>
          <a href={`mailto:${brand.email}`} className="p1 text-grey-40">
            {brand.email}
          </a>
          <Button href="#cta" label="Register interest" onClick={() => setOpen(false)} />
        </div>
      </div>
    </>
  )
}
