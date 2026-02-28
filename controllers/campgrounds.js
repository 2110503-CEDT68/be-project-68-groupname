const Campground=require('../models/Campground.js');
const Book = require('../models/Book.js');
exports.getCampgrounds= async (req, res, next)=>{
    //res.status(200).json({success: true});
    let query;
    //copy req query
    const reqQuery = {...req.query};
    //fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Campground.find(JSON.parse(queryStr)).populate('books');

    //select
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    //sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else{
        query = query.sort('-createdAt');
    }
    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;
    const total = await Campground.countDocuments();
    
    
    try {
        query = query.skip(startIndex).limit(limit);
        const campgrounds = await query;

        //pagination result
        const pagination = {};
        if(endIndex < total){
            pagination.next = {
                page : page + 1,
                limit
            }
        }
        if(startIndex > 0){
            pagination.prev = {
                page : page - 1,
                limit
            }
        }

        res.status(200).json({success: true, count: campgrounds.length, pagination, data: campgrounds});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

exports.getCampground= async  (req, res, next)=>{
    try {
        const campground = await Campground.findById(req.params.id);
        if(!campground){
            return res.status(400).json({success: false});
        }
        res.status(200).json({success: true, data: campground});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

exports.createCampground= async(req, res, next)=>{
    const campground = await Campground.create(req.body);
    res.status(201).json({success: true, data: campground});
};

exports.updateCampground= async(req, res, next)=>{
    try {
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!campground){
            return res.status(400).json({success: false});
        }
        res.status(200).json({success: true, data: campground});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

exports.deleteCampground= async(req, res, next)=>{
    try {
        const campground = await Campground.findById(req.params.id);
        if(!campground){
            return res.status(400).json({
                success: false,
                message: `Campground not found with id of ${req.params.id}`
            });
        }
        await Book.deleteMany({campground: req.params.id});
        await Campground.deleteOne({_id: req.params.id});
        res.status(200).json({success: true, data: {}});
    } catch (err) {
        res.status(400).json({success: false});
    }
};