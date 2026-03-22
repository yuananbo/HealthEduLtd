import Patient from "../../models/patient.model.js";

export const getMyCart = async (req, res) => {
  try {
    const me = await Patient.findById(req.user._id).select("cartItems");
    return res.json({ items: me?.cartItems ?? [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { deviceId, name, unitPrice, quantity = 1 } = req.body || {};
    if (!deviceId || !name || typeof unitPrice !== "number") {
      return res.status(400).json({ message: "deviceId, name, unitPrice are required" });
    }
    const me = await Patient.findById(req.user._id).select("cartItems");
    const items = me.cartItems || [];
    const existingIndex = items.findIndex((it) => it.deviceId === deviceId);
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ deviceId, name, unitPrice, quantity: Math.max(1, quantity) });
    }
    me.cartItems = items;
    await me.save();
    return res.status(200).json({ items: me.cartItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add to cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { quantity } = req.body || {};
    if (!deviceId || typeof quantity !== "number") {
      return res.status(400).json({ message: "deviceId param and numeric quantity required" });
    }
    const me = await Patient.findById(req.user._id).select("cartItems");
    const idx = me.cartItems.findIndex((it) => it.deviceId === deviceId);
    if (idx < 0) return res.status(404).json({ message: "Item not found" });
    if (quantity <= 0) {
      me.cartItems.splice(idx, 1);
    } else {
      me.cartItems[idx].quantity = quantity;
    }
    await me.save();
    return res.json({ items: me.cartItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const me = await Patient.findById(req.user._id).select("cartItems");
    const next = (me.cartItems || []).filter((it) => it.deviceId !== deviceId);
    me.cartItems = next;
    await me.save();
    return res.json({ items: me.cartItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove cart item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.user._id, { $set: { cartItems: [] } });
    return res.json({ items: [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};

