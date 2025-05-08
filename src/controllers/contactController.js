const Contact = require("../models/Contact");

const handleContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        console.log("Received form data:", req.body); // Debugging

        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        console.log("Contact saved:", newContact); // Debugging

        res.status(200).json({ message: "Contact saved successfully." });
    } catch (error) {
        console.error("Error saving contact:", error);
        res.status(500).json({ error: "Failed to save contact." });
    }
};

module.exports = { handleContactForm };
