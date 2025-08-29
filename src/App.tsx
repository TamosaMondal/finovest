import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Goals from './pages/Goals';
import Debts from './pages/Debts';
//import ContactUs from './pages/ContactUs'; // Import the new Contact Us page

function App() {
  const { currentUser, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      setShowAuthModal(true);
    }
  }, [isLoading, currentUser]);

  if (isLoading) {
    return (
      // UPDATED: Loading screen with dark mode styles
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your finance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      // UPDATED: Logged-out screen with dark mode styles
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Personal Finance Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Secure, private, and personalized financial management</p>
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

  return (
    <FinanceProvider>
      <Router>
        {/* UPDATED: Main app container with dark mode styles */}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation />
          {/* Padding added to the main content area */}
          <main className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/daily-budget" element={<DailyBudget />} />
              <Route path="/monthly-overview" element={<MonthlyOverview />} />
              <Route path="/budget-setup" element={<BudgetSetup />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/needs" element={<Needs />} />
              <Route path="/wants" element={<Wants />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/debts" element={<Debts />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinanceProvider>
  );
}

export default App;