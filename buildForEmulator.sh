cp -r config.xml ./unittests
cp -r app ./cordova/www
cp -r unittests ./cordova/www
cp -r uitests ./cordova/www
cp -r uitest.html ./cordova/www
cp -r uitest.js ./cordova/www
cp -r touch ./cordova/www
sencha app build -run native
