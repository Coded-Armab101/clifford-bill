/**
 * The reference pairs every button with two stacked labels — the resting
 * one and a duplicate that cross-fades in on hover. This bakes that in so
 * call sites just declare their variant and label.
 */
export default function Button({
  as: Tag = 'a',
  href,
  label,
  variant = 'prim-on-white',
  hoverLabel,
  icon,
  className = '',
  ...rest
}) {
  const cls = ['btn', variant, className].filter(Boolean).join(' ')

  return (
    <Tag href={href} className={cls} {...rest}>
      <div className="btn_label">
        <div className="p1 text-bold">{label}</div>
        <div className={`p1 text-bold ${hoverLabel ? '' : 'label_is-2'}`}>
          {hoverLabel ?? label}
        </div>
      </div>
      {icon ? <img className="btn-icon_ico" src={icon.src} alt="" /> : null}
      <div className={`btn_hover-bg ${variant}`} />
    </Tag>
  )
}
