import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api/client';

interface EmployeePhotoCaptureProps {
  employeeId: string;
  photoUrl?: string | null;
  initials: string;
  onChange: () => Promise<void>;
}

type Mode = 'menu' | 'camera' | 'preview';

const MAX_DIMENSION = 480;
const JPEG_QUALITY = 0.85;
const MAX_SOURCE_FILE_BYTES = 20 * 1024 * 1024; // 20MB, sólo para descartar archivos absurdos antes de decodificarlos

function drawScaledToDataUrl(source: HTMLVideoElement | HTMLImageElement): string {
  const srcW = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const srcH = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen');
  ctx.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Captura/carga de la foto del colaborador. No hay storage de archivos en
 * este proyecto: la imagen se redimensiona/comprime a JPEG en el navegador
 * (canvas) y se envía como data URL dentro del PATCH normal de /employees,
 * igual que cualquier otro campo de texto.
 */
export function EmployeePhotoCapture({ employeeId, photoUrl, initials, onChange }: EmployeePhotoCaptureProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => stopCamera, []); // corta la cámara si el componente se desmonta con el modo cámara abierto

  function openPanel() {
    setError(null);
    setPendingDataUrl(null);
    setMode('menu');
    setPanelOpen(true);
  }

  function closePanel() {
    stopCamera();
    setPanelOpen(false);
    setMode('menu');
    setPendingDataUrl(null);
    setError(null);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setMode('camera');
      // El <video> se monta recién al cambiar a mode 'camera'; se asigna el stream en el próximo render.
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError('No se pudo acceder a la cámara. Revisa los permisos del navegador o usa "Subir archivo".');
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    try {
      const dataUrl = drawScaledToDataUrl(videoRef.current);
      stopCamera();
      setPendingDataUrl(dataUrl);
      setMode('preview');
    } catch {
      setError('No se pudo capturar la foto.');
    }
  }

  function triggerFileUpload() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo más tarde
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > MAX_SOURCE_FILE_BYTES) {
      setError('La imagen es demasiado grande (máximo 20MB).');
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setPendingDataUrl(drawScaledToDataUrl(img));
      setMode('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la imagen');
    }
  }

  function retake() {
    setPendingDataUrl(null);
    setError(null);
    setMode('menu');
  }

  async function confirmSave() {
    if (!pendingDataUrl) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/employees/${employeeId}`, { photoUrl: pendingDataUrl });
      await onChange();
      closePanel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la foto');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm('¿Quitar la foto del colaborador?')) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/employees/${employeeId}`, { photoUrl: '' });
      await onChange();
      closePanel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo quitar la foto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="employee-photo no-print">
      <button type="button" className="employee-photo-frame" onClick={openPanel} title="Cambiar foto">
        {photoUrl ? <img src={photoUrl} alt="Foto del colaborador" /> : <span className="employee-photo-placeholder">{initials}</span>}
        <span className="employee-photo-edit-badge">&#128247;</span>
      </button>

      {panelOpen && (
        <div className="employee-photo-panel">
          {error && <p className="error">{error}</p>}

          {mode === 'menu' && (
            <div className="employee-photo-actions">
              <button type="button" onClick={startCamera}>
                Usar cámara
              </button>
              <button type="button" onClick={triggerFileUpload}>
                Subir archivo
              </button>
              {photoUrl && (
                <button type="button" className="danger-btn" onClick={handleRemove} disabled={saving}>
                  Quitar foto
                </button>
              )}
              <button type="button" onClick={closePanel}>
                Cerrar
              </button>
            </div>
          )}

          {mode === 'camera' && (
            <div className="employee-photo-actions">
              <video ref={videoRef} autoPlay playsInline muted className="employee-photo-video" />
              <div className="row-actions">
                <button type="button" onClick={capturePhoto}>
                  Capturar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setMode('menu');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {mode === 'preview' && pendingDataUrl && (
            <div className="employee-photo-actions">
              <img src={pendingDataUrl} alt="Vista previa" className="employee-photo-video" />
              <div className="row-actions">
                <button type="button" onClick={confirmSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={retake} disabled={saving}>
                  Repetir
                </button>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelected} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}
