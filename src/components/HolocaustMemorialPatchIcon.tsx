/**
 * Yellow memorial patch (SVG, transparent outside the patch).
 * Original asset — not the copyrighted Flickr photograph.
 */

interface Props {
  size?: number;
  title?: string;
  className?: string;
}

export function HolocaustMemorialPatchIcon({ size = 22, title, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.72)}
      viewBox="0 0 28 20"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={`inline-block shrink-0 align-middle ${className}`}
    >
      {title ? <title>{title}</title> : null}
      <rect
        x="1"
        y="1"
        width="26"
        height="18"
        rx="2.5"
        fill="#f5d030"
        stroke="#5c4a00"
        strokeWidth="1.1"
      />
      <rect
        x="2.35"
        y="2.35"
        width="23.3"
        height="15.3"
        rx="1.4"
        fill="none"
        stroke="#b8941a"
        strokeWidth="0.55"
        opacity={0.9}
      />
    </svg>
  );
}
