const { PromoCode } = require("../models/PromoCode");

async function createPromoCode(code, discount, startDate, endDate, minOrderAmount = 0, applicableProducts = []) {
  try {
    const newPromoCode = new PromoCode({
      code,
      discount,
      startDate,
      endDate,
      minOrderAmount,
      applicableProducts,
    });

    await newPromoCode.save();
    return newPromoCode;
  } catch (error) {
    console.error("Error creating promo code:", error);
    throw new Error("Failed to create promo code");
  }
}

async function getPromoCodeById(promoCodeId) {
  try {
    const promoCode = await PromoCode.findById(promoCodeId)
      .populate("applicableProducts", "name price");
    if (!promoCode) throw new Error("Promo code not found");
    return promoCode;
  } catch (error) {
    console.error("Error fetching promo code:", error);
    throw new Error("Failed to fetch promo code");
  }
}

async function getPromoCodeByCode(code) {
  try {
    const promoCode = await PromoCode.findOne({ code })
      .populate("applicableProducts", "name price");
    if (!promoCode) throw new Error("Promo code not found");
    return promoCode;
  } catch (error) {
    console.error("Error fetching promo code by code:", error);
    throw new Error("Failed to fetch promo code");
  }
}

async function getAllPromoCodes() {
  try {
    return await PromoCode.find().populate("applicableProducts", "name price");
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    throw new Error("Failed to fetch promo codes");
  }
}

async function updatePromoCode(promoCodeId, updateData) {
  try {
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      promoCodeId,
      updateData,
      { new: true }
    ).populate("applicableProducts", "name price");

    if (!updatedPromoCode) throw new Error("Promo code not found or update failed");
    return updatedPromoCode;
  } catch (error) {
    console.error("Error updating promo code:", error);
    throw new Error("Failed to update promo code");
  }
}

async function deletePromoCode(promoCodeId) {
  try {
    const deletedPromoCode = await PromoCode.findByIdAndDelete(promoCodeId);
    if (!deletedPromoCode) throw new Error("Promo code not found or already deleted");
    return deletedPromoCode;
  } catch (error) {
    console.error("Error deleting promo code:", error);
    throw new Error("Failed to delete promo code");
  }
}

module.exports = {
  createPromoCode,
  getPromoCodeById,
  getPromoCodeByCode,
  getAllPromoCodes,
  updatePromoCode,
  deletePromoCode,
};
