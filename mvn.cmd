@echo off
set "DIR=%~dp0"
set "JAVA_HOME=%DIR%tools\jdk-17.0.12+7"
set "PATH=%JAVA_HOME%\bin;%DIR%tools\apache-maven-3.9.9\bin;%PATH%"
"%DIR%tools\apache-maven-3.9.9\bin\mvn.cmd" %*
