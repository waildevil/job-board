import React, { useEffect, useState } from 'react';
import { fetchMyApplications } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';


dayjs.extend(relativeTime);

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMyApplications();
        
        const sorted = [...data].sort(
          (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
        );
        setApplications(sorted);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          My Applications
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven't applied to any jobs yet.
          </p>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div
                key={app.applicationId}
                className="bg-white rounded-2xl shadow hover:shadow-md transition-all p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                      {app.companyName}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      {app.location}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end">
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        app.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : app.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied {dayjs(app.appliedAt).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
