// // src/pages/Pricing.jsx
// import { useState } from 'react'
// import {
//   Box,
//   Grid,
//   GridItem,
//   Card,
//   CardBody,
//   CardHeader,
//   Heading,
//   Text,
//   VStack,
//   List,
//   ListItem,
//   ListIcon,
//   Button,
//   Badge,
//   useToast,
// } from '@chakra-ui/react'
// import { FiCheck, FiX, FiStar } from 'react-icons/fi'
// import { loadStripe } from '@stripe/stripe-js'
// import axios from 'axios'
// import { useAuth } from '../contexts/AuthContext'

// const Pricing = () => {
//   const [loading, setLoading] = useState(false)
//   const { user } = useAuth()
//   const toast = useToast()

//   const plans = [
//     {
//       name: 'Free',
//       price: '0',
//       period: 'forever',
//       color: 'gray',
//       features: [
//         { text: '5 posts per day', included: true },
//         { text: 'Basic AI generation', included: true },
//         { text: '3 trending hashtags', included: true },
//         { text: 'Post history (50 items)', included: true },
//         { text: 'Priority support', included: false },
//         { text: 'Custom templates', included: false },
//         { text: 'Bulk generation', included: false },
//         { text: 'API access', included: false },
//       ],
//       cta: user ? 'Current Plan' : 'Get Started',
//       disabled: user?.subscription === 'free',
//     },
//     {
//       name: 'Pro',
//       price: '9.99',
//       period: 'per month',
//       color: 'brand',
//       popular: true,
//       features: [
//         { text: 'Unlimited posts', included: true },
//         { text: 'Advanced AI (GPT-4)', included: true },
//         { text: 'All trending hashtags', included: true },
//         { text: 'Unlimited post history', included: true },
//         { text: 'Priority support', included: true },
//         { text: 'Custom templates', included: true },
//         { text: 'Bulk generation', included: true },
//         { text: 'API access', included: true },
//       ],
//       cta: user?.subscription === 'pro' ? 'Current Plan' : 'Upgrade Now',
//       disabled: user?.subscription === 'pro',
//     },
//   ]

//   // const handleSubscribe = async () => {
//   //   if (!user) {
//   //     toast({
//   //       title: 'Please login',
//   //       description: 'You need to be logged in to upgrade',
//   //       status: 'warning',
//   //       duration: 3000,
//   //     })
//   //     return
//   //   }

//   //   setLoading(true)
//   //   try {
//   //     const response = await axios.post('http://localhost:5000/api/subscription/create-session')
      
//   //     const stripe = await loadStripe('pk_test_51SfPK2HznAEQAbqoR0T5FpV07bL1Z2ZC0v8Q5qXtZL0e1FTrsEKJ4p7ZHZz5eFfvD4KZQgPcCBF9A8qNjBz6kV9N00dM5qB2L1')
      
//   //     const { error } = await stripe.redirectToCheckout({
//   //       sessionId: response.data.sessionId,
//   //     })
      
//   //     if (error) {
//   //       throw new Error(error.message)
//   //     }
//   //   } catch (error) {
//   //     console.error('Checkout error:', error)
//   //     toast({
//   //       title: 'Error',
//   //       description: error.response?.data?.message || 'Failed to initiate checkout',
//   //       status: 'error',
//   //       duration: 5000,
//   //     })
//   //     setLoading(false)
//   //   }
//   // }
//   const handleSubscribe = async () => {
//   if (!user) {
//     toast({
//       title: 'Please login',
//       description: 'You need to be logged in to upgrade',
//       status: 'warning',
//       duration: 3000,
//     });
//     navigate('/login');
//     return;
//   }

//   setLoading(true);
  
//   try {
//     // Call your backend API
//     const response = await axios.post('http://localhost:5000/api/subscription/create-session');
    
//     if (response.data.sessionId) {
//       // Initialize Stripe with your publishable key
//       const stripe = await loadStripe('pk_test_51SfPK2HznAEQAbqoR0T5FpV07bL1Z2ZC0v8Q5qXtZL0e1FTrsEKJ4p7ZHZz5eFfvD4KZQgPcCBF9A8qNjBz6kV9M00dM5qB2L1');
      
//       // Redirect to Stripe Checkout
//       const { error } = await stripe.redirectToCheckout({
//         sessionId: response.data.sessionId,
//       });
      
//       if (error) {
//         throw new Error(error.message);
//       }
//     } else {
//       throw new Error('No session ID received');
//     }
//   } catch (error) {
//     console.error('Checkout error:', error);
    
//     // Show detailed error message
//     let errorMessage = 'Failed to initiate checkout';
    
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       console.error('Response data:', error.response.data);
//       console.error('Response status:', error.response.status);
      
//       if (error.response.status === 500) {
//         errorMessage = 'Server error: ' + (error.response.data?.message || 'Internal server error');
//       } else if (error.response.status === 400) {
//         errorMessage = error.response.data?.message || 'Bad request';
//       }
//     } else if (error.request) {
//       // The request was made but no response was received
//       errorMessage = 'No response from server. Please check your internet connection.';
//     } else {
//       // Something happened in setting up the request
//       errorMessage = error.message || 'Request setup failed';
//     }
    
