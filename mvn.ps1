$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = Join-Path $rootDir "tools\jdk-17.0.12+7"
$env:PATH = "$env:JAVA_HOME\bin;" + (Join-Path $rootDir "tools\apache-maven-3.9.9\bin") + ";$env:PATH"
& (Join-Path $rootDir "tools\apache-maven-3.9.9\bin\mvn.cmd") @args
