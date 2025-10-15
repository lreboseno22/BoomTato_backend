export const logger = (req, res, next) => {
    console.log("DEBUG:", req.method, req.url, req.body);
    next();
}