//     toast({
//       title: 'Checkout Failed',
//       description: errorMessage,
//       status: 'error',
//       duration: 5000,
//     });
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <Box>
//       <Box textAlign="center" mb={10}>
//         <Heading size="lg" mb={3}>Simple, Transparent Pricing</Heading>
//         <Text color="gray.600" maxW="2xl" mx="auto">
//           Choose the perfect plan for your content creation needs. 
//           All plans include our core AI generation features.
//         </Text>
//       </Box>

//       <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8} maxW="4xl" mx="auto">
//         {plans.map((plan) => (
//           <GridItem key={plan.name}>
//             <Card 
//               borderWidth={plan.popular ? '2px' : '1px'} 
//               borderColor={plan.popular ? 'brand.500' : 'gray.200'}
//               position="relative"
//               h="100%"
//             >
//               {plan.popular && (
//                 <Badge
//                   position="absolute"
//                   top={-3}
//                   left="50%"
//                   transform="translateX(-50%)"
//                   colorScheme="brand"
//                   px={4}
//                   py={1}
//                   borderRadius="full"
//                 >
//                   Most Popular
//                 </Badge>
//               )}
              
//               <CardHeader textAlign="center" pb={0}>
//                 <Heading size="md" color={`${plan.color}.600`}>
//                   {plan.name}
//                 </Heading>
//                 <Box mt={4}>
//                   <Text as="span" fontSize="4xl" fontWeight="bold">
//                     ${plan.price}
//                   </Text>
//                   {plan.period && (
//                     <Text as="span" color="gray.500" ml={2}>
//                       /{plan.period}
//                     </Text>
//                   )}
//                 </Box>
//               </CardHeader>
              
//               <CardBody>
//                 <VStack spacing={6} align="stretch" h="100%">
//                   <List spacing={3} flex="1">
//                     {plan.features.map((feature, index) => (
//                       <ListItem key={index} display="flex" alignItems="center">
//                         <ListIcon
//                           as={feature.included ? FiCheck : FiX}
//                           color={feature.included ? 'green.500' : 'red.500'}
//                           boxSize={5}
//                         />
//                         <Text
//                           color={feature.included ? 'gray.700' : 'gray.400'}
//                           textDecoration={feature.included ? 'none' : 'line-through'}
//                         >
//                           {feature.text}
//                         </Text>
//                       </ListItem>
//                     ))}
//                   </List>
                  
//                   <Button
//                     colorScheme={plan.color}
//                     size="lg"
//                     w="100%"
//                     isDisabled={plan.disabled || loading}
//                     isLoading={plan.name === 'Pro' && loading}
//                     loadingText="Processing..."
//                     onClick={plan.name === 'Pro' ? handleSubscribe : undefined}
//                   >
//                     {plan.cta}
//                   </Button>
                  
//                   {plan.name === 'Free' && user && (
//                     <Text fontSize="sm" color="gray.500" textAlign="center">
//                       You're currently on the Free plan
//                     </Text>
//                   )}
//                 </VStack>
//               </CardBody>
//             </Card>
//           </GridItem>
//         ))}
//       </Grid>

//       <Card mt={8} maxW="4xl" mx="auto">
//         <CardBody>
//           <VStack spacing={4} align="stretch">
//             <Heading size="md">Frequently Asked Questions</Heading>
            
//             <Box>
//               <Text fontWeight="bold" mb={2}>Can I cancel anytime?</Text>
//               <Text color="gray.600">
//                 Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
//               </Text>
//             </Box>
            
//             <Box>
//               <Text fontWeight="bold" mb={2}>What payment methods do you accept?</Text>
//               <Text color="gray.600">
//                 We accept all major credit cards through Stripe's secure payment processing.
//               </Text>
//             </Box>
            
//             <Box>
//               <Text fontWeight="bold" mb={2}>Is there a free trial?</Text>
//               <Text color="gray.600">
//                 The Free plan is always free. For the Pro plan, we offer a 14-day money-back guarantee.
//               </Text>
//             </Box>
//           </VStack>
//         </CardBody>
//       </Card>
//     </Box>
//   )
// }

// export default Pricing


