import React from 'react';
import { useNavigate } from 'react-router-dom';

function ApplicationStep4({ success, job }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#fefeff] to-[#f4f0f9] flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl bg-white p-10 rounded-xl shadow text-center space-y-4">
        {success ? (
          <>
            <h1 className="text-2xl font-bold text-green-600">Application Submitted!</h1>
            <p className="text-gray-700">You successfully applied to:</p>
            <h2 className="text-xl font-semibold">{job?.title}</h2>
            <p className="text-gray-500">{job?.companyName} — {job?.location}</p>
            <button
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/jobs')}
            >
              Back to Jobs
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600">Application Failed</h1>
            <p className="text-gray-700">You’ve already applied to this job:</p>
            <h2 className="text-xl font-semibold">{job?.title}</h2>
            <p className="text-gray-500">{job?.companyName} — {job?.location}</p>
            <button
              className="mt-6 px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => navigate('/jobs')}
            >
              Back to Jobs
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ApplicationStep4;
