Music player written in HTML5 with Sencha Touch, Apache Cordova and Cordova SQLite Plugin.
Unit tests powered by Jasmine, UI tests powered by Siesta.
To build the app you need SenchaCMD, the Android SDK and Cordova CLI which requires nodejs.
Run buildForEmulator.sh to build and run the app on an Android emulator.
There may be some permission issues with Cordova. If so, mark all executables as executable or create a new sencha cordova project and copy the app/uitests/unittests folder and the files in the root directory into the newly created project.
Alternatively you can also just install the apk from the root directory.

The app loads music from sdcard/Music on startup. To run the unit-/UI-tests, you need to have some files in there.
The unittests require two special files: crash.mp3 and crash1.mp3, the uitests need an artist with at least two songs, ie. Aa - aa.mp3 and Aa - bb.mp3