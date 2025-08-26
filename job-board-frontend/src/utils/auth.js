import {jwtDecode} from 'jwt-decode';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

export function getUserEmailFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return '';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.email || '';
  } catch (err) {
    return '';
  }
}

export const getUserNameFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || '';
  } catch {
    return '';
  }
};

export function getUserPhoneFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.phoneNumber || '';
  } catch {
    return '';
  }
}


export function isTokenExpired() {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  } catch (e) {
    return true;
  }
}



