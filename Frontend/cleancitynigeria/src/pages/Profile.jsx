import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Select, Alert, Loading } from '../components/UI';
import { NIGERIAN_STATES } from '../constants';
import { getErrorMessage } from '../utils/helpers';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    lga: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        state: user.state || 'Lagos',
        lga: user.lga || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <Card className="max-w-md">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            icon={<User className="w-4 h-4" />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{formData.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone className="w-4 h-4" />}
          />

          <Select
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            options={NIGERIAN_STATES.map((state) => ({ value: state, label: state }))}
            icon={<MapPin className="w-4 h-4" />}
          />

          <Input
            label="Local Government Area (LGA)"
            name="lga"
            value={formData.lga}
            onChange={handleChange}
          />

          <Button type="submit" size="lg" loading={loading}>
            Update Profile
          </Button>
        </form>
      </Card>

      {/* Account Info */}
      <Card className="mt-6">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Account Type:</span>
            <span className="font-semibold text-gray-900 capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email Verified:</span>
            <span className="font-semibold text-green-600">{user.isVerified ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Member Since:</span>
            <span className="font-semibold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
