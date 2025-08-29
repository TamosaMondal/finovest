import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Target, Shield, Download, User, LogOut, Sun, Moon, MessageSquare, Trash2, Mail, Phone, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { exportToPDF } from './PDFExport';

export default function Navigation() {
  const { state, updateNotesInDatabase } = useFinance();
  const { notes } = state;

  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // State for the modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const [newNote, setNewNote] = useState('');

  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleExportPDF = () => {
    exportToPDF(state, userProfile?.name || 'User');
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const addNote = () => {
    if (newNote.trim() !== '') {
      const updatedNotes = [...notes, newNote.trim()];
      updateNotesInDatabase(updatedNotes); // Saves to Firestore
      setNewNote('');
    }
  };

  const deleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    updateNotesInDatabase(updatedNotes); // Saves to Firestore
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/debts', icon: Shield, label: 'Debt Planner' },
    { path: '/contact', icon: MessageSquare, label: 'Contact Us' },
  ];

  return (
    <>
      {/* ---------------- Desktop Navigation ---------------- */}
      <nav className="hidden md:flex bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              {/* 💡 NEW: Added the logo icon */}
              <TrendingUp className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Finovest</span>
            </Link>
            
            <div className="flex space-x-6">
              {/* Updated rendering to handle the contact button */}
              {navItems.map((item) => {
                if (item.path === '/contact') {
                  return (
                    <button
                      key={item.path}
                      onClick={() => setShowContactModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNoteModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              📝 <span className="text-sm font-medium">Quick Note</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download PDF</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Welcome, {userProfile?.name || currentUser?.email || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------- Mobile Navigation ---------------- */}
      <nav className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            {/* 💡 NEW: Added the logo icon for mobile */}
            <TrendingUp className="h-7 w-7 text-green-500" />
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Finovest</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNoteModal(true)}
              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              📝
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleExportPDF}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                if (item.path === '/contact') {
                  return (
                    <button
                      key={item.path}
                      onClick={() => { setShowContactModal(true); setIsOpen(false); }}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Welcome, {userProfile?.name || currentUser?.email || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ---------------- Quick Notes Modal ---------------- */}
      {showNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96 transition-colors">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Notes</h2>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <button
                onClick={addNote}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No notes yet.</p>
              ) : (
                notes.map((note, i) => (
                  <li key={i} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg transition-colors group">
                    <span className="text-sm text-gray-700 dark:text-gray-200">{note}</span>
                    <button
                      onClick={() => deleteNote(i)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>

            <button
              onClick={() => setShowNoteModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Contact Us Modal ---------------- */}
      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-sm text-center">
            <div className="flex justify-end -mt-4 -mr-4">
                <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2">
                    <X size={24} />
                </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Have questions? We're here to help.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a href="mailto:subhadey2901@gmail.com" className="font-semibold text-gray-800 dark:text-gray-100 hover:underline">
                    subhadey2901@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Phone className="h-5 w-5 text-green-500 dark:text-green-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <a href="tel:+918116007069" className="font-semibold text-gray-800 dark:text-gray-100 hover:underline">
                    +91 8116007069
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
