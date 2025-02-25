const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ["smoothie", "akai", "juice"]
    },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category };