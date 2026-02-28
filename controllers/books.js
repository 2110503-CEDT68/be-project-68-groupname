const Book = require('../models/Book');
const Campground = require('../models/Campground');
//@desc     Get all book
//@route    GET /api/v1/books
//@access   public
exports.getBooks = async(req, res, next) => {
    let query;
    // user can see their own book
    if(req.user.role !== 'admin'){
        query = Book.find({user:req.user.id}).populate({
            path: 'campground',
            select: 'name province tel'
        });
    }else{
        if(req.params.campgroundId){
            console.log(req.params.campgroundId);
            query = Book.find({campground: req.params.campgroundId}).populate({
                path: 'campground',
                select: 'name province tel'
            });
        }else{
            query = Book.find().populate({
                path: 'campground',
                select: 'name province tel'
            });
        }
    }
    try{
        const book = await query;

        res.status(200).json({
            success: true,
            count: book.length,
            data: book
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot find Book"
        });
    }
};

//@desc     get one book
//@route    get api/v1/books/:id
//@access   public
exports.getBook = async (req, res, next) => {
    try{
        const book = await Book.findById(req.params.id).populate({
            path: 'campground',
            select: 'name description tel'
        });

        if(!book){
            return res.status(400).json({
                success: false,
                message: `No book with the id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: book
        });
    }catch(error){
        console.log(error);;
        res.status(500).json({
            success: false,
            message: 'Cannot find book'
        });
    }
}
exports.addBook = async (req, res, next) => {
    try{
        req.body.campground = req.params.campgroundId;
        const campground = await Campground.findById(req.params.campgroundId);
        
        if(!campground){
            res.status(404).json({
                success: false,
                message: `No campground with id of ${req.params.campgroundId}`
            });
        }

        req.body.user = req.user.id;
        const existedBook = await Book.find({user:req.user.id});
        if(existedBook.length >= 3 && req.user.role !== 'admin'){
             return res.status(400).json({
                success: false,
                message: `user with ID ${req.user.id} has already made 3 books`
            });
        }
        const book = await Book.create(req.body);
        res.status(200).json({
            success: true,
            data: book
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot create book'
        });
    }
}

exports.updateBook = async (req, res, next) => {
    try{
        let book = await Book.findById(req.params.id);
        
        if(!book){
            res.status(404).json({
                success: false,
                message: `No book with id of ${req.params.campgroundId}`
            });
        }

        if(book.user.toString() !== req.user.id && req.user.role !== 'admin'){
             return res.status(400).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this book`
            });
        }
        book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: book
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot update book'
        });
    }
}

exports.deleteBook = async (req, res, next) => {
    try{
        const book = await Book.findById(req.params.id);
        
        if(!book){
            res.status(404).json({
                success: false,
                message: `No book with id of ${req.params.campgroundId}`
            });
        }
        
        if(book.user.toString() !== req.user.id && req.user.role !== 'admin'){
             return res.status(400).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this book`
            });
        }
        await Book.deleteOne();

        res.status(200).json({
            success: true,
            data: book
        }); 
    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot delete book'
        });
    }
}