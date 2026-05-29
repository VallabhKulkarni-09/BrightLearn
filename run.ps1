Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Starting BrightLearn Services..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Spring Boot Backend..." -ForegroundColor Green
$backend = Start-Process -FilePath ".\brightlearn-backend\mvnw.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory ".\brightlearn-backend" -PassThru

# Start Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory ".\brightlearn-frontend" -PassThru

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Services are opening in separate windows." -ForegroundColor Cyan
Write-Host "Close those windows to stop the servers." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
