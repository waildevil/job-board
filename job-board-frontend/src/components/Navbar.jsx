import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { isTokenExpired, getUserRole } from '../utils/auth';
import { toast } from 'react-toastify';



function Navbar() {
  const [email, setEmail] = useState(null);
  const [name, setName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const role = getUserRole();

  useEffect(() => {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired()) {
    if (!sessionStorage.getItem('toastShown')) {
      toast.info('Session expired. Please login again.');
      sessionStorage.setItem('toastShown', 'true');
    }
    localStorage.clear();
    setEmail(null);
    setName('');
    return;
  }

 
  fetch('http://localhost:8080/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    })
    .then(data => {
      setName(data.name || 'User');
      setEmail(data.email || localStorage.getItem('email') || null); 
    
      if (data.email) localStorage.setItem('email', data.email);
      if (data.name) localStorage.setItem('name', data.name);
    })
    .catch(err => {
      console.error('User fetch error:', err);
     
      setName(localStorage.getItem('name') || 'User');
      setEmail(localStorage.getItem('email') || null);
    });
}, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setEmail(null);
    setName('');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-600 tracking-wide"
        >
          Job Board
        </Link>

        {email ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <FaUserCircle className="text-4xl text-blue-600" />
              <span className="font-medium text-gray-800 text-base">{name}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-md shadow-lg z-50">
                <div className="px-4 py-3 text-sm text-gray-600 border-b">{email}</div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                {role === 'CANDIDATE' && (
                <Link
                  to="/my-applications"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  My Applications
                </Link>)}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 transition"
          >
            Login
          </Link>
        )}
      </div>
</nav>
  );
}

export default Navbar;
