const express=require('express');
const router=express.Router({mergeParams:true});
const catchAsync= require('../utils/catchAsync');
const Review=require('../models/review');
const Campground=require('../models/campground');
const {validateReview,isLoggedIn,isReviewAuthor}= require('../middleware.js');
const reviews=require('../controllers/reviews');

router.post('/', isLoggedIn,validateReview,catchAsync(reviews.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;