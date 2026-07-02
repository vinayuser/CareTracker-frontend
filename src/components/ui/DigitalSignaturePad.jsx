import { useCallback, useEffect, useRef } from 'react';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const CANVAS_HEIGHT = 140;

export default function DigitalSignaturePad({ label, value = '', onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: CANVAS_HEIGHT });

  const restoreImage = useCallback((dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataUrl?.startsWith('data:image')) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, sizeRef.current.width, sizeRef.current.height);
    };
    img.src = dataUrl;
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    sizeRef.current = { width, height: CANVAS_HEIGHT };
    canvas.width = width * 2;
    canvas.height = CANVAS_HEIGHT * 2;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111827';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (value?.startsWith('data:image')) restoreImage(value);
  }, [restoreImage, value]);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

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
    onChange(hasInk ? canvas.toDataURL('image/png') : '');
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const moveDraw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const point = getPoint(e);
    drawLine(lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const endDraw = (e) => {
    if (!drawingRef.current) return;
    e?.preventDefault?.();
    drawingRef.current = false;
    lastPointRef.current = null;
    saveSignature();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div>
      {label && <p className={labelClass}>{label}</p>}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <canvas
          ref={canvasRef}
          className="h-[140px] w-full cursor-crosshair touch-none bg-white"
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <span className="text-xs text-gray-400">Draw your signature above</span>
          <button type="button" onClick={clear} className="text-xs font-medium text-primary hover:underline">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
