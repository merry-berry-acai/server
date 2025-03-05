const ORDER_STATUSES = ["Pending", "Processing", "Delivered", "Cancelled"];

const validateOrderStatus = ({ body: { orderStatus } }, res, next) => {
    // If `orderStatus` is not supplied, send error
    if (!orderStatus) {
        return res.status(400).json({ error: "Order status is required" });
    }
    
    // If `orderStatus` is invalid, return an error response
    if (!ORDER_STATUSES.includes(orderStatus)) {
        console.error(`Invalid orderStatus: "${orderStatus}". Allowed: ${ORDER_STATUSES.join(", ")}`);
        return res.status(400).json({ error: `Invalid orderStatus: "${orderStatus}". Must be one of ${ORDER_STATUSES.join(", ")}` });
    }

    next();
};

module.exports = { validateOrderStatus };