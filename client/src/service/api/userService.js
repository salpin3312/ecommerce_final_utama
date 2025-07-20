import axiosInstance from "../axiosService";

// Get user profile
export const getUserProfile = async () => {
   try {
      const response = await axiosInstance.get("/api/user/profile");
      return response.data.user;
   } catch (error) {
      console.error("Get profile error:", error);
      throw error;
   }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
   try {
      const response = await axiosInstance.put("/api/user/profile", profileData);
      console.log(response.data);
      return response.data;
   } catch (error) {
      console.error("Update profile error:", error);
      throw error;
   }
};

// Change password
export const changeUserPassword = async (passwordData) => {
   try {
      const response = await axiosInstance.put("/api/user/change-password", passwordData);
      return response.data;
   } catch (error) {
      console.error("Change password error:", error);
      throw error;
   }
};

// Upload user avatar
export const uploadUserAvatar = async (file) => {
   const formData = new FormData();
   formData.append("avatar", file);
   const response = await axiosInstance.post("/api/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
   });
   return response.data;
};

// Get all users (for admin dashboard)
export const getAllUsers = async () => {
   try {
      const response = await axiosInstance.get("/api/user/all");
      return response.data;
   } catch (error) {
      console.error("Get all users error:", error);
      throw error;
   }
};
