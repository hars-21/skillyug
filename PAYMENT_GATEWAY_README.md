# SkillyUG Payment Gateway Documentation

## Overview

This document provides comprehensive information about the SkillyUG payment gateway implementation using Razorpay for secure course purchases.

## Features

✅ **Secure Payment Processing**: Integration with Razorpay for secure transactions  
✅ **Multiple Payment Methods**: Support for cards, UPI, net banking, and wallets  
✅ **User Authentication**: Requires login before payment  
✅ **Real-time Verification**: Instant payment verification and course enrollment  
✅ **Error Handling**: Comprehensive error handling with user-friendly messages  
✅ **Responsive Design**: Mobile-first responsive design  
✅ **Indian Currency**: Full INR support with proper formatting  

## File Structure

```
frontend-nextjs/src/
├── app/
│   ├── payment/
│   │   ├── page.tsx              # Main payment page
│   │   ├── success/
│   │   │   └── page.tsx          # Payment success page
│   │   └── failure/
│   │       └── page.tsx          # Payment failure page
│   └── courses/
│       └── page.tsx              # Updated with payment integration
├── services/
│   └── paymentService.ts         # Payment service utilities
└── hooks/
    └── AuthContext.tsx           # Authentication context
```

## Payment Flow

### 1. Course Selection
- User browses courses on `/courses`
- Clicks "Enroll Now" button
- If not logged in, redirected to login page
- After login, redirected to payment page

### 2. Payment Page (`/payment`)
- Displays course details and pricing
- Shows security features
- Loads Razorpay configuration
- Processes payment with Razorpay SDK

### 3. Payment Processing
- Creates order via backend API
- Opens Razorpay checkout modal
- Handles payment success/failure
- Verifies payment signature
- Enrolls user in course

### 4. Post-Payment
- **Success**: Redirected to `/payment/success`
- **Failure**: Redirected to `/payment/failure`
- Course access granted immediately on success

## API Endpoints

### Backend Endpoints (Already Implemented)
```
GET    /api/payments/config           # Get Razorpay configuration
POST   /api/payments/create-order     # Create payment order
POST   /api/payments/verify           # Verify payment
POST   /api/payments/process-success  # Process successful payment
POST   /api/payments/handle-failure   # Handle payment failure
GET    /api/payments/:id/status       # Get payment status
```

### Frontend API Service
```typescript
// Payment Service Methods
PaymentService.getPaymentConfig()
PaymentService.createOrder(amount, courseId)
PaymentService.verifyPayment(verificationData)
PaymentService.processSuccessfulPayment(courseId, paymentData)
PaymentService.handlePaymentFailure(courseId, errorDetails)
```

## Usage Examples

### Basic Payment Integration
```typescript
import PaymentService from '@/services/paymentService';

// Navigate to payment page
router.push(`/payment?courseId=${courseId}&amount=${amount}`);

// Create payment order
const order = await PaymentService.createOrder(amount, courseId);
```

### Custom Payment Handler
```typescript
const handlePayment = async () => {
  try {
    const config = await PaymentService.getPaymentConfig();
    const order = await PaymentService.createOrder(amount, courseId);
    
    const options = {
      key: config.razorpayKey,
      amount: order.amount,
      currency: config.currency,
      order_id: order.id,
      handler: async (response) => {
        await PaymentService.verifyPayment({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          courseId: courseId,
        });
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

## URL Parameters

### Payment Page
- `courseId` (required): ID of the course to purchase
- `amount` (required): Amount to be paid in INR

### Success Page
- `courseId` (optional): Course ID for display
- `paymentId` (optional): Razorpay payment ID

### Failure Page
- `courseId` (optional): Course ID for retry
- `error` (optional): Error code
- `description` (optional): Error description

## Styling & Theme

The payment pages follow the SkillyUG design system:

### Colors
- **Primary Background**: Linear gradient from black to `#2741D6` to `#051C7F`
- **Card Background**: `rgba(0, 0, 0, 0.3)` with backdrop blur
- **Primary Button**: `#EB8216` (orange)
- **Text**: White with various opacities
- **Borders**: `rgba(59, 130, 246, 0.3)` (blue with opacity)

### Components
- Glassmorphism cards with backdrop blur
- Responsive grid layouts
- Smooth transitions and hover effects
- Loading states with spinners
- Toast notifications for feedback

## Security Features

### Payment Security
- 256-bit SSL encryption
- Razorpay's secure checkout
- Payment signature verification
- Server-side validation

### User Security
- Authentication required
- Session management
- CSRF protection
- Input validation

## Error Handling

### Payment Errors
- **Card Declined**: Clear messaging with retry option
- **Insufficient Funds**: Specific error with alternative payment methods
- **Network Issues**: Retry mechanism with helpful tips
- **Verification Failed**: Support contact information

### User Experience
- Loading states during processing
- Progress indicators
- Clear error messages
- Helpful troubleshooting tips
- Easy retry mechanisms

## Testing

### Test Scenarios
1. **Successful Payment**: Complete flow from course selection to enrollment
2. **Failed Payment**: Various failure scenarios (card declined, network error)
3. **User Not Logged In**: Redirect to login page
4. **Invalid Course**: Error handling for non-existent courses
5. **Network Issues**: Offline/online state handling

### Test Cards (Razorpay Test Mode)
```
Successful Payment: 4111 1111 1111 1111
Failed Payment: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Razorpay Configuration
The backend handles Razorpay configuration. Frontend gets the key via:
```typescript
const config = await PaymentService.getPaymentConfig();
```

## Deployment Notes

### Production Checklist
- [ ] Update Razorpay keys to production keys
- [ ] Test all payment flows
- [ ] Verify SSL certificates
- [ ] Set up monitoring and alerts
- [ ] Configure webhook endpoints
- [ ] Test mobile responsiveness

### Performance Optimization
- Lazy loading of Razorpay script
- Image optimization for course thumbnails
- Caching of payment configuration
- Minimize API calls

## Support & Maintenance

### Common Issues
1. **Payment not completing**: Check network and retry
2. **Course not accessible**: Verify enrollment status
3. **Receipt not generated**: Contact support

### Monitoring
- Payment success/failure rates
- API response times
- Error frequency and types
- User drop-off points

## Future Enhancements

### Planned Features
- [ ] Multiple course purchase (cart)
- [ ] Subscription-based payments
- [ ] Installment payments
- [ ] Coupon/discount codes
- [ ] Refund processing
- [ ] Payment analytics dashboard

### Technical Improvements
- [ ] Offline payment queue
- [ ] Advanced error recovery
- [ ] Payment retry logic
- [ ] Enhanced security measures

## Contact

For technical support or questions about the payment system:
- **Development Team**: [Your team contact]
- **Support Email**: [Support email]
- **Documentation**: This README and inline code comments

---

**Note**: This payment system is designed to work seamlessly with the existing SkillyUG backend. No changes are required to the backend payment logic.