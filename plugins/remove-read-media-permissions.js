const { withAndroidManifest } = require('expo/config-plugins');

const REMOVE_PERMISSIONS = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
  'android.permission.READ_EXTERNAL_STORAGE',
];

const withRemoveReadMediaPermissions = (config) => {
  if (Array.isArray(config._android?.permissions)) {
    config._android.permissions = config._android.permissions.filter(
      (name) => !REMOVE_PERMISSIONS.includes(name),
    );
  }
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    if (Array.isArray(manifest.manifest['uses-permission'])) {
      manifest.manifest['uses-permission'] = manifest.manifest['uses-permission'].filter(
        (item) => !REMOVE_PERMISSIONS.includes(item.$['android:name']),
      );
    }
    return cfg;
  });
};

module.exports = withRemoveReadMediaPermissions;
