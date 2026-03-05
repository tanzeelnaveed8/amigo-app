const Razorpay = require('razorpay');
const crypto = require('crypto');
const userCredentialDB = require('../../models/userAuth/userCredential');

let razorpay;
function getRazorpayInstance() {
    if (!razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured');
        }
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
}

exports.createOrder = async (req, res) => {
    const { amount, currency = 'INR', phoneNumber } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const options = {
            amount: Math.round(amount),
            currency,
            receipt: `rcpt_${phoneNumber}_${Date.now()}`,
            notes: {
                phoneNumber,
                purpose: 'premium_access_pass',
            },
        };

        const order = await getRazorpayInstance().orders.create(options);
        res.status(200).json({ order });
    } catch (err) {
        console.error('Razorpay create order error:', err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            error: err.error?.description || err.message || 'Failed to create order',
        });
    }
};

exports.verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
            success: false,
            error: 'Missing payment verification parameters',
        });
    }

    try {
        const sign = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return res.json({
                success: true,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
            });
        } else {
            return res.status(400).json({
                success: false,
                error: 'Payment signature verification failed',
            });
        }
    } catch (err) {
        console.error('Razorpay verify payment error:', err);
        return res.status(500).json({
            success: false,
            error: 'Payment verification failed due to server error',
        });
    }
};
