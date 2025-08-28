import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Target, Heart, TrendingUp, Calendar, Settings, LogOut, Download, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { exportToPDF } from './PDFExport';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  // CHANGED: Get currentUser, userProfile, and logout from the updated useAuth hook
  const { currentUser, userProfile, logout } = useAuth();
  const { state } = useFinance();

  const handleExportPDF = () => {
    // CHANGED: Use userProfile?.name to get the user's name
    exportToPDF(state, userProfile?.name || 'User');
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/budget-setup', icon: Settings, label: 'Budget Setup' },
    { path: '/needs', icon: Target, label: 'Needs' },
    { path: '/wants', icon: Heart, label: 'Wants' },
    { path: '/investments', icon: TrendingUp, label: 'Investments' },
    { path: '/daily-budget', icon: Calendar, label: 'Daily Budget' },
    { path: '/monthly-overview', icon: Calendar, label: 'Monthly Overview' },
    { path: '/returns', icon: TrendingUp, label: 'Returns' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white shadow-lg border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">Finovest</span>
            </Link>
            
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download PDF Report</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {/* CHANGED: Use userProfile?.name to display the name */}
                  Welcome, {userProfile?.name || currentUser?.phoneNumber || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white shadow-lg border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-bold text-gray-800">Finance</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportPDF}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {/* CHANGED: Use userProfile?.name to display the name */}
                    Welcome, {userProfile?.name || currentUser?.phoneNumber || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}