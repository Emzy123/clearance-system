const multer = require("multer");

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }
  return cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter
});

function looksMalicious(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return true;

  // Very lightweight signature checks; not a full antivirus scanner.
  const b0 = buffer[0];
  const b1 = buffer[1];
  const b2 = buffer[2];
  const b3 = buffer[3];

  // PDF: %PDF
  const isPdf = b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46;
  // PNG: 89 50 4E 47
  const isPng = b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47;
  // JPG: FF D8 FF
  const isJpg = b0 === 0xff && b1 === 0xd8 && b2 === 0xff;
  // DOCX: ZIP header PK..
  const isZip = b0 === 0x50 && b1 === 0x4b;
  // DOC: D0 CF 11 E0 (OLE)
  const isOle = b0 === 0xd0 && b1 === 0xcf && b2 === 0x11 && b3 === 0xe0;

  return !(isPdf || isPng || isJpg || isZip || isOle);
}

module.exports = { upload, looksMalicious, MAX_SIZE_BYTES, allowedMimeTypes };

