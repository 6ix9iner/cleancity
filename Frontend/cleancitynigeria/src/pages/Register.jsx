import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Alert, Card } from '../components/UI';
import { isValidEmail, validatePassword, getErrorMessage } from '../utils/helpers';
import { NIGERIAN_STATES } from '../constants';
import { User, Shield } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    state: 'Lagos',
    lga: '',
    role: 'citizen',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.role === 'citizen' && !formData.phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        state: formData.state,
        lga: formData.lga,
        role: formData.role,
      });

      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join CleanCity and make a difference</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Enter your phone number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Register as</label>
            <div className="grid grid-cols-2 gap-4">
              {/* Citizen Card */}
              <div
                onClick={() => {
                  setFormData((prev) => ({ ...prev, role: 'citizen' }));
                  if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
                }}
                className={`flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === 'citizen'
                    ? 'border-green-600 bg-green-50/50 text-green-700 shadow-md ring-1 ring-green-600/20'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${formData.role === 'citizen' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <User className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Citizen</span>
                <span className="text-xs text-gray-500 text-center mt-1 leading-snug">Report waste & earn rewards</span>
              </div>

              {/* Agency Card */}
              <div
                onClick={() => {
                  setFormData((prev) => ({ ...prev, role: 'agency' }));
                  if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
                }}
                className={`flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === 'agency'
                    ? 'border-green-600 bg-green-50/50 text-green-700 shadow-md ring-1 ring-green-600/20'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${formData.role === 'agency' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Waste Agency</span>
                <span className="text-xs text-gray-500 text-center mt-1 leading-snug">Accept & resolve cleanups</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Local Government Area (LGA)"
            name="lga"
            value={formData.lga}
            onChange={handleChange}
            placeholder="Enter your LGA"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="At least 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
          />

          <Button type="submit" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
