const { default: mongoose } = require('mongoose');
const mediaDB = require('../../models/media/media')

const getMedia = async (req, res) => {
    const { mediaType, sender, conversationId } = req.body;
    let message;
    let status;

    try {
        let query = {
            "$or": [{ sender: new mongoose.Types.ObjectId(sender) }],
            mediaType: mediaType || 'images'
        };

        // Add conversationId conditionally if it exists
        if (conversationId) {
            query["$or"].push({ conversationId: new mongoose.Types.ObjectId(conversationId) });
        }

        const data = await mediaDB.find(query);
        //// console.log({ data });

        if (data.length > 0) {
            message = 'Media found';
            status = 201;
        } else {
            message = 'Media not found';
            status = 401;
        }

        res.status(201).json({
            message: message,
            status: status,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: `Failed due to ${error}`
        });
    }
};

module.exports = { getMedia }