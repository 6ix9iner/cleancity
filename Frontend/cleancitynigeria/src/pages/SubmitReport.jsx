import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { Button, Card, TextArea, Select, Alert, Loading } from '../components/UI';
import { REPORT_CATEGORIES, NIGERIAN_STATES } from '../constants';
import { getErrorMessage } from '../utils/helpers';
import { Upload, X, Camera, RefreshCw } from 'lucide-react';

const SubmitReport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);
  const [activeDeviceIdx, setActiveDeviceIdx] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (deviceIndex = 0) => {
    setCameraError('');
    setIsCameraOpen(true);
    stopCamera();

    try {
      let devices = videoDevices;
      if (devices.length === 0) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        devices = allDevices.filter(device => device.kind === 'videoinput');
        setVideoDevices(devices);
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      if (devices.length > 0 && devices[deviceIndex]) {
        constraints.video.deviceId = { ideal: devices[deviceIndex].deviceId };
      } else {
        constraints.video.facingMode = { ideal: 'environment' };
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn('First camera access attempt failed, trying fallback constraints:', firstErr);
        // Fallback to basic video access
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActiveDeviceIdx(deviceIndex);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Could not access the live camera. This can happen if permissions are denied, if another application is using the camera, or if you are not using a secure (HTTPS) connection.');
    }
  };

  const switchCamera = () => {
    if (videoDevices.length > 1) {
      const nextIdx = (activeDeviceIdx + 1) % videoDevices.length;
      startCamera(nextIdx);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], `snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const totalImages = images.length + 1;
      if (totalImages > 5) {
        setError('Maximum 5 images allowed');
        setIsCameraOpen(false);
        stopCamera();
        return;
      }
      
      setImages(prev => [...prev, file]);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
      
      setIsCameraOpen(false);
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  const handleCaptureClick = () => {
    const hasCameraSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (!hasCameraSupport || isMobile) {
      cameraInputRef.current?.click();
    } else {
      startCamera(0);
    }
  };
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-600 hover:bg-green-50/50 transition flex flex-col items-center justify-center group"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-3 group-hover:bg-green-100 transition">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-900">Upload Files</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div
              onClick={handleCaptureClick}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-600 hover:bg-green-50/50 transition flex flex-col items-center justify-center group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition">
                <Camera className="w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-900">Take Photo</p>
              <p className="text-xs text-gray-500 mt-1">Use camera to snap a picture</p>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
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

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl overflow-hidden max-w-lg w-full border border-gray-800 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gray-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-green-500" />
                Capture Issue Photo
              </h3>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsCameraOpen(false);
                }}
                className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center">
                  <p className="text-red-400 mb-4 text-sm">{cameraError}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button
                      type="button"
                      onClick={() => startCamera(activeDeviceIdx)}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setIsCameraOpen(false);
                        cameraInputRef.current?.click();
                      }}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Use Device Camera / Files
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-gray-950 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsCameraOpen(false);
                }}
                className="text-gray-400 hover:text-white font-semibold transition px-4 py-2"
              >
                Cancel
              </button>

              {/* Shutter Button */}
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-gray-400 active:scale-95 transition-transform flex items-center justify-center shadow-lg hover:border-green-500 group"
                  title="Capture Photo"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors" />
                </button>
              )}

              {/* Camera Switcher */}
              {videoDevices.length > 1 && !cameraError ? (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-11 h-11" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitReport;
