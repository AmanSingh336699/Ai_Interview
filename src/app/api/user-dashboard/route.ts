import { authOptions } from "@/lib/authOption";
import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import User, { IUser } from "@/models/User";
import { cloudinary } from "@/utils/config";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ProfileFormData, updateSchema } from "@/utils/Schema";
import bcrypt from "bcryptjs";

export async function GET(){
    await connectDb()
    const session = await getServerSession(authOptions)
    if(!session?.user?.id){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const userId = session.user.id
        const totalInterviews = await Interview.countDocuments({ userId })
        const user = await User.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const provider = (user as unknown as IUser).provider;
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const highesScoreInterview = await Interview.aggregate([
            { $match: { userId } },
            { $addFields: { totalScore: { $sum: "$response.score" } } },
            { $sort: { totalScore: -1 } },
            { $limit: 1 },
            { $project: { _id: 1, role: 1, experience: 1, techStack: 1, totalScore: 1, createdAt: 1, status: 1 } }
        ])
        return NextResponse.json({ totalInterviews, highestScoreInterview: highesScoreInterview[0] || null, provider: provider }, { status: 200 })
    } catch (_error) {
        console.error("Dashboard error", _error)
        return NextResponse.json({ error: "failed to fetch data" }, { status: 500 })
    }
}

export async function POST(req: NextRequest){
    const session = await getServerSession(authOptions)
    if(!session?.user?.id){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const formaData = await req.formData()
    const file = formaData.get('file')

    if(!file){
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    if (!(file instanceof File) || !allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const maxSize = 7 * 1024 * 1024;
    if(file.size > maxSize) {
        return NextResponse.json({ error: "File size exceeds 7MB" }, { status: 400 })
    }

    try {
        await connectDb()
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const cloudinaryResponse = await cloudinary.uploader.upload(`data:${file.type};base64,${buffer.toString('base64')}`, {
            folder: 'profile_images',
            width: 150,
            height: 150,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto'
        })
        const user = await User.findById(session.user.id)
        const previousImage = user.avatar
        await User.findByIdAndUpdate(session.user.id, {
            $set: { avatar: cloudinaryResponse.secure_url },
        })
        if(previousImage){
            const publicId = previousImage.split('/').pop().split('.')[0]
            cloudinary.uploader.destroy(`profile_images/${publicId}`, (error) => {
                if(error) console.error("Error deleting previous image:", error)
            })
        }
        return NextResponse.json({ profileImage: cloudinaryResponse.secure_url }, { status: 200 })
    } catch (error) {
        console.error("Error uploading image:", error)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }
}


export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    await connectDb()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
    }
  
    const userId = session.user.id;
    const data: ProfileFormData = await request.json();
  
    try {
      updateSchema.parse(data);
    } catch (error) {
      return NextResponse.json({})
    }
  
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  
    const { username, email, password, confirmPassword } = data;
  
    if (user.provider !== 'credentials') {
      if (email || password) {
        return NextResponse.json({ error: 'OAuth users cannot change email or password' }, { status: 403 });
      }
    }
    if(password && password !== confirmPassword){
        return NextResponse.json({ message: "Password do not match" }, { status: 400 })
    }
  
    const updates: { username?: string; email?: string; password?: string } = {};
    if (username) updates.username = username;
    if (email && user.provider === 'credentials') updates.email = email;
    if (password && user.provider === 'credentials') updates.password = await bcrypt.hash(password, 10);
  
    try {
      await User.findByIdAndUpdate(userId, updates);
      return NextResponse.json({ message: 'Profile updated' }, { status: 200 });
    } catch (_error: any) {
      if (_error.code === 11000) {
        return NextResponse.json({ error: 'Username or email already exist' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }


export async function DELETE(){
    const session = await getServerSession(authOptions)
    await connectDb()
    if (!session || !session?.user?.id) {
        return NextResponse.json({ error: "Session does not exist" }, { status: 404 });
    }
    const userId = session?.user.id
    try {
        await User.findOneAndDelete({_id: userId})
        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}