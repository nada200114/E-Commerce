import dotenv from 'dotenv';
dotenv.config();
import connectionDB from "../DB/connectionDB.js";
import { AppError } from './utils/classError.js';
import * as router from './modules/index.routes.js';
import { GlobalErrorHandler } from './utils/asyncHandler.js';


export const initApp=(app,express)=>{
    // Express setup
    connectionDB()
    app.use(express.json());
    app.get('/',(req, res, next)=>{

        res.status(200).json({message:'Hello from express server'})
    });
    // User routes
    app.use('/users',router.usersRouter);
    app.use('/categories',router.categoriesRouter);
    app.use('/subcategories',router.subcategoriesRouter);
    app.use('/brands',router.brandsRouter);
    app.use('/products',router.productsRouter);
    app.use('/coupons',router.couponsRouter);
    app.use('/carts',router.CartRouter);

    





    
app.use('*',(req,res,next)=>{
    const err=new AppError(`Invalid url ${req.original}`);
    next(err);
})

// Global error handler (ensure this is the last middleware)
app.use(GlobalErrorHandler);

}



