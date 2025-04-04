import { Document, models, model, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
    provider: string
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    }
}, { timestamps: true })

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

const User = models.User || model<IUser>("User", userSchema)

export default User;
