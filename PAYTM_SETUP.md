# Paytm Payment Gateway Setup Guide

## Environment Variables Required

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/harmoniq_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Server Configuration
PORT=4000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Paytm Payment Gateway Configuration
# Get these from Paytm Dashboard: https://dashboard.paytm.com/

# Merchant Credentials
PAYTM_MID=YOUR_MID_HERE
PAYTM_MERCHANT_KEY=YOUR_MERCHANT_KEY_HERE

# Website Configuration
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE_ID=Retail

# URLs (staging)
PAYTM_CALLBACK_URL=http://localhost:4000/api/payment/callback
PAYTM_TXN_STATUS_URL=https://securegw-stage.paytm.in/merchant-status/getTxnStatus
PAYTM_TXN_URL=https://securegw-stage.paytm.in/theia/processTransaction
PAYTM_REFUND_URL=https://securegw-stage.paytm.in/refund/apply

# Environment (staging/production)
PAYTM_ENVIRONMENT=staging

# App Configuration
APP_URL=http://localhost:5173

# Payment Configuration
PAYTM_PAYMENT_TIMEOUT=15
```

## How to Get Paytm Credentials

### 1. Create Paytm Merchant Account
- Visit [Paytm Dashboard](https://dashboard.paytm.com/)
- Sign up for a merchant account
- Complete KYC verification

### 2. Get API Credentials
- Login to Paytm Dashboard
- Go to **Developer** → **API Keys**
- Copy your **Merchant ID (MID)** and **Merchant Key**

### 3. Configure Website
- In Dashboard, go to **Settings** → **Website**
- Add your website details
- Set callback URL: `http://localhost:4000/api/payment/callback` (for development)

### 4. Test Credentials
For testing, you can use Paytm's test credentials:
- **MID**: `YOUR_MID_HERE` (replace with your actual MID)
- **Merchant Key**: `YOUR_MERCHANT_KEY_HERE` (replace with your actual key)
- **Website**: `WEBSTAGING` (for testing)

## Production Setup

When moving to production:

1. **Update Environment Variables**:
   ```env
   PAYTM_WEBSITE=YOUR_PRODUCTION_WEBSITE
   PAYTM_CALLBACK_URL=https://yourdomain.com/api/payment/callback
   PAYTM_TXN_STATUS_URL=https://securegw.paytm.in/merchant-status/getTxnStatus
   PAYTM_TXN_URL=https://securegw.paytm.in/theia/processTransaction
   PAYTM_REFUND_URL=https://securegw.paytm.in/refund/apply
   PAYTM_ENVIRONMENT=production
   APP_URL=https://yourdomain.com
   ```

2. **Update CORS Settings**:
   ```env
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **SSL Certificate**: Ensure your production server has SSL certificate

## Database Migration

Run the database migration to create the transactions table:

```bash
cd server
npm run migrate
```

## Testing the Payment System

1. **Start the server**:
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Test Payment Flow**:
   - Add items to cart in the store
   - Click "Checkout"
   - Fill payment form
   - Complete Paytm payment

## API Endpoints

- `POST /api/payment/create-payment` - Create payment request
- `POST /api/payment/callback` - Paytm callback (webhook)
- `GET /api/payment/status/:orderId` - Check payment status
- `GET /api/payment/transactions` - Get user transactions
- `POST /api/payment/refund` - Process refund
- `GET /api/payment/config` - Get payment configuration

## Security Notes

1. **Never commit** `.env` file to version control
2. **Use HTTPS** in production
3. **Validate** all payment callbacks
4. **Log** all transactions for audit
5. **Implement** proper error handling

## Troubleshooting

### Common Issues:

1. **Invalid Checksum**: Check if Merchant Key is correct
2. **CORS Errors**: Update CORS_ORIGIN in .env
3. **Database Errors**: Ensure database is running and migrated
4. **Callback Issues**: Check if callback URL is accessible

### Debug Mode:
Set `NODE_ENV=development` to enable detailed error logging.

