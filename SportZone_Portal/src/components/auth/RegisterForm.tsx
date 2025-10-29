import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface RegisterFormProps {
  role: 'player' | 'fieldOwner'; // 'player' -> Customer, 'fieldOwner' -> Field Owner
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ role }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const roleNameMap: Record<RegisterFormProps['role'], string> = {
    player: 'Customer',
    fieldOwner: 'Field_Owner',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa lỗi của trường đang thay đổi
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): Partial<FormData> => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name) newErrors.name = 'Tên không được để trống';
    if (!formData.phone) newErrors.phone = 'Số điện thoại không được để trống';
    if (!formData.email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (
      formData.password.length < 10 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    ) {
      newErrors.password =
        'Mật khẩu phải dài ít nhất 10 ký tự và bao gồm chữ hoa, chữ thường và ký tự đặc biệt';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    };

    setLoading(true);

    try {
      await axios.post('https://localhost:7057/api/Register/register', {
        roleName: roleNameMap[role],
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dob: null,
        facId: null,
        image: null,
        startTime: null,
        endTime: null,
      });

      // Reset form và xóa lỗi sau khi đăng ký thành công
      setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
      setErrors({}); // ✅ Xóa tất cả lỗi xác thực
      setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập.');
      showToast('Đăng ký thành công!', 'success');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.response?.data?.message || 'Đã xảy ra lỗi không xác định';
      setApiError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#2f4f3f] capitalize">
        Đăng ký với vai trò {role === 'fieldOwner' ? 'Chủ sân' : 'Người chơi'}
      </h2>

      {apiError && <p className="text-sm text-red-600">{apiError}</p>}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

      {/* Tên */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Tên</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      {/* Mật khẩu */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Mật khẩu</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
      </div>

      {/* Xác nhận mật khẩu */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Xác nhận mật khẩu</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Nút đăng ký */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f] disabled:opacity-50"
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
    </form>
  );
};

export default RegisterForm;