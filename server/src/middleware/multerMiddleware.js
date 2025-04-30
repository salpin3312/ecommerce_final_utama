import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Dapatkan direktori path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");

// Pastikan folder upload ada
(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Gagal membuat direktori upload:", error);
  }
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /^image\/(jpeg|jpg|png)$/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar dengan format jpeg, jpg, atau png yang diperbolehkan!"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: fileFilter,
});

export default upload;
