import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { agencyAPI, reportAPI } from '../services/api';
import { Card, Badge, Loading, Alert, Button, Input } from '../components/UI';
import { formatDate, truncateText, getErrorMessage } from '../utils/helpers';
import { REPORT_STATUS_COLORS, NIGERIAN_STATES } from '../constants';
import { MapPin, Briefcase, CheckCircle, Clock, Shield } from 'lucide-react';

const AgencyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Onboarding & verification states
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [onboardingForm, setOnboardingForm] = useState({
    organizationName: '',
    registrationNumber: '',
    state: 'Lagos',
    lga: '',
    address: '',
    description: '',
    serviceCategories: [],
    coverageAreas: '',
  });

  const fetchData = async () => {
    try {
      const [reportsRes, statsRes, agenciesRes] = await Promise.all([
        agencyAPI.getAssignedReports({ limit: 20 }),
        agencyAPI.getStats(),
        agencyAPI.getAll(),
      ]);

      setReports(reportsRes.data.data.reports || []);
      setStats(statsRes.data.data);

      const userId = user?.id || user?._id;
      const myAgency = agenciesRes.data.data.agencies.find(
        (a) => a.userId?._id === userId || a.userId === userId || a.userId?.id === userId
      );
      setIsVerified(myAgency?.verified ?? false);
      setNeedsOnboarding(false);
      setError('');
    } catch (err) {
      if (err.response?.status === 404 && (err.response?.data?.message?.includes('profile not found') || err.response?.data?.message?.includes('profile'))) {
        setNeedsOnboarding(true);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await reportAPI.updateStatus(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
      );
      // Reload stats
      const statsRes = await agencyAPI.getStats();
      setStats(statsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleOnboardingChange = (e) => {
    const { name, value } = e.target;
    setOnboardingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryCheckboxChange = (catId) => {
    setOnboardingForm((prev) => {
      const exists = prev.serviceCategories.includes(catId);
      const updated = exists
        ? prev.serviceCategories.filter((c) => c !== catId)
        : [...prev.serviceCategories, catId];
      return {
        ...prev,
        serviceCategories: updated,
      };
    });
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingError('');
    setOnboardingLoading(true);

    try {
      const payload = {
        organizationName: onboardingForm.organizationName,
        registrationNumber: onboardingForm.registrationNumber,
        state: onboardingForm.state,
        lga: onboardingForm.lga,
        address: onboardingForm.address,
        description: onboardingForm.description,
        categories: onboardingForm.serviceCategories.length > 0 ? onboardingForm.serviceCategories : ['other'],
        assignedAreas: onboardingForm.coverageAreas.split(',').map((x) => x.trim()).filter((x) => x.length > 0),
      };

      await agencyAPI.register(payload);
      setNeedsOnboarding(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      setOnboardingError(getErrorMessage(err));
    } finally {
      setOnboardingLoading(false);
    }
  };

  const filteredReports = filterStatus === 'all' ? reports : reports.filter((r) => r.status === filterStatus);

  if (loading && !needsOnboarding) return <Loading />;

  // Render onboarding form if agency profile needs setup
  if (needsOnboarding) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="p-6 md:p-8 border-t-4 border-t-green-600 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-green-50 rounded-full mb-3 text-green-600">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Set Up Agency Profile</h1>
            <p className="text-gray-600 mt-2">Create your organization profile to start managing waste reports in your area.</p>
          </div>

          {onboardingError && <Alert type="error" message={onboardingError} onClose={() => setOnboardingError('')} className="mb-6" />}

          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            <Input
              label="Organization/Agency Name"
              name="organizationName"
              value={onboardingForm.organizationName}
              onChange={handleOnboardingChange}
              required
              placeholder="e.g. Lagos Waste Management Authority (LAWMA)"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Registration Certificate Number"
                name="registrationNumber"
                value={onboardingForm.registrationNumber}
                onChange={handleOnboardingChange}
                placeholder="e.g. RC-123456"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating State</label>
                <select
                  name="state"
                  value={onboardingForm.state}
                  onChange={handleOnboardingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                >
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Office Location LGA"
                name="lga"
                value={onboardingForm.lga}
                onChange={handleOnboardingChange}
                placeholder="e.g. Ikeja"
              />
              <Input
                label="Office Street Address"
                name="address"
                value={onboardingForm.address}
                onChange={handleOnboardingChange}
                placeholder="e.g. 5 Secretariat Road, Alausa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency Operations Description</label>
              <textarea
                name="description"
                rows="3"
                value={onboardingForm.description}
                onChange={handleOnboardingChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                placeholder="Briefly state your agency's scope, mission, and resources..."
              />
            </div>

            <Input
              label="Assigned LGAs / Coverage Areas (comma separated)"
              name="coverageAreas"
              value={onboardingForm.coverageAreas}
              onChange={handleOnboardingChange}
              placeholder="e.g. Ikeja, Ojodu, Agege"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Service Categories Handled</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { id: 'illegal_dumpsite', label: 'Illegal Dumpsite' },
                  { id: 'overflowing_bin', label: 'Overflowing Bin' },
                  { id: 'hazardous_waste', label: 'Hazardous Waste' },
                  { id: 'other', label: 'Other Types' }
                ].map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="checkbox"
                      checked={onboardingForm.serviceCategories.includes(cat.id)}
                      onChange={() => handleCategoryCheckboxChange(cat.id)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={onboardingLoading}>
              Save and Connect Profile
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Verification Warning Banner */}
      {!isVerified && (
        <Alert
          type="warning"
          message="Your agency profile is pending administrator verification. You will be automatically assigned environmental reports in your coverage area once verified."
          className="mb-8"
        />
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Dashboard</h1>
        <p className="text-gray-600">Manage assigned environmental reports and track cleanup progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Assigned Reports</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalAssigned || 0}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.resolved || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.inProgress || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'assigned', 'in_progress', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition font-semibold capitalize ${
              filterStatus === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Assigned Reports</h2>
        {filteredReports.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">No reports assigned yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report._id} className="hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary">{report.category}</Badge>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${REPORT_STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-900 font-semibold mb-1">{truncateText(report.description, 80)}</p>
                    <p className="text-gray-600 text-sm mb-2">
                      📍 {report.location.address || report.location.lga}, {report.location.state}
                    </p>
                    {report.reportedBy?.name && (
                      <p className="text-gray-600 text-sm">Reported by: {report.reportedBy.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Link
                      to={`/reports/${report._id}`}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Status Update Buttons */}
                {report.status !== 'resolved' && report.status !== 'rejected' && (
                  <div className="border-t pt-4 flex gap-2">
                    {report.status === 'assigned' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(report._id, 'in_progress')}
                      >
                        Start Work
                      </Button>
                    )}
                    {report.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(report._id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusUpdate(report._id, 'assigned')}
                        >
                          Pause
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;
