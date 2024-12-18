const { isValidObjectId } = require("mongoose");

const validateId = (req, res, next) => {
    console.log("я в validateId", req);
    if (!isValidObjectId(req.params.id)){
        res.status(404).json({message : "Not found"});
        return;
    }
    next();
}

module.exports = validateId;