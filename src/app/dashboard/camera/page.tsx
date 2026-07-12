'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { usePhotoStore } from '@/store/photoStore';
import Button from '@/components/ui/Button';

export default function CameraPage() {
  const router = useRouter();
  const setPhotoStore = usePhotoStore((s) => s.setPhoto);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (photo) {
      setPhotoStore(photo);
    }
    router.push('/dashboard/analysis');
  };

  return (
    <div style={{ padding: '16px', minHeight: 'calc(100vh - 96px)' }}>
      <h1 className="headline-medium" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', paddingTop: '8px' }}>
        📸 Snap Your Meal
      </h1>

      <AnimatePresence mode="wait">
        {!photo ? (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Camera viewfinder */}
            {cameraActive ? (
              <div style={{ position: 'relative', borderRadius: 'var(--md-sys-shape-corner-large)', overflow: 'hidden', marginBottom: '16px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', display: 'block', borderRadius: 'var(--md-sys-shape-corner-large)' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Shutter button */}
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                  <motion.button
                    onClick={capturePhoto}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      border: '4px solid white',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      outline: 'none',
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', margin: 'auto' }} />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  borderRadius: 'var(--md-sys-shape-corner-large)',
                  padding: '60px 24px',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}
              >
                <div className="animate-float" style={{ fontSize: '64px', marginBottom: '20px' }}>📷</div>
                <p className="body-large" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}>
                  Take a photo of your meal
                </p>
                <p className="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '24px' }}>
                  Our AI will identify food items and calculate nutrition
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                  <Button variant="filled" onClick={startCamera} fullWidth disabled={cameraError}>
                    {cameraError ? 'Camera Unavailable' : '📸 Open Camera'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    🖼️ Upload from Gallery
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Photo preview */}
            <div style={{ borderRadius: 'var(--md-sys-shape-corner-large)', overflow: 'hidden', marginBottom: '16px' }}>
              <img
                src={photo}
                alt="Meal photo"
                style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outlined" onClick={() => setPhoto(null)} fullWidth>
                Retake
              </Button>
              <Button variant="filled" onClick={handleAnalyze} fullWidth>
                ✨ Analyze Meal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
