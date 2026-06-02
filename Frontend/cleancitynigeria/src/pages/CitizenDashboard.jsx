import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reportAPI, rewardAPI, authAPI } from '../services/api';
import { Card, Badge, Loading, Alert } from '../components/UI';
import { formatDate, truncateText, getErrorMessage } from '../utils/helpers';
import { REPORT_STATUS_COLORS } from '../constants';
import { MapPin, Award, FileText, TrendingUp } from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, statsRes] = await Promise.all([
          reportAPI.getMyReports({ limit: 10 }),
          authAPI.getStats(),
        ]);
        setReports(reportsRes.data.data.reports || []);
        setStats(statsRes.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600">Track your reports and earn rewards by helping keep your community clean.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalReports || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Token Balance</p>
              <p className="text-3xl font-bold text-gray-900">{user?.tokenBalance || 0}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">
                {reports.filter((r) => r.status === 'resolved').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {reports.filter((r) => r.status === 'in_progress').length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-orange-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Link to="/submit-report" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
          + Submit New Report
        </Link>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Recent Reports</h2>
        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No reports yet. Start by submitting a report!</p>
            <Link to="/submit-report" className="text-green-600 hover:text-green-700 font-semibold">
              Submit your first report
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report._id} className="hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary">{report.category}</Badge>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${REPORT_STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-900 font-semibold mb-1">{truncateText(report.description, 60)}</p>
                    <p className="text-gray-600 text-sm mb-2">
                      📍 {report.location.address || report.location.lga}, {report.location.state}
                    </p>
                    <p className="text-gray-500 text-xs">{formatDate(report.createdAt)}</p>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
