import { useCallback, useEffect, useRef } from 'react';
import { signatureImageSrc } from '../../utils/assessmentSignatures';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const CANVAS_HEIGHT = 140;

export default function DigitalSignaturePad({ label, value = '', onChange, readOnly = false }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: CANVAS_HEIGHT });
  const lastValueRef = useRef(value);

  const restoreImage = useCallback((dataUrl) => {
    const canvas = canvasRef.current;
    const src = signatureImageSrc(dataUrl);
    if (!canvas || !src) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      // Use CSS pixel size for drawImage after scale(2,2)
      ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
      ctx.drawImage(img, 0, 0, sizeRef.current.width, sizeRef.current.height);
    };
    img.src = src;
  }, []);

  const setupCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const prevWidth = sizeRef.current.width;
    sizeRef.current = { width, height: CANVAS_HEIGHT };
    // Avoid wiping the pad when size hasn't actually changed
    if (prevWidth === width && canvas.width > 0) return false;

    const existing = signatureImageSrc(lastValueRef.current);
    canvas.width = width * 2;
    canvas.height = CANVAS_HEIGHT * 2;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111827';
    ctx.clearRect(0, 0, width, CANVAS_HEIGHT);
    if (existing) restoreImage(existing);
    return true;
  }, [restoreImage]);

  // Size canvas once + on resize (not on every value change)
  useEffect(() => {
    setupCanvasSize();
    const onResize = () => setupCanvasSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setupCanvasSize]);

  // Restore when parent value changes (e.g. loaded from server / upload URL),
  // but never while the user is actively drawing.
  useEffect(() => {
    if (drawingRef.current) return;
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
    if (signatureImageSrc(value)) restoreImage(value);
  }, [value, restoreImage]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawLine = (from, to) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasInk = pixels.some((p, i) => i % 4 === 3 && p > 0);
    const next = hasInk ? canvas.toDataURL('image/png') : '';
    lastValueRef.current = next;
    onChange(next);
  };

  const startDraw = (e) => {
    if (readOnly) return;
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const moveDraw = (e) => {
    if (readOnly || !drawingRef.current) return;
    e.preventDefault();
    const point = getPoint(e);
    drawLine(lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const endDraw = (e) => {
    if (readOnly || !drawingRef.current) return;
    e?.preventDefault?.();
    drawingRef.current = false;
    lastPointRef.current = null;
    saveSignature();
  };

  const clear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
    lastValueRef.current = '';
    onChange('');
  };

  return (
    <div>
      {label && <p className={labelClass}>{label}</p>}
      <div className={`overflow-hidden rounded-xl border border-gray-200 ${readOnly ? 'bg-gray-50' : 'bg-white'}`}>
        <canvas
          ref={canvasRef}
          className={`h-[140px] w-full touch-none ${readOnly ? 'cursor-default bg-gray-50' : 'cursor-crosshair bg-white'}`}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <span className="text-xs text-gray-400">
            {readOnly ? (value ? 'Signature on file' : 'No signature') : 'Draw your signature above'}
          </span>
          {!readOnly && (
            <button type="button" onClick={clear} className="text-xs font-medium text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
