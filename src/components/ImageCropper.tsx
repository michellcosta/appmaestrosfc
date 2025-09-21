import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300; // Tamanho do canvas
    canvas.width = size;
    canvas.height = size;

    // Limpar canvas
    ctx.clearRect(0, 0, size, size);

    // Salvar estado do contexto
    ctx.save();

    // Criar máscara circular
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Calcular dimensões da imagem
    const centerX = size / 2;
    const centerY = size / 2;

    // Aplicar transformações
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Desenhar imagem centralizada
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight;
    if (aspectRatio > 1) {
      drawHeight = size;
      drawWidth = size * aspectRatio;
    } else {
      drawWidth = size;
      drawHeight = size / aspectRatio;
    }

    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Restaurar estado do contexto
    ctx.restore();
  }, [scale, rotation, position, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    drawCanvas();
  };

  React.useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Controles de toque para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom com scroll do mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
  };

  const handleScaleChange = (value: number[]) => {
    setScale(value[0]);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Criar canvas final com tamanho otimizado (512x512 para boa qualidade)
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    const finalSize = 512;
    finalCanvas.width = finalSize;
    finalCanvas.height = finalSize;

    // Redimensionar a imagem do canvas atual para o tamanho final
    finalCtx.drawImage(canvas, 0, 0, finalSize, finalSize);

    // Converter para base64 com qualidade otimizada
    const croppedImage = finalCanvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImage);
  };

  const resetTransforms = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Imagem oculta para carregar */}
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Original"
        className="hidden"
        onLoad={handleImageLoad}
      />

      {/* Canvas de preview */}
      <div className="flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-2 border-zinc-200 rounded-full cursor-move select-none"
            style={{ width: '300px', height: '300px', touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          />
          <div className="absolute inset-0 border-2 border-dashed border-zinc-400 rounded-full pointer-events-none opacity-50" />
        </div>
      </div>

      {/* Controles */}
      <div className="space-y-4">
        {/* Zoom */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Zoom
            </label>
            <span className="text-sm text-zinc-500">{Math.round(scale * 100)}%</span>
          </div>
          <Slider
            value={[scale]}
            onValueChange={handleScaleChange}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Controles de ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Girar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTransforms}
            className="flex-1"
          >
            Resetar
          </Button>
        </div>

        {/* Instruções */}
        <div className="text-xs text-zinc-500 text-center space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Move className="w-3 h-3" />
            Arraste para mover a imagem
          </p>
          <p>Use o scroll do mouse ou slider para zoom</p>
          <p>Toque e arraste funciona no mobile</p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleCrop} className="flex-1">
          Aplicar Recorte
        </Button>
      </div>
    </div>
  );
}