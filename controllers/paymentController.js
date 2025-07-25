import Stripe from "stripe";
import Charges from "../models/chargesSchema.js";
import Subscription from "../models/subscriptionSchema.js";

const stripe = new Stripe(process.env.STRIPE_KEY);
export const checkoutSession = async (req, res) => {
  const { products, orderID, totalAmount } = req.body;
  const platformCharges = await Charges.findOne({ name: "Platform Charge" });
  const deliveryCharges = await Charges.findOne({ name: "Delivery Charge" });
  const line_items = products.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.productID.name,
      },
      unit_amount: Math.round(product.price * 100),
    },
    quantity: product.quantity,
  }));

  line_items.push({
    price_data: {
      currency: "inr",
      product_data: {
        name: "CGST (9%)",
      },
      unit_amount: Math.round(totalAmount * (9 / 100) * 100),
    },
    quantity: 1,
  });

  line_items.push({
    price_data: {
      currency: "inr",
      product_data: {
        name: "SGST (9%)",
      },
      unit_amount: Math.round(totalAmount * (9 / 100) * 100),
    },
    quantity: 1,
  });

  line_items.push({
    price_data: {
      currency: "inr",
      product_data: {
        name: `Platform Charges (${platformCharges.chargePercent}%)`,
      },
      unit_amount: Math.round(
        totalAmount * (platformCharges.chargePercent / 100) * 100
      ),
    },
    quantity: 1,
  });

  if (deliveryCharges?.chargePercent > 0) {
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `Delivery Charges`,
        },
        unit_amount: Math.round(
          totalAmount * (deliveryCharges.chargePercent / 100) * 100
        ),
      },
      quantity: 1,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/`,
      metadata: {
        orderID,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const basePlanCheckout = async (req, res) => {
  const { priceID } = req.body;
  const user = req.user;
  let stripeCustomerId;

  let subscriptionRecord = await Subscription.findOne({ userID: user._id });
  if (!subscriptionRecord) {
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user._id.toString() },
    });

    subscriptionRecord = await Subscription.create({
      userID: user._id,
      customerID: stripeCustomer.id,
    });

    stripeCustomerId = stripeCustomer.id;
  } else {
    stripeCustomerId = subscriptionRecord.customerID;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceID,
          quantity: 1,
        },
      ],
      customer: stripeCustomerId,
      success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/`,
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
