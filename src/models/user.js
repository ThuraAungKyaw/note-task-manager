const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");
const restrictedInfo = ["password", "tokens", "avatar"];


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("Email is invalid!")
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error("Password length should be more than 6")
            }

            if (validator.contains(value, "password", { ignoreCase: true })) {
                throw new Error("Password should not be the string 'password'!")
            }
        }
    },
    age: {
        type: Number,
        default: 16,
        validate(value) {
            if (value < 16) {
                throw new Error("Age should be 16 or greater.")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual("tasks", { ref: "Task", localField: "_id", foreignField: "owner" });

userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject();

    for (let key in userObject) {

        if (restrictedInfo.indexOf(key) >= 0) delete userObject[key];
    }

    return userObject;

}

userSchema.methods.generateToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token })
    user.save()

    return token;


}

// Add custom DB method
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Unable to login");

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) throw new Error("Unable to login");

    return user;
}

userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next()
})

// Remove user related tasks when the user is removed
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id })

    next()
})


const User = mongoose.model('User', userSchema);


module.exports = User;