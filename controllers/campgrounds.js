const Campground=require('../models/campground');
const {cloudinary}=require('../cloudinary/index');
const mbxGeocoding= require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken= process.env.MAPBOX_TOKEN;
const geoCoder=mbxGeocoding({accessToken: mapBoxToken});

module.exports.index=async(req,res)=>{
    const campgrounds= await Campground.find();
    res.render('campgrounds/index',{campgrounds});
};

module.exports.renderNewForm=async (req,res,next)=>{
    res.render('campgrounds/new');
};

module.exports.createCampground= async (req,res,next)=>{
    const geoData= await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newcamp=new Campground(req.body.campground);
    newcamp.geometry =geoData.body.features[0].geometry;
    newcamp.images= req.files.map( f=> ({url:f.path,filename: f.filename}));
    newcamp.author = req.user._id;
    const added= await newcamp.save();
    req.flash('success','Successfully made new campground');
    res.redirect(`/campgrounds/${newcamp._id}`);
}; 

module.exports.showCampground =async (req,res)=>{
    const {id}=req.params;
    const campground= await Campground.findById(id).populate({path:'reviews',populate:{path: 'author'}}).populate('author');
    if(!campground){
        req.flash('error','Cannot find Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
};

module.exports.renderEditForm = async (req,res)=>{
    const {id}=req.params;
    const campground= await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
};

module.exports.updateCampground= async (req,res)=>{
    const {id}=req.params;
    const geoData= await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground= await Campground.findByIdAndUpdate(id,{...req.body.campground});
    campground.geometry =geoData.body.features[0].geometry;
    const imgs=req.files.map( f=> ({url:f.path,filename: f.filename}));
    campground.images.push(...imgs);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { "images": { "filename": { $in: req.body.deleteImages } } } });
    }
    await campground.save();
    req.flash('success','Successfully updated Campground');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted Campground');
    res.redirect('/campgrounds');
};
