import * as FileSystem from 'expo-file-system';

const DocumentDirectoryPath = FileSystem.documentDirectory || '';
const CachesDirectoryPath = FileSystem.cacheDirectory || '';
const DownloadDirectoryPath = FileSystem.documentDirectory || '';

async function downloadFile(options: {fromUrl: string; toFile: string}) {
  const result = await FileSystem.downloadAsync(options.fromUrl, options.toFile);
  return {
    promise: Promise.resolve(result),
    statusCode: result.status,
    bytesWritten: 0,
    jobId: 0,
  };
}

async function writeFile(
  filepath: string,
  contents: string,
  encoding?: string,
) {
  const enc =
    encoding === 'base64'
      ? FileSystem.EncodingType.Base64
      : FileSystem.EncodingType.UTF8;
  await FileSystem.writeAsStringAsync(filepath, contents, {encoding: enc});
}

async function readFile(filepath: string, encoding?: string) {
  const enc =
    encoding === 'base64'
      ? FileSystem.EncodingType.Base64
      : FileSystem.EncodingType.UTF8;
  return await FileSystem.readAsStringAsync(filepath, {encoding: enc});
}

async function exists(filepath: string) {
  const info = await FileSystem.getInfoAsync(filepath);
  return info.exists;
}

async function unlink(filepath: string) {
  await FileSystem.deleteAsync(filepath, {idempotent: true});
}

const RNFS = {
  DocumentDirectoryPath,
  CachesDirectoryPath,
  DownloadDirectoryPath,
  downloadFile,
  writeFile,
  readFile,
  exists,
  unlink,
};

export default RNFS;
