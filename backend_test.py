#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for School Management System
Tests all endpoints with proper authentication and role-based access control
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import uuid

# Configuration
BASE_URL = "https://edumanage-ng.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class SchoolManagementTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.tokens = {}
        self.test_data = {}
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", error_details=""):
        """Log test results"""
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.results["failed"] += 1
            error_msg = f"❌ {test_name}: {message}"
            if error_details:
                error_msg += f" | Details: {error_details}"
            print(error_msg)
            self.results["errors"].append(f"{test_name}: {message} - {error_details}")
    
    def make_request(self, method, endpoint, data=None, token=None, params=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = self.headers.copy()
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, params=params, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, params=params, timeout=30)
            
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_user_registration(self):
        """Test user registration for all roles"""
        print("\n=== Testing User Registration ===")
        
        test_users = [
            {
                "role": "admin",
                "name": "Admin User",
                "email": "admin@school.edu.ng",
                "password": "AdminPass123!",
                "phoneNumber": "+2348012345678"
            },
            {
                "role": "teacher", 
                "name": "Teacher John",
                "email": "teacher@school.edu.ng",
                "password": "TeacherPass123!",
                "phoneNumber": "+2348012345679"
            },
            {
                "role": "parent",
                "name": "Parent Mary",
                "email": "parent@school.edu.ng", 
                "password": "ParentPass123!",
                "phoneNumber": "+2348012345680"
            },
            {
                "role": "student",
                "name": "Student David",
                "email": "student@school.edu.ng",
                "password": "StudentPass123!",
                "phoneNumber": "+2348012345681"
            }
        ]
        
        for user_data in test_users:
            response = self.make_request("POST", "auth/register", user_data)
            
            if response and response.status_code == 200:
                result = response.json()
                if "token" in result and "user" in result:
                    self.tokens[user_data["role"]] = result["token"]
                    self.test_data[f"{user_data['role']}_user"] = result["user"]
                    self.log_result(
                        f"Register {user_data['role']}",
                        True,
                        f"Successfully registered {user_data['role']} user"
                    )
                else:
                    self.log_result(
                        f"Register {user_data['role']}",
                        False,
                        "Registration response missing token or user data",
                        str(result)
                    )
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result(
                    f"Register {user_data['role']}",
                    False,
                    f"Registration failed with status {response.status_code if response else 'N/A'}",
                    error_msg
                )
    
    def test_user_login(self):
        """Test user login for all roles"""
        print("\n=== Testing User Login ===")
        
        login_data = [
            {"email": "admin@school.edu.ng", "password": "AdminPass123!", "role": "admin"},
            {"email": "teacher@school.edu.ng", "password": "TeacherPass123!", "role": "teacher"},
            {"email": "parent@school.edu.ng", "password": "ParentPass123!", "role": "parent"},
            {"email": "student@school.edu.ng", "password": "StudentPass123!", "role": "student"}
        ]
        
        for login in login_data:
            response = self.make_request("POST", "auth/login", {
                "email": login["email"],
                "password": login["password"]
            })
            
            if response and response.status_code == 200:
                result = response.json()
                if "token" in result:
                    self.tokens[login["role"]] = result["token"]
                    self.log_result(
                        f"Login {login['role']}",
                        True,
                        f"Successfully logged in {login['role']} user"
                    )
                else:
                    self.log_result(
                        f"Login {login['role']}",
                        False,
                        "Login response missing token",
                        str(result)
                    )
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result(
                    f"Login {login['role']}",
                    False,
                    f"Login failed with status {response.status_code if response else 'N/A'}",
                    error_msg
                )
    
    def test_auth_me(self):
        """Test auth/me endpoint for all roles"""
        print("\n=== Testing Auth Me Endpoint ===")
        
        for role, token in self.tokens.items():
            response = self.make_request("GET", "auth/me", token=token)
            
            if response and response.status_code == 200:
                user_data = response.json()
                if "id" in user_data and "role" in user_data:
                    self.log_result(
                        f"Auth me {role}",
                        True,
                        f"Successfully retrieved {role} user data"
                    )
                else:
                    self.log_result(
                        f"Auth me {role}",
                        False,
                        "User data missing required fields",
                        str(user_data)
                    )
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result(
                    f"Auth me {role}",
                    False,
                    f"Auth me failed with status {response.status_code if response else 'N/A'}",
                    error_msg
                )
    
    def test_student_management(self):
        """Test student CRUD operations"""
        print("\n=== Testing Student Management ===")
        
        if "admin" not in self.tokens:
            self.log_result("Student Management", False, "Admin token not available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test Create Student
        student_data = {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@student.edu.ng",
            "dateOfBirth": "2010-05-15",
            "gender": "Male",
            "address": "123 Lagos Street, Lagos",
            "phoneNumber": "+2348012345682",
            "classId": str(uuid.uuid4()),
            "parentId": self.test_data.get("parent_user", {}).get("id", str(uuid.uuid4())),
            "admissionNumber": "STU001",
            "admissionDate": "2024-01-15"
        }
        
        response = self.make_request("POST", "students", student_data, admin_token)
        
        if response and response.status_code == 200:
            created_student = response.json()
            self.test_data["created_student"] = created_student
            self.log_result("Create Student", True, "Successfully created student")
            
            # Test Get Students
            response = self.make_request("GET", "students", token=admin_token)
            if response and response.status_code == 200:
                students = response.json()
                if isinstance(students, list):
                    self.log_result("Get Students", True, f"Retrieved {len(students)} students")
                else:
                    self.log_result("Get Students", False, "Response is not a list", str(students))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Get Students", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Update Student
            update_data = {"firstName": "Jane", "lastName": "Smith"}
            response = self.make_request("PUT", "students", update_data, admin_token, {"id": created_student["id"]})
            
            if response and response.status_code == 200:
                self.log_result("Update Student", True, "Successfully updated student")
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Update Student", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Delete Student
            response = self.make_request("DELETE", "students", token=admin_token, params={"id": created_student["id"]})
            
            if response and response.status_code == 200:
                self.log_result("Delete Student", True, "Successfully deleted student")
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Delete Student", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Create Student", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_teacher_management(self):
        """Test teacher CRUD operations"""
        print("\n=== Testing Teacher Management ===")
        
        if "admin" not in self.tokens:
            self.log_result("Teacher Management", False, "Admin token not available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test Create Teacher
        teacher_data = {
            "firstName": "Sarah",
            "lastName": "Johnson",
            "email": "sarah.johnson@school.edu.ng",
            "phoneNumber": "+2348012345683",
            "address": "456 Abuja Street, Abuja",
            "qualification": "B.Ed Mathematics",
            "experience": "5 years",
            "specialization": "Mathematics",
            "employeeId": "TCH001",
            "dateOfJoining": "2024-01-01"
        }
        
        response = self.make_request("POST", "teachers", teacher_data, admin_token)
        
        if response and response.status_code == 200:
            created_teacher = response.json()
            self.test_data["created_teacher"] = created_teacher
            self.log_result("Create Teacher", True, "Successfully created teacher")
            
            # Test Get Teachers
            response = self.make_request("GET", "teachers", token=admin_token)
            if response and response.status_code == 200:
                teachers = response.json()
                if isinstance(teachers, list):
                    self.log_result("Get Teachers", True, f"Retrieved {len(teachers)} teachers")
                else:
                    self.log_result("Get Teachers", False, "Response is not a list", str(teachers))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Get Teachers", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Update Teacher
            update_data = {"specialization": "Physics", "experience": "6 years"}
            response = self.make_request("PUT", "teachers", update_data, admin_token, {"id": created_teacher["id"]})
            
            if response and response.status_code == 200:
                self.log_result("Update Teacher", True, "Successfully updated teacher")
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Update Teacher", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Delete Teacher
            response = self.make_request("DELETE", "teachers", token=admin_token, params={"id": created_teacher["id"]})
            
            if response and response.status_code == 200:
                self.log_result("Delete Teacher", True, "Successfully deleted teacher")
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Delete Teacher", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Create Teacher", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_class_management(self):
        """Test class CRUD operations"""
        print("\n=== Testing Class Management ===")
        
        if "admin" not in self.tokens:
            self.log_result("Class Management", False, "Admin token not available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test Create Class
        class_data = {
            "name": "JSS 1A",
            "level": "Junior Secondary 1",
            "section": "A",
            "capacity": 30,
            "academicYear": "2024/2025",
            "classTeacherId": self.test_data.get("created_teacher", {}).get("id", str(uuid.uuid4()))
        }
        
        response = self.make_request("POST", "classes", class_data, admin_token)
        
        if response and response.status_code == 200:
            created_class = response.json()
            self.test_data["created_class"] = created_class
            self.log_result("Create Class", True, "Successfully created class")
            
            # Test Get Classes
            response = self.make_request("GET", "classes", token=admin_token)
            if response and response.status_code == 200:
                classes = response.json()
                if isinstance(classes, list):
                    self.log_result("Get Classes", True, f"Retrieved {len(classes)} classes")
                else:
                    self.log_result("Get Classes", False, "Response is not a list", str(classes))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Get Classes", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Update Class
            update_data = {"capacity": 35, "section": "B"}
            response = self.make_request("PUT", "classes", update_data, admin_token, {"id": created_class["id"]})
            
            if response and response.status_code == 200:
                self.log_result("Update Class", True, "Successfully updated class")
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Update Class", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Delete Class
            response = self.make_request("DELETE", "classes", token=admin_token, params={"id": created_class["id"]})
            
            if response and response.status_code == 200:
                self.log_result("Delete Class", True, "Successfully deleted class")
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Delete Class", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Create Class", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_subject_management(self):
        """Test subject CRUD operations"""
        print("\n=== Testing Subject Management ===")
        
        if "admin" not in self.tokens:
            self.log_result("Subject Management", False, "Admin token not available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test Create Subject
        subject_data = {
            "name": "Mathematics",
            "code": "MATH101",
            "description": "Basic Mathematics for Junior Secondary",
            "credits": 3,
            "level": "Junior Secondary"
        }
        
        response = self.make_request("POST", "subjects", subject_data, admin_token)
        
        if response and response.status_code == 200:
            created_subject = response.json()
            self.test_data["created_subject"] = created_subject
            self.log_result("Create Subject", True, "Successfully created subject")
            
            # Test Get Subjects
            response = self.make_request("GET", "subjects", token=admin_token)
            if response and response.status_code == 200:
                subjects = response.json()
                if isinstance(subjects, list):
                    self.log_result("Get Subjects", True, f"Retrieved {len(subjects)} subjects")
                else:
                    self.log_result("Get Subjects", False, "Response is not a list", str(subjects))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Get Subjects", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Create Subject", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_teacher_assignments(self):
        """Test teacher assignment system"""
        print("\n=== Testing Teacher Assignments ===")
        
        if "admin" not in self.tokens:
            self.log_result("Teacher Assignments", False, "Admin token not available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test Create Teacher Assignment
        assignment_data = {
            "teacherId": self.test_data.get("created_teacher", {}).get("id", str(uuid.uuid4())),
            "subjectId": self.test_data.get("created_subject", {}).get("id", str(uuid.uuid4())),
            "classId": self.test_data.get("created_class", {}).get("id", str(uuid.uuid4())),
            "subjectName": "Mathematics",
            "className": "JSS 1A",
            "academicYear": "2024/2025"
        }
        
        response = self.make_request("POST", "teacher-assignments", assignment_data, admin_token)
        
        if response and response.status_code == 200:
            created_assignment = response.json()
            self.test_data["created_assignment"] = created_assignment
            self.log_result("Create Teacher Assignment", True, "Successfully created teacher assignment")
            
            # Test Get Teacher Assignments
            response = self.make_request("GET", "teacher-assignments", token=admin_token)
            if response and response.status_code == 200:
                assignments = response.json()
                if isinstance(assignments, list):
                    self.log_result("Get Teacher Assignments", True, f"Retrieved {len(assignments)} assignments")
                else:
                    self.log_result("Get Teacher Assignments", False, "Response is not a list", str(assignments))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Get Teacher Assignments", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Create Teacher Assignment", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_attendance_management(self):
        """Test attendance management system"""
        print("\n=== Testing Attendance Management ===")
        
        if "admin" not in self.tokens:
            self.log_result("Attendance Management", False, "Admin token not available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test Individual Attendance Marking
        attendance_data = {
            "studentId": self.test_data.get("created_student", {}).get("id", str(uuid.uuid4())),
            "classId": self.test_data.get("created_class", {}).get("id", str(uuid.uuid4())),
            "subjectId": self.test_data.get("created_subject", {}).get("id", str(uuid.uuid4())),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "status": "present",
            "remarks": "On time"
        }
        
        response = self.make_request("POST", "attendance", attendance_data, admin_token)
        
        if response and response.status_code == 200:
            created_attendance = response.json()
            self.log_result("Mark Individual Attendance", True, "Successfully marked individual attendance")
            
            # Test Get Attendance
            response = self.make_request("GET", "attendance", token=admin_token)
            if response and response.status_code == 200:
                attendance_records = response.json()
                if isinstance(attendance_records, list):
                    self.log_result("Get Attendance", True, f"Retrieved {len(attendance_records)} attendance records")
                else:
                    self.log_result("Get Attendance", False, "Response is not a list", str(attendance_records))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Get Attendance", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
            
            # Test Bulk Attendance Marking
            bulk_attendance_data = {
                "attendanceList": [
                    {
                        "studentId": str(uuid.uuid4()),
                        "classId": self.test_data.get("created_class", {}).get("id", str(uuid.uuid4())),
                        "subjectId": self.test_data.get("created_subject", {}).get("id", str(uuid.uuid4())),
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "status": "present"
                    },
                    {
                        "studentId": str(uuid.uuid4()),
                        "classId": self.test_data.get("created_class", {}).get("id", str(uuid.uuid4())),
                        "subjectId": self.test_data.get("created_subject", {}).get("id", str(uuid.uuid4())),
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "status": "absent"
                    }
                ]
            }
            
            response = self.make_request("POST", "attendance/bulk", bulk_attendance_data, admin_token)
            
            if response and response.status_code == 200:
                result = response.json()
                if "success" in result and result["success"]:
                    self.log_result("Bulk Attendance Marking", True, f"Successfully marked bulk attendance for {result.get('count', 0)} students")
                else:
                    self.log_result("Bulk Attendance Marking", False, "Bulk attendance response missing success flag", str(result))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result("Bulk Attendance Marking", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Mark Individual Attendance", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_notification_system(self):
        """Test notification system"""
        print("\n=== Testing Notification System ===")
        
        if "teacher" not in self.tokens:
            self.log_result("Notification System", False, "Teacher token not available")
            return
        
        teacher_token = self.tokens["teacher"]
        
        # Test Get Notifications
        response = self.make_request("GET", "notifications", token=teacher_token)
        
        if response and response.status_code == 200:
            notifications = response.json()
            if isinstance(notifications, list):
                self.log_result("Get Notifications", True, f"Retrieved {len(notifications)} notifications")
                
                # Test Mark Notification as Read (if notifications exist)
                if notifications:
                    notification_id = notifications[0].get("id")
                    if notification_id:
                        mark_read_data = {"notificationId": notification_id}
                        response = self.make_request("POST", "notifications/mark-read", mark_read_data, teacher_token)
                        
                        if response and response.status_code == 200:
                            result = response.json()
                            if result.get("success"):
                                self.log_result("Mark Notification Read", True, "Successfully marked notification as read")
                            else:
                                self.log_result("Mark Notification Read", False, "Response missing success flag", str(result))
                        else:
                            error_msg = response.text if response else "Request failed"
                            self.log_result("Mark Notification Read", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
                    else:
                        self.log_result("Mark Notification Read", False, "No notification ID found in first notification")
                else:
                    self.log_result("Mark Notification Read", True, "No notifications to mark as read (expected)")
            else:
                self.log_result("Get Notifications", False, "Response is not a list", str(notifications))
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Get Notifications", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_dashboard_statistics(self):
        """Test dashboard statistics for all roles"""
        print("\n=== Testing Dashboard Statistics ===")
        
        for role, token in self.tokens.items():
            response = self.make_request("GET", "dashboard/stats", token=token)
            
            if response and response.status_code == 200:
                stats = response.json()
                if isinstance(stats, dict) and stats:
                    self.log_result(f"Dashboard Stats {role}", True, f"Retrieved dashboard statistics for {role}")
                else:
                    self.log_result(f"Dashboard Stats {role}", False, "Empty or invalid stats response", str(stats))
            else:
                error_msg = response.text if response else "Request failed"
                self.log_result(f"Dashboard Stats {role}", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def test_role_based_access_control(self):
        """Test role-based access control"""
        print("\n=== Testing Role-Based Access Control ===")
        
        # Test unauthorized access - student trying to access admin endpoints
        if "student" in self.tokens:
            student_token = self.tokens["student"]
            
            # Student should not be able to create teachers
            teacher_data = {"firstName": "Test", "lastName": "Teacher", "email": "test@test.com"}
            response = self.make_request("POST", "teachers", teacher_data, student_token)
            
            if response and response.status_code == 401:
                self.log_result("RBAC - Student Access Control", True, "Student correctly denied access to create teachers")
            else:
                self.log_result("RBAC - Student Access Control", False, f"Student should be denied access but got status {response.status_code if response else 'N/A'}")
        
        # Test teacher access to students (should be allowed for GET)
        if "teacher" in self.tokens:
            teacher_token = self.tokens["teacher"]
            
            response = self.make_request("GET", "students", token=teacher_token)
            
            if response and response.status_code == 200:
                self.log_result("RBAC - Teacher Student Access", True, "Teacher correctly allowed to view students")
            else:
                self.log_result("RBAC - Teacher Student Access", False, f"Teacher should be allowed to view students but got status {response.status_code if response else 'N/A'}")
    
    def test_parent_portal(self):
        """Test parent portal functionality"""
        print("\n=== Testing Parent Portal ===")
        
        if "parent" not in self.tokens:
            self.log_result("Parent Portal", False, "Parent token not available")
            return
        
        parent_token = self.tokens["parent"]
        
        # Test Get Parent's Students
        response = self.make_request("GET", "parent/students", token=parent_token)
        
        if response and response.status_code == 200:
            students = response.json()
            if isinstance(students, list):
                self.log_result("Parent Students", True, f"Retrieved {len(students)} students for parent")
            else:
                self.log_result("Parent Students", False, "Response is not a list", str(students))
        else:
            error_msg = response.text if response else "Request failed"
            self.log_result("Parent Students", False, f"Failed with status {response.status_code if response else 'N/A'}", error_msg)
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Comprehensive School Management System Backend Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 80)
        
        # Run tests in logical order
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        self.test_student_management()
        self.test_teacher_management()
        self.test_class_management()
        self.test_subject_management()
        self.test_teacher_assignments()
        self.test_attendance_management()
        self.test_notification_system()
        self.test_dashboard_statistics()
        self.test_role_based_access_control()
        self.test_parent_portal()
        
        # Print final results
        print("\n" + "=" * 80)
        print("📊 FINAL TEST RESULTS")
        print("=" * 80)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results["errors"]:
            print(f"\n🔍 DETAILED ERROR SUMMARY:")
            for i, error in enumerate(self.results["errors"], 1):
                print(f"{i}. {error}")
        
        return self.results

if __name__ == "__main__":
    tester = SchoolManagementTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if results["failed"] == 0 else 1)