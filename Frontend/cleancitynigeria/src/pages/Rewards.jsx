import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rewardAPI } from '../services/api';
import { Card, Loading, Alert, Badge } from '../components/UI';
import { formatDate, getErrorMessage } from '../utils/helpers';
import { Award, Trophy, Zap } from 'lucide-react';

const Rewards = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewards, setRewards] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [activeTab, setActiveTab] = useState('tokens');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rewardsRes, tokensRes] = await Promise.all([
          rewardAPI.getMyRewards({ limit: 50 }),
          rewardAPI.getMyTokens({ limit: 50 }),
        ]);
        setRewards(rewardsRes.data.data.rewards || []);
        setTokens(tokensRes.data.data.tokens || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  const totalTokens = user?.tokenBalance || 0;
  const tokensByType = tokens.reduce((acc, token) => {
    acc[token.type] = (acc[token.type] || 0) + token.amount;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Rewards</h1>
        <p className="text-gray-600">Track your earned tokens and reward history</p>
      </div>

      {/* Token Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tokens</p>
              <p className="text-4xl font-bold text-yellow-600">{totalTokens}</p>
            </div>
            <Award className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-600 bg-gradient-to-r from-green-50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">From Reports</p>
              <p className="text-4xl font-bold text-green-600">{tokensByType.report_verification || 0}</p>
            </div>
            <Zap className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bonus Tokens</p>
              <p className="text-4xl font-bold text-purple-600">{tokensByType.bonus || 0}</p>
            </div>
            <Trophy className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'tokens'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Token History ({tokens.length})
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'rewards'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Rewards ({rewards.length})
        </button>
      </div>

      {/* Token History */}
      {activeTab === 'tokens' && (
        <div>
          {tokens.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600">No tokens earned yet. Start reporting environmental issues!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <Card key={token._id} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={token.type === 'bonus' ? 'warning' : 'success'}>
                        {token.type === 'report_verification' ? 'Report Verified' : 'Bonus'}
                      </Badge>
                      <span className="font-semibold text-gray-900">+{token.amount} tokens</span>
                    </div>
                    <p className="text-gray-600 text-sm">{token.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">{formatDate(token.createdAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rewards */}
      {activeTab === 'rewards' && (
        <div>
          {rewards.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600">No rewards yet. Keep earning tokens!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <Card key={reward._id} className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{reward.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">Cost: {reward.tokenCost} tokens</span>
                      <Badge>{reward.status || 'Available'}</Badge>
                    </div>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold whitespace-nowrap">
                    Claim
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">How to Earn Tokens</h3>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li>✓ Report environmental issues: 10 tokens per verified report</li>
          <li>✓ Provide helpful details and images: Bonus tokens for quality reports</li>
          <li>✓ Participate in community challenges: Extra rewards</li>
          <li>✓ Admin bonuses: Special achievements</li>
        </ul>
      </div>
    </div>
  );
};

export default Rewards;
