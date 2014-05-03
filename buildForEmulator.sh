cp -r config.xml ./unittests
cp -r app ./cordova/www
cp -r unittests ./cordova/www
sencha app build -run native
