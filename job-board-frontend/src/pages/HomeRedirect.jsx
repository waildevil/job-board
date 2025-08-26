import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';
import Home from './Home';

export default function HomeRedirect() {
  const navigate = useNavigate();
  const role = (getUserRole() || '').replace(/^ROLE_/, '').toUpperCase();

  useEffect(() => {
    if (role === 'RECRUITER') {
      navigate('/recruiter', { replace: true });
    }
  }, [role, navigate]);

  return role === 'RECRUITER' ? null : <Home />;
}
