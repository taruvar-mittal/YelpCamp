const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor }  = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });



router.route('/')
      .get(catchAsync(campgrounds.index))
      .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createNewCampground))

router.get('/new',isLoggedIn, campgrounds.renderNewForm );
 
router.get('/:id', catchAsync(campgrounds.showCampground))
 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
 
router.put('/:id',isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
 
router.delete('/:id',isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;