module.exports = (roleRequired) => {
    return (req, res, next) => {
        next();
    };
};