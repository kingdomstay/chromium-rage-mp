del /f /s /q "server/packages"
robocopy "app/dist/packages" "server/packages" /E

del /f /s /q "server/client_packages"
robocopy "app/dist/client_packages" "server/client_packages" /E

cd server
ragemp-server.exe
