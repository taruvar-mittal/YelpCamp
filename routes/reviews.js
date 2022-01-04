const express = require('express');
const router = express.Router({ mergeParams : true })
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn } = require('../middleware');

const validateReview = (req,res,next) => {
    const result = reviewSchema.validate(req.body);
    if(result.error){
        const message = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(message,400);
    } else {
        next();
    }

    console.log(result);
}

router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash('success','Successfully created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId',isLoggedIn, catchAsync(async(req,res)=>{
   const {id, reviewId} = req.params;
   await Campground.findByIdAndUpdate(id, { $pull : { reviews:reviewId }});
   await Review.findByIdAndDelete(reviewId);
   req.flash('success','Successfully deleted a review!');
   res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;