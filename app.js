import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { getCrud, getIndex, getLogin, getProfiles, getSignup, postDeleteProfile, postLogin, postProfile, postSignup, postUpdateProfile } from './controller/crud.controllers.js';

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
app.get('/',getIndex);
app.get('/login',getLogin);
app.get('/signup',getSignup);
app.get('/crud',getCrud);

// Signup route
app.post('/signup',postSignup);

// Login route
app.post('/login',postLogin);

// Create Profile
app.post('/profile', upload.single('image'),postProfile);

// Read Profiles (for rendering in HTML)
app.get('/profiles',getProfiles);

// Update Profile
app.post('/profile/update/:id', upload.single('image'),postUpdateProfile);

// Delete Profile
app.post('/profile/delete/:id',postDeleteProfile);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
