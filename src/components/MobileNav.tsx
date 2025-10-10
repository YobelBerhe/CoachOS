import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Camera,
  ShoppingCart,
  Leaf,
  Utensils,
  Repeat,
  Menu,
  X,
  Bell,
  Users,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainNav = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/barcode-scanner', icon: Camera, label: 'Scan' },
    { path: '/shopping-list', icon: ShoppingCart, label: 'List' },
    { path: '/food-waste', icon: Leaf, label: 'Waste' },
  ];

  const moreNav = [
    { path: '/menu-scanner', icon: Utensils, label: 'Menu AI' },
    { path: '/meal-swap', icon: Repeat, label: 'Swap' },
    { path: '/family-sharing', icon: Users, label: 'Family' },
    { path: '/receipt-scanner', icon: Receipt, label: 'Receipt' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden safe-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          {mainNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl p-6 lg:hidden safe-bottom"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">More Features</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {moreNav.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <item.icon className="w-8 h-8 mb-2 text-primary" />
                    <span className="text-sm font-medium text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
