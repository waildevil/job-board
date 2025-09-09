import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserEmailFromToken, getUserNameFromToken } from '../utils/auth';
import axios from 'axios';
import ApplicationStep1 from './ApplicationStep1';
import ApplicationStep2 from './ApplicationStep2';
import ApplicationStep3 from './ApplicationStep3';
import ApplicationSummary from './ApplicationSummary';
import ApplicationStep4 from './ApplicationStep4';
import { API_URL } from '../services/config';

function JobApplicationForm() {
  const { id: jobId } = useParams();
  const email = getUserEmailFromToken();
  const nameFromToken = getUserNameFromToken();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: nameFromToken || '',
    phone: '',
    cv: null,
    coverLetter: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append('jobId', jobId);
    data.append('name', formData.name);
    data.append('email', email);
    data.append('phoneNumber', formData.phone);
    data.append('resume', formData.cv);
    if (formData.coverLetter) data.append('coverLetter', formData.coverLetter);

    try {
      setSubmitting(true);
      await axios.post(`/applications`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess(true); 
    } catch (err) {
      console.error(err);
      setSuccess(false); 
    } finally {
      setSubmitting(false);
      setStep(5);
    }
  };

  
  useEffect(() => {
    const next = () => setStep((prev) => Math.min(prev + 1, 4));
    const prev = () => setStep((prev) => Math.max(prev - 1, 1));
    const submit = () => handleSubmit();

    window.addEventListener('nextStep', next);
    window.addEventListener('prevStep', prev);
    window.addEventListener('submitApplication', submit);

    return () => {
      window.removeEventListener('nextStep', next);
      window.removeEventListener('prevStep', prev);
      window.removeEventListener('submitApplication', submit);
    };
  }, [formData, submitting]);

  
  useEffect(() => {
    axios.get(`/jobs/${jobId}`)
      .then(res => setJob(res.data))
      .catch(err => console.error('Failed to fetch job info', err));
  }, [jobId]);

  return (
    <div>
      {step === 1 && <ApplicationStep1 formData={formData} onChange={handleChange} job={job} />}
      {step === 2 && <ApplicationStep2 formData={formData} onChange={handleChange} job={job} />}
      {step === 3 && <ApplicationStep3 formData={formData} onChange={handleChange} job={job} />}
      {step === 4 && (
        <ApplicationSummary
          formData={formData}
          email={email}
          onBack={() => setStep(3)}
          job={job}
        />
      )}
      {step === 5 && <ApplicationStep4 success={success} job={job} />}
    </div>
  );
}

export default JobApplicationForm;
