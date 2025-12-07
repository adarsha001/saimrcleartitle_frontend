import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAddPropertyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // Check for admin in multiple possible fields
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true || user?.admin === true;

  return (
    <nav className="bg-black text-white shadow-lg border-b border-gray-800 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:text-gray-300 transition-colors flex-shrink-0"
            onClick={handleNavLinkClick}
          >
            <img className='w-10 h-10 sm:w-12 sm:h-12 scale-200' src="/logo.png" alt="Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link 
              to="/" 
              className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-600 whitespace-nowrap"
            >
              Properties
            </Link>
            
            <Link 
              to="/featured" 
              className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-600 whitespace-nowrap"
            >
              Featured
            </Link>
            
         
            
    
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-600 whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Profile, </span>{user.username}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded transition-colors text-sm font-medium border border-white whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-600 whitespace-nowrap"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm border border-white whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Tablet Navigation (hidden on mobile, shown on md) */}
          <div className="hidden md:flex lg:hidden items-center space-x-3">
            {isAdmin && (
              <Link 
                to="/admin"
                className="bg-purple-600 text-white p-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm border border-purple-600"
                title="Admin Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </Link>
            )}
            
            <div className="relative">
              <Link 
                to={user ? "/add-property" : "#"}
                onClick={handleAddPropertyClick}
                className={`p-2 rounded-lg font-medium transition-colors border text-sm ${
                  user 
                    ? "bg-white text-black hover:bg-gray-200 border-white" 
                    : "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                }`}
                title="Add Property"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="p-2 hover:text-gray-300 transition-colors rounded-md text-sm font-medium border border-transparent hover:border-gray-600"
                  title="Profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-white text-black hover:bg-gray-200 p-2 rounded transition-colors text-sm font-medium border border-white"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="p-2 hover:text-gray-300 transition-colors rounded-md text-sm font-medium border border-transparent hover:border-gray-600"
                  title="Login"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-black p-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm border border-white"
                  title="Register"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-600 border border-gray-600 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-black border-t border-gray-800 shadow-xl`}>
        <div className="px-2 pt-2 pb-4 space-y-2">
          {/* Main Navigation Links */}
          <Link
            to="/"
            className="block px-4 py-3 rounded-lg text-base font-medium hover:text-gray-300 hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700"
            onClick={handleNavLinkClick}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Properties</span>
            </div>
          </Link>

          <Link
            to="/featured"
            className="block px-4 py-3 rounded-lg text-base font-medium hover:text-gray-300 hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700"
            onClick={handleNavLinkClick}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Featured Properties</span>
            </div>
          </Link>

    

      
          {/* User Section */}
          {user ? (
            <>
              <Link
                to="/profile"
                className="block px-4 py-3 rounded-lg text-base font-medium hover:text-gray-300 hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700"
                onClick={handleNavLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile ({user.username})</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium bg-white text-black hover:bg-gray-200 transition-colors border border-white"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-3 rounded-lg text-base font-medium hover:text-gray-300 hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700"
                onClick={handleNavLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login</span>
                </div>
              </Link>
              <Link
                to="/register"
                className="block px-4 py-3 rounded-lg text-base font-medium bg-white text-black hover:bg-gray-200 transition-colors border border-white"
                onClick={handleNavLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Register</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}