import { useState } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  ListIcon,
  Button,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { FiCheck, FiX } from 'react-icons/fi'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Pricing = () => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Free',
      price: '0',
      period: 'forever',
      color: 'gray',
      features: [
        { text: '5 posts per day', included: true },
        { text: 'Basic AI generation', included: true },
        { text: '3 trending hashtags', included: true },
        { text: 'Post history (50 items)', included: true },
        { text: 'Priority support', included: false },
        { text: 'Custom templates', included: false },
        { text: 'Bulk generation', included: false },
        { text: 'API access', included: false },
      ],
      cta: user ? 'Current Plan' : 'Get Started',
      disabled: user?.subscription === 'free',
    },
    {
      name: 'Pro',
      price: '9.99',
      period: 'per month',
      color: 'brand',
      popular: true,
      features: [
        { text: 'Unlimited posts', included: true },
        { text: 'Advanced AI (GPT-4)', included: true },
        { text: 'All trending hashtags', included: true },
        { text: 'Unlimited post history', included: true },
        { text: 'Priority support', included: true },
        { text: 'Custom templates', included: true },
        { text: 'Bulk generation', included: true },
        { text: 'API access', included: true },
      ],
      cta: user?.subscription === 'pro' ? 'Current Plan' : 'Upgrade Now',
      disabled: user?.subscription === 'pro',
    },
  ]

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to upgrade',
        status: 'warning',
        duration: 3000,
      })
      navigate('/login')
      return
    }

    setLoading(true)
    
    try {
      // Call backend to create checkout session
      const response = await axios.post('http://localhost:5000/api/subscription/create-session')
      
      if (response.data.url) {
        // NEW METHOD: Redirect directly to Stripe Checkout URL
        window.location.href = response.data.url
      } else if (response.data.sessionId) {
        // OLD METHOD (deprecated) - fallback
        const stripe = await loadStripe('pk_test_51SfPK2HznAEQAbqoR0T5FpV07bL1Z2ZC0v8Q5qXtZL0e1FTrsEKJ4p7ZHZz5eFfvD4KZQgPcCBF9A8qNjBz6kV9M00dM5qB2L1')
        
        // NEW: Use redirectToCheckout with different method
        // Note: The old redirectToCheckout is deprecated, so we use window.location
        // as a fallback
        window.location.href = `https://checkout.stripe.com/c/pay/${response.data.sessionId}`
      } else {
        throw new Error('No checkout URL or session ID received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      
      let errorMessage = 'Failed to initiate checkout'
      
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        
        if (error.response.status === 500) {
          errorMessage = 'Server error: ' + (error.response.data?.message || 'Internal server error')
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Bad request'
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.'
      } else {
        errorMessage = error.message || 'Request setup failed'
      }
      
      toast({
        title: 'Checkout Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      })
      setLoading(false)
    }
    // Note: We don't setLoading(false) here because page will redirect
  }

  return (
    <Box>
      <Box textAlign="center" mb={10}>
        <Heading size="lg" mb={3}>Simple, Transparent Pricing</Heading>
        <Text color="gray.600" maxW="2xl" mx="auto">
          Choose the perfect plan for your content creation needs. 
          All plans include our core AI generation features.
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8} maxW="4xl" mx="auto">
        {plans.map((plan) => (
          <GridItem key={plan.name}>
            <Card 
              borderWidth={plan.popular ? '2px' : '1px'} 
              borderColor={plan.popular ? 'brand.500' : 'gray.200'}
              position="relative"
              h="100%"
            >
              {plan.popular && (
                <Badge
                
                  position="absolute"
                  top={-3}
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="brand"
                  px={4}
                  py={1}
                  borderRadius="full"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader textAlign="center" pb={0}>
                <Heading size="md" color={`${plan.color}.600`}>
                  {plan.name}
                </Heading>
                <Box mt={4}>
                  <Text as="span" fontSize="4xl" fontWeight="bold">
                    ${plan.price}
                  </Text>
                  {plan.period && (
                    <Text as="span" color="gray.500" ml={2}>
                      /{plan.period}
                    </Text>
                  )}
                </Box>
              </CardHeader>
              
              <CardBody>
                <VStack spacing={6} align="stretch" h="100%">
                  <List spacing={3} flex="1">
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} display="flex" alignItems="center">
                        <ListIcon
                          as={feature.included ? FiCheck : FiX}
                          color={feature.included ? 'green.500' : 'red.500'}
                          boxSize={5}
                        />
                        <Text
                          color={feature.included ? 'gray.700' : 'gray.400'}
                          textDecoration={feature.included ? 'none' : 'line-through'}
                        >
                          {feature.text}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button
                    colorScheme={plan.color}
                    size="lg"
                    w="100%"
                    isDisabled={plan.disabled || loading}
                    isLoading={plan.name === 'Pro' && loading}
                    loadingText="Processing..."
                    onClick={plan.name === 'Pro' ? handleSubscribe : undefined}
                  >
                    {plan.cta}
                  </Button>
                  
                  {plan.name === 'Free' && user && (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      You're currently on the Free plan
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Card mt={8} maxW="4xl" mx="auto">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Frequently Asked Questions</Heading>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Can I cancel anytime?</Text>
              <Text color="gray.600">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
              </Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={2}>What payment methods do you accept?</Text>
              <Text color="gray.600">
                We accept all major credit cards through Stripe's secure payment processing.
              </Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Is there a free trial?</Text>
              <Text color="gray.600">
                The Free plan is always free. For the Pro plan, we offer a 14-day money-back guarantee.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Pricing