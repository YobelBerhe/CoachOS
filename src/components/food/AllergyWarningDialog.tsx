import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  Heart,
  ArrowRight,
  Info
} from 'lucide-react';

interface AllergyWarningDialogProps {
  open: boolean;
  onClose: () => void;
  foodName: string;
  detectedAllergens: string[];
  userId: string;
  onProceed: () => void;
}

interface AllergyDetails {
  name: string;
  severity: string;
  symptoms?: string;
}

export default function AllergyWarningDialog({
  open,
  onClose,
  foodName,
  detectedAllergens,
  userId,
  onProceed
}: AllergyWarningDialogProps) {
  const [allergyDetails, setAllergyDetails] = useState<AllergyDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && detectedAllergens.length > 0) {
      loadAllergyDetails();
    }
  }, [open, detectedAllergens]);

  async function loadAllergyDetails() {
    try {
      const { data } = await supabase
        .from('user_allergies')
        .select('*')
        .eq('user_id', userId)
        .in('allergen_name', detectedAllergens);

      if (data) {
        setAllergyDetails(data.map(a => ({
          name: a.allergen_name,
          severity: a.severity || 'moderate',
          symptoms: a.reaction_symptoms || undefined
        })));
      }
    } catch (error) {
      console.error('Error loading allergy details:', error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'life-threatening':
        return {
          bg: 'from-red-500 to-red-600',
          text: 'text-red-600',
          border: 'border-red-500',
          glow: 'shadow-red-500/50'
        };
      case 'severe':
        return {
          bg: 'from-orange-500 to-red-500',
          text: 'text-orange-600',
          border: 'border-orange-500',
          glow: 'shadow-orange-500/50'
        };
      case 'moderate':
        return {
          bg: 'from-yellow-500 to-orange-500',
          text: 'text-yellow-600',
          border: 'border-yellow-500',
          glow: 'shadow-yellow-500/50'
        };
      default:
        return {
          bg: 'from-blue-500 to-blue-600',
          text: 'text-blue-600',
          border: 'border-blue-500',
          glow: 'shadow-blue-500/50'
        };
    }
  };

  const hasLifeThreatening = allergyDetails.some(a => a.severity === 'life-threatening');
  const hasSevere = allergyDetails.some(a => a.severity === 'severe');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-transparent">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative"
        >
          {/* Glassmorphism Container */}
          <div className="relative bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl" />
            
            {/* Pulsing Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.15), transparent 70%)',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative z-10">
              {/* Header with Icon */}
              <DialogHeader className="p-8 pb-4">
                <div className="flex items-start justify-between">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <ShieldAlert className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold mb-1">
                        ⚠️ Allergy Alert
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        This food contains allergens you're sensitive to
                      </p>
                    </div>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full hover:bg-red-500/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="px-8 pb-8 space-y-6">
                {/* Food Name Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Food Item:</p>
                      <h3 className="text-2xl font-bold">{foodName}</h3>
                    </div>
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      {detectedAllergens.length} Allergen{detectedAllergens.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </motion.div>

                {/* Detected Allergens */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Detected Allergens
                  </h4>
                  
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allergyDetails.map((allergy, index) => {
                        const colors = getSeverityColor(allergy.severity);
                        return (
                          <motion.div
                            key={allergy.name}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className={`relative p-5 rounded-xl border-2 ${colors.border} overflow-hidden group hover:shadow-xl transition-all`}
                          >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg`} />
                                  <h5 className="font-bold text-lg">{allergy.name}</h5>
                                </div>
                                <Badge className={`${colors.text} bg-transparent border ${colors.border} capitalize`}>
                                  {allergy.severity}
                                </Badge>
                              </div>
                              
                              {allergy.symptoms && (
                                <div className="mt-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Known Reactions:
                                  </p>
                                  <p className="text-sm">{allergy.symptoms}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Warning Message */}
                {(hasLifeThreatening || hasSevere) && (
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
                    <Heart className="w-5 h-5 text-red-600" />
                    <AlertDescription>
                      <p className="font-semibold text-red-600 mb-1">
                        Critical Warning
                      </p>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        This food contains {hasLifeThreatening ? 'life-threatening' : 'severe'} allergens. 
                        Please consult with your doctor before consuming.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onProceed();
                      onClose();
                    }}
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    I Understand - Log Anyway
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Info Footer */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    💡 <strong>Tip:</strong> You can update your allergies anytime in Settings → Health Profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
