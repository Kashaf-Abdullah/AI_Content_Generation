require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function verifyPrice() {
  const priceId = 'price_1StX5wQZTQeJQFjS1XDdXmjA';
  
  console.log('Verifying price ID:', priceId);
  console.log('Using Stripe key starting with:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');
  
  try {
    // Try to retrieve the price
    const price = await stripe.prices.retrieve(priceId);
    
    console.log('\n✅ PRICE FOUND!');
    console.log('Product ID:', price.product);
    console.log('Amount:', price.unit_amount / 100, price.currency);
    console.log('Active:', price.active);
    console.log('Type:', price.type);
    
    if (price.recurring) {
      console.log('Recurring interval:', price.recurring.interval);
    }
    
    // Also get product details
    const product = await stripe.products.retrieve(price.product);
    console.log('\nProduct Details:');
    console.log('Name:', product.name);
    console.log('Description:', product.description);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Error type:', error.type);
    
    // List all available prices to see what exists
    console.log('\n🔍 Listing all available prices...');
    try {
      const prices = await stripe.prices.list({ limit: 10 });
      console.log(`Found ${prices.data.length} price(s):`);
      
      prices.data.forEach(p => {
        const productName = p.product || 'Unknown product';
        console.log(`- ${p.id}: $${p.unit_amount/100}/${p.recurring?.interval || 'one-time'} (${p.active ? 'active' : 'inactive'})`);
      });
    } catch (listError) {
      console.error('Could not list prices:', listError.message);
    }
  }
}

verifyPrice();