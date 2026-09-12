/** Framed product screenshot for marketing pages */
export default function ProductShot({
  src,
  alt = 'CareTraker product screenshot',
  className = '',
  aspect = 'aspect-[16/10]',
}) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] border border-slate-200/70 bg-white shadow-[0_24px_55px_-22px_rgba(15,23,42,0.38)] ring-1 ring-slate-900/5 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`block w-full ${aspect} object-cover object-left-top`}
        loading="lazy"
      />
    </div>
  );
}
