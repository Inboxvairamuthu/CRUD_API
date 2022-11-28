const express = require('express');
const router = express.Router();
const passport = require('passport');
const needsAuth = passport.authenticate('jwt', { session: false });

//Declare passport middleware
require('./../middleware/passport')(passport);

//Nothing here in the route stage
router.get('/', (req, res) => {
    return res.json({ message: 'Nothing here in this route' })
});

const UserController = require('../controllers/user.controller');

//User account creation
router.post('/user/add', UserController.createAccount);

//User login
router.post('/user/login', UserController.login);

//All Users List
router.get('/users', needsAuth, UserController.getAllUsers);

//Required User Detail
router.get('/:userId', needsAuth, UserController.getUser);

//Update Required User
router.put('/update/:userId', needsAuth, UserController.updateUser);

//Delete Required User
router.delete('/delete/:userId', needsAuth, UserController.deleteUser);

module.exports = router;