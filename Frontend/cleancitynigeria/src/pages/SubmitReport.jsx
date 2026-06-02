import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { Button, Card, TextArea, Select, Alert, Loading } from '../components/UI';
import { REPORT_CATEGORIES, NIGERIAN_STATES } from '../constants';
import { getErrorMessage } from '../utils/helpers';
import { Upload, X } from 'lucide-react';

const SubmitReport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: 'other',
    state: 'Lagos',
    lga: '',
    address: '',
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

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          type: 'Point',
          coordinates: [longitude, latitude],
        });
        setFormData((prev) => ({
          ...prev,
          address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
        }));
        setGettingLocation(false);
      },
      (err) => {
        setError('Unable to get your location. Please ensure location permission is enabled.');
        console.error('Geolocation error:', err);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length;

    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!location) newErrors.location = 'Location is required. Click "Get My Current Location" to set it.';
    if (images.length === 0) newErrors.images = 'Please upload at least 1 photo (max 5)';

    setErrors(newErrors);
    
    // Show a more specific error message
    if (Object.keys(newErrors).length > 0) {
      const errorList = Object.values(newErrors).join(' • ');
      setError(errorList);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await reportAPI.create({
        description: formData.description,
        category: formData.category,
        location: {
          ...location,
          address: formData.address,
          lga: formData.lga,
          state: formData.state,
        },
        images,
      });

      setSuccess('Report submitted successfully! Redirecting...');
      setTimeout(() => {
        const reportId = response.data.data.report._id;
        navigate(`/reports/${reportId}`);
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report Environmental Issue</h1>
        <p className="text-gray-600 mt-2">Help us keep your community clean by reporting issues you see</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Category */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Report Details</h2>
          <div className="space-y-4">
            <Select
              label="Issue Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              options={REPORT_CATEGORIES}
            />

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Describe the environmental issue in detail..."
              rows={4}
            />
          </div>
        </Card>

        {/* Location */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Location</h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition font-semibold flex items-center justify-center gap-2"
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  📍 Get My Current Location
                </>
              )}
            </button>

            {location && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Location: {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
                </p>
              </div>
            )}

            {errors.location && <p className="text-red-600 text-sm">{errors.location}</p>}

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                options={NIGERIAN_STATES.map((state) => ({ value: state, label: state }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                <input
                  type="text"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                  placeholder="Enter your Local Government Area"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address/Landmark</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter a specific address or landmark"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
        </Card>

        {/* Images */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Images (Max 5)</h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-600 hover:bg-green-50 transition"
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="font-semibold text-gray-900">Click to upload images</p>
            <p className="text-sm text-gray-600">PNG, JPG, GIF up to 10MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {errors.images && <p className="text-red-600 text-sm mt-2">{errors.images}</p>}

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <Button type="submit" size="lg" loading={loading}>
          Submit Report
        </Button>
      </form>
    </div>
  );
};

export default SubmitReport;
