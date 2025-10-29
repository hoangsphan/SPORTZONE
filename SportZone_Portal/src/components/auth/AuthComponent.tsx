import React, { useState } from 'react';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';
import RightSide from './RightSide';
import Header from '../Header';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'player' | 'fieldOwner' | null>(null);

  const handleRegisterClick = () => {
    setActiveTab('register');
    setShowRoleModal(true); // Show modal when Register tab is clicked
  };

  const handleRoleSelect = (role: 'player' | 'fieldOwner') => {
    setSelectedRole(role);
    setShowRoleModal(false); // Close modal after role selection
  };

  const handleCloseModal = () => {
    setShowRoleModal(false);
    setActiveTab('signin'); // Revert to sign-in if modal is closed without selection
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Nội dung dưới header: flex-grow để chiếm toàn bộ phần còn lại */}
      <div className="flex flex-grow">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#f5fafc] px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[#2f4f3f]">Chào mừng bạn đến với SportZone</h1>
            </div>

            <div className="flex space-x-6 mb-6 border-b border-gray-200 justify-center">
              <button
                className={`pb-2 font-medium text-sm ${
                  activeTab === 'signin'
                    ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]'
                    : 'text-gray-400 hover:text-[#2f4f3f]'
                }`}
                onClick={() => setActiveTab('signin')}
              >
               Đăng nhập
              </button>
              <button
                className={`pb-2 font-medium text-sm ${
                  activeTab === 'register'
                    ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]'
                    : 'text-gray-400 hover:text-[#2f4f3f]'
                }`}
                onClick={handleRegisterClick}
              >
                Đăng ký
              </button>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              {activeTab === 'signin' ? (
                <SignInForm />
              ) : selectedRole ? (
                <RegisterForm role={selectedRole} />
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 hidden md:flex">
          <RightSide />
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-[#2f4f3f] mb-4">Chọn vai trò để đăng ký</h2>
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-[#2f4f3f] text-white py-2 rounded-full text-sm font-semibold hover:bg-[#24412f]"
                onClick={() => handleRoleSelect('player')}
              >
                Người chơi
              </button>
              <button
                className="flex-1 bg-[#2f4f3f] text-white py-2 rounded-full text-sm font-semibold hover:bg-[#24412f]"
                onClick={() => handleRoleSelect('fieldOwner')}
              >
                Chủ sân
              </button>
            </div>
            <button
              className="w-full mt-4 text-gray-500 text-sm hover:underline"
              onClick={handleCloseModal}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;