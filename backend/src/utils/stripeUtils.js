// backend/src/utils/stripeUtils.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.updateStripeCustomer = async (user) => {
  if (!user.stripeCustomerId) {
    console.error('User does not have a Stripe customer ID');
    return;
  }

  try {
    await stripe.customers.update(user.stripeCustomerId, {
      name: user.name,
      email: user.email,
      metadata: {
        companyName: user.companyDetails.companyName,
        nip: user.companyDetails.nip,
        address: `${user.companyDetails.address} ${user.companyDetails.buildingNumber}`,
        postalCode: user.companyDetails.postalCode,
        city: user.companyDetails.city
      }
    });
    console.log(`Updated Stripe customer data for user ${user._id}`);
  } catch (error) {
    console.error('Error updating Stripe customer:', error);
  }
};