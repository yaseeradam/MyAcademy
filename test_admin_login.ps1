# Simple test to check if school admin account exists

Write-Host "Testing school admin login..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@testschool.com","password":"admin123456"}' -UseBasicParsing

    Write-Host "Status Code:" $response.StatusCode -ForegroundColor Green

    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "  User:" $data.user.name -ForegroundColor Gray
        Write-Host "  Email:" $data.user.email -ForegroundColor Gray
        Write-Host "  Role:" $data.user.role -ForegroundColor Gray
        if ($data.school) {
            Write-Host "  School:" $data.school.name -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ Login failed" -ForegroundColor Red
        Write-Host "Response:" $response.Content -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error:" $_.Exception.Message -ForegroundColor Red
    Write-Host "This likely means the school admin account was not created successfully" -ForegroundColor Yellow
}

Write-Host "Test completed" -ForegroundColor Green
