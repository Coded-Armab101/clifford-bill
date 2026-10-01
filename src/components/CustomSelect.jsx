import { useEffect, useRef, useState } from 'react'

/**
 * The reference builds its dropdowns from a hidden input plus a styled
 * label and a floating option list, rather than a native <select>. This
 * keeps that appearance, but is a real listbox underneath: keyboard
 * navigable, and it reports its value through a hidden input so the form
 * still submits the chosen option.
 */
export default function CustomSelect({ name, label, placeholder, options, required }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const wrapRef = useRef(null)
  const labelRef = useRef(null)
  const optionRefs = useRef([])
  const activeIndex = value ? options.indexOf(value) : -1

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (open && activeIndex >= 0) optionRefs.current[activeIndex]?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const commit = (option) => {
    setValue(option)
    setOpen(false)
    labelRef.current?.focus()
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      labelRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      optionRefs.current[(activeIndex + 1) % options.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      optionRefs.current[(activeIndex - 1 + options.length) % options.length]?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="select-wrap" ref={wrapRef}>
      <span className="sr-only" id={`${name}-label`}>
        {label}
      </span>
      <div
        className={`select-dropdown${open ? ' active' : ''}`}
        role="listbox"
        aria-labelledby={`${name}-label`}
        hidden={!open}
      >
        {options.map((option, i) => (
          <div
            key={option}
            role="option"
            tabIndex={-1}
            aria-selected={option === value}
            className="select-dropdown-item p1"
            ref={(el) => {
              optionRefs.current[i] = el
            }}
            onClick={() => commit(option)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                commit(option)
              }
            }}
          >
            {option}
          </div>
        ))}
      </div>
      <div
        className="select select-label"
        ref={labelRef}
        role="combobox"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={`${name}-listbox`}
        aria-haspopup="listbox"
        aria-label={label}
        data-placeholder={!value || undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        {value || placeholder}
      </div>
      <input type="hidden" name={name} value={value} required={required} readOnly />
    </div>
  )
}
