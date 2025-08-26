import React from 'react';

function ApplicationSummary({ formData, email, onBack, job }) {
  return (
    <div className="min-h-screen bg-gradient-to-t from-[#fefeff] to-[#f4f0f9] px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">

        
        <div className="flex-1 bg-white p-8 rounded-xl shadow flex flex-col justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-blue-500 mb-6"
            >
              &lt; Back
            </button>

            <p className="text-sm text-gray-500 mb-2">Step 4 of 4</p>
            <h1 className="text-xl font-bold mb-6">Review your Application</h1>

            <div className="space-y-2">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Resume:</strong> {formData.cv?.name}</p>
              <p><strong>Cover Letter:</strong> {formData.coverLetter?.name || 'None'}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('submitApplication'))}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Submit Application
            </button>
          </div>
        </div>

        
        <div className="w-full md:w-[280px] h-fit bg-white p-6 rounded-xl shadow space-y-2 text-sm self-start">
          <p className="text-gray-400">You are applying for</p>
          <h2 className="font-bold text-blue-900">{job?.title || 'No Title'}</h2>
          <p className="text-gray-700">{job?.companyName}</p>
          <p className="text-gray-700">{job?.location}</p>
        </div>

      </div>
    </div>
  );
}

export default ApplicationSummary;
