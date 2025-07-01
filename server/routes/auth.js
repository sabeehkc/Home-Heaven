const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const User = require("../models/User")

/* Configuration multer for file upload */
const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null, "public/uploads/") //Store uploaded files
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

// User Register
router.post('/register', upload.single('profileImage'), async(req,res) => {
    try{
        const {firstName, lastName, email , password} = req.body

        const profileImage = req.file

        if(!profileImage){
            return res.status(400).send('No file uploaded')
        }

        const profileImagePath = profileImage.path

        // check if user exists
        const existingUser = await User.findOne({ email })
        if(existingUser){
            return res.status(409).json({message: 'User already exisits!'})
        }

        //Hash the password
        const salt = await bcrypt.genSalt()
        const hasPassword = await bcrypt.hash(password, salt)
        
        //create a new user 
        const newUSer = new User ({
            firstName,
            lastName,
            email,
            password: hasPassword,
            profileImagePath
        });
        await newUSer.save()

        res.status(200).json({message: 'User register successfully', user: newUSer})
    }catch (err){
        console.log(err)
        res.status(500).json({ message: 'Registration failed', error: err.message})
    }
})

router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });
        delete user.password; // Remove password from user object

        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
})

module.exports = router