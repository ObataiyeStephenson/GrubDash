const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// VALIDATION MIDDLEWARE
function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (!name || name == "")
    next({ status: 400, message: "Dish must include a name" });
  if (name) return next();
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (!description || description == "")
    next({ status: 400, message: "Dish must include a description" });
  if (description) return next();
}

function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) next({ status: 400, message: "Dish must include a price" });
  else if (price <= 0 || !Number.isInteger(price))
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  else return next();
}

function hasImg(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (!image_url || image_url == "")
    next({ status: 400, message: "Dish must include a image_url" });
  if (image_url) return next();
}

function hasID(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function dataIdIsValid(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (dishId !== id) {
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
  }
  next();
}


// CRUD FUNCTIONS

//GET /dishes This route will respond with a list of all existing dish data.
function list(req, res) {
  res.status(200).json({ data: dishes });
}
//POST   /This route will save the dish and respond with the newly created dish.
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
// GET /dishes/:dishId /This route will respond with the dish where id === :dishId or return 404 if no matching dish is found.
function read(req, res) {
  const matchDish = res.locals.dish;
  res.status(200).json({ data: matchDish });
}
// PUT /dishes/:dishID/ This route will update the dish where id === :dishId or return 404 if no matching dish is found.
function update(req, res) {
  const matchDish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;
  matchDish.name = name;
  matchDish.description = description;
  matchDish.price = price;
  matchDish.image_url = image_url;
  res.status(200).json({ data: matchDish });
}

module.exports = {
  list,
  create: [hasName, hasDescription, hasImg, hasPrice, create],
  read: [hasID, read],
  update: [
    hasID,
    hasName,
    hasDescription,
    hasImg,
    hasPrice,
    dataIdIsValid,
    update,
  ],
};
