import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [debug, setDebug] = useState({});

  useEffect(() => {
    const href = window.location.href;
    const hash = window.location.hash;
    const search = window.location.search;

    console.log('[OAuthCallback] href:', href);
    console.log('[OAuthCallback] hash:', hash);
    console.log('[OAuthCallback] search:', search);


    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

    const tokenFromHash = hashParams.get('token');
    const tokenFromQuery = searchParams.get('token');
    const token = tokenFromHash || tokenFromQuery;

    console.log('[OAuthCallback] tokenFromHash:', tokenFromHash);
    console.log('[OAuthCallback] tokenFromQuery:', tokenFromQuery);

    setDebug({ href, hash, search, tokenFromHash, tokenFromQuery });

    if (token) {
      try {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        console.log('[OAuthCallback] decoded:', decoded);
        localStorage.setItem('role', decoded.role);
        localStorage.setItem('userId', decoded.userId);
        localStorage.setItem('name', decoded.name);
        localStorage.setItem('email', decoded.sub);
        navigate('/', { replace: true });
      } catch (e) {
        console.error('[OAuthCallback] decode/store error:', e);
 
      }
    } else {
      console.warn('[OAuthCallback] No token found, redirecting to /login');
      
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    }
  }, [navigate]);

  
  return (
    <pre style={{ padding: 16, background: '#f7fafc', color: '#1a202c', borderRadius: 8, overflowX: 'auto' }}>
      OAuth debug:
      {JSON.stringify(debug, null, 2)}
    </pre>
  );
}
