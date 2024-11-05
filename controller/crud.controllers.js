import bcrypt from 'bcryptjs';
import path from 'path';
import User from '../models/User.js'; 
import Profile from '../models/Profile.js'; 

//get options
export const getIndex = (req, res) =>{
    res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
} 
export const getLogin = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'login.html'));
}
export const getSignup = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'signup.html'));
}
export const getCrud = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'crud.html'));
}
export const getProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().sort({ createdAt: -1 });
        res.json(profiles);
    } catch (error) {
        res.status(500).send('Error fetching profiles');
    }
}
//post operations

//1.signup
export const postSignup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(200).redirect('/login');
    } catch (error) {
        res.status(500).send('Error signing up user');
    }
}
//2.login
export const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        res.status(200).redirect('/crud');  // Redirect to crud.html after successful login
    } catch (error) {
        res.status(500).send('Error logging in');
    }
}
//3.profile
export const postProfile = async (req, res) => {
    console.log(req.body);
    
    const { name,designation } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const profile = new Profile({ name, imageUrl, designation });
        await profile.save();
        res.redirect('/crud');
    } catch (error) {
        res.status(500).send('Error creating profile');
    }
}
//4.Update Profiles
export const postUpdateProfile = async (req, res) => {
    const { name,designation } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
        const updateData = { name,designation };
        if (imageUrl) updateData.imageUrl = imageUrl;

        await Profile.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/crud');
    } catch (error) {
        res.status(500).send('Error updating profile');
    }
}
//5.delete profiles
export const postDeleteProfile = async (req, res) => {
    try {
        await Profile.findByIdAndDelete(req.params.id);
        res.redirect('/crud');
    } catch (error) {
        res.status(500).send('Error deleting profile');
    }
}