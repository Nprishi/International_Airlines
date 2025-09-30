// Payment service for handling various payment methods
export interface PaymentRequest {
  amount: number;
  currency: 'USD' | 'NPR';
  paymentMethod: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  successUrl: string;
  failureUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message: string;
  redirectForm?: string;
}

// eSewa Payment Integration
export class ESewaPaymentService {
  private static readonly ESEWA_URL = "https://uat.esewa.com.np/epay/main";
  private static readonly VERIFY_URL = "https://uat.esewa.com.np/epay/transrec";
  private static readonly MERCHANT_CODE = "EPAYTEST";

  static async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Convert USD to NPR if needed
      const amountInNPR = request.currency === 'USD' 
        ? Math.round(request.amount * 133.25) 
        : request.amount;

      const params = {
        amt: amountInNPR,
        psc: 0, // Service charge
        pdc: 0, // Delivery charge
        txAmt: 0, // Tax amount
        tAmt: amountInNPR, // Total amount
        pid: request.orderId,
        scd: this.MERCHANT_CODE,
        su: request.successUrl,
        fu: request.failureUrl,
      };

      console.log('eSewa Payment Parameters:', params);
      // Create auto-submitting form HTML
      const form = `
        <html>
        <head>
          <title>Redirecting to eSewa...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              text-align: center;
              background: white;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body onload="setTimeout(() => document.forms[0].submit(), 1000)">
          <div class="container">
            <div class="spinner"></div>
            <h2>Redirecting to eSewa Payment Gateway...</h2>
            <p>Please wait while we redirect you to complete your payment.</p>
            <p><strong>Amount:</strong> NPR ${amountInNPR.toLocaleString()}</p>
            <p><strong>Order ID:</strong> ${request.orderId}</p>
            <p><strong>Merchant:</strong> ${this.MERCHANT_CODE}</p>
          </div>
          <form action="${this.ESEWA_URL}" method="POST" style="display: none;">
            ${Object.entries(params)
              .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}" />`)
              .join("")}
          </form>
          <script>
            console.log('eSewa Form Parameters:', ${JSON.stringify(params)});
          </script>
        </body>
        </html>
      `;

      return {
        success: true,
        redirectForm: form,
        transactionId: request.orderId,
        message: 'Redirecting to eSewa payment gateway'
      };
    } catch (error) {
      console.error('eSewa Payment Initiation Error:', error);
      return {
        success: false,
        message: 'Failed to initiate eSewa payment: ' + (error as Error).message
      };
    }
  }

  static async verifyPayment(
    orderId: string, 
    amount: number, 
    refId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Verifying eSewa Payment:', { orderId, amount, refId });
      
      const response = await fetch('/api/verify-esewa-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          refId,
          merchantCode: this.MERCHANT_CODE
        })
      });

      console.log('Verification Response Status:', response.status);
      const result = await response.json();
      console.log('Verification Result:', result);
      return result;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      return {
        success: false,
        message: 'Payment verification failed: ' + (error as Error).message
      };
    }
  }
}

// Other Nepal Payment Services (Mock implementations)
export class KhaltiPaymentService {
  static async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Mock Khalti integration
    return {
      success: true,
      paymentUrl: `https://khalti.com/payment?amount=${request.amount}&order_id=${request.orderId}`,
      transactionId: request.orderId,
      message: 'Redirecting to Khalti payment gateway'
    };
  }
}

export class IMEPayService {
  static async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Mock IME Pay integration
    return {
      success: true,
      paymentUrl: `https://imepay.com.np/payment?amount=${request.amount}&order_id=${request.orderId}`,
      transactionId: request.orderId,
      message: 'Redirecting to IME Pay gateway'
    };
  }
}

export class ConnectIPSService {
  static async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Mock ConnectIPS integration
    return {
      success: true,
      paymentUrl: `https://connectips.com/payment?amount=${request.amount}&order_id=${request.orderId}`,
      transactionId: request.orderId,
      message: 'Redirecting to ConnectIPS gateway'
    };
  }
}

// Main Payment Service Factory
export class PaymentServiceFactory {
  static getService(paymentMethod: string) {
    switch (paymentMethod) {
      case 'esewa':
        return ESewaPaymentService;
      case 'khalti':
        return KhaltiPaymentService;
      case 'ime-pay':
        return IMEPayService;
      case 'connect-ips':
        return ConnectIPSService;
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  }
}