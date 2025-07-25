import express from 'express'
import { changeUserStatus, editUser, getAllUsers, getUser, loginUser, registerUser, searchUsers } from '../controllers/userController.js'
import { upload } from '../utils/multerConfig.js'
import { userAuth } from '../middlewares/userAuthMiddleware.js'
import { adminAuth } from '../middlewares/adminAuthMiddleware.js'

export const userRoutes = express.Router()

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/getAll', adminAuth, getAllUsers)
userRoutes.get('/getUser', userAuth, getUser)
userRoutes.put('/editUser', userAuth, upload.single("profilePicture"), editUser)
userRoutes.put('/changeStatus', adminAuth, changeUserStatus)
userRoutes.get('/search/:query', adminAuth, searchUsers)