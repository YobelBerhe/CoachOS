import { motion } from 'framer-motion';

export function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-muted-foreground">Scanning barcode...</p>
    </div>
  );
}
