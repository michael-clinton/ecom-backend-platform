const PageView = require('../models/PageView'); // Import the PageView model

const trackPageView = async (req, res, next) => {
    try {
        const route = req.originalUrl;

        // Get userId from session if exists, else 'guest'
        const userId = (req.session && req.session.userId) || 'guest';

        await PageView.create({
            route,
            visitorId: userId,
            timestamp: new Date()
        });

        next();
    } catch (error) {
        console.error('Error tracking page view:', error);
        next();
    }
};

module.exports = trackPageView;
