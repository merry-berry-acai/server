const { Topping } = require("../models/ToppingModel");

async function createTopping(name, price = 0, availability = true) {
    try {
        const newTopping = new Topping({
            name,
            price,
            availability
        });

        await newTopping.save();
        return newTopping;
    } catch (error) {
        console.error("Error creating topping:", error);
        throw new Error("Failed to create topping");
    }
}

async function getToppingById(toppingId) {
    try {
        const topping = await Topping.findById(toppingId).populate("category");
        if (!topping) throw new Error("Topping not found");
        return topping;
    } catch (error) {
        console.error("Error fetching topping:", error);
        throw new Error("Failed to fetch topping");
    }
}

async function getAllToppings() {
    try {
        return await Topping.find().populate("category");
    } catch (error) {
        console.error("Error fetching toppings:", error);
        throw new Error("Failed to fetch toppings");
    }
}

async function updateTopping(toppingId, updateData) {
    try {
        const updatedTopping = await Topping.findByIdAndUpdate(
            toppingId,
            updateData,
            { new: true }
        ).populate("category");

        if (!updatedTopping) throw new Error("Topping not found or update failed");
        return updatedTopping;
    } catch (error) {
        console.error("Error updating topping:", error);
        throw new Error("Failed to update topping");
    }
}

async function deleteTopping(toppingId) {
    try {
        const deletedTopping = await Topping.findByIdAndDelete(toppingId);
        if (!deletedTopping) throw new Error("Topping not found or already deleted");
        return deletedTopping;
    } catch (error) {
        console.error("Error deleting topping:", error);
        throw new Error("Failed to delete topping");
    }
}

module.exports = {
    createTopping,
    getToppingById,
    getAllToppings,
    updateTopping,
    deleteTopping,
};
