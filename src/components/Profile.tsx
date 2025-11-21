import React, { useState, useEffect, useRef, ChangeEvent, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// User profile interface
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  walletAddress: string;
  bio: string;
  avatar: string | null;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  security: {
    lastLogin: string;
  };
}

// Validation errors interface
interface ValidationErrors {
  fullName?: string;
  email?: string;
  bio?: string;
}

// Toast notification interface
interface ToastNotification {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | '';
}

// Email verification interface
interface EmailVerification {
  isVerifying: boolean;
  verificationCode: string;
  enteredCode: string;
  newEmail: string;
  error: string;
}

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BIO_LENGTH = 500;
const MAX_NAME_LENGTH = 50;
const MIN_NAME_LENGTH = 2;
const VERIFICATION_CODE_LENGTH = 6;
const TOAST_DURATION = 3000;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User state
  const [user, setUser] = useState<UserProfile>({
    id: '1',
    fullName: 'MarsRunner',
    email: 'marsrunner@marsfrontier.com',
    walletAddress: '0x9c8F21a7D8C1b4A2c9E3F7A6B5C8D9E2F1A3B4C5',
    bio: 'Collector of frontier artifacts and Martian mission relics. Exploring the cosmos one artifact at a time.',
    avatar: null,
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
    },
    security: {
      lastLogin: '2024-01-15T14:30:00Z',
    },
  });

  const [originalUser, setOriginalUser] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState<ToastNotification>({ visible: false, message: '', type: '' });
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  
  // Email verification state
  const [emailVerification, setEmailVerification] = useState<EmailVerification>({
    isVerifying: false,
    verificationCode: '',
    enteredCode: '',
    newEmail: '',
    error: ''
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Memoized formatted wallet address
  const formattedWalletAddress = useMemo(() => {
    return `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-6)}`;
  }, [user.walletAddress]);

  // Memoized formatted date
  const formattedLastLogin = useMemo(() => {
    return new Date(user.security.lastLogin).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [user.security.lastLogin]);

  // Memoized bio character count with warning color
  const bioCharacterCount = useMemo(() => {
    const count = user.bio.length;
    return {
      count,
      isNearLimit: count > MAX_BIO_LENGTH - 50,
      isAtLimit: count >= MAX_BIO_LENGTH
    };
  }, [user.bio]);

  // Load user data from localStorage
  const loadUserData = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('marsPioneers_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setOriginalUser(parsedUser);
        if (parsedUser.avatar) {
          setAvatarPreview(parsedUser.avatar);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showNotification('Failed to load profile data', 'error');
    }
  }, []);

  // Save user data to localStorage
  const saveUserData = useCallback(async (userData: UserProfile) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('marsPioneers_user', JSON.stringify(userData));
      setOriginalUser(userData);
      setIsEditing(false);
      
      // Update global user state by triggering storage event
      window.dispatchEvent(new Event('storage'));
      
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving user data:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate form inputs
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    if (!user.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (user.fullName.length < MIN_NAME_LENGTH) {
      errors.fullName = `Full name must be at least ${MIN_NAME_LENGTH} characters`;
    } else if (user.fullName.length > MAX_NAME_LENGTH) {
      errors.fullName = `Full name must be less than ${MAX_NAME_LENGTH} characters`;
    }

    if (!user.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (user.bio.length > MAX_BIO_LENGTH) {
      errors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [user]);

  // Handle save button click
  const handleSave = useCallback(() => {
    if (!validateForm()) return;
    
    const userToSave = {
      ...user,
      avatar: avatarPreview || user.avatar,
    };
    
    saveUserData(userToSave);
  }, [user, avatarPreview, validateForm, saveUserData]);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    setUser(originalUser);
    setAvatarPreview(originalUser.avatar);
    setIsEditing(false);
    setValidationErrors({});
    setEmailVerification({
      isVerifying: false,
      verificationCode: '',
      enteredCode: '',
      newEmail: '',
      error: ''
    });
  }, [originalUser]);

  // Handle avatar image change
  const handleAvatarChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showNotification(`Image size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`, 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    // Read and preview image
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle input field changes
  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
    setIsEditing(true);
    
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [validationErrors]);

  // Handle preference toggle changes
  const handlePreferenceChange = useCallback((field: keyof UserProfile['preferences'], value: boolean) => {
    setUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
    setIsEditing(true);
  }, []);

  // Generate 6-digit verification code
  const generateVerificationCode = useCallback((): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  // Mock email sending function
  const sendEmail = useCallback((email: string, code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Verification code ${code} sent to ${email}`);
        resolve(true);
      }, 1000);
    });
  }, []);

  // Handle email input change with verification
  const handleEmailChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setUser(prev => ({ ...prev, email: newEmail }));
    setIsEditing(true);

    // Clear validation error when user starts typing
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }

    // Start verification process if email is new and valid
    if (newEmail !== originalUser.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      const verificationCode = generateVerificationCode();
      setEmailVerification({
        isVerifying: true,
        verificationCode,
        enteredCode: '',
        newEmail,
        error: ''
      });

      // Send verification code
      const success = await sendEmail(newEmail, verificationCode);
      if (!success) {
        setEmailVerification(prev => ({ ...prev, error: 'Failed to send verification code' }));
      }
    } else if (newEmail === originalUser.email) {
      // Reset verification if email is same as original
      setEmailVerification({
        isVerifying: false,
        verificationCode: '',
        enteredCode: '',
        newEmail: '',
        error: ''
      });
    }
  }, [originalUser.email, generateVerificationCode, sendEmail, validationErrors.email]);

  // Handle verification code input change
  const handleVerificationCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers and limit to verification code length
    if (/^\d*$/.test(value) && value.length <= VERIFICATION_CODE_LENGTH) {
      setEmailVerification(prev => ({ 
        ...prev, 
        enteredCode: value,
        error: ''
      }));
    }
  }, []);

  // Verify the entered code
  const verifyEmailCode = useCallback(() => {
    if (emailVerification.enteredCode === emailVerification.verificationCode) {
      setUser(prev => ({ ...prev, email: emailVerification.newEmail }));
      setEmailVerification({
        isVerifying: false,
        verificationCode: '',
        enteredCode: '',
        newEmail: '',
        error: ''
      });
      showNotification('Email verified successfully!', 'success');
    } else {
      setEmailVerification(prev => ({ ...prev, error: 'Invalid verification code' }));
    }
  }, [emailVerification]);

  // Cancel email verification
  const cancelEmailVerification = useCallback(() => {
    setUser(prev => ({ ...prev, email: originalUser.email }));
    setEmailVerification({
      isVerifying: false,
      verificationCode: '',
      enteredCode: '',
      newEmail: '',
      error: ''
    });
  }, [originalUser.email]);

  // Show wallet disconnect confirmation modal
  const handleDisconnectWallet = useCallback(() => {
    setShowDisconnectModal(true);
  }, []);

  // Confirm wallet disconnect and logout
  const confirmDisconnectWallet = useCallback(() => {
    // Clear user data from localStorage
    localStorage.removeItem('marsPioneers_user');
    
    // Dispatch storage event to update other components
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to homepage
    navigate('/');
  }, [navigate]);

  // Copy wallet address to clipboard
  const copyWalletAddress = useCallback(() => {
    navigator.clipboard.writeText(user.walletAddress);
    showNotification('Wallet address copied!', 'success');
  }, [user.walletAddress]);

  // Show notification toast
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setShowToast({ visible: true, message, type });
    setTimeout(() => setShowToast({ visible: false, message: '', type: '' }), TOAST_DURATION);
  }, []);

  // Reset avatar
  const resetAvatar = useCallback(() => {
    setAvatarPreview(originalUser.avatar);
    setIsEditing(true);
  }, [originalUser.avatar]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 pt-32 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {showToast.visible && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border transform transition-all duration-300 ${
          showToast.type === 'success' 
            ? 'bg-green-900/90 border-green-600 text-green-100' 
            : 'bg-red-900/90 border-red-600 text-red-100'
        }`}>
          <div className="flex items-center">
            {showToast.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {showToast.message}
          </div>
        </div>
      )}

      {/* Wallet Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Disconnect Wallet</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to disconnect your wallet? You will be logged out and redirected to the homepage.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDisconnectWallet}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-orange-400 hover:text-orange-300 transition-colors mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account preferences and settings</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Avatar Section */}
          <div className="p-8 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold relative overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : user.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold text-white">{user.fullName}</h2>
                <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                <div className="flex items-center justify-center sm:justify-start mt-2">
                  <div className="bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                    <span className="text-xs text-gray-400">Wallet: </span>
                    <span className="text-xs text-orange-400 font-mono">
                      {formattedWalletAddress}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Profile picture upload"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-orange-500/20 border border-orange-500/40 text-orange-200 rounded-lg hover:bg-orange-500/30 transition-colors text-sm font-medium"
                >
                  Change Photo
                </button>
                {avatarPreview && avatarPreview !== originalUser.avatar && (
                  <button
                    onClick={resetAvatar}
                    className="px-4 py-2 bg-gray-600/20 border border-gray-600/40 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors text-sm font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="p-8 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={user.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full bg-gray-900/50 border ${
                    validationErrors.fullName ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors`}
                  placeholder="Enter your full name"
                  maxLength={MAX_NAME_LENGTH}
                  aria-describedby={validationErrors.fullName ? "fullName-error" : undefined}
                />
                {validationErrors.fullName && (
                  <p id="fullName-error" className="text-red-400 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email Input with Verification */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={handleEmailChange}
                  className={`w-full bg-gray-900/50 border ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors`}
                  placeholder="Enter your email"
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-red-400 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.email}
                  </p>
                )}
                
                {/* Email Verification Section */}
                {emailVerification.isVerifying && (
                  <div className="mt-4 p-4 bg-gray-900/50 border border-orange-500/30 rounded-lg">
                    <p className="text-orange-400 text-sm font-medium mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Verify your new email address
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      We sent a 6-digit verification code to {emailVerification.newEmail}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={emailVerification.enteredCode}
                        onChange={handleVerificationCodeChange}
                        placeholder="Enter verification code"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                        maxLength={VERIFICATION_CODE_LENGTH}
                        aria-label="Verification code"
                      />
                      <button
                        onClick={verifyEmailCode}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        Verify
                      </button>
                    </div>
                    {emailVerification.error && (
                      <p className="text-red-400 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {emailVerification.error}
                      </p>
                    )}
                    <button
                      onClick={cancelEmailVerification}
                      className="text-gray-400 text-sm hover:text-gray-300 transition-colors mt-2"
                    >
                      Cancel verification
                    </button>
                  </div>
                )}
              </div>

              {/* Bio Textarea */}
              <div className="lg:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={user.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={`w-full bg-gray-900/50 border ${
                    validationErrors.bio ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors resize-none`}
                  placeholder="Tell us about yourself..."
                  maxLength={MAX_BIO_LENGTH}
                  aria-describedby={validationErrors.bio ? "bio-error" : "bio-count"}
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.bio && (
                    <p id="bio-error" className="text-red-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.bio}
                    </p>
                  )}
                  <p id="bio-count" className={`text-sm ml-auto ${
                    bioCharacterCount.isAtLimit ? 'text-red-400' : 
                    bioCharacterCount.isNearLimit ? 'text-orange-400' : 'text-gray-400'
                  }`}>
                    {bioCharacterCount.count}/{MAX_BIO_LENGTH}
                  </p>
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="lg:col-span-2">
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="walletAddress"
                    type="text"
                    value={user.walletAddress}
                    readOnly
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed font-mono text-sm"
                  />
                  <button
                    onClick={copyWalletAddress}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                    aria-label="Copy wallet address"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors whitespace-nowrap"
                    aria-label="Disconnect wallet"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="p-8 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account Settings
            </h3>
            
            <div className="space-y-4">
              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-gray-400 text-sm">Receive email updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                    aria-label="Toggle email notifications"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-gray-400 text-sm">Receive browser notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.preferences.pushNotifications}
                    onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                    aria-label="Toggle push notifications"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Information Section */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Security Information
            </h3>
            
            <div className="space-y-4">
              <div className="py-3 border-b border-gray-700/50">
                <p className="text-white font-medium mb-1">Last Login</p>
                <p className="text-gray-400 text-sm">{formattedLastLogin}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="p-8 bg-gray-900/50 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleCancel}
                disabled={isLoading || !isEditing}
                className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !isEditing}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium relative flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;