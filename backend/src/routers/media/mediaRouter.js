const express = require('express');
const router = express.Router();

// const {upload}=require('../../middleware/mediaUpload')
const {getMedia} =require('../../controllers/media/uploadMediacontroller');
const { verifyToken } = require('../../middleware/jwtToken');

// router.post('/upload-media',upload.single('media'),uploadMedia)

router.post('/get-media',verifyToken, getMedia)

module.exports=router