'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  RotateCcw,
  Pencil,
  Type,
  Circle,
  Undo2,
  Search,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  HardHat
} from "lucide-react";

interface Rapport {
  id: string;
  description: string;
  dateRapport: string;
  avancement: number;
  phase: string;
  tache: string;
  employes: string[];
  validation: "En attente" | "À réviser" | "Approuvé";
  photos: string[];
}

interface ImageAnnotationEditorProps {
  rapport: Rapport;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestRevision: (id: string, comment: string) => void;
  chefDeBrigade?: string; // Ajout du Chef de Brigade
}

type DrawingMode = 'none' | 'pencil' | 'text';
type DrawingColor = '#ef4444' | '#eab308';

interface DrawAction {
  type: 'path' | 'text';
  color: string;
  points?: { x: number; y: number }[];
  text?: string;
  position?: { x: number; y: number };
  imageIndex: number;
}

const validationConfig = {
  "En attente": { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  "À réviser": { icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  "Approuvé": { icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" }
};

export function ImageAnnotationEditor({
  rapport,
  isOpen,
  onClose,
  onApprove,
  onRequestRevision,
  chefDeBrigade
}: ImageAnnotationEditorProps) {
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [drawingColor, setDrawingColor] = useState<DrawingColor>('#ef4444');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState([100]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current image URL from rapport photos
  const imageUrl = rapport.photos[currentImageIndex] || "";
  const totalImages = rapport.photos.length;

  const ValidationIcon = validationConfig[rapport.validation].icon;

  const goToPreviousImage = () => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prev => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const resetEditor = useCallback(() => {
    setIsRevisionMode(false);
    setRevisionComment("");
    setDrawingMode('none');
    setRotation(0);
    setZoom([100]);
    setActions([]);
    setTextPosition(null);
    setTextInput("");
    setCurrentImageIndex(0);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetEditor();
    }
  }, [isOpen, resetEditor]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Redraw all actions for current image
      actions
        .filter(action => action.imageIndex === currentImageIndex)
        .forEach(action => {
          if (action.type === 'path' && action.points && action.points.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = action.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(action.points[0].x, action.points[0].y);
            action.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          } else if (action.type === 'text' && action.text && action.position) {
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = action.color;
            ctx.fillText(action.text, action.position.x, action.position.y);
          }
        });

      // Draw current path
      if (currentPath.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    };
    img.src = imageUrl;
  }, [rotation, actions, currentPath, drawingColor, imageUrl, currentImageIndex]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isRevisionMode) return;
    
    const coords = getCanvasCoordinates(e);
    
    if (drawingMode === 'pencil') {
      setIsDrawing(true);
      setCurrentPath([coords]);
    } else if (drawingMode === 'text') {
      setTextPosition(coords);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode !== 'pencil') return;
    
    const coords = getCanvasCoordinates(e);
    setCurrentPath(prev => [...prev, coords]);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentPath.length > 1) {
      setActions(prev => [...prev, {
        type: 'path',
        color: drawingColor,
        points: currentPath,
        imageIndex: currentImageIndex
      }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleAddText = () => {
    if (textInput && textPosition) {
      setActions(prev => [...prev, {
        type: 'text',
        color: drawingColor,
        text: textInput,
        position: textPosition,
        imageIndex: currentImageIndex
      }]);
      setTextInput("");
      setTextPosition(null);
    }
  };

  const handleUndo = () => {
    // Only undo actions for the current image
    const lastActionIndex = actions.map((a, i) => ({ ...a, index: i }))
      .filter(a => a.imageIndex === currentImageIndex)
      .pop()?.index;
    
    if (lastActionIndex !== undefined) {
      setActions(prev => prev.filter((_, i) => i !== lastActionIndex));
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `rapport-${rapport.id}-annotated.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const enterRevisionMode = () => {
    setIsRevisionMode(true);
    setDrawingMode('pencil');
  };

  const exitRevisionMode = () => {
    setIsRevisionMode(false);
    setDrawingMode('none');
    setActions([]);
  };

  const handleSubmitRevision = () => {
    onRequestRevision(rapport.id, revisionComment);
    onClose();
  };

  const handleApprove = () => {
    onApprove(rapport.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-background rounded-2xl overflow-hidden w-full max-w-6xl h-[85vh] flex shadow-2xl border border-border/50"
        >
          {/* Left Side - Image Editor */}
          <div className="flex-1 bg-neutral-900 relative flex flex-col">
            {/* Floating Toolbar */}
            <AnimatePresence>
              {isRevisionMode && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 bg-background/95 backdrop-blur-sm rounded-xl p-2 border border-border/50 shadow-lg"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exitRevisionMode}
                    className="h-10 w-10 rounded-lg bg-success/10 text-success hover:bg-success/20"
                    title="Confirmer"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exitRevisionMode}
                    className="h-10 w-10 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    title="Annuler"
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="h-px bg-border/50 my-1" />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotate}
                    className="h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary"
                    title="Rotation 90°"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>

                  <Button
                    variant={drawingMode === 'pencil' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setDrawingMode(drawingMode === 'pencil' ? 'none' : 'pencil')}
                    className={`h-10 w-10 rounded-lg ${drawingMode === 'pencil' ? 'gradient-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
                    title="Tracé libre"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>

                  <Button
                    variant={drawingMode === 'text' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setDrawingMode(drawingMode === 'text' ? 'none' : 'text')}
                    className={`h-10 w-10 rounded-lg ${drawingMode === 'text' ? 'gradient-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
                    title="Ajouter texte"
                  >
                    <Type className="h-5 w-5" />
                  </Button>

                  <div className="h-px bg-border/50 my-1" />

                  {/* Color Selector */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDrawingColor('#ef4444')}
                      className={`h-10 w-10 rounded-lg ${drawingColor === '#ef4444' ? 'ring-2 ring-red-500' : ''}`}
                      title="Rouge"
                    >
                      <Circle className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDrawingColor('#eab308')}
                      className={`h-10 w-10 rounded-lg ${drawingColor === '#eab308' ? 'ring-2 ring-yellow-500' : ''}`}
                      title="Jaune"
                    >
                      <Circle className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    </Button>
                  </div>

                  <div className="h-px bg-border/50 my-1" />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUndo}
                    disabled={actions.length === 0}
                    className="h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                    title="Annuler dernière action"
                  >
                    <Undo2 className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="h-10 w-10 rounded-lg hover:bg-success/10 hover:text-success"
                    title="Télécharger l'image annotée"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Container */}
            <div 
              ref={containerRef}
              className="flex-1 flex items-center justify-center p-8 overflow-hidden relative"
            >
              {/* Navigation Arrows */}
              {totalImages > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div 
                className="relative"
                style={{ 
                  transform: `scale(${zoom[0] / 100})`,
                  transition: 'transform 0.2s ease'
                }}
              >
                <canvas
                  ref={canvasRef}
                  className={`max-w-full max-h-[60vh] rounded-lg shadow-2xl ${
                    isRevisionMode && drawingMode !== 'none' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                
                {/* Text Input Overlay */}
                <AnimatePresence>
                  {textPosition && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 bg-background rounded-lg p-3 shadow-xl border border-border/50 flex gap-2"
                    >
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Entrez le texte..."
                        className="px-3 py-2 bg-secondary rounded-lg text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleAddText}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setTextPosition(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Image Counter Badge */}
              {totalImages > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-sm text-white font-medium">
                    {currentImageIndex + 1} / {totalImages}
                  </span>
                </div>
              )}
            </div>

            {/* Zoom Slider */}
            <div className="p-4 bg-neutral-800/50 border-t border-white/10">
              <div className="flex items-center gap-4 max-w-xs mx-auto">
                <Search className="h-4 w-4 text-white/60" />
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={50}
                  max={200}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm text-white/60 w-12 text-right">{zoom}%</span>
              </div>
            </div>
          </div>

          {/* Right Side - Info Panel */}
          <div className="w-96 bg-background border-l border-border/50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Détails du Rapport</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Badge variant="outline" className={`${validationConfig[rapport.validation].className} border gap-1`}>
                <ValidationIcon className="h-3 w-3" />
                {rapport.validation}
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ID */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Référence</p>
                  <p className="font-mono font-semibold text-foreground">{rapport.id}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{rapport.description}</p>
              </div>

              {/* Task & Phase */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tâche</p>
                  <p className="text-sm font-medium text-foreground">{rapport.tache}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phase</p>
                  <p className="text-sm font-medium text-foreground">{rapport.phase}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date du rapport</p>
                  <p className="font-medium text-foreground">
                    {new Date(rapport.dateRapport).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Avancement</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rapport.avancement}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full gradient-primary rounded-full"
                    />
                  </div>
                  <span className="text-lg font-bold text-primary">{rapport.avancement}%</span>
                </div>
              </div>

              {/* Employees */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Employés assignés</p>
                <div className="space-y-2">
                  {rapport.employes.map((employe, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{employe}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef de Brigade */}
              {chefDeBrigade && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <HardHat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-primary font-medium">Chef de Brigade assigné</p>
                    <p className="text-sm font-semibold text-foreground">{chefDeBrigade}</p>
                  </div>
                </div>
              )}

              {/* Photos Thumbnails */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Photos jointes ({totalImages})</p>
                <div className="grid grid-cols-5 gap-2">
                  {rapport.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary ring-2 ring-primary/30' 
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {actions.some(a => a.imageIndex === index) && (
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-warning rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revision Comment */}
              <AnimatePresence>
                {isRevisionMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-xs text-muted-foreground mb-2">Commentaire de révision</p>
                    <Textarea
                      value={revisionComment}
                      onChange={(e) => setRevisionComment(e.target.value)}
                      placeholder="Décrivez les modifications demandées..."
                      className="min-h-[120px] resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border/50 space-y-3">
              {rapport.validation === "En attente" && !isRevisionMode && (
                <>
                  <Button
                    onClick={handleApprove}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approuver le rapport
                  </Button>
                  <Button
                    variant="outline"
                    onClick={enterRevisionMode}
                    className="w-full border-warning/50 text-warning hover:bg-warning/10"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Demander Révision
                  </Button>
                </>
              )}
              
              {isRevisionMode && (
                <>
                  <Button
                    onClick={handleSubmitRevision}
                    disabled={!revisionComment.trim()}
                    className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Envoyer au Chef de Brigade
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exitRevisionMode}
                    className="w-full"
                  >
                    Annuler
                  </Button>
                </>
              )}

              {rapport.validation !== "En attente" && !isRevisionMode && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Fermer
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
