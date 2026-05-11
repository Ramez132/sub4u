"use client";

import { useState, useRef, useEffect } from "react";
import { type Language } from "@/lib/translations";

type Props = {
  onClose: () => void;
  lang: Language;
};

export default function ContractModal({ onClose, lang }: Props) {
  const isHe = lang === "he";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signMode, setSignMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [signMode]);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSigned(true);
  }

  function stopDraw() { setIsDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  const canSubmit = agreed && (signMode === "draw" ? hasSigned : typedName.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isHe ? "חוזה שימוש" : "Terms of Service"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Contract text */}
        <div className="flex-1 overflow-y-auto px-6 py-5" dir={isHe ? "rtl" : "ltr"}>
          <div className="rounded-2xl bg-gray-50 p-5 text-sm leading-relaxed text-gray-600">
            {isHe ? (
              <>
                <p className="mb-3 font-semibold text-gray-800">חוזה השימוש באתר Sub4U</p>
                <p className="mb-3">🚧 החוזה המלא נמצא בהכנה ויופיע כאן בקרוב.</p>
                <p className="mb-3">על ידי הרשמה לאתר Sub4U, המשתמש מסכים לתנאי השימוש שיפורסמו בהמשך, ומאשר כי הפרטים שמסר נכונים ומדויקים.</p>
                <p>Sub4U שומרת לעצמה את הזכות לעדכן את תנאי השימוש בכל עת.</p>
              </>
            ) : (
              <>
                <p className="mb-3 font-semibold text-gray-800">Sub4U Terms of Service</p>
                <p className="mb-3">🚧 The full contract is being prepared and will appear here soon.</p>
                <p className="mb-3">By signing up to Sub4U, the user agrees to the terms of service that will be published shortly, and confirms that the details provided are accurate and truthful.</p>
                <p>Sub4U reserves the right to update the terms of service at any time.</p>
              </>
            )}
          </div>

          {/* Signature section */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-gray-800">
              {isHe ? "חתימה" : "Signature"}
            </p>
            <div className="mb-4 flex gap-2">
              <button onClick={() => setSignMode("draw")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${signMode === "draw" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {isHe ? "✍️ ציור חתימה" : "✍️ Draw signature"}
              </button>
              <button onClick={() => setSignMode("type")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${signMode === "type" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {isHe ? "⌨️ הקלדת שם" : "⌨️ Type name"}
              </button>
            </div>

            {signMode === "draw" ? (
              <div>
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={140}
                  className="w-full cursor-crosshair rounded-2xl border-2 border-dashed border-gray-300 bg-white touch-none"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <div className="mt-2 flex justify-between">
                  <p className="text-xs text-gray-400">{isHe ? "חתום כאן בעזרת העכבר או האצבע" : "Sign here using mouse or finger"}</p>
                  <button onClick={clearCanvas} className="text-xs text-teal-600 hover:underline">{isHe ? "נקה" : "Clear"}</button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={isHe ? "הקלד את שמך המלא" : "Type your full name"}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-lg italic outline-none focus:border-teal-500"
                  style={{ fontFamily: "Georgia, serif" }}
                />
                <p className="mt-1 text-xs text-gray-400">{isHe ? "שמך המלא ישמש כחתימה" : "Your full name will serve as your signature"}</p>
              </div>
            )}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 accent-teal-600" />
            <span className="text-sm text-gray-700">
              {isHe ? "אני מסכים/ה לתנאי השימוש של Sub4U ומאשר/ת כי קראתי את החוזה" : "I agree to the Sub4U terms of service and confirm that I have read the contract"}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} disabled={!canSubmit}
            className="w-full rounded-full bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-40">
            {isHe ? "אישור וסגירה" : "Confirm & Close"}
          </button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-gray-400">
              {isHe ? "יש לחתום ולסמן את תיבת האישור" : "Please sign and check the agreement box"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}