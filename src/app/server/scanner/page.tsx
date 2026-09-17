'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export default function ServerScannerPage() {

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-start camera when the page mounts
  const startCamera = async () => {
    setCameraError(null);
    setStarting(true);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera not supported. Please grant camera permissions.');
      }
    } catch {
      setCameraError('Camera access denied. Please allow camera access and try again.');
    } finally {
      setStarting(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  // Auto-start on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-sm mx-auto flex flex-col items-center space-y-5">
      <div className="w-full text-center">
        <h1 className="text-xl font-black text-[#201611]">QR Scanner</h1>
        <p className="text-xs text-[#8C7E76] mt-0.5">Point camera at customer's QR token</p>
      </div>

      {/* Camera Viewport — full-width square */}
      <div className="w-full aspect-square bg-stone-900 rounded-3xl overflow-hidden border-2 border-stone-800 shadow-xl relative flex items-center justify-center">
        {/* Video */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          playsInline
          muted
        />

        {/* Target Reticle */}
        {cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Corner brackets */}
            <div className="relative w-52 h-52">
              {/* Top-left */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF5722] rounded-tl-lg" />
              {/* Top-right */}
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF5722] rounded-tr-lg" />
              {/* Bottom-left */}
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF5722] rounded-bl-lg" />
              {/* Bottom-right */}
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF5722] rounded-br-lg" />
              {/* Scan line */}
              <div className="absolute left-1 right-1 top-1/2 h-0.5 bg-[#FF5722]/70 animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading / No camera state */}
        {!cameraActive && (
          <div className="text-center text-stone-300 space-y-3 p-6">
            {starting ? (
              <>
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-stone-700 border-t-[#FF5722] animate-spin" />
                <p className="text-xs">Starting camera…</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-[#FF5722]">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-xs max-w-xs mx-auto">
                  {cameraError || 'Camera not available.'}
                </p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-xl transition"
                >
                  Retry Camera
                </button>
              </>
            )}
          </div>
        )}

        {/* Stop camera button */}
        {cameraActive && (
          <button
            onClick={stopCamera}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-stone-900/80 text-white text-xs font-bold rounded-full backdrop-blur-sm"
          >
            Stop Camera
          </button>
        )}
      </div>

      {/* Info */}
      <div className="w-full bg-white p-4 rounded-3xl border border-stone-200 text-center space-y-1">
        <p className="text-xs font-bold text-[#201611]">Single-Use Token Verification</p>
        <p className="text-[11px] text-[#8C7E76]">
          Each QR token can only be scanned once. Redeemed tokens are permanently locked.
        </p>
      </div>
    </div>
  );
}
