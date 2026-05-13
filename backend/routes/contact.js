const express = require('express');
const router = express.Router();

// WhatsApp number from env (e.g. 919876543210 — country code + number, no + or spaces)
const WA_NUMBER = process.env.WHATSAPP_NUMBER || '9279921642';

// @desc  Generate WhatsApp link for a product enquiry
// @route POST /api/contact/whatsapp/product
router.post('/whatsapp/product', (req, res) => {
  const { productName, productType, selectedMaterial, selectedSize, quantity, price, productUrl } = req.body;
  if (!productName) return res.status(400).json({ success: false, message: 'productName required' });

  const lines = [
    `💎 *WYW Jewellery — Product Enquiry*`,
    ``,
    `🛍️ *Product:* ${productName}`,
    `📦 *Type:* ${productType || '—'}`,
    selectedMaterial ? `✨ *Material:* ${selectedMaterial}` : null,
    selectedSize     ? `📏 *Size:* ${selectedSize}` : null,
    quantity         ? `🔢 *Quantity:* ${quantity}` : null,
    price            ? `💰 *Price:* ₹${price}` : null,
    productUrl       ? `🔗 *Link:* ${productUrl}` : null,
    ``,
    `I'm interested in this piece. Please share more details!`,
  ].filter(Boolean).join('\n');

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
  res.json({ success: true, url, number: WA_NUMBER });
});

// @desc  Generate WhatsApp link for a custom order enquiry
// @route POST /api/contact/whatsapp/custom
router.post('/whatsapp/custom', (req, res) => {
  const { firstName, lastName, jewelleryType, vision, budget } = req.body;

  const lines = [
    `✂️ *WYW Jewellery — Custom Order Request*`,
    ``,
    `👤 *Name:* ${firstName || ''} ${lastName || ''}`.trim(),
    `💎 *Type:* ${jewelleryType || '—'}`,
    budget ? `💰 *Budget:* ${budget}` : null,
    ``,
    `📝 *Vision:*`,
    vision || '—',
    ``,
    `Please get back to me with a quote. Thank you!`,
  ].filter(Boolean).join('\n');

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
  res.json({ success: true, url, number: WA_NUMBER });
});

// @desc  Generate WhatsApp link for general contact
// @route POST /api/contact/whatsapp/general
router.post('/whatsapp/general', (req, res) => {
  const { name, message } = req.body;
  const lines = [
    `👋 *WYW Jewellery — General Enquiry*`,
    ``,
    name    ? `👤 *Name:* ${name}` : null,
    message ? `💬 *Message:* ${message}` : null,
  ].filter(Boolean).join('\n');

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
  res.json({ success: true, url });
});

module.exports = router;
