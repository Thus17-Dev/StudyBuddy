import { Eraser, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function WhiteboardNote({ topicName, onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [status, setStatus] = useState("");
  const [penColor, setPenColor] = useState("#2563eb");
  const [penSize, setPenSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  function point(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function start(event) {
    event.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(event) {
    if (!drawing.current) return;
    event.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = point(event);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function stop() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setStatus("");
  }

  async function saveImage() {
    const image = canvasRef.current.toDataURL("image/png");
    await onSave(`WHITEBOARD_NOTE::${image}`);
    setStatus("Whiteboard note saved.");
  }

  async function refine() {
    const image = canvasRef.current.toDataURL("image/png");
    await onSave(`WHITEBOARD_NOTE::${image}`);
    await onSave(
      `Refined handwriting note for ${topicName}\n\nThis whiteboard note was saved. Connect a vision-capable AI/OCR service later to convert handwriting into clean typed notes automatically.`
    );
    setStatus("Saved whiteboard plus a clean typed note template.");
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Pen</label>
        <input type="color" value={penColor} onChange={(event) => setPenColor(event.target.value)} className="h-9 w-12 rounded-lg" />
        <input
          type="range"
          min="2"
          max="14"
          value={penSize}
          onChange={(event) => setPenSize(Number(event.target.value))}
          className="w-28"
        />
        <button onClick={clear} className="ml-auto grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-[#102044] dark:text-white dark:ring-white/10" title="Clear">
          <Eraser size={16} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-72 w-full touch-none rounded-2xl bg-white shadow-inner"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerLeave={stop}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={saveImage} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
          <Save size={16} /> Save whiteboard
        </button>
        <button onClick={refine} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white">
          <Sparkles size={16} /> Auto-refine
        </button>
      </div>
      {status && <p className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-200">{status}</p>}
    </div>
  );
}
