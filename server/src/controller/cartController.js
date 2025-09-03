import prisma from "../config/prisma.js";

// Helper function untuk menghitung harga diskon
const calculateDiscountedPrice = (product) => {
   if (!product.isDiscountActive || !product.discountPercentage) {
      return product.price;
   }

   const now = new Date();
   const startDate = new Date(product.discountStartDate);
   const endDate = new Date(product.discountEndDate);

   if (now < startDate || now > endDate) {
      return product.price;
   }

   const discountAmount = (product.price * product.discountPercentage) / 100;
   return product.price - discountAmount;
};

// Helper function untuk mendapatkan status diskon
const getDiscountStatus = (product) => {
   if (!product.isDiscountActive || !product.discountPercentage) {
      return { isActive: false, message: "Tidak ada diskon" };
   }

   const now = new Date();
   const startDate = new Date(product.discountStartDate);
   const endDate = new Date(product.discountEndDate);

   if (now < startDate) {
      return {
         isActive: false,
         message: `Diskon akan mulai ${startDate.toLocaleDateString("id-ID")}`,
      };
   }

   if (now > endDate) {
      return {
         isActive: false,
         message: `Diskon telah berakhir pada ${endDate.toLocaleDateString("id-ID")}`,
      };
   }

   return {
      isActive: true,
      message: `Diskon aktif hingga ${endDate.toLocaleDateString("id-ID")}`,
   };
};

