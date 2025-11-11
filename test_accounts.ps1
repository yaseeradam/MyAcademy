# Test script to create developer and school admin accounts

Write-Host "=== School Management System - Account Creation Test ===" -ForegroundColor Green

# Step 1: Login as developer to get token
Write-Host "Step 1: Logging in as developer..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"developer@test.com","password":"dev123456"}' -UseBasicParsing

    if ($loginResponse.StatusCode -eq 200) {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.token
        $user = $loginData.user

        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "  User: $($user.name) ($($user.email))" -ForegroundColor Gray
        Write-Host "  Role: $($user.role)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Login failed with status: $($loginResponse.StatusCode)" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "✗ Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Create school admin account
Write-Host "Step 2: Creating school admin account..." -ForegroundColor Yellow
try {
    $schoolResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/master/schools" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body '{"schoolName":"Test School","adminName":"Test School Admin","adminEmail":"admin@testschool.com","adminPassword":"admin123456"}' -UseBasicParsing

    if ($schoolResponse.StatusCode -eq 200) {
        $schoolData = $schoolResponse.Content | ConvertFrom-Json

        Write-Host "✓ School admin account created successfully!" -ForegroundColor Green
        Write-Host "  School: $($schoolData.school.name)" -ForegroundColor Gray
        Write-Host "  Admin: $($schoolData.admin.name) ($($schoolData.admin.email))" -ForegroundColor Gray
        Write-Host "  Role: $($schoolData.admin.role)" -ForegroundColor Gray
    } else {
        Write-Host "✗ School creation failed with status: $($schoolResponse.StatusCode)" -ForegroundColor Red
        Write-Host "Response: $($schoolResponse.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ School creation error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to:" -ForegroundColor Yellow
    Write-Host "  - Token format issues" -ForegroundColor Yellow
    Write-Host "  - Server-side authentication problems" -ForegroundColor Yellow
    Write-Host "  - MongoDB connection issues" -ForegroundColor Yellow
}

Write-Host "=== Test completed ===" -ForegroundColor Green
