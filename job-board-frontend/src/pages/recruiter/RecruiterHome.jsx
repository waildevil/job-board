import React, { useEffect, useState, useMemo } from 'react';
import { getMyJobs, getEmployerApplications } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiEdit3, FiArrowRight } from 'react-icons/fi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function RecruiterHome() {
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [j, a] = await Promise.all([getMyJobs(), getEmployerApplications()]);
        setJobs(Array.isArray(j) ? j : []);
        setApps(Array.isArray(a) ? a : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

 
  const sortedJobs = useMemo(
    () =>
      [...jobs].sort(
        (a, b) =>
          (b?.createdAt ? new Date(b.createdAt).getTime() : 0) -
          (a?.createdAt ? new Date(a.createdAt).getTime() : 0)
      ),
    [jobs]
  );

  const sortedApps = useMemo(
    () =>
      [...apps].sort(
        (a, b) =>
          (b?.appliedAt ? new Date(b.appliedAt).getTime() : 0) -
          (a?.appliedAt ? new Date(a.appliedAt).getTime() : 0)
      ),
    [apps]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
     
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-6">
        <div className="rounded-3xl p-6 md:p-8 bg-white/60 backdrop-blur border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back<span className="text-blue-700">.</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your postings, review applicants, and fill roles faster.
              </p>
            </div>
            
            <div>
              <button
                onClick={() => navigate('/recruiter/post')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Post a Job
              </button>
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Stat icon={FiBriefcase} label="Open Jobs" value={loading ? '—' : sortedJobs.length} />
            <Stat icon={FiUsers} label="Applications" value={loading ? '—' : sortedApps.length} />
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white/70 backdrop-blur rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Your Jobs</h2>
              {!loading && sortedJobs[0]?.title && (
                <div className="text-xs text-gray-500 mt-0.5">
                  Most recent: {sortedJobs[0].title}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="text-sm text-blue-700 hover:underline flex items-center gap-1"
            >
              View all <FiArrowRight />
            </button>
          </div>

          {loading ? (
            <Empty text="Loading jobs…" />
          ) : sortedJobs.length === 0 ? (
            <Empty
              text="No jobs yet. Create your first posting."
              actionLabel="Post Job"
              onAction={() => navigate('/recruiter/post')}
            />
          ) : (
            <ul className="divide-y">
              {sortedJobs.slice(0, 6).map((j) => (
                <li key={j.id} className="px-5 py-4 flex items-start justify-between gap-3 hover:bg-white">
                  <div>
                    <div className="font-medium">{j.title}</div>
                    <div className="text-sm text-gray-600">
                      {j.location || '—'} • {j.type || '—'} {j.category ? `• ${j.category}` : ''}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {j.createdAt ? dayjs(j.createdAt).fromNow() : '—'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm flex items-center gap-2"
                      onClick={() => navigate('/recruiter/post', { state: { job: j } })}
                    >
                      <FiEdit3 /> Edit
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                      onClick={() => navigate(`/recruiter/jobs/${j.id}/applicants`)}
                    >
                      Applicants
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        
        <div className="bg-white/70 backdrop-blur rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold">Recent Applications</h2>
          </div>

          {loading ? (
            <Empty text="Loading applications…" />
          ) : sortedApps.length === 0 ? (
            <Empty text="No applications yet." />
          ) : (
            <ul className="divide-y">
              {sortedApps.slice(0, 8).map((a) => (
                <li key={a.id} className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-white">
                  <div>
                    <div className="font-medium">{a.applicantName}</div>
                    <div className="text-sm text-gray-600">
                      {a.jobTitle}
                      {a.companyName ? ` • ${a.companyName}` : ''} •{' '}
                      {a.appliedAt ? dayjs(a.appliedAt).fromNow() : '—'}
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                    onClick={() => navigate(`/recruiter/jobs/${a.jobId}/applicants`)}
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
          <Icon className="text-xl" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Empty({ text, actionLabel, onAction }) {
  return (
    <div className="px-5 py-10 text-center text-gray-500">
      <p>{text}</p>
      {actionLabel && onAction && (
        <button
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
