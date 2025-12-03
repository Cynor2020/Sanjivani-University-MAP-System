import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Upload, Camera, User, Hash, Phone, Mail, Building, Calendar, Lock, X, AlertCircle } from "lucide-react";

export default function CreateStudent() {
  const [formData, setFormData] = useState({
    name: "",
    prn: "",
    mobile: "",
    email: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: ""
  });
  
  const [departments, setDepartments] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.department) {
      const dept = departments.find(d => d._id === formData.department);
      if (dept) {
        setAvailableYears(dept.years);
        if (!dept.years.includes(formData.year)) {
          setFormData(prev => ({ ...prev, year: "" }));
        }
      }
    } else {
      setAvailableYears([]);
      setFormData(prev => ({ ...prev, year: "" }));
    }
  }, [formData.department, departments]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
      const data = await res.json();
      if (res.ok) {
        setDepartments(data.departments || []);
      } else {
        toast.error(data.error || "Failed to fetch departments");
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error("Failed to fetch departments");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, JPG, or PNG)");
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      
      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setPreviewUrl("");
    const fileInput = document.getElementById('profile-photo-input');
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "prn") {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } 
    else if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    
    if (!formData.prn.trim()) {
      toast.error("PRN Number is required");
      return false;
    }
    
    if (!formData.mobile.trim()) {
      toast.error("Mobile Number is required");
      return false;
    }
    
    if (formData.mobile.length !== 10) {
      toast.error("Mobile Number must be exactly 10 digits");
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    if (!formData.department) {
      toast.error("Department is required");
      return false;
    }
    
    if (!formData.year) {
      toast.error("Year is required");
      return false;
    }
    
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    
    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      toast.error("Passwords do not match");
      return false;
    }
    
    if (!profilePhoto) {
      toast.error("Profile Photo is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("prn", formData.prn);
      formDataObj.append("mobile", formData.mobile);
      formDataObj.append("email", formData.email);
      formDataObj.append("department", formData.department);
      formDataObj.append("year", formData.year);
      formDataObj.append("password", formData.password);
      formDataObj.append("confirmPassword", formData.confirmPassword);
      
      formDataObj.append("profilePhoto", profilePhoto);
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register-student`, {
        method: "POST",
        body: formDataObj
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-4xl">
        {/* Required Fields Notice */}
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-800 font-medium text-sm">
              All fields are mandatory including Profile Photo
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-white p-8 text-center border-b border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="p-2">
                <img 
                  src="https://sanjivani.edu.in/images/SU%20LOGO.png" 
                  alt="Sanjivani University Logo"
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center"><span class="text-blue-600 font-bold text-xl">SU</span></div>';
                  }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-2">Student Registration</h1>
            <p className="text-gray-600 mt-2 text-base">Create your account to access the MAP System</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {previewUrl ? (
                  <>
                    <div className="h-32 w-32 rounded-full border-4 border-blue-500 shadow-lg overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Profile Preview" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeProfilePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-4 border-red-500 shadow-lg relative">
                    <Camera className="h-12 w-12 text-white" />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                      Required
                    </div>
                  </div>
                )}
                
                <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition shadow-lg">
                  <Upload className="h-5 w-5" />
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
              <p className={`text-sm mt-3 font-medium ${!profilePhoto ? 'text-red-600' : 'text-gray-600'}`}>
                {!profilePhoto ? '★ Profile Photo is required (Max 2MB)' : 'Profile Photo uploaded ✓'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <User className="inline h-4 w-4 mr-1 text-gray-500" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              {/* PRN Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Hash className="inline h-4 w-4 mr-1 text-gray-500" />
                  PRN Number *
                </label>
                <input
                  type="text"
                  name="prn"
                  value={formData.prn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
                  placeholder="Enter PRN"
                  required
                />
              </div>
              
              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Phone className="inline h-4 w-4 mr-1 text-gray-500" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter 10-digit mobile number"
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Mail className="inline h-4 w-4 mr-1 text-gray-500" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Building className="inline h-4 w-4 mr-1 text-gray-500" />
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="" className="text-gray-400">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1 text-gray-500" />
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                  required
                  disabled={!formData.department}
                >
                  <option value="" className="text-gray-400">Select Year</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year} Year</option>
                  ))}
                </select>
              </div>
              
              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Lock className="inline h-4 w-4 mr-1 text-gray-500" />
                  Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  placeholder="Enter password (min 8 characters)"
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 pt-6 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              
              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <Lock className="inline h-4 w-4 mr-1 text-gray-500" />
                  Confirm Password *
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 pt-6 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading || !profilePhoto}
                className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  isLoading || !profilePhoto ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition">
                  Login here
                </Link>
              </p>
              <p className="text-gray-400 text-xs mt-6">
                © 2025 Sanjivani University • Developed by CYNORTECH
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}