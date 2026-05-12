import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Map, Plus, Home, Menu, X, BookOpen, Images, Printer, PartyPopper } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import TreeExplorer from './pages/TreeExplorer';
import FamilyMap from './pages/FamilyMap';
import AddMemberForm from './pages/AddMemberForm';
import EditMemberForm from './pages/EditMemberForm';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import PrintPage from './pages/PrintPage';
import EventsPage from './pages/EventsPage';
import EventAttendeesPage from './pages/EventAttendeesPage';

function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isHome = location.pathname === '/';

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/tree', label: 'Pohon Keluarga', icon: Network },
    { path: '/map', label: 'Peta Sebaran', icon: Map },
    { path: '/gallery', label: 'Galeri', icon: Images },
    { path: '/events', label: 'Acara', icon: PartyPopper },
    { path: '/print', label: 'Cetak PDF', icon: Printer },
    { path: '/add', label: 'Tambah Anggota', icon: Plus },
    { path: '/about', label: 'Tentang', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navBg = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-stone-900/95 backdrop-blur-md border-b border-stone-700/50 shadow-xl';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
              <img src="/Logo.png" alt="Eyang Bandan" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Eyang Bandan</p>
              <p className="text-amber-400 text-[10px] font-medium tracking-wider uppercase">Family Tree</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-stone-900/98 border-t border-stone-700/50 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                      ${active
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tree" element={<TreeExplorer />} />
            <Route path="/map" element={<FamilyMap />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id/attendees" element={<EventAttendeesPage />} />
            <Route path="/print" element={<PrintPage />} />
            <Route path="/add" element={<AddMemberForm />} />
            <Route path="/edit/:id" element={<EditMemberForm />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>

        <footer className="bg-stone-900 border-t border-stone-800 py-10 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                <img src="/Logo.png" alt="Eyang Bandan" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold">Eyang Bandan Family Tree</span>
            </div>
            <p className="text-stone-400 font-serif italic text-sm mb-2">
              "Keturunan adalah amanah, silsilah adalah jembatan mengenang."
            </p>
            <p className="text-stone-600 text-xs">
              © 2026 Eyang Bandan Family Tree · Dibangun oleh Lucky Zamaludin Malik
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
