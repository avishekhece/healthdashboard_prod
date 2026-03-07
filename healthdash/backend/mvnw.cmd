@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")

@SET MAVEN_PROJECTBASEDIR=%~dp0

@IF NOT "%JAVA_HOME%" == "" SET "JAVA_HOME_BAK=%JAVA_HOME%"
@SET "JAVA_PATH=%JAVA_HOME%\bin\java.exe"

@IF NOT EXIST "%JAVA_PATH%" (
  @FOR %%i IN (java.exe) DO @SET "JAVA_PATH=%%~$PATH:i"
)

@IF NOT EXIST "%JAVA_PATH%" (
  @echo ERROR: JAVA_HOME not set and java not found in PATH >&2
  @exit /b 1
)

@SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
@SET "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"
@SET "DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

@IF NOT EXIST "%WRAPPER_JAR%" (
  @echo Downloading Maven Wrapper JAR...
  @powershell -Command "(New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')"
)

@"%JAVA_PATH%" "-classpath" "%WRAPPER_JAR%" "%WRAPPER_LAUNCHER%" %*
