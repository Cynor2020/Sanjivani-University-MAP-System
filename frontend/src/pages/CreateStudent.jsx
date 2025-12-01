import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Upload, Camera, User, Hash, Phone, Mail, Building, Calendar, Lock, X } from "lucide-react";

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
        // Reset year selection if it's not in the available years
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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, JPG, or PNG)");
        return;
      }
      
      // Validate file size (2MB max)
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
    // Reset file input
    const fileInput = document.getElementById('profile-photo-input');
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for PRN to convert to uppercase
    if (name === "prn") {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } 
    // Special handling for mobile to only allow digits
    else if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Check all required fields
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
    
    // Check if passwords match (trim both values before comparing)
    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      toast.error("Passwords do not match");
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
      
      if (profilePhoto) {
        formDataObj.append("profilePhoto", profilePhoto);
      }
      
      // Log data being sent for debugging
      console.log("Sending registration data:", {
        name: formData.name,
        prn: formData.prn,
        mobile: formData.mobile,
        email: formData.email,
        department: formData.department,
        year: formData.year,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* University Header */}
      <div className="bg-[#0B1A42] text-white border-b-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="https://sanjivani.edu.in/img/SU_Logo.webp" 
              alt="Sanjivani University Logo" 
              className="w-16 h-16 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">SANJIVANI UNIVERSITY</h1>
              <p className="text-xs md:text-sm text-amber-300">At Kopargaon, Dist: Ahilyanagar, Maharashtra-423601</p>
            </div>
          </div>
          <div className="text-right text-xs md:text-sm">
            <p className="text-amber-400 font-semibold">Student Registration Portal</p>
            <p className="text-sm">Academic Year 2025-2026</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 py-8 px-6 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Student Registration</h1>
              <p className="text-blue-100 mt-2">Create your account to access the MAP System</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  {previewUrl ? (
                    <>
                      <img 
                        src={previewUrl} 
                        alt="Profile Preview" 
                        className="h-32 w-32 rounded-full object-cover border-4 border-amber-500 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-4 border-amber-500 shadow-lg">
                      <Camera className="h-12 w-12 text-white" />
                    </div>
                  )}
                  
                  <label className="absolute bottom-2 right-2 bg-amber-500 text-white p-2 rounded-full cursor-pointer hover:bg-amber-600 transition shadow-lg">
                    <Upload className="h-5 w-5" />
                    <input
                      id="profile-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-3">Upload Profile Photo (Optional, Max 2MB)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                {/* PRN Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    PRN Number *
                  </label>
                  <input
                    type="text"
                    name="prn"
                    value={formData.prn}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition uppercase"
                    placeholder="Enter PRN"
                    required
                  />
                </div>
                
                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength="10"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter 10-digit mobile number"
                    required
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Year *
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                    required
                    disabled={!formData.department}
                  >
                    <option value="">Select Year</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year} Year</option>
                    ))}
                  </select>
                </div>
                
                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-12"
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
                    <Lock className="inline h-4 w-4 mr-1" />
                    Confirm Password *
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-12"
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
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02] ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/login" className="text-blue-700 hover:text-blue-900 font-medium hover:underline">
                  Already have an account? Login here
                </Link>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p className="font-medium">Developed by <span className="text-blue-700 font-bold">CYNOR Team SET</span></p>
            <p className="mt-1">
              <a href="https://cynortech.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                cynortech.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}