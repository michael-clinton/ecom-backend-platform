const corsOptions = {
    origin: ['http://localhost:5173', 'https://ecom-frontend-platform.vercel.app'], // Replace with allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  };
  
  module.exports = corsOptions;
