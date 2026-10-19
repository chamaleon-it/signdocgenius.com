'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string, file: File) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(ratio, ratio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#242333';
    context.lineWidth = 2;
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    setIsEmpty(false);
    const { x, y } = point(event);
    const context = event.currentTarget.getContext('2d');
    context?.beginPath();
    context?.moveTo(x, y);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const { x, y } = point(event);
    const context = event.currentTarget.getContext('2d');
    context?.lineTo(x, y);
    context?.stroke();
  };

  const stop = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    onSave(dataUrl, new File([blob], 'signature.png', { type: 'image/png' }));
  };

  return (
    <div>
      <div className="relative h-[188px] rounded-lg border border-dashed border-[#dddbe5] bg-[#fbfcfd] overflow-hidden">
        <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} className="w-full h-full touch-none cursor-crosshair" aria-label="Draw your signature" />
        {isEmpty && <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[#636270] text-sm"><PenTool size={28} className="mb-2 text-[#5119ae]" />Draw your signature here</div>}
      </div>
      <div className="flex justify-between gap-3 mt-2">
        <button onClick={clear} className="h-10 px-4 rounded-lg text-[#5119ae] text-sm font-medium hover:bg-[#eef4f5]">Clear signature</button>
        <button onClick={save} disabled={isEmpty} className="signature-pulse h-10 px-4 rounded-lg bg-[#5119ae] text-white text-sm font-semibold disabled:bg-[#715da3] disabled:text-white disabled:cursor-not-allowed">Use signature</button>
      </div>
    </div>
  );
}
