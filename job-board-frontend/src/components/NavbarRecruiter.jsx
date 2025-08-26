import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { FiBriefcase, FiMenu, FiX } from 'react-icons/fi';
import { isTokenExpired } from '../utils/auth';
import { toast } from 'react-toastify';

export default function NavbarRecruiter() {
  const [email, setEmail] = useState(null);
  const [name, setName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired()) {
      if (!sessionStorage.getItem('toastShown')) {
        toast.info('Session expired. Please login again.');
        sessionStorage.setItem('toastShown', 'true');
      }
      localStorage.clear();
      setEmail(null); setName('');
      return;
    }
    fetch('http://localhost:8080/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(d => {
        setName(d.name || 'Recruiter');
        setEmail(d.email || localStorage.getItem('email') || null);
        if (d.email) localStorage.setItem('email', d.email);
        if (d.name) localStorage.setItem('name', d.name);
      })
      .catch(() => {
        setName(localStorage.getItem('name') || 'Recruiter');
        setEmail(localStorage.getItem('email') || null);
      });
  }, [location]);

  useEffect(() => {
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };

  const linkBase = 'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition';
  const linkIdle = 'text-gray-600 hover:text-blue-700 hover:bg-blue-50';
  const linkActive = 'text-blue-700 bg-blue-50 ring-1 ring-blue-100';

  return (
    <nav className="bg-white shadow-md">
    
      <div className="max-w-screen-xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/recruiter" className="text-3xl font-extrabold text-blue-600 tracking-wide">JobBoard</Link>
          <span className="hidden md:inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Recruiter</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <NavLink
            to="/recruiter/jobs"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <FiBriefcase className="text-base" />
            My Jobs
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(s => !s)} aria-label="Toggle menu">
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>

          {email ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(s => !s)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100">
                <FaUserCircle className="text-4xl text-blue-600" />
                <span className="hidden sm:inline font-medium text-gray-800 text-base">{name}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3 text-sm text-gray-600 border-b">{email}</div>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-block text-sm bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700">Login</Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex flex-col gap-2">
            <NavLink
              to="/recruiter/jobs"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              onClick={() => setMobileOpen(false)}
            >
              <FiBriefcase />
              My Jobs
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
