'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCanteen } from '@/context/CanteenContext';
import { Order } from '@/types';
import jsQR from 'jsqr';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ServerScannerPage() {
  const { user } = useAuth();
  const { serveOrder, orders } = useCanteen();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  // Result state
  const [scanResult, setScanResult] = useState<{
    type: 'SUCCESS' | 'ALREADY_SERVED' | 'ERROR';
    order?: Order;
    message: string;
    servedAt?: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(true);

  // Sound & Haptics
  const triggerFeedback = (success: boolean) => {
    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);

          if (success) {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12); // A6
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
          } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
          }
        }
      }
    } catch {}

    try {
      if (navigator.vibrate) {
        if (success) {
          navigator.vibrate([70, 40, 70]);
        } else {
          navigator.vibrate([150]);
        }
      }
    } catch {}
  };

  // Process the scanned string
  const handleDecodedString = useCallback(
    (rawText: string) => {
      if (!isScanningRef.current) return;
      isScanningRef.current = false;

      const trimmed = (rawText || '').trim();
      if (!trimmed) {
        isScanningRef.current = true;
        return;
      }

      setIsProcessing(true);
      const serverStaffName = user?.name || 'Kamalesh';
      const res = serveOrder(trimmed, serverStaffName);
      setIsProcessing(false);

      if (res.success && res.order) {
        triggerFeedback(true);
        setScanResult({
          type: 'SUCCESS',
          order: res.order,
          message: 'Token verified successfully! Dispense hot food to customer.',
        });
      } else if (res.servedAt || (res.error && res.error.includes('ALREADY SERVED'))) {
        triggerFeedback(false);
        setScanResult({
          type: 'ALREADY_SERVED',
          order: res.order,
          message: res.error || 'Token has already been served.',
          servedAt: res.servedAt,
        });
      } else {
        triggerFeedback(false);
        setScanResult({
          type: 'ERROR',
          message: res.error || `Invalid QR token: "${trimmed}". Order not found.`,
        });
      }
    },
    [serveOrder]
  );

  // Real-time video frame scanning loop
  const scanLoop = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodedString(code.data);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  }, [handleDecodedString]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setStarting(true);
    isScanningRef.current = true;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          isScanningRef.current = true;
          animationFrameRef.current = requestAnimationFrame(scanLoop);
        }
      } else {
        setCameraError('Camera not supported by browser. Please use manual token search below.');
      }
    } catch {
      setCameraError('Camera permission denied or camera unavailable. Please grant camera access.');
    } finally {
      setStarting(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [scanLoop]);

  // Resume scanning for next customer
  const handleScanNext = () => {
    setScanResult(null);
    isScanningRef.current = true;
    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
    } else {
      startCamera();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-black text-[#201611] tracking-tight">
          QR Token Scanner
        </h1>
        <p className="text-xs text-[#8C7E76] mt-0.5">
          Scan customer digital token to verify payment & dispense food
        </p>
      </div>

      {/* Camera Viewport or Scan Result */}
      {!scanResult ? (
        <div className="w-full aspect-square bg-stone-900 rounded-3xl overflow-hidden border-2 border-stone-800 shadow-xl relative flex items-center justify-center">
          {/* Video Stream */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {/* Active Scanning Reticle Animation */}
          {cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-56 h-56">
                {/* Corner brackets */}
                <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF5722] rounded-tl-xl" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF5722] rounded-tr-xl" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF5722] rounded-bl-xl" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF5722] rounded-br-xl" />
              </div>
            </div>
          )}

          {/* Camera Status Overlay */}
          {cameraActive && (
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Camera Live · Scanning QR</span>
              </span>
            </div>
          )}

          {/* Fallback / Camera Inactive State */}
          {!cameraActive && (
            <div className="text-center text-stone-300 space-y-3 p-6">
              {starting ? (
                <>
                  <div className="w-12 h-12 mx-auto rounded-full border-4 border-stone-700 border-t-[#FF5722] animate-spin" />
                  <p className="text-xs font-semibold">Starting camera hardware…</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-[#FF5722]">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-xs max-w-xs mx-auto text-stone-400">
                    {cameraError || 'Camera not available.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Retry Camera
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── RESULT CARD ── */
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xl space-y-4 animate-scaleUp">
          {scanResult.type === 'SUCCESS' && scanResult.order && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                  ✓ Token Verified & Served
                </span>
                <h2 className="text-2xl font-black text-[#201611] tracking-tight">
                  Token #{scanResult.order.id}
                </h2>
                <p className="text-xs text-[#5C4E46]">
                  Customer: <strong className="text-[#201611]">{scanResult.order.userName}</strong>
                </p>
              </div>

              {/* Items Breakdown */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-stone-200/80 text-left space-y-2">
                <p className="text-[10px] font-black text-[#8C7E76] uppercase tracking-wider">
                  Dishes to Dispense ({scanResult.order.items.length})
                </p>
                <div className="divide-y divide-stone-200/60 text-xs">
                  {scanResult.order.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="font-bold text-[#201611]">
                        {it.name} <strong className="text-[#FF5722] ml-1">×{it.quantity}</strong>
                      </span>
                      <span className="font-semibold text-stone-500">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-black text-xs text-[#201611]">
                    <span>Total Amount Paid</span>
                    <span className="text-emerald-700">₹{scanResult.order.total} (PAID)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleScanNext}
                className="w-full py-3.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(22,163,74,0.3)] transition active:scale-98"
              >
                <span>Dispense Food & Scan Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {scanResult.type === 'ALREADY_SERVED' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                  ⚠️ Token Already Served
                </span>
                {scanResult.order && (
                  <h2 className="text-xl font-black text-[#201611]">
                    Token #{scanResult.order.id}
                  </h2>
                )}
                <p className="text-xs text-amber-700 font-medium">
                  {scanResult.message}
                </p>
                <p className="text-[11px] text-stone-500">
                  This single-use QR token has already been redeemed and cannot be used twice.
                </p>
              </div>

              <button
                onClick={handleScanNext}
                className="w-full py-3 bg-[#201611] hover:bg-stone-800 text-white font-bold text-xs rounded-2xl transition"
              >
                Scan Next Token
              </button>
            </>
          )}

          {scanResult.type === 'ERROR' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider">
                  Invalid Token
                </span>
                <p className="text-xs text-stone-600">
                  {scanResult.message}
                </p>
                <p className="text-[11px] text-stone-400">
                  Please verify the token number or ask customer to refresh their order screen.
                </p>
              </div>

              <button
                onClick={handleScanNext}
                className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-2xl transition"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      )}


      {/* Guidelines */}
      <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/80 text-center space-y-0.5 text-[11px] text-[#8C7E76]">
        <p className="font-bold text-[#201611]">🔒 Secure Counter Token Verification</p>
        <p>Real-time QR barcode decoder & duplicate prevention active.</p>
      </div>
    </div>
  );
}
