const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas');
const Campground = require('../models/campground');
const { isLoggedIn }  = require('../middleware');


const validateCampground = (req,res,next) => {
    const result = campgroundSchema.validate(req.body);
    if(result.error){
        const message = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(message,400);
    } else {
        next();
    }

    console.log(result);
}


router.get('/', catchAsync( async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds });
 }))
 
router.get('/new',isLoggedIn, (req,res) => {
     res.render('./campgrounds/new');
 })
 
router.post('/', isLoggedIn, validateCampground, catchAsync( async (req,res,next) => { 
     // if(!req.body.campground) throw new ExpressError('Invalid campground details!', 400);
         const campground = new Campground(req.body.campground);
         await campground.save();
         req.flash('success', 'Successfully created a new campground!');
         res.redirect(`/campgrounds/${campground._id}`);
 }))
 
router.get('/:id', catchAsync( async (req,res) => {
     const campground = await Campground.findById(req.params.id).populate('reviews');
     if(!campground){
         req.flash('error','Campground not found!');
         return res.redirect('/campgrounds');
     }else{
        res.render('./campgrounds/show', { campground });
     }  
 }))
 
router.get('/:id/edit', isLoggedIn, catchAsync( async (req,res) => {
     const campground = await Campground.findById(req.params.id);
     res.render('./campgrounds/edit',{ campground });
 }))
 
router.put('/:id',isLoggedIn, validateCampground, catchAsync(  async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
     req.flash('success', 'Successfully updated campground!');
     res.redirect(`/campgrounds/${campground._id}`)
 }))
 
router.delete('/:id',isLoggedIn, catchAsync( async (req,res) => {
     const campground = await Campground.findByIdAndDelete(req.params.id);
     req.flash('success', 'Successfully deleted campground!');
     res.redirect('/campgrounds');
 }))

module.exports = router;