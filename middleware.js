const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first');
        return res.redirect('/login');
    }else{
        next();
    }
}


module.exports.validateCampground = (req,res,next) => {
    const result = campgroundSchema.validate(req.body);
    if(result.error){
        const message = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(message,400);
    } else {
        next();
    }

    console.log(result);
}

module.exports.isAuthor = async(req,res,next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)) {
       req.flash('error',"You don't have the permission to do that");
       return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async(req,res,next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
       req.flash('error',"You don't have the permission to do that");
       return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next) => {
    const result = reviewSchema.validate(req.body);
    if(result.error){
        const message = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(message,400);
    } else {
        next();
    }

    console.log(result);
}