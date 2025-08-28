import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// CHANGED: No need for AuthProvider here as it's already in main.tsx
import { useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import AuthModal from './components/AuthModal';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import DailyBudget from './pages/DailyBudget';
import MonthlyOverview from './pages/MonthlyOverview';
import BudgetSetup from './pages/BudgetSetup';
import Investments from './pages/Investments';
import Returns from './pages/Returns';
import Needs from './pages/Needs';
import Wants from './pages/Wants';

function App() {
  // CHANGED: Get currentUser and isLoading directly from useAuth
  const { currentUser, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Automatically open the modal if we're done loading and there's no user
    if (!isLoading && !currentUser) {
      setShowAuthModal(true);
    }
  }, [isLoading, currentUser]);

  // Renders a loading spinner while Firebase checks the user's auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your finance dashboard...</p>
        </div>
      </div>
    );
  }

  // If there is no logged-in user, show the landing page and the modal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Personal Finance Dashboard</h1>
            <p className="text-gray-600 mb-8">Secure, private, and personalized financial management</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If a user is logged in, show the full application
  return (
    <FinanceProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/daily-budget" element={<DailyBudget />} />
              <Route path="/monthly-overview" element={<MonthlyOverview />} />
              <Route path="/budget-setup" element={<BudgetSetup />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/needs" element={<Needs />} />
              <Route path="/wants" element={<Wants />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinanceProvider>
  );
}


// You no longer need a separate AppContent component.
// The main App component handles everything now.
// And since AuthProvider is already in main.tsx, we just export App.
export default App;