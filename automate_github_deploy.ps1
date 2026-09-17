# ==============================================================================
# ConnectSphere — Automated GitHub Pages Deployment Script
# ==============================================================================
param(
    [string]$RepoUrl = ""
)

Write-Host "`n🚀 ConnectSphere Automated GitHub Deployer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor DarkGray

# 1. Verify Git availability
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "`n⚠️  Git is not currently installed or not in your PATH." -ForegroundColor Yellow
    Write-Host "Would you like to install Git now via Windows Package Manager (winget)? (Y/N)" -ForegroundColor White
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "Installing Git via winget..." -ForegroundColor Cyan
        winget install --id Git.Git -e --source winget
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } else {
        Write-Host "Please install Git manually from https://git-scm.com/download/win and rerun this script." -ForegroundColor Red
        exit 1
    }
}

# 2. Build production client bundle
Write-Host "`n📦 Building production client bundle..." -ForegroundColor Cyan
Set-Location "d:\new Project\client"
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please review the errors above." -ForegroundColor Red
    exit 1
}
Set-Location "d:\new Project"
Write-Host "✅ Production bundle built successfully into client/dist!" -ForegroundColor Green

# 3. Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "`n🌱 Initializing Git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
}

# 4. Stage and commit
Write-Host "`n📝 Staging files and creating commit..." -ForegroundColor Cyan
git add .
git commit -m "Deploy ConnectSphere with Global Internet Mesh (PeerJS + Google STUN)"

# 5. Remote repository setup
$remotes = git remote -v
if (-not $remotes) {
    if (-not $RepoUrl) {
        Write-Host "`n🔗 Enter your GitHub Repository URL (e.g. https://github.com/username/connectsphere.git):" -ForegroundColor Yellow
        $RepoUrl = Read-Host
    }
    if ($RepoUrl) {
        git remote add origin $RepoUrl
        Write-Host "✅ Added origin: $RepoUrl" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No remote URL provided. You can add one later with: git remote add origin <url>" -ForegroundColor Yellow
        exit 0
    }
}

# 6. Push to main
Write-Host "`n🚀 Pushing to GitHub (main branch)..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`n🎉 PUSH COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor DarkGray
Write-Host "Next Step on GitHub.com:" -ForegroundColor White
Write-Host "1. Go to your repository Settings -> Pages" -ForegroundColor Yellow
Write-Host "2. Under 'Source', select 'GitHub Actions'" -ForegroundColor Yellow
Write-Host "3. Your site will be published at https://<username>.github.io/<repo>/`n" -ForegroundColor Green
