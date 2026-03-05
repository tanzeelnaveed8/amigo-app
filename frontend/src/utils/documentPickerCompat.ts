import * as ExpoDocumentPicker from 'expo-document-picker';

const types = {
  images: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  allFiles: '*/*',
  pdf: 'application/pdf',
  plainText: 'text/plain',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
};

async function pick(options?: any) {
  const typeArray = options?.type || ['*/*'];
  const mimeType = Array.isArray(typeArray) ? typeArray : [typeArray];

  const result = await ExpoDocumentPicker.getDocumentAsync({
    type: mimeType.length === 1 ? mimeType[0] : mimeType,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    throw {code: 'DOCUMENT_PICKER_CANCELED', message: 'User cancelled'};
  }

  return result.assets.map(asset => ({
    uri: asset.uri,
    name: asset.name,
    size: asset.size,
    type: asset.mimeType || 'application/octet-stream',
    fileCopyUri: asset.uri,
  }));
}

function isCancel(err: any) {
  return (
    err?.code === 'DOCUMENT_PICKER_CANCELED' ||
    err?.message === 'User cancelled'
  );
}

const DocumentPickerCompat = {
  pick,
  types,
  isCancel,
};

export default DocumentPickerCompat;
