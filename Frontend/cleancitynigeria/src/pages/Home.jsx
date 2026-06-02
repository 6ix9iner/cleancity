import { Link } from 'react-router-dom';
import { MapPin, Users, Award, Zap, ChevronRight, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Keep Nigeria <span className="text-green-600">Clean</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Report environmental issues in your community and earn rewards. Help agencies respond quickly to keep our neighborhoods clean and safe.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              {!user ? (
                <>
                  <Link to="/register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">Sign In</Button>
                  </Link>
                </>
              ) : user.role === 'citizen' ? (
                <>
                  <Link to="/submit-report">
                    <Button size="lg">Submit Report</Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg">View Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/agency">
                    <Button size="lg">Agency Dashboard</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 text-white">
              <Leaf className="w-24 h-24 mb-4" />
              <p className="text-2xl font-bold">Clean Environment = Better Future</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: MapPin,
              title: 'Report',
              description: 'Spot an issue? Report it with photos and location',
            },
            {
              icon: Zap,
              title: 'Verify',
              description: 'Our team reviews and verifies your report',
            },
            {
              icon: Users,
              title: 'Assign',
              description: 'Nearby agencies are assigned to handle it',
            },
            {
              icon: Award,
              title: 'Earn',
              description: 'Earn tokens when the issue is resolved',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">10+</p>
              <p className="text-green-100">States Active</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-green-100">Reports Resolved</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">1000+</p>
              <p className="text-green-100">Community Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of Nigerians making their communities cleaner and safer every day.
          </p>
          {!user ? (
            <Link to="/register">
              <Button size="lg">Join CleanCity Today</Button>
            </Link>
          ) : (
            <Link to={user.role === 'citizen' ? '/submit-report' : '/agency'}>
              <Button size="lg">Get Started</Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                CleanCity
              </h3>
              <p className="text-sm">Making Nigeria clean, one report at a time.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CleanCity Nigeria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
