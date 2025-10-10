import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface UseBarcodeScanner {
  videoRef: React.RefObject<HTMLVideoElement>;
  isScanning: boolean;
  detectedBarcode: string | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}

export function useBarcodeScanner(
  onDetect?: (barcode: string) => void
): UseBarcodeScanner {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastDetectedRef = useRef<string | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize code reader
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const codeReader = codeReaderRef.current;
      if (!codeReader || !videoRef.current) return;

      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      // Prefer back camera on mobile
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      console.log('📸 Starting camera with device:', selectedDeviceId);

      // Start continuous decode from video device
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result: Result | null, error: Error | undefined) => {
          if (result) {
            const barcode = result.getText();
            
            // Prevent duplicate detections within 3 seconds
            if (lastDetectedRef.current === barcode) {
              return;
            }

            lastDetectedRef.current = barcode;
            setDetectedBarcode(barcode);

            console.log('✅ Barcode detected:', barcode);

            // Call callback
            if (onDetect) {
              onDetect(barcode);
            }

            // Reset last detected after 3 seconds
            if (detectionTimeoutRef.current) {
              clearTimeout(detectionTimeoutRef.current);
            }
            detectionTimeoutRef.current = setTimeout(() => {
              lastDetectedRef.current = null;
            }, 3000);
          }

          if (error && !(error instanceof Error)) {
            // Ignore common scanning errors
            return;
          }
        }
      );

      console.log('✅ Camera started successfully');
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    const codeReader = codeReaderRef.current;
    if (codeReader) {
      codeReader.reset();
      console.log('📸 Camera stopped');
    }

    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    lastDetectedRef.current = null;
    setIsScanning(false);
    setDetectedBarcode(null);
  };

  return {
    videoRef,
    isScanning,
    detectedBarcode,
    error,
    startScanning,
    stopScanning,
  };
}
