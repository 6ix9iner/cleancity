import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reportAPI } from '../services/api';
import { Card, Badge, Loading, Alert, Button } from '../components/UI';
import { formatDate, formatDateTime, getErrorMessage } from '../utils/helpers';
import { REPORT_STATUS_COLORS, REPORT_STATUS } from '../constants';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await reportAPI.getById(id);
        setReport(response.data.data.report);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdateLoading(true);
    try {
      await reportAPI.updateStatus(id, newStatus);
      setReport((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportAPI.delete(id);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading />;

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message="Report not found" />
        <Link to="/dashboard" className="text-green-600 hover:text-green-700 mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isReporter = user?._id === report.reportedBy?._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {report.images?.length > 0 && (
            <Card>
              <div className="grid grid-cols-2 gap-4">
                {report.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Report ${index}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Report Details */}
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{report.category}</Badge>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${REPORT_STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                  {REPORT_STATUS[report.status]}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.category.replace(/_/g, ' ')}</h1>
              <p className="text-gray-600">Reported on {formatDateTime(report.createdAt)}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
            </div>

            {report.resolvedAt && (
              <div className="border-t mt-4 pt-4 bg-green-50 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✓ Resolved on {formatDateTime(report.resolvedAt)}</p>
              </div>
            )}
          </Card>

          {/* Location */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Location</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span> {report.location.address}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">LGA:</span> {report.location.lga}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">State:</span> {report.location.state}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Coordinates:</span> {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
              </p>
            </div>
          </Card>

          {/* Reporter Info */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Reported By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                {report.reportedBy?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{report.reportedBy?.name}</p>
                <p className="text-gray-600 text-sm">{report.reportedBy?.email}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div>
          {/* Status Card */}
          <Card className="mb-6 sticky top-20">
            <h3 className="font-bold text-lg mb-4">Report Status</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Current Status</p>
                <p className={`px-3 py-2 text-center font-bold rounded-lg ${REPORT_STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                  {REPORT_STATUS[report.status]}
                </p>
              </div>

              {report.tokenIssued && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 font-semibold">🎁 +{report.rewardToken || 10} Tokens Earned</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isReporter && report.status !== 'resolved' && report.status !== 'rejected' && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={updateLoading}
                >
                  Delete Report
                </Button>
              </div>
            )}

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t">
              <p className="font-bold text-sm mb-4 text-gray-600">Timeline</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-semibold text-gray-900">{formatDate(report.createdAt)}</p>
                </div>
                {report.verifiedAt && (
                  <div>
                    <p className="text-gray-600">Verified</p>
                    <p className="font-semibold text-gray-900">{formatDate(report.verifiedAt)}</p>
                  </div>
                )}
                {report.resolvedAt && (
                  <div>
                    <p className="text-gray-600">Resolved</p>
                    <p className="font-semibold text-gray-900">{formatDate(report.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Assigned Agency */}
          {report.assignedAgency && (
            <Card>
              <h3 className="font-bold text-lg mb-4">Assigned Agency</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                  {report.assignedAgency?.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{report.assignedAgency?.name}</p>
                  <p className="text-gray-600 text-sm">{report.assignedAgency?.email}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
