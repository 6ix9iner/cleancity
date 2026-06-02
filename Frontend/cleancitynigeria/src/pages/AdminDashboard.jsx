import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, agencyAPI, rewardAPI } from '../services/api';
import { Card, Badge, Loading, Alert, Button, Input } from '../components/UI';
import { formatDate, truncateText, getErrorMessage } from '../utils/helpers';
import { REPORT_STATUS_COLORS } from '../constants';
import { Shield, FileText, CheckCircle, Award, Clock, Users, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [reports, setReports] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [activeTab, setActiveTab] = useState('agencies');

  // Bonus form state
  const [bonusForm, setBonusForm] = useState({
    userId: '',
    amount: '',
    description: '',
  });
  const [bonusLoading, setBonusLoading] = useState(false);
  const [bonusSuccess, setBonusSuccess] = useState('');
  const [bonusError, setBonusError] = useState('');

  // Action loading states
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchData = async () => {
    try {
      setError('');
      const [reportsRes, agenciesRes] = await Promise.all([
        reportAPI.getAll({ limit: 20 }),
        agencyAPI.getAll(),
      ]);

      setReports(reportsRes.data.data.reports || []);
      setAgencies(agenciesRes.data.data.agencies || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyAgency = async (agencyId) => {
    setVerifyingId(agencyId);
    try {
      await agencyAPI.verify(agencyId);
      toast.success('Agency verified successfully!');
      // Update local state
      setAgencies((prev) =>
        prev.map((a) => (a._id === agencyId ? { ...a, verified: true } : a))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleBonusChange = (e) => {
    const { name, value } = e.target;
    setBonusForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAwardBonus = async (e) => {
    e.preventDefault();
    setBonusError('');
    setBonusSuccess('');
    
    const amountNum = parseInt(bonusForm.amount);
    if (!bonusForm.userId.trim()) {
      setBonusError('User ID is required');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setBonusError('Please enter a valid positive token amount');
      return;
    }

    setBonusLoading(true);
    try {
      await rewardAPI.awardBonus({
        userId: bonusForm.userId.trim(),
        amount: amountNum,
        description: bonusForm.description.trim() || 'Admin bonus reward',
      });

      setBonusSuccess(`Successfully awarded ${amountNum} bonus tokens!`);
      setBonusForm({ userId: '', amount: '', description: '' });
      toast.success('Bonus tokens awarded!');
    } catch (err) {
      setBonusError(getErrorMessage(err));
    } finally {
      setBonusLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Calculate statistics
  const totalReports = reports.length;
  const totalAgencies = agencies.length;
  const pendingAgencies = agencies.filter((a) => !a.verified).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      {/* Title section */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-green-600 text-white rounded-lg shadow-md">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-600">Overview of CleanCity platform reports, agency verifications, and user tokens.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Recent Reports</p>
              <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Registered Agencies</p>
              <p className="text-3xl font-bold text-gray-900">{totalAgencies}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className={`border-l-4 ${pendingAgencies > 0 ? 'border-l-red-600 bg-red-50/10' : 'border-l-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Verifications</p>
              <p className={`text-3xl font-bold ${pendingAgencies > 0 ? 'text-red-600' : 'text-gray-900'}`}>{pendingAgencies}</p>
            </div>
            <Clock className={`w-8 h-8 ${pendingAgencies > 0 ? 'text-red-600' : 'text-gray-400'} opacity-20`} />
          </div>
        </Card>
      </div>

      {/* Tabs list */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('agencies')}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === 'agencies'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Agencies ({totalAgencies})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Platform Reports ({totalReports})
        </button>
        <button
          onClick={() => setActiveTab('bonus')}
          className={`py-3 px-6 font-bold border-b-2 transition-all ${
            activeTab === 'bonus'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Award Bonus Tokens
        </button>
      </div>

      {/* Tab contents */}
      <div>
        {/* Tab 1: Manage Agencies */}
        {activeTab === 'agencies' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Waste Collection Agencies</h2>
            {agencies.length === 0 ? (
              <Card className="text-center py-12 text-gray-500">No agencies registered on the platform.</Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {agencies.map((agency) => (
                  <Card key={agency._id} className="hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{agency.organizationName}</h3>
                        <p className="text-sm text-gray-600">Reg: {agency.registrationNumber || 'N/A'}</p>
                      </div>
                      <Badge variant={agency.verified ? 'success' : 'warning'}>
                        {agency.verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 mb-4 border-t pt-3">
                      <p>📍 {agency.address || 'N/A'}, {agency.lga}, {agency.state} State</p>
                      <p>📞 Phone: {agency.contactPhone || 'N/A'}</p>
                      <p>🌐 Admin contact: {agency.userId?.name} ({agency.userId?.email})</p>
                      <p>📦 Coverage areas: {agency.assignedAreas?.join(', ') || 'None'}</p>
                      <p>♻️ Categories: {agency.categories?.join(', ') || 'None'}</p>
                    </div>

                    {!agency.verified && (
                      <Button
                        onClick={() => handleVerifyAgency(agency._id)}
                        loading={verifyingId === agency._id}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        Approve & Verify Agency
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Platform Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Environmental Reports</h2>
            {reports.length === 0 ? (
              <Card className="text-center py-12 text-gray-500">No reports submitted on the platform.</Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report._id} className="hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{report.category}</Badge>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${REPORT_STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Submitted: {formatDate(report.createdAt)}</p>
                    </div>

                    <p className="text-gray-900 font-semibold mb-2">{report.description}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-3 mt-3">
                      <div>
                        <p>📍 {report.location?.address || 'N/A'}</p>
                        <p>LGA: {report.location?.lga}, {report.location?.state} State</p>
                      </div>
                      <div className="sm:text-right">
                        <p>Reporter: {report.reportedBy?.name || 'Deleted User'} ({report.reportedBy?.email || 'N/A'})</p>
                        <p>User ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs select-all">{report.reportedBy?._id || 'N/A'}</code></p>
                        {report.assignedAgency && <p>Assigned to: {report.assignedAgency.organizationName}</p>}
                      </div>
                    </div>

                    <div className="text-right border-t pt-3 mt-3">
                      <Link
                        to={`/reports/${report._id}`}
                        className="text-green-600 hover:text-green-700 font-bold text-sm inline-flex items-center gap-1"
                      >
                        View Full Details & Location →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Award Bonus */}
        {activeTab === 'bonus' && (
          <div className="max-w-xl mx-auto">
            <Card className="border-t-4 border-t-green-600 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-green-50 rounded-full mb-3 text-green-600">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Award Bonus Tokens</h2>
                <p className="text-gray-600 text-sm mt-1">Reward active citizens with extra tokens for clean-up participation.</p>
              </div>

              {bonusSuccess && <Alert type="success" message={bonusSuccess} className="mb-4" />}
              {bonusError && <Alert type="error" message={bonusError} onClose={() => setBonusError('')} className="mb-4" />}

              <form onSubmit={handleAwardBonus} className="space-y-4">
                <Input
                  label="Citizen User ID (from report details or DB)"
                  name="userId"
                  value={bonusForm.userId}
                  onChange={handleBonusChange}
                  required
                  placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
                />

                <Input
                  label="Token Amount"
                  name="amount"
                  type="number"
                  value={bonusForm.amount}
                  onChange={handleBonusChange}
                  required
                  placeholder="e.g. 25"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={bonusForm.description}
                    onChange={handleBonusChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                    placeholder="e.g. Special recognition for 10 verified reports"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={bonusLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Issue Bonus Reward
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
