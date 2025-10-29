/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

type ForgotStep = "email" | "otp" | "new-password";

const showToast = (message: string, type: "success" | "error" = "success") => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};

const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Định dạng email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (
      formData.password.length < 10 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    ) {
      newErrors.password =
        "Mật khẩu phải dài ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      setLoading(true);

      const response = await axios.post(
        "https://localhost:7057/api/Authentication/Login",
        {
          uEmail: formData.email,
          uPassword: formData.password,
        }
      );

      const { token, user, facilityInfo } = response.data;

      let name = user.name || "";
      let phone = user.phone || "";
      if (!name || !phone) {
        if (user.Admin) {
          name = name || user.Admin.name || "";
          phone = phone || user.Admin.phone || "";
        }
        if (user.Customer) {
          name = name || user.Customer.name || "";
          phone = phone || user.Customer.phone || "";
        }
        if (user.Customers && user.Customers.length > 0) {
          name = name || user.Customers[0].name || "";
          phone = phone || user.Customers[0].phone || "";
        }
        if (user.FieldOwner) {
          name = name || user.FieldOwner.name || "";
          phone = phone || user.FieldOwner.phone || "";
        }
        if (user.Staff) {
          name = name || user.Staff.name || "";
          phone = phone || user.Staff.phone || "";
        }
      }
      const userToStore = {
        UId: user.uId || user.UId,
        RoleId: user.roleId || 0,
        UEmail: user.uEmail || user.UEmail,
        UPassword: user.uPassword || user.UPassword,
        UStatus: user.uStatus || user.UStatus || "Active",
        UCreateDate:
          user.uCreateDate || user.UCreateDate || new Date().toISOString(),
        IsExternalLogin: user.isExternalLogin ?? false,
        IsVerify: user.isVerify ?? true,
        Admin: user.Admin ?? null,
        Customers: user.Customers ?? [],
        ExternalLogins: user.ExternalLogins ?? [],
        FieldOwner: user.fieldOwner ?? null,
        Notifications: user.notifications ?? [],
        Role: user.Role ?? null,
        Staff: user.Staff ?? null,
        avatarUrl:
          user.avatarUrl ||
          "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/anh-den-ngau.jpeg",
        Bookings: user.bookings ?? [],
        Orders: user.orders ?? [],
        Payments: user.payments ?? [],
        name,
        phone,
      };

      console.log("User to store:", userToStore);
      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem("facilityInfo", JSON.stringify(facilityInfo));

      showToast("Đăng nhập thành công!");

      const userStorage = JSON.parse(localStorage.getItem("user") || "{}");

      // Điều hướng theo RoleId
      if (userStorage.RoleId === 3) {
        // Admin navigate to users_manager
        navigate("/users_manager");
      } else if (userStorage.RoleId === 2) {
        // Field Owner navigate to facility_manager
        navigate("/facility_manager");
      } else if (userStorage.RoleId === 1) {
        // Customer navigate to homepage
        navigate("/homepage");
      } else if (userStorage.RoleId === 4) {
        // Staff navigate to weekly_schedule
        navigate("/weekly_schedule");
      } else {
        navigate("/homepage");
      }

      console.log("Signed in user:", userToStore);
      console.log("Facility Info:", facilityInfo);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Đăng nhập thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://localhost:7057/api/Authentication/googlelogin";
  };

  const handleForgotPasswordSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("https://localhost:7057/api/ForgotPassword/send-code", {
        email: forgotEmail,
      });
      showToast("Mã OTP đã được gửi về email!");
      setForgotStep("otp");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Gửi mã thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async () => {
    setLoading(true);
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu không khớp!", "error");
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        "https://localhost:7057/api/ForgotPassword/verify-code",
        {
          code: otp,
          newPassword,
          confirmPassword,
        }
      );
      showToast("Đặt lại mật khẩu thành công!");
      setShowForgotModal(false);
      setForgotStep("email");
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Đặt lại mật khẩu thất bại",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="signin-email"
            className="block text-sm font-medium text-gray-500 mb-1"
          >
            E-mail
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleChange}
            required
            className={`block w-full rounded-md border py-2 px-4 text-sm ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signin-password"
            className="block text-sm font-medium text-gray-500 mb-1"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="@#*%"
              value={formData.password}
              onChange={handleChange}
              required
              className={`block w-full rounded-md border py-2 px-4 pr-12 text-sm ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={togglePassword}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              <i
                className={`far ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <label className="flex items-center space-x-2">
            <input
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-3.5 h-3.5"
            />
            <span>Nhớ mật khẩu</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-[#2f4f3f] font-semibold underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f]"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-2 bg-white border border-gray-300 text-gray-800 py-2 rounded-full text-sm font-medium hover:bg-gray-100 flex items-center justify-center space-x-2"
        >
          <i className="fab fa-google"></i>
          <span>{loading ? "Đợi một chút..." : "Đăng nhập với Google"}</span>
        </button>
      </form>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
            {forgotStep === "email" && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Thay đổi mật khẩu
                </h2>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="text-sm px-4 py-2 bg-gray-200 rounded"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleForgotPasswordSubmit}
                    disabled={loading}
                    className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded"
                  >
                    {loading ? "Đang gửi..." : "Gửi mã"}
                  </button>
                </div>
              </>
            )}

            {forgotStep === "otp" && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Nhập OTP và mật khẩu mới
                </h2>
                <input
                  type="text"
                  placeholder="Nhập mã OTP 6 số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  maxLength={6}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setForgotStep("email")}
                    className="text-sm px-4 py-2 bg-gray-200 rounded"
                  >
                    Trở lại
                  </button>
                  <button
                    onClick={handleNewPasswordSubmit}
                    disabled={loading}
                    className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded"
                  >
                    {loading ? "Đang xác nhận..." : "Xác nhận & Lưu"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SignInForm;
