import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { UserPlus, Upload, Camera, AlertCircle } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    department: "",
    year: "",
    prn: "",
    name: "",
    email: "",
    mobile: "",
    whatsapp: "",
    password: "",
    confirmPassword: ""
  });
  const [departments, setDepartments] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Redirect to the new student registration page
    nav("/create-student");
  }, [nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-2xl text-center">
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Redirecting...</CardTitle>
            <p className="text-blue-100 mt-2 text-lg">We're redirecting you to the new student registration page</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <p className="text-gray-700 mb-6">
              A new improved student registration page is now available. You will be automatically redirected.
            </p>
            <Button 
              onClick={() => nav("/create-student")}
              className="w-full py-4 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg"
            >
              Go to New Registration Page
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col p-8 pt-0 space-y-4 bg-gray-50">
            <div className="text-center text-sm">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Already have an account? Login here
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p className="font-medium">Developed by <span className="text-blue-600 font-bold">CYNOR Team SET</span></p>
              <p className="mt-1">© {new Date().getFullYear()} Sanjivani University</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
