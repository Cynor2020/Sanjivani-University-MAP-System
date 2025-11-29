import dotenv from "dotenv";
import fetch from "node-fetch";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";

dotenv.config();

const test = async () => {
  await connectDB();
  
  try {
    console.log("Testing API endpoint with authentication...");
    
    // First, let's login to get a token
    // For simplicity, let's just create a JWT token for a super admin
    const superAdmin = await User.findOne({ role: "super_admin" });
    console.log("Super admin:", superAdmin);
    
    if (superAdmin) {
      const token = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET);
      console.log("Generated token:", token);
      
      // Test the assign HOD endpoint with authentication
      const response = await fetch('http://localhost:5000/api/departments/692b279de8208434118ee467/assign-hod', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          hodId: '6925bbb11d267cce3c6ead08'
        })
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.raw());
      
      const result = await response.json();
      console.log("Response body:", result);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
};

test();