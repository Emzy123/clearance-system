const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

function getBucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not ready");
  return new GridFSBucket(db, { bucketName: "documents" });
}

async function uploadBufferToGridFS({ buffer, filename, contentType, metadata }) {
  const bucket = getBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType, metadata });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve({ _id: uploadStream.id }));
    uploadStream.end(buffer);
  });
}

function openDownloadStream(fileId) {
  const bucket = getBucket();
  return bucket.openDownloadStream(fileId);
}

module.exports = { uploadBufferToGridFS, openDownloadStream };

