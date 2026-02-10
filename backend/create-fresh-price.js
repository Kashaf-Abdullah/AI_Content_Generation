require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createFreshPrice() {
  console.log('=== Creating Fresh Price for PakPost ===\n');
  
  try {
    // Step 1: Check current account
    console.log('1. Checking Stripe account...');
    const balance = await stripe.balance.retrieve();
    console.log('✅ Account connected');
    console.log('   Currency:', balance.available[0].currency);
    console.log('   Mode:', process.env.STRIPE_SECRET_KEY.includes('_test_') ? 'TEST MODE' : 'LIVE MODE');
    
    // Step 2: Check existing products
    console.log('\n2. Checking existing products...');
    const products = await stripe.products.list({ limit: 5 });
    
    let product;
    if (products.data.length === 0) {
      console.log('   No products found, creating new one...');
      product = await stripe.products.create({
        name: 'PakPost Pro Monthly',
        description: 'Unlimited AI post generation - Monthly subscription',
        metadata: {
          created_by: 'pakpost_app',
          plan: 'pro_monthly'
        }
      });
      console.log('   ✅ Created product:', product.name);
    } else {
      product = products.data[0];
      console.log('   Found existing product:', product.name);
    }
    
    // Step 3: Create new price
    console.log('\n3. Creating new price...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 900, // $9.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Pro Monthly',
      metadata: {
        plan: 'pro_monthly',
        features: 'unlimited_posts'
      }
    });
    
    console.log('   ✅ Price created successfully!');
    console.log('\n' + '='.repeat(50));
    console.log('🎉 PRICE CREATION COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📋 COPY THIS TO YOUR .env FILE:');
    console.log('='.repeat(50));
    console.log(`STRIPE_PRO_PRICE_ID=${price.id}`);
    console.log('='.repeat(50));
    
    console.log('\n📊 Price Details:');
    console.log('   - Price ID:', price.id);
    console.log('   - Amount: $9.00 USD/month');
    console.log('   - Product:', product.name);
    console.log('   - Active:', price.active ? 'Yes' : 'No');
    
    // Step 4: Verify it works
    console.log('\n4. Verifying price retrieval...');
    const verifyPrice = await stripe.prices.retrieve(price.id);
    console.log('   ✅ Verification successful!');
    
    // Step 5: Show all prices for reference
    console.log('\n5. Listing all prices in account:');
    const allPrices = await stripe.prices.list({ limit: 10 });
    console.log(`   Total prices: ${allPrices.data.length}`);
    allPrices.data.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.id} - $${p.unit_amount/100}/${p.recurring?.interval || 'one-time'}`);
    });
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Full error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 TIPS:');
      console.log('1. Check your Stripe secret key in .env file');
      console.log('2. Make sure you\'re in the correct mode (test vs live)');
      console.log('3. Try creating a new API key from Stripe dashboard');
    }
  }
}

createFreshPrice();