import { supabase } from '@/integrations/supabase/client';

export const initializeAdmin = async () => {
  try {
    const response = await fetch('https://ozubododfkoeyqpxiifl.supabase.co/functions/v1/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'Pedroab01287@@'
      })
    });

    const result = await response.json();
    console.log('Admin initialization result:', result);
    return result;
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};