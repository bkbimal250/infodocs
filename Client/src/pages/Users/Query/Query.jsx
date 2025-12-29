import { useState } from 'react';
import { HiPlus, HiCollection } from 'react-icons/hi';
import QueryList from './QueryList';
import SendQueries from './SendQueries';

/**
 * User Query Page
 * Main container that shows QueryList first with option to send new query
 * 
 * Flow:
 * 1. Shows QueryList by default (displays all queries already sent)
 * 2. "Send Query" button toggles to SendQueries form
 * 3. After successful submission, returns to QueryList
 */
const Query = () => {
  const [showSendForm, setShowSendForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Queries & Support</h1>
            <p className="text-gray-600">View your queries and submit new support requests</p>
          </div>
          <div className="flex gap-3">
            {showSendForm ? (
              <button
                onClick={() => setShowSendForm(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium shadow-sm hover:shadow-md transition-all"
              >
                <HiCollection className="w-5 h-5" />
                View Queries
              </button>
            ) : (
              <button
                onClick={() => setShowSendForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow-md transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Send Query
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {showSendForm ? (
          <SendQueries 
            onSuccess={() => {
              setShowSendForm(false);
              // Trigger refresh of QueryList
              setRefreshKey(prev => prev + 1);
            }} 
          />
        ) : (
          <QueryList key={refreshKey} />
        )}
      </div>
    </div>
  );
};

export default Query;

