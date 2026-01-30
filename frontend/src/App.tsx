import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const Details = lazy(() => import('./pages/Details'));
const SearchResults = lazy(() => import('./pages/Search'));

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/:type/:id" element={<Details />} />
              {/* Added routes will go here as pages are built */}
            </Routes>
          </Suspense>
        </main>

        <footer className="py-12 px-6 border-t border-white/5 mt-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-bold tracking-tight">NEXUS</div>
              <p className="text-text-muted text-sm max-w-xs">
                Your ultimate streaming aggregator. Bringing all your favorite content into one place.
              </p>
            </div>
            <div className="flex gap-12">
              <div className="flex flex-col gap-3">
                <h4 className="font-semibold text-sm uppercase tracking-wider">Company</h4>
                <a href="#" className="text-text-muted text-sm hover:text-white transition-colors">About</a>
                <a href="#" className="text-text-muted text-sm hover:text-white transition-colors">Careers</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-semibold text-sm uppercase tracking-wider">Legal</h4>
                <a href="#" className="text-text-muted text-sm hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-text-muted text-sm hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-text-muted text-xs">
            © 2026 Nexus Streaming API. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
