/* Lumora — Blob Storage (SAS token generation) */
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require('@azure/storage-blob');

function getServiceClient() {
  return BlobServiceClient.fromConnectionString(
    process.env.BLOB_CONNECTION_STRING
  );
}

/* Generate a write-only SAS URL for direct browser upload */
async function generateUploadSasUrl(blobName) {
  const account   = process.env.BLOB_ACCOUNT_NAME;
  const container = process.env.BLOB_CONTAINER || 'photos';

  // Parse key from connection string
  const match = process.env.BLOB_CONNECTION_STRING.match(/AccountKey=([^;]+)/);
  const key   = match ? match[1] : '';

  const sharedKey = new StorageSharedKeyCredential(account, key);
  const expiresOn = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const sasQuery = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse('cw'), // create + write
      expiresOn,
    },
    sharedKey
  ).toString();

  return `https://${account}.blob.core.windows.net/${container}/${blobName}?${sasQuery}`;
}

/* Delete a blob by name */
async function deleteBlob(blobName) {
  const client = getServiceClient()
    .getContainerClient(process.env.BLOB_CONTAINER || 'photos')
    .getBlockBlobClient(blobName);
  await client.deleteIfExists();
}

module.exports = { generateUploadSasUrl, deleteBlob };
