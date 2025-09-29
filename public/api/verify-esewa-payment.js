// Mock API endpoint for eSewa payment verification
// In a real application, this would be a backend service

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, amount, refId, merchantCode } = req.body;

  // Simulate eSewa verification API call
  // In production, this would make an actual HTTP request to eSewa's verification endpoint
  try {
    // Mock verification logic
    if (refId && orderId && amount) {
      // Simulate successful verification (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          transactionId: refId,
          orderId: orderId,
          amount: amount
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
}