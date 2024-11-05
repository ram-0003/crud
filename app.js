import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import User from './models/User.js'; 
import Profile from './models/Profile.js'; 
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = 3000;

// Connect to MongoDB
dotenv.config();
mongoose.connect(process.env.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(process.cwd(), 'views')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Routes for rendering pages
app.get('/', (req, res) => res.sendFile(path.join(process.cwd(), 'views', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(process.cwd(), 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(process.cwd(), 'views', 'signup.html')));
app.get('/crud', (req, res) => res.sendFile(path.join(process.cwd(), 'views', 'crud.html')));

// Signup route
app.post('/signup', async (req, res) => {
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
});

// Login route
app.post('/login', async (req, res) => {
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
});

// Create Profile
app.post('/profile', upload.single('image'), async (req, res) => {
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
});

// Read Profiles (for rendering in HTML)
app.get('/profiles', async (req, res) => {
    try {
        const profiles = await Profile.find().sort({ createdAt: -1 });
        res.json(profiles);
    } catch (error) {
        res.status(500).send('Error fetching profiles');
    }
});

// Update Profile
app.post('/profile/update/:id', upload.single('image'), async (req, res) => {
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
});

// Delete Profile
app.post('/profile/delete/:id', async (req, res) => {
    try {
        await Profile.findByIdAndDelete(req.params.id);
        res.redirect('/crud');
    } catch (error) {
        res.status(500).send('Error deleting profile');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
