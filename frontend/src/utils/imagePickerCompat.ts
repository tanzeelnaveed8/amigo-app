import * as ExpoImagePicker from 'expo-image-picker';

function mapMediaType(mediaType?: string) {
  switch (mediaType) {
    case 'photo':
      return ExpoImagePicker.MediaTypeOptions.Images;
    case 'video':
      return ExpoImagePicker.MediaTypeOptions.Videos;
    case 'mixed':
      return ExpoImagePicker.MediaTypeOptions.All;
    default:
      return ExpoImagePicker.MediaTypeOptions.All;
  }
}

function mapAssets(assets: ExpoImagePicker.ImagePickerAsset[]) {
  return assets.map(asset => ({
    uri: asset.uri,
    fileName: asset.fileName || asset.uri.split('/').pop(),
    type:
      asset.mimeType ||
      (asset.uri.match(/\.(\w+)$/)
        ? `image/${asset.uri.match(/\.(\w+)$/)?.[1]}`
        : 'image/jpeg'),
    fileSize: asset.fileSize,
    width: asset.width,
    height: asset.height,
    base64: asset.base64,
  }));
}

export async function launchImageLibrary(options?: any, callback?: Function) {
  try {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: mapMediaType(options?.mediaType),
      quality: options?.quality ?? 1,
      allowsMultipleSelection: false,
      base64: options?.includeBase64 || false,
    });

    const response = result.canceled
      ? {didCancel: true}
      : {assets: mapAssets(result.assets)};

    if (callback) {
      callback(response);
      return;
    }
    return response;
  } catch (error: any) {
    const response = {error: error.message};
    if (callback) {
      callback(response);
      return;
    }
    return response;
  }
}

export async function launchCamera(options?: any, callback?: Function) {
  try {
    const {status} = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      const response = {error: 'Camera permission denied'};
      if (callback) {
        callback(response);
        return;
      }
      return response;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: mapMediaType(options?.mediaType),
      quality: options?.quality ?? 1,
      base64: options?.includeBase64 || false,
    });

    const response = result.canceled
      ? {didCancel: true}
      : {assets: mapAssets(result.assets)};

    if (callback) {
      callback(response);
      return;
    }
    return response;
  } catch (error: any) {
    const response = {error: error.message};
    if (callback) {
      callback(response);
      return;
    }
    return response;
  }
}

export async function openCropper(options?: any) {
  const result = await ExpoImagePicker.launchImageLibraryAsync({
    mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: options?.width && options?.height
      ? [options.width, options.height]
      : undefined,
    quality: options?.quality ?? 1,
  });

  if (result.canceled) {
    throw new Error('User cancelled cropping');
  }

  const asset = result.assets[0];
  return {
    path: asset.uri,
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    mime: asset.mimeType || 'image/jpeg',
    size: asset.fileSize,
  };
}

const ImagePickerCompat = {
  launchImageLibrary,
  launchCamera,
  openCropper,
};

export default ImagePickerCompat;
