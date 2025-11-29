import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const test = async () => {
  try {
    console.log("Testing API endpoint...");
    
    // Test the assign HOD endpoint
    const response = await fetch('http://localhost:5000/api/departments/692b279de8208434118ee467/assign-hod', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hodId: '6925bbb11d267cce3c6ead08'
      })
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers.raw());
    
    const result = await response.json();
    console.log("Response body:", result);
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
};

test();