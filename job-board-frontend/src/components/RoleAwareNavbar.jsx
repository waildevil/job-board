import React from 'react';
import { useLocation } from 'react-router-dom';
import { getUserRole } from '../utils/auth';
import NavbarRecruiter from './NavbarRecruiter';
import Navbar from './Navbar';

export default function RoleAwareNavbar() {
  const role = getUserRole();
  const { pathname } = useLocation();

  
  if (pathname.startsWith('/recruiter') && role === 'RECRUITER') {
    return <NavbarRecruiter />;
  }


  return <Navbar />;
}
