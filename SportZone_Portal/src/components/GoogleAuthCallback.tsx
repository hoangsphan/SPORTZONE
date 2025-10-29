import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const user = query.get('user');
    const error = query.get('error');

    if (error) {
      alert(decodeURIComponent(error));
      navigate('/');
      return;
    }

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      navigate('/homepage');
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  return <div className="text-center p-10 text-gray-600">Đang xử lý đăng nhập...</div>;
};


export default GoogleAuthCallback;
