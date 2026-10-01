/**
 * Square icon button — the same wipe interaction as `Button`, sized
 * `2.22vw` with an inset hairline for the outlined variants.
 */
export default function IconButton({
  as: Tag = 'a',
  href,
  icon,
  alt = '',
  variant = 'prim-on-white',
  className = '',
  ...rest
}) {
  const cls = ['btn-ico', variant, className].filter(Boolean).join(' ')

  return (
    <Tag href={href} className={cls} aria-label={rest['aria-label'] || alt || undefined} {...rest}>
      <img className="btn-icon_ico" src={icon} alt={alt} />
      <div className={`btn_hover-bg ${variant}`} />
    </Tag>
  )
}
