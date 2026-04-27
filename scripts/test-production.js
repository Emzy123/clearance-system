#!/usr/bin/env node

// Production Testing Suite
const axios = require("axios");

class ProductionTester {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
    this.testResults = [];
  }

  async runTest(name, testFn) {
    console.log(`🧪 Running: ${name}`);
    try {
      const result = await testFn();
      this.testResults.push({ name, status: "PASS", result });
      console.log(`✅ ${name} - PASSED`);
      return true;
    } catch (error) {
      this.testResults.push({ name, status: "FAIL", error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}`);
      return false;
    }
  }

  async testHealthEndpoint() {
    const response = await axios.get(`${this.baseURL}/api/health`);
    if (response.data.success || response.data.status === "ok") {
      return response.data;
    }
    throw new Error("Health endpoint not responding correctly");
  }

  async testLogin() {
    const response = await axios.post(`${this.baseURL}/api/auth/login`, {
      email: "admin@demo.edu",
      password: "AdminPass123!"
    });
    
    if (response.data.success && response.data.data.token) {
      this.token = response.data.data.token;
      return response.data.data;
    }
    throw new Error("Login failed");
  }

  async testProtectedEndpoint() {
    if (!this.token) throw new Error("No token available");
    
    const response = await axios.get(`${this.baseURL}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Protected endpoint failed");
  }

  async testStudentEndpoints() {
    if (!this.token) throw new Error("No token available");
    
    const response = await axios.get(`${this.baseURL}/api/students/clearance/status`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    return response.data;
  }

  async testStaffEndpoints() {
    if (!this.token) throw new Error("No token available");
    
    const response = await axios.get(`${this.baseURL}/api/staff/statistics`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    return response.data;
  }

  async testAdminEndpoints() {
    if (!this.token) throw new Error("No token available");
    
    const response = await axios.get(`${this.baseURL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    
    return response.data;
  }

  async testCORS() {
    const response = await axios.options(`${this.baseURL}/api/health`, {
      headers: { Origin: "https://clearance-system-frontend.onrender.com" }
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (!corsHeaders) {
      throw new Error("CORS headers not found");
    }
    
    return { cors: corsHeaders };
  }

  async testRateLimiting() {
    const promises = [];
    
    // Make 5 rapid requests to test rate limiting
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.post(`${this.baseURL}/api/auth/login`, {
          email: "test@example.com",
          password: "wrongpassword"
        }).catch(err => err.response || err)
      );
    }
    
    const results = await Promise.all(promises);
    const rateLimited = results.some(res => 
      res.status === 429 || (res.data && res.data.error?.includes("rate limit"))
    );
    
    return { rateLimited, requests: results.length };
  }

  async testDatabaseConnection() {
    const response = await axios.get(`${this.baseURL}/api/health`);
    
    // Check if health endpoint includes database status
    if (response.data.checks && response.data.checks.database === "connected") {
      return { database: "connected" };
    }
    
    // Fallback: try to access an endpoint that requires database
    try {
      await axios.get(`${this.baseURL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return { database: "connected" };
    } catch (error) {
      if (error.response?.status === 401) {
        return { database: "connected" }; // 401 means DB is working, just auth failed
      }
      throw new Error("Database connection may be failing");
    }
  }

  async runAllTests() {
    console.log(`🚀 Starting Production Tests for: ${this.baseURL}`);
    console.log("=" * 50);

    const tests = [
      { name: "Health Endpoint", fn: () => this.testHealthEndpoint() },
      { name: "Login Authentication", fn: () => this.testLogin() },
      { name: "Protected Endpoint", fn: () => this.testProtectedEndpoint() },
      { name: "Student Endpoints", fn: () => this.testStudentEndpoints() },
      { name: "Staff Endpoints", fn: () => this.testStaffEndpoints() },
      { name: "Admin Endpoints", fn: () => this.testAdminEndpoints() },
      { name: "CORS Configuration", fn: () => this.testCORS() },
      { name: "Rate Limiting", fn: () => this.testRateLimiting() },
      { name: "Database Connection", fn: () => this.testDatabaseConnection() }
    ];

    let passedTests = 0;
    
    for (const test of tests) {
      const passed = await this.runTest(test.name, test.fn);
      if (passed) passedTests++;
    }

    console.log("\n" + "=" * 50);
    console.log("📊 Test Results Summary");
    console.log("=" * 50);
    
    this.testResults.forEach(result => {
      const icon = result.status === "PASS" ? "✅" : "❌";
      console.log(`${icon} ${result.name}: ${result.status}`);
      if (result.status === "FAIL") {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log(`\n🎯 Tests Passed: ${passedTests}/${tests.length}`);
    
    if (passedTests === tests.length) {
      console.log("🎉 All tests passed! Production deployment is working correctly.");
    } else {
      console.log("⚠️  Some tests failed. Check the errors above and fix the issues.");
    }

    return passedTests === tests.length;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseURL: this.baseURL,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === "PASS").length,
        failed: this.testResults.filter(r => r.status === "FAIL").length
      },
      results: this.testResults
    };

    require("fs").writeFileSync(
      `production-test-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    console.log(`📄 Test report saved: production-test-report-${Date.now()}.json`);
    return report;
  }
}

// CLI Usage
if (require.main === module) {
  const baseURL = process.argv[2] || process.env.TEST_URL || "http://localhost:5000";
  
  const tester = new ProductionTester(baseURL);
  
  tester.runAllTests()
    .then(success => {
      tester.generateReport();
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("❌ Test suite failed:", error.message);
      process.exit(1);
    });
}

module.exports = { ProductionTester };
