import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-green-600">
            <MapPin className="w-8 h-8" />
            <span className="hidden sm:inline">CleanCity</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-green-600 transition">
              Home
            </Link>
            {user ? (
              <>
                {user.role === 'citizen' ? (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 transition">
                      Dashboard
                    </Link>
                    <Link to="/submit-report" className="text-gray-600 hover:text-green-600 transition">
                      Report
                    </Link>
                    <Link to="/rewards" className="text-gray-600 hover:text-green-600 transition">
                      Rewards
                    </Link>
                  </>
                ) : user.role === 'agency' ? (
                  <>
                    <Link to="/agency" className="text-gray-600 hover:text-green-600 transition">
                      Dashboard
                    </Link>
                  </>
                ) : user.role === 'admin' ? (
                  <>
                    <Link to="/admincleancity" className="text-gray-600 hover:text-green-600 transition font-semibold">
                      Admin Panel
                    </Link>
                  </>
                ) : null}
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-green-600 transition">
                  Login
                </Link>
                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* User Profile/Mobile Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <Link to="/profile" className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition">
                <User className="w-4 h-4" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-green-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3 mt-4">
              <Link to="/" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              {user ? (
                <>
                  {user.role === 'citizen' && (
                    <>
                      <Link to="/dashboard" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <Link to="/submit-report" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                        Report
                      </Link>
                      <Link to="/rewards" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                        Rewards
                      </Link>
                    </>
                  )}
                  {user.role === 'agency' && (
                    <Link to="/agency" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                      Agency Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admincleancity" className="text-gray-600 hover:text-green-600 px-4 py-2 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-red-600 hover:text-red-700 px-4 py-2">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-green-600 px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mx-4" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
