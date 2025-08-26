import React, { useEffect, useState } from 'react';
import { getMyJobs, getEmployerApplications } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [j, a] = await Promise.all([getMyJobs(), getEmployerApplications()]);
        setJobs(j);
        setApplications(a);
      } catch (e) {
        
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalApps = applications.length;
  const openJobs = jobs.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recruiter Dashboard</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate('/recruiter/post')}>Post a Job</button>
          <button className="px-4 py-2 border rounded" onClick={() => navigate('/recruiter/jobs')}>Manage Jobs</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Open Jobs</div>
            <div className="text-3xl font-semibold">{openJobs}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Total Applications</div>
            <div className="text-3xl font-semibold">{totalApps}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Last Job</div>
            <div className="text-lg">{jobs[0]?.title || '—'}</div>
          </div>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-2">Recent Applications</h2>
          <div className="space-y-3">
            {applications.slice(0, 5).map(ap => (
              <div key={ap.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{ap.applicantName}</div>
                  <div className="text-sm text-gray-600">{ap.jobTitle}</div>
                </div>
                <button onClick={() => navigate(`/recruiter/jobs/${ap.jobId}/applicants`)} className="px-3 py-1.5 border rounded">Open</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
