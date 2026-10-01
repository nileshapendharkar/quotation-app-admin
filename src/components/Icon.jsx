// Renders one of the designer's PNG icons (public/design/icons/*.png) as a CSS mask,
// so it can be recoloured with `color` just like an icon font.
// size is in px at the 16px root size (it is converted to rem so it scales with the UI).
export default function Icon({ name, size = 20, color = 'currentColor', className = '', style = {}, title }) {
  const url = `url(/design/icons/${name}.png)`;
  const dim = `${size / 16}rem`;
  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title}
      className={`ds-icon ${className}`}
      style={{
        width: dim,
        height: dim,
        backgroundColor: color,
        WebkitMaskImage: url,
        maskImage: url,
        ...style,
      }}
    />
  );
}

// Filled "calendar with check" glyph used for Products in the sidebar
// (this one was not exported by the designer, so it is drawn here as SVG).
export function CalendarCheckIcon({ size = 30, color = 'currentColor' }) {
  const dim = `${size / 16}rem`;
  return (
    <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        {/* white = painted, black = cut out (so the holes are transparent on any background) */}
        <mask id="cal-check-cutouts" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <rect x="7" y="16" width="3.5" height="3" rx="0.6" fill="#000" />
          <rect x="13" y="16" width="3.5" height="3" rx="0.6" fill="#000" />
          <rect x="7" y="21.5" width="3.5" height="3" rx="0.6" fill="#000" />
          <rect x="13" y="21.5" width="3.5" height="3" rx="0.6" fill="#000" />
          <circle cx="25" cy="25" r="7.4" fill="#000" />
          <circle cx="25" cy="25" r="6" fill="#fff" />
          <path d="m22.3 25.1 1.9 1.9 3.6-3.8" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <g mask="url(#cal-check-cutouts)" fill={color}>
        <rect x="9" y="2" width="3" height="6" rx="1.5" />
        <rect x="20" y="2" width="3" height="6" rx="1.5" />
        <path d="M3 9a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3v3H3V9Z" />
        <path d="M3 13h26v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V13Z" />
        <circle cx="25" cy="25" r="6" />
      </g>
    </svg>
  );
}
