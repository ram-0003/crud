import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String },
    designation:{type:String},
}, { timestamps: true });

const Profile = mongoose.model('Profile', ProfileSchema);
export default Profile;
