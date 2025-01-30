
  /** SESSION TOKENS DE SHOPIFY */
  import { getSessionToken } from '@shopify/app-bridge-utils';
  import createApp from '@shopify/app-bridge';
  
  const app = createApp({
    apiKey: 'your-api-key',
    shopOrigin: 'your-shop.myshopify.com',
    forceRedirect: true,
  });
  
  async function fetchWithSessionToken(url) {
    const token = await getSessionToken(app); // Get the session token
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token to the request
      },
    });
  
    return response.json();
  }
  
  // Example usage
  fetchWithSessionToken('/protected').then((data) => console.log(data));