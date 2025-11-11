$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@testschool.com","password":"admin123456"}' -UseBasicParsing
Write-Host "Status:" $response.StatusCode
Write-Host "Content:" $response.Content
