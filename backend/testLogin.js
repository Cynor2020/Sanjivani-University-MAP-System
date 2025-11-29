import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const test = async () => {
  try {
    console.log("Testing login...");
    
    // Test the login endpoint
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'dean@sanjivaniuniversity.edu.in',
        password: 'dean123'
      })
    });
    
    console.log("Login response status:", loginResponse.status);
    console.log("Login response headers:", loginResponse.headers.raw());
    
    const loginResult = await loginResponse.json();
    console.log("Login result:", loginResult);
    
    // Get cookies from the response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log("Cookies set:", cookies);
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
};

test();