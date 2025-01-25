const mongoose = require("mongoose");


const refreshTokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", 
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    device: {
        type: String, 
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
}, {
    versionKey: false,
});


const RefreshTokenModel = mongoose.model("refreshToken", refreshTokenSchema);

module.exports = { RefreshTokenModel };

