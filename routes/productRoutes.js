import express from 'express'
import { upload } from '../utils/multerConfig.js'
import { addProduct, deleteProduct, getProducts, updateProduct, getSingleProduct, getProductsFromCategory, getDummyProducts, searchProducts, filterProducts } from '../controllers/productController.js'
import { adminAuth } from '../middlewares/adminAuthMiddleware.js'

export const productRoutes = express.Router()

productRoutes.get('/', getProducts)
productRoutes.post('/add', adminAuth, upload.array('images', 5), addProduct)
productRoutes.delete('/delete/:id', adminAuth, deleteProduct)
productRoutes.put('/edit/:id', adminAuth, upload.array('images', 5), updateProduct)
productRoutes.get('/get/:id', getSingleProduct)
productRoutes.get('/category/:id', getProductsFromCategory)
productRoutes.get('/dummyProducts', adminAuth, getDummyProducts)
productRoutes.get('/search/:query', searchProducts)
productRoutes.get('/filter/:query', filterProducts)