import React, { useState, useRef, useEffect } from 'react';

function ApplicationStep2({ formData, onChange, job }) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange('cv', file);
    setTouched(true);
    setError(file ? '' : 'Please upload your CV.');
  };

  const handleContinue = () => {
    setTouched(true);
    if (!formData.cv) {
      setError('Please upload your CV.');
      return;
    }
    window.dispatchEvent(new CustomEvent('nextStep'));
  };

  useEffect(() => {
    if (touched && formData.cv) {
      setError('');
    }
  }, [formData.cv, touched]);

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#fefeff] to-[#f4f0f9] px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">

        
        <div className="flex-1 bg-white p-8 rounded-xl shadow flex flex-col justify-between">
          <div>
            <button
              className="text-sm text-blue-500 mb-6"
              onClick={() => window.dispatchEvent(new CustomEvent('prevStep'))}
            >
              &lt; Back
            </button>

            <p className="text-sm text-gray-500 mb-2">Step 2 of 4</p>
            <h1 className="text-xl font-bold mb-6">Upload your CV</h1>
            <p>Employers use your CV to determine whether you have the right experience for the job.</p>

            <div className="mt-4">
              
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="cv-upload"
              />

              
              <label
                htmlFor="cv-upload"
                className={`inline-block cursor-pointer bg-white border px-4 py-2 rounded-md shadow-sm
                  ${error ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700'}
                  hover:bg-gray-100 transition`}
              >
                Choose File
              </label>

              
              {formData.cv && (
                <p className="mt-2 text-sm text-green-700">{formData.cv.name}</p>
              )}

              
              {error && !formData.cv && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Next →
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

export default ApplicationStep2;
