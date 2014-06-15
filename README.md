Music player written in HTML5 with Sencha Touch, Apache Cordova and Cordova SQLite Plugin.
Unit tests powered by Jasmine, UI tests powered by Siesta.
To build the app you need SenchaCMD, the Android SDK and Cordova CLI which requires nodejs.
Run buildForEmulator.sh to build and run the app on an Android emulator.

The app loads music from sdcard/Music on startup. To run the unit-/UI-tests, you need to have some files in there.
The unittests require two special files: crash.mp3 and crash1.mp3