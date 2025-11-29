import dotenv from "dotenv";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

dotenv.config();

const test = async () => {
  try {
    console.log("Testing assign HOD...");
    
    // First, login to get a token
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
    
    const loginResult = await loginResponse.json();
    console.log("Login result:", loginResult);
    
    // Get cookies from the response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log("Cookies set:", cookies);
    
    // Extract the token from the cookie
    const tokenCookie = cookies[0];
    const tokenStart = tokenCookie.indexOf('token=') + 6;
    const tokenEnd = tokenCookie.indexOf(';', tokenStart);
    const token = tokenCookie.substring(tokenStart, tokenEnd);
    console.log("Token:", token);
    
    // Test the assign HOD endpoint
    const assignHodResponse = await fetch('http://localhost:5000/api/departments/692b279de8208434118ee467/assign-hod', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      },
      body: JSON.stringify({
        hodId: '6925bbb11d267cce3c6ead08'
      })
    });
    
    console.log("Assign HOD response status:", assignHodResponse.status);
    console.log("Assign HOD response headers:", assignHodResponse.headers.raw());
    
    const assignHodResult = await assignHodResponse.json();
    console.log("Assign HOD result:", assignHodResult);
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
};

test();