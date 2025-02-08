const express = require("express");
const router = express.Router();
const {
  createPromoCode,
  getPromoCodeById,
  getPromoCodeByCode,
  getAllPromoCodes,
  updatePromoCode,
  deletePromoCode,
} = require("../controllers/promoCodeController");

// Create a new promo code
router.post("/new", async (req, res) => {
  try {
    const { code, discount, startDate, endDate, minOrderAmount, applicableProducts } = req.body;
    const newPromoCode = await createPromoCode(code, discount, startDate, endDate, minOrderAmount, applicableProducts);
    res.status(201).json(newPromoCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get a promo code by ID
router.get("/:id", async (req, res) => {
  try {
    const promoCode = await getPromoCodeById(req.params.id);
    res.status(200).json(promoCode);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});



// Get a promo code by code
router.get("/:code", async (req, res) => {
  try {
    const promoCode = await getPromoCodeByCode(req.params.code);
    res.status(200).json(promoCode);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});



// Get all promo codes
router.get("/", async (req, res) => {
  try {
    const promoCodes = await getAllPromoCodes();
    res.status(200).json(promoCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Update a promo code by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedPromoCode = await updatePromoCode(req.params.id, req.body);
    res.status(200).json(updatedPromoCode);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Delete a promo code by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPromoCode = await getPromoCodeById(req.params.id);
    await deletePromoCode(req.params.id);
    res.status(200).json({ message: `Promo code '${deletedPromoCode.code}' successfully deleted` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
