# WhatsApp Integration Setup

## Step 1 — Set your WhatsApp number in Backend

Open `backend/.env` and set your number:
```env
WHATSAPP_NUMBER=9279921642
```

**Format rules:**
- Country code + number, NO `+`, NO spaces, NO dashes
- India (+91): `91` + 10-digit number → `9279921642`
- USA (+1):    `1`  + 10-digit number → `12025551234`

## Step 2 — Set your WhatsApp number in Frontend

Open `frontend/.env` and set:
```env
REACT_APP_WHATSAPP=9279921642
```

## Step 3 — Restart both servers

```cmd
# Backend terminal
npm run dev

# Frontend terminal  
npm start
```

---

## What happens when someone clicks WhatsApp:

### On Product Page:
```
💎 WYW Jewellery — Product Enquiry

🛍️ Product: Iced Out Cuban Chain 20"
📦 Type: Chain
✨ Material: 14K Gold
📏 Size: 22"
🔢 Quantity: 2
💰 Price: ₹4,999
🔗 Link: http://localhost:3000/product/...

I'm interested in this piece. Please share more details!
```

### On Custom Order Page:
```
✂️ WYW Jewellery — Custom Order Request

👤 Name: Rahul Sharma
💎 Type: Pendant
💰 Budget: ₹10,000 – ₹20,000

📝 Vision:
I want a custom pendant with my initials "RS" ...

Please get back to me with a quote. Thank you!
```

### On Contact Page:
```
👋 WYW Jewellery — General Enquiry

👤 Name: Rahul Sharma
💬 Message: [Subject] I want to know about bulk orders...
```

---

## WhatsApp Business (Recommended)

For a business, use **WhatsApp Business** app:
1. Download WhatsApp Business on your phone
2. Use the same number you set in `.env`
3. Set up:
   - Business name: WYW Jewellery
   - Auto-reply for when you're offline
   - Quick replies for common questions
   - Business hours

This way customers get professional responses automatically.
