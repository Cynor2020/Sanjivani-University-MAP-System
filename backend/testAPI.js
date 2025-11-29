import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Department from "./models/Department.js";
import User from "./models/User.js";

dotenv.config();

const test = async () => {
  await connectDB();
  
  try {
    // Get a department
    const department = await Department.findOne({ name: "AIDS" });
    console.log("Department:", department);
    
    // Get an HOD
    const hod = await User.findOne({ role: "hod", name: "Ajay Singh" });
    console.log("HOD:", hod);
    
    if (department && hod) {
      console.log("Attempting to assign HOD to department...");
      
      // Try to assign HOD to department
      department.hod = hod._id;
      await department.save();
      console.log("Assigned HOD to department successfully");
      
      // Update user's department field
      hod.department = department.name;
      await hod.save();
      console.log("Updated HOD's department field successfully");
      
      // Check the updated department
      const updatedDepartment = await Department.findById(department._id).populate('hod', 'name email');
      console.log("Updated department:", updatedDepartment);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
};

test();