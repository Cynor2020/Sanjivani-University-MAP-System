import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

export default function UploadCertificate() {
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    level: "",
    academicYear: "",
    eventName: "",
    eventDate: "",
    organizer: "",
    certificateNumber: "",
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories?isActive=true`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch current academic year
  const { data: academicYearData, isLoading: yearLoading } = useQuery({
    queryKey: ["academicYear"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/current`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (academicYearData?.year) {
      setFormData(prev => ({
        ...prev,
        academicYear: academicYearData.year
      }));
    }
  }, [academicYearData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file
      }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.categoryId || !formData.level || !formData.academicYear || !formData.file) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("categoryId", formData.categoryId);
      formDataObj.append("level", formData.level);
      formDataObj.append("academicYear", formData.academicYear);
      formDataObj.append("eventName", formData.eventName);
      formDataObj.append("eventDate", formData.eventDate);
      formDataObj.append("organizer", formData.organizer);
      formDataObj.append("certificateNumber", formData.certificateNumber);
      formDataObj.append("file", formData.file);
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/upload`, {
        method: "POST",
        credentials: "include",
        body: formDataObj
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Certificate uploaded successfully!");
        // Reset form
        setFormData({
          title: "",
          categoryId: "",
          level: "",
          academicYear: formData.academicYear,
          eventName: "",
          eventDate: "",
          organizer: "",
          certificateNumber: "",
          file: null
        });
        setPreviewUrl("");
      } else {
        toast.error(data.error || "Failed to upload certificate");
      }
    } catch (error) {
      toast.error("Failed to upload certificate: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = categoriesData?.categories || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Certificate</h1>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    placeholder="e.g., Participation in Hackathon"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Activity Category *</label>
                  {categoriesLoading ? (
                    <p>Loading categories...</p>
                  ) : (
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="college">College Level</option>
                    <option value="state">State Level</option>
                    <option value="national">National Level</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year *</label>
                  {yearLoading ? (
                    <p>Loading academic year...</p>
                  ) : (
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="e.g., 2025-26"
                      required
                    />
                  )}
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    placeholder="e.g., TechFest 2025"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Organizer</label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    placeholder="e.g., Sanjivani University"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Certificate Number</label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    placeholder="e.g., CERT-2025-001"
                  />
                </div>
              </div>
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Certificate File (PDF/JPEG/PNG) *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full border rounded p-2"
                required
              />
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  {formData.file?.type?.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="max-w-full h-48 object-contain border rounded" />
                  ) : (
                    <div className="border rounded p-4 text-center">
                      <p className="text-blue-600">PDF File Selected</p>
                      <p className="text-sm text-gray-500">{formData.file?.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Uploading..." : "Upload Certificate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Only PDF, JPEG, and PNG files are allowed</li>
            <li>File size must be less than 5MB</li>
            <li>Make sure all details are accurate before submitting</li>
            <li>Uploaded certificates will be reviewed by your mentor</li>
            <li>You can view the status of your certificates in "My Certificates"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}