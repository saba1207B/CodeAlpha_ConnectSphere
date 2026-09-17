@echo off
title ConnectSphere - Push to GitHub
set "PATH=%LOCALAPPDATA%\MinGit\cmd;%LOCALAPPDATA%\MinGit\mingw64\bin;%PATH%"
cd /d "d:\new Project"

echo ======================================================================
echo   Deploying ConnectSphere to GitHub
echo   Repository: https://github.com/saba1207B/CodeAlpha_ConnectSphere
echo ======================================================================
echo.
echo Pushing local commits to origin main...
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo   SUCCESS! All files and workflows have been pushed to GitHub!
    echo   GitHub Actions will now build and publish your site to:
    echo   https://saba1207B.github.io/CodeAlpha_ConnectSphere/
    echo ======================================================================
) else (
    echo.
    echo ----------------------------------------------------------------------
    echo   Authentication required:
    echo   If prompted, sign in via browser or use a GitHub Personal Access Token (PAT).
    echo ----------------------------------------------------------------------
)
echo.
pause
