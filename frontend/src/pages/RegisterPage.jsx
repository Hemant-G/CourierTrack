import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router'; // Ensure this is 'react-router-dom'
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

  // Background image URL for the registration page
  const bgImageUrl = 'https://images.pexels.com/photos/5025643/pexels-photo-5025643.jpeg'; 
  // You can use a different URL if you want a unique image for this page

  // Validation functions (unchanged, copied from your provided code)
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

  // Get password strength (unchanged, copied from your provided code)
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

  // Handle field changes and validation (unchanged, copied from your provided code)
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
      default:
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

  // Redirect if already authenticated (unchanged)
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => { // Changed to receive event
    e.preventDefault(); // Prevent default form submission
    
    // Mark all fields as touched for validation display
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid()) {
      toast.error('Please fix the validation errors before submitting.');
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
    // Apply background image and color scheme to the main container
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      {/* Overlay for better readability of the form */}
      <div className="absolute inset-0 bg-slate-900 opacity-70"></div>

      {/* Registration Form Container - place it above the overlay with z-index */}
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-6">Create Your Account</h2>
        <p className="text-slate-600 mb-8 text-lg">Join us to start tracking your deliveries!</p>

        <form onSubmit={handleSubmit} className="space-y-6"> {/* Changed to form and added onSubmit */}
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left mb-1" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 ${
                touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
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
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 ${
                touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
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
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 ${
                touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
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
                  <span className="text-slate-600">Password strength:</span> {/* Changed text color */}
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
          <div> {/* Changed mb-6 to standard div margin */}
            <label className="block text-sm font-medium text-gray-700 text-left mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 ${
                touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
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
            <label className="block text-sm font-medium text-gray-700 text-left mb-1" htmlFor="role">
              Register as
            </label>
            <select
              id="role"
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              type="submit" // Changed type to submit
              // onClick={handleSubmit} // No need for onClick on button if form has onSubmit
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <p className="mt-8 text-md text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition duration-150 ease-in-out">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;