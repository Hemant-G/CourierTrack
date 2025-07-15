import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateUsername = (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters long';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Username can only contain small letters, numbers, and underscores';
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*])/.test(value)) return 'Password must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  };

  // Get password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*]/.test(password)
    ];
    
    score = checks.filter(Boolean).length;
    
    if (score <= 2) return { strength: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { strength: score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { strength: score, label: 'Good', color: 'bg-blue-500' };
    return { strength: score, label: 'Strong', color: 'bg-green-500' };
  };

  // Handle field changes and validation
  const handleFieldChange = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'username':
        setUsername(value);
        error = validateUsername(value);
        break;
      case 'email':
        setEmail(value);
        error = validateEmail(value);
        break;
      case 'password':
        setPassword(value);
        error = validatePassword(value);
        // Also revalidate confirm password if it exists
        if (confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: value !== confirmPassword ? 'Passwords do not match' : ''
          }));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        error = validateConfirmPassword(value);
        break;
      case 'role':
        setRole(value);
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const isFormValid = () => {
    const newErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword)
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async () => {
    
    // Mark all fields as touched for validation display
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);

    // Call the register function from context
    const success = await register(username, email, password, role);

    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>
        <div>
          {/* Username Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                touched.username && errors.username ? 'border-red-500' : ''
              }`}
              placeholder="Choose a username"
              value={username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              required
            />
            {touched.username && errors.username && (
              <p className="text-red-500 text-xs italic mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                touched.email && errors.email ? 'border-red-500' : ''
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              required
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                touched.password && errors.password ? 'border-red-500' : ''
              }`}
              placeholder="********"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              required
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>
            )}
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.label === 'Weak' ? 'text-red-600' :
                    passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                    passwordStrength.label === 'Good' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''
              }`}
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              required
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Register as
            </label>
            <select
              id="role"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="courier">Courier</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;