import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/config';

function ApplicationStep1({ formData, onChange, job }) {
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);

  
  const COUNTRY_CODES = ['+49', '+212', '+33', '+1'];

  const [countryCode, setCountryCode] = useState('+49');
  const [number, setNumber] = useState('');

  useEffect(() => {
    
    const fetchPhoneFromProfile = async () => {
      try {
        const data = await fetchMe();
        if (data.phoneNumber) {
          const matchCode = COUNTRY_CODES.find(code => data.phoneNumber.startsWith(code));
          if (matchCode) {
            setCountryCode(matchCode);
            setNumber(data.phoneNumber.slice(matchCode.length));
            onChange('phone', data.phoneNumber);
          }
        }
      } catch (err) {
        console.error('Failed to prefill phone number:', err);
      }
    };

    if (!formData.phone) {
      fetchPhoneFromProfile();
    } else {
      const matchCode = COUNTRY_CODES.find(code => formData.phone.startsWith(code));
      if (matchCode) {
        setCountryCode(matchCode);
        setNumber(formData.phone.slice(matchCode.length));
      } else {
        setCountryCode('+49');
        setNumber(formData.phone.replace(/\D+/g, ''));
      }
    }
  }, [formData.phone]);

  const handleNameChange = (e) => {
    onChange('name', e.target.value);
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    onChange('phone', newCode + number);
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setNumber(onlyDigits);
    onChange('phone', countryCode + onlyDigits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#fefeff] to-[#f4f0f9] px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        
        <div className="flex-1 bg-white p-8 rounded-xl shadow flex flex-col justify-between">
          <div>
            <button
              className="text-sm text-blue-500 mb-6"
              onClick={() => navigate(-1)}
            >
              &lt; Back
            </button>

            <p className="text-sm text-gray-500 mb-2">Step 1 of 4</p>
            <h1 className="text-xl font-bold mb-6">What's your contact information?</h1>
            <p className="text-sm text-gray-600 mb-6">The employer will use this to get in touch.</p>

            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.name || ''}
                  onChange={handleNameChange}
                  required
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium">Phone number *</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="w-24 border rounded-lg px-2 py-2"
                  >
                    {COUNTRY_CODES.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className={`flex-1 border rounded-lg px-3 py-2 ${touched && !number ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                    value={number}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
                {touched && !number && (
                  <p className="text-red-500 text-sm mt-1">Phone number is required.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                setTouched(true);
                if (!formData.name || !number) return;
                window.dispatchEvent(new CustomEvent('nextStep'));
              }}
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

export default ApplicationStep1;
