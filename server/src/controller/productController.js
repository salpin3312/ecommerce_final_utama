import prisma from "../config/prisma.js";
import fs from "fs/promises";
import path from "path";

// Helper untuk mendapatkan path dari image URL
const getImagePath = (imageUrl) => {
  if (!imageUrl) return null;
  const filename = imageUrl.split("/").pop();
  return path.join(process.cwd(), "public", "uploads", filename);
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, sizes, stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Validasi input agar tidak kosong
    if (!name || !description || !price || !sizes || !stock) {
      return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    // Validasi angka
    const priceFloat = parseFloat(price);
    const stockInt = parseInt(stock, 10);

    if (Number.isNaN(priceFloat) || Number.isNaN(stockInt)) {
      return res
        .status(400)
        .json({ message: "Harga dan stok harus berupa angka!" });
    }

    // Parsing sizes dari string menjadi array jika diperlukan
    let sizesArray = sizes;
    if (typeof sizes === "string") {
      sizesArray = sizes.split(",").map((size) => size.trim());
    }

    // Simpan produk dan sizes-nya dalam satu transaksi
    const product = await prisma.$transaction(async (prisma) => {
      // Buat produk
      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          price: priceFloat,
          stock: stockInt,
          imageUrl,
        },
      });

      // Buat record ukuran untuk produk
      await Promise.all(
        sizesArray.map((size) =>
          prisma.productSize.create({
            data: {
              productId: newProduct.id,
              size,
            },
          })
        )
      );

      // Ambil produk lengkap dengan sizes
      return prisma.product.findUnique({
        where: { id: newProduct.id },
        include: { sizes: true },
      });
    });

    res.status(201).json({ message: "Produk berhasil ditambahkan", product });
  } catch (error) {
    console.error("Error saat menambahkan produk:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk mendapatkan semua produk
export const getAllProducts = async (req, res) => {
  try {
    const { status, includeArchived } = req.query;

    // Filter berdasarkan status
    let whereClause = {};

    if (status) {
      // Filter berdasarkan status spesifik
      whereClause.status = status;
    } else if (includeArchived !== "true") {
      // Default: Jangan tampilkan produk yang diarsipkan kecuali diminta
      whereClause.status = {
        not: "ARCHIVED",
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        sizes: true, // Include product sizes
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response untuk memudahkan konsumsi di frontend
    const formattedProducts = products.map((product) => ({
      ...product,
      sizes: product.sizes.map((size) => size.size), // Ekstrak array ukuran
    }));

    res.status(200).json({
      message: "Berhasil mengambil data produk",
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error saat mengambil data produk:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk mendapatkan produk berdasarkan ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        sizes: true, // Include product sizes
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Format response untuk memudahkan konsumsi di frontend
    const formattedProduct = {
      ...product,
      sizes: product.sizes.map((size) => size.size), // Ekstrak array ukuran
    };

    res.status(200).json({
      message: "Berhasil mengambil data produk",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Error saat mengambil data produk:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk memperbarui produk
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, sizes, stock } = req.body;
    const newImageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Cek produk yang akan diupdate
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
      include: { sizes: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Validasi angka
    let priceFloat, stockInt;

    if (price) {
      priceFloat = parseFloat(price);
      if (Number.isNaN(priceFloat)) {
        return res.status(400).json({ message: "Harga harus berupa angka!" });
      }
    }

    if (stock) {
      stockInt = parseInt(stock, 10);
      if (Number.isNaN(stockInt)) {
        return res.status(400).json({ message: "Stok harus berupa angka!" });
      }
    }

    // Parsing sizes dari string menjadi array jika diperlukan
    let sizesArray;
    if (sizes) {
      sizesArray =
        typeof sizes === "string"
          ? sizes.split(",").map((size) => size.trim())
          : sizes;
    }

    // Jika ada gambar baru dan gambar lama, hapus gambar lama
    if (newImageUrl && existingProduct.imageUrl) {
      try {
        const oldImagePath = getImagePath(existingProduct.imageUrl);
        if (oldImagePath) {
          await fs.unlink(oldImagePath);
        }
      } catch (err) {
        console.error("Gagal menghapus gambar lama:", err);
        // Tetap lanjutkan proses update meskipun gagal menghapus gambar lama
      }
    }

    // Update produk dan sizes-nya dalam satu transaksi
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // Update produk
      const product = await prisma.product.update({
        where: { id: id },
        data: {
          name: name || undefined,
          description: description || undefined,
          price: priceFloat || undefined,
          stock: stockInt || undefined,
          imageUrl: newImageUrl || undefined,
        },
      });

      // Update sizes jika ada perubahan
      if (sizesArray) {
        // Hapus semua ukuran yang ada
        await prisma.productSize.deleteMany({
          where: { productId: id },
        });

        // Buat record ukuran baru
        await Promise.all(
          sizesArray.map((size) =>
            prisma.productSize.create({
              data: {
                productId: id,
                size,
              },
            })
          )
        );
      }

      // Ambil produk yang sudah diupdate dengan sizes-nya
      return prisma.product.findUnique({
        where: { id: id },
        include: { sizes: true },
      });
    });

    // Format response untuk memudahkan konsumsi di frontend
    const formattedProduct = {
      ...updatedProduct,
      sizes: updatedProduct.sizes.map((size) => size.size),
    };

    res.status(200).json({
      message: "Produk berhasil diperbarui",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Error saat memperbarui produk:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk menghapus produk
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { forceDelete } = req.query; // Parameter opsional untuk admin

    // Cek produk yang akan dihapus
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Cek apakah produk memiliki relasi dengan Cart
    const cartItems = await prisma.cart.findMany({
      where: { productId: id },
      include: { user: true }, // Include user untuk notifikasi (implementasi future)
    });

    // Cek apakah produk memiliki relasi dengan OrderItem
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
    });

    const hasReferences = cartItems.length > 0 || orderItems.length > 0;

    // Jika ada referensi dan bukan force delete, lakukan soft delete (ubah status)
    if (hasReferences && forceDelete !== "true") {
      const updatedProduct = await prisma.product.update({
        where: { id: id },
        data: {
          status: "ARCHIVED",
          deletedAt: new Date(),
        },
      });

      // Di sini bisa ditambahkan kode untuk notifikasi ke pengguna yang memiliki produk di keranjang
      // Contoh: kirim email atau notifikasi in-app

      return res.status(200).json({
        message: "Produk telah diarsipkan karena masih digunakan dalam sistem",
        status: updatedProduct.status,
        references: {
          carts: cartItems.length,
          orders: orderItems.length,
        },
      });
    }

    // Jika force delete atau tidak ada referensi
    if (forceDelete === "true" && hasReferences) {
      // Hapus referensi di Cart jika ada
      if (cartItems.length > 0) {
        await prisma.cart.deleteMany({
          where: { productId: id },
        });
      }

      // Untuk OrderItem, kita tidak hapus tapi bisa tambahkan catatan bahwa produk sudah dihapus
      // Ini penting untuk menjaga integritas data pesanan
    }

    // Hapus gambar terkait jika ada
    if (product.imageUrl) {
      try {
        const imagePath = getImagePath(product.imageUrl);
        if (imagePath) {
          await fs.access(imagePath).then(
            () => fs.unlink(imagePath),
            () => console.log(`File tidak ditemukan: ${imagePath}`)
          );
        }
      } catch (err) {
        console.error("Gagal menghapus gambar produk:", err);
        // Tetap lanjutkan proses delete meskipun gagal menghapus gambar
      }
    }

    // Hapus ukuran produk terlebih dahulu
    await prisma.productSize.deleteMany({
      where: { productId: id },
    });

    // Hard delete produk jika force delete atau tidak ada referensi
    // Soft delete (update status) jika ada referensi di OrderItem
    if (forceDelete === "true" || !hasReferences) {
      await prisma.product.delete({
        where: { id: id },
      });

      return res.status(200).json({
        message:
          forceDelete === "true"
            ? "Produk dan referensinya di keranjang berhasil dihapus"
            : "Produk berhasil dihapus",
      });
    } else {
      // Jika kita sampai di sini, berarti ada referensi di OrderItem yang tidak bisa dihapus
      const updatedProduct = await prisma.product.update({
        where: { id: id },
        data: {
          status: "DISCONTINUED",
          deletedAt: new Date(),
        },
      });

      return res.status(200).json({
        message:
          "Produk telah dinonaktifkan karena masih terdapat dalam pesanan",
        status: updatedProduct.status,
      });
    }
  } catch (error) {
    console.error("Error saat menghapus produk:", error);

    // Memberikan pesan error yang lebih spesifik
    if (error.code === "P2003") {
      return res.status(400).json({
        message:
          "Produk tidak dapat dihapus karena masih digunakan di data lain",
        error: "Foreign key constraint violation",
      });
    }

    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk mencari produk berdasarkan kata kunci
export const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Kata kunci pencarian diperlukan" });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: keyword.toLowerCase() } },
          { description: { contains: keyword.toLowerCase() } },
        ],
      },
      include: {
        sizes: true,
      },
    });

    // Format response untuk memudahkan konsumsi di frontend
    const formattedProducts = products.map((product) => ({
      ...product,
      sizes: product.sizes.map((size) => size.size),
    }));

    res.status(200).json({
      message: "Pencarian berhasil",
      count: products.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error saat mencari produk:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk mengubah status produk
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status
    const validStatuses = [
      "DRAFT",
      "ACTIVE",
      "OUT_OF_STOCK",
      "DISCONTINUED",
      "ARCHIVED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status tidak valid",
        validStatuses,
      });
    }

    // Cek produk yang akan diupdate
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Update status produk
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        status,
        // Jika status ARCHIVED, set deletedAt
        deletedAt: status === "ARCHIVED" ? new Date() : null,
      },
      include: {
        sizes: true,
      },
    });

    // Format response untuk memudahkan konsumsi di frontend
    const formattedProduct = {
      ...updatedProduct,
      sizes: updatedProduct.sizes.map((size) => size.size),
    };

    res.status(200).json({
      message: `Status produk berhasil diubah menjadi ${status}`,
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Error saat mengubah status produk:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
