import { storage } from "./storage";
import { hashPassword } from "./auth";

async function setupTestAccounts() {
  try {
    console.log("Setting up test accounts...");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const admin = await storage.createUser({
      name: "Admin User",
      email: "admin@leaveflow.com",
      password: adminPassword,
      role: "admin",
      totalLeave: 25,
      remainingLeave: 25,
    });
    console.log("✅ Admin account created:", admin.email, "Password: admin123");

    // Create regular employee
    const employeePassword = await hashPassword("employee123");
    const employee = await storage.createUser({
      name: "John Employee",
      email: "employee@leaveflow.com",
      password: employeePassword,
      role: "employee",
      totalLeave: 20,
      remainingLeave: 20,
    });
    console.log("✅ Employee account created:", employee.email, "Password: employee123");

    // Create additional test employees
    const employee2Password = await hashPassword("employee123");
    const employee2 = await storage.createUser({
      name: "Jane Smith",
      email: "jane@leaveflow.com",
      password: employee2Password,
      role: "employee",
      totalLeave: 18,
      remainingLeave: 18,
    });
    console.log("✅ Employee account created:", employee2.email, "Password: employee123");

    const employee3Password = await hashPassword("employee123");
    const employee3 = await storage.createUser({
      name: "Mike Johnson",
      email: "mike@leaveflow.com",
      password: employee3Password,
      role: "employee",
      totalLeave: 22,
      remainingLeave: 22,
    });
    console.log("✅ Employee account created:", employee3.email, "Password: employee123");

    const employee4Password = await hashPassword("employee123");
    const employee4 = await storage.createUser({
      name: "Sarah Wilson",
      email: "sarah@leaveflow.com",
      password: employee4Password,
      role: "employee",
      totalLeave: 19,
      remainingLeave: 19,
    });
    console.log("✅ Employee account created:", employee4.email, "Password: employee123");

    console.log("\n🎉 Test accounts setup complete!");
    console.log("\n📋 Login Credentials:");
    console.log("Admin: admin@leaveflow.com / admin123");
    console.log("Employees: employee@leaveflow.com, jane@leaveflow.com, mike@leaveflow.com, sarah@leaveflow.com / employee123");

  } catch (error) {
    console.error("❌ Error setting up test accounts:", error);
  }
}

// Run the setup
setupTestAccounts(); 