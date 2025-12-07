import React from 'react';
import { CallSession, CallResult } from '../../types';
import { Flex, Card } from '../ui/Layout';
import { ResultBadge, Badge } from '../ui/Badge';
import { Phone, CheckCircle, XCircle, TrendingUp, ChevronRight, Search, UploadCloud, Plus } from 'lucide-react';

interface DashboardProps {
  sessions: CallSession[];
  onSelectSession: (id: string) => void;
  onUploadClick: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ sessions, onSelectSession, onUploadClick }) => {
  const stats = {
    total: sessions.length,
    success: sessions.filter(s => s.result === CallResult.Success).length,
    fail: sessions.filter(s => s.result === CallResult.Fail).length,
  };

  const successRate = Math.round((stats.success / stats.total) * 100) || 0;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <Flex align="center" justify="between">
        <Flex direction="column" gap={2}>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your sales calls and performance metrics.</p>
        </Flex>
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          <UploadCloud size={18} />
          <span>New Analysis</span>
        </button>
      </Flex>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Flex direction="column" gap={2}>
            <span className="text-sm font-medium text-gray-500">Total Calls</span>
            <Flex align="center" gap={2}>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Phone size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </Flex>
          </Flex>
        </Card>
        <Card className="p-4">
          <Flex direction="column" gap={2}>
            <span className="text-sm font-medium text-gray-500">Success Rate</span>
            <Flex align="center" gap={2}>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <TrendingUp size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{successRate}%</span>
            </Flex>
          </Flex>
        </Card>
        <Card className="p-4">
          <Flex direction="column" gap={2}>
            <span className="text-sm font-medium text-gray-500">Meetings Booked</span>
            <Flex align="center" gap={2}>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <CheckCircle size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.success}</span>
            </Flex>
          </Flex>
        </Card>
        <Card className="p-4">
          <Flex direction="column" gap={2}>
            <span className="text-sm font-medium text-gray-500">Failed/Rejected</span>
            <Flex align="center" gap={2}>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <XCircle size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.fail}</span>
            </Flex>
          </Flex>
        </Card>
      </div>

      {/* Call List */}
      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Calls</h2>
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Source (Context)</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Result</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr 
                  key={session.id} 
                  onClick={() => onSelectSession(session.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    {/* FIXED: Accessed customer_company.name correctly */}
                    <span className="font-medium text-gray-900">{session.customer_company.name}</span>
                  </td>
                  <td className="px-6 py-4">
                     <Badge variant="outline" className="text-xs bg-white">
                        {session.context.source.replace(/_/g, ' ')}
                     </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{session.date}</td>
                  <td className="px-6 py-4">
                    <ResultBadge result={session.result} />
                  </td>
                  <td className="px-6 py-4 text-gray-400 group-hover:text-blue-500">
                    <ChevronRight size={18} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};