import api from './api';

// Opens WhatsApp with a pre-filled message for product enquiry
export const whatsappProduct = async ({ product, selectedMaterial, selectedSize, quantity }) => {
  try {
    const { data } = await api.post('/contact/whatsapp/product', {
      productName: product.name,
      productType: product.type,
      selectedMaterial,
      selectedSize,
      quantity,
      price: product.price,
      productUrl: window.location.href,
    });
    window.open(data.url, '_blank');
  } catch {
    // Fallback — build URL client side
    const number = process.env.REACT_APP_WHATSAPP || '9279921642';
    const msg = `💎 WYW Jewellery Enquiry\n\nProduct: ${product.name}\nType: ${product.type}\nMaterial: ${selectedMaterial || '—'}\nSize: ${selectedSize || '—'}\n\nI'm interested in this piece!`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
  }
};

// Opens WhatsApp with custom order details
export const whatsappCustom = async (formData) => {
  try {
    const { data } = await api.post('/contact/whatsapp/custom', formData);
    window.open(data.url, '_blank');
  } catch {
    const number = process.env.REACT_APP_WHATSAPP || '9279921642';
    const msg = `✂️ WYW Custom Order\n\nName: ${formData.firstName} ${formData.lastName}\nType: ${formData.jewelleryType}\nVision: ${formData.vision}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
  }
};

// General WhatsApp contact
export const whatsappGeneral = (name = '', message = '') => {
  const number = process.env.REACT_APP_WHATSAPP || '9279921642';
  const msg = `👋 WYW Jewellery Enquiry\n\nName: ${name}\n\n${message}`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Returns the static WhatsApp chat link
export const whatsappLink = () => {
  const number = process.env.REACT_APP_WHATSAPP || '9279921642';
  return `https://wa.me/${number}`;
};