// Mendapatkan semua cart items untuk user tertentu
export const getUserCart = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth

      const cartItems = await prisma.cart.findMany({
         where: {
            userId: userId,
         },
         include: {
            product: {
               include: {
                  sizes: true, // Include product sizes
               },
            },
         },
      });

      // Tambahkan informasi diskon ke setiap item
      const cartItemsWithDiscount = cartItems.map((item) => {
         const discountStatus = getDiscountStatus(item.product);
         const discountedPrice = calculateDiscountedPrice(item.product);

         return {
            ...item,
            product: {
               ...item.product,
               discountStatus,
               discountedPrice: Number(discountedPrice),
               hasActiveDiscount: discountStatus.isActive,
            },
         };
      });

      res.status(200).json({
         message: "Berhasil mengambil data keranjang",
         cart: cartItemsWithDiscount,
      });
   } catch (error) {
      console.error("Error saat mengambil data keranjang:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Menambahkan item ke cart
export const addToCart = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth
      const { productId, size, quantity } = req.body;

      if (!productId || !quantity || quantity <= 0 || !size) {
         return res.status(400).json({
            message: "ProductId, size, dan quantity yang valid diperlukan",
         });
      }

      // Cek apakah produk ada
      const product = await prisma.product.findUnique({
         where: {
            id: productId,
         },
         include: {
            sizes: true,
         },
      });

      if (!product) {
         return res.status(404).json({
            message: "Produk tidak ditemukan",
         });
      }

      // Cek apakah ukuran tersedia untuk produk ini
      const sizeExists = product.sizes.some((productSize) => productSize.size === size);
      if (!sizeExists) {
         return res.status(400).json({
            message: "Ukuran yang dipilih tidak tersedia untuk produk ini",
         });
      }

      // Cek stok
      if (product.stock < quantity) {
         return res.status(400).json({
            message: "Stok tidak mencukupi",
         });
      }

      // Cek apakah item dengan ukuran yang sama sudah ada di cart
      const existingCartItem = await prisma.cart.findFirst({
         where: {
            userId: userId,
            productId: productId,
            size: size,
         },
      });

      let cartItem;

      if (existingCartItem) {
         // Update quantity jika item sudah ada
         cartItem = await prisma.cart.update({
            where: {
               id: existingCartItem.id,
            },
            data: {
               quantity: existingCartItem.quantity + quantity,
            },
            include: {
               product: {
                  include: {
                     sizes: true,
                  },
               },
            },
         });
      } else {
         // Buat item baru jika belum ada
         cartItem = await prisma.cart.create({
            data: {
               userId: userId,
               productId: productId,
               size: size,
               quantity: quantity,
            },
            include: {
               product: {
                  include: {
                     sizes: true,
                  },
               },
            },
         });
      }

      // Tambahkan informasi diskon ke cart item
      const discountStatus = getDiscountStatus(cartItem.product);
      const discountedPrice = calculateDiscountedPrice(cartItem.product);

      const cartItemWithDiscount = {
         ...cartItem,
         product: {
            ...cartItem.product,
            discountStatus,
            discountedPrice: Number(discountedPrice),
            hasActiveDiscount: discountStatus.isActive,
         },
      };

      res.status(201).json({
         message: "Produk berhasil ditambahkan ke keranjang",
         cart: cartItemWithDiscount,
      });
   } catch (error) {
      console.error("Error saat menambahkan ke keranjang:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Mengupdate quantity item di cart
export const updateCartItem = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth
      const { cartId } = req.params;
      const { quantity, size } = req.body;

      if (!quantity || quantity <= 0) {
         return res.status(400).json({
            message: "Quantity yang valid diperlukan",
         });
      }

      // Cek apakah cart item ada dan milik user yang request
      const cartItem = await prisma.cart.findFirst({
         where: {
            id: cartId,
            userId: userId,
         },
         include: {
            product: {
               include: {
                  sizes: true,
               },
            },
         },
      });

      if (!cartItem) {
         return res.status(404).json({
            message: "Item keranjang tidak ditemukan",
         });
      }

      // Cek stok
      if (cartItem.product.stock < quantity) {
         return res.status(400).json({
            message: "Stok tidak mencukupi",
         });
      }

      // Prepare update data
      const updateData = { quantity };

      // Jika size diubah, periksa apakah size tersedia
      if (size && size !== cartItem.size) {
         const sizeExists = cartItem.product.sizes.some((productSize) => productSize.size === size);
         if (!sizeExists) {
            return res.status(400).json({
               message: "Ukuran yang dipilih tidak tersedia untuk produk ini",
            });
         }
         updateData.size = size;
      }

      // Update item cart
      const updatedCartItem = await prisma.cart.update({
         where: {
            id: cartId,
         },
         data: updateData,
         include: {
            product: {
               include: {
                  sizes: true,
               },
            },
         },
      });

      // Tambahkan informasi diskon ke cart item
      const discountStatus = getDiscountStatus(updatedCartItem.product);
      const discountedPrice = calculateDiscountedPrice(updatedCartItem.product);

      const updatedCartItemWithDiscount = {
         ...updatedCartItem,
         product: {
            ...updatedCartItem.product,
            discountStatus,
            discountedPrice: Number(discountedPrice),
            hasActiveDiscount: discountStatus.isActive,
         },
      };

      res.status(200).json({
         message: "Item keranjang berhasil diupdate",
         cart: updatedCartItemWithDiscount,
      });
   } catch (error) {
      console.error("Error saat mengupdate item keranjang:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Menghapus item dari cart
export const removeFromCart = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth
      const { cartId } = req.params;

      // Cek apakah cart item ada dan milik user yang request
      const cartItem = await prisma.cart.findFirst({
         where: {
            id: cartId,
            userId: userId,
         },
      });

      if (!cartItem) {
         return res.status(404).json({
            message: "Item keranjang tidak ditemukan",
         });
      }

      // Hapus item
      await prisma.cart.delete({
         where: {
            id: cartId,
         },
      });

      res.status(200).json({
         message: "Item berhasil dihapus dari keranjang",
      });
   } catch (error) {
      console.error("Error saat menghapus dari keranjang:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};

// Menghapus semua item di cart untuk user tertentu
export const clearCart = async (req, res) => {
   try {
      const userId = req.user.id; // Asumsikan user ID didapat dari middleware auth

      await prisma.cart.deleteMany({
         where: {
            userId: userId,
         },
      });

      res.status(200).json({
         message: "Keranjang berhasil dikosongkan",
      });
   } catch (error) {
      console.error("Error saat mengosongkan keranjang:", error);
      res.status(500).json({
         message: "Terjadi kesalahan pada server",
         error: error.message,
      });
   }
};
