const express = require("express");
const Book = require("../models/bookModels");
const upload = require("../middleware/multer.js");
const { isAuthenticated } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(isAuthenticated);

router.post("/", upload.single("image"), async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: "Send all the required fileds :title,author,publishYear",
      });
    }
    let imageUrl = "";
    if (request.file) {
      imageUrl = `${request.protocol}://${request.get("host")}/uploads/${
        request.file.filename
      }`;
    }
    const newBook = {
      title: request.body.title,
      author: request.body.author,
      publishYear: request.body.publishYear,
      image: imageUrl,
      userId: request.user.id,
    };

    const book = await Book.create(newBook);

    response.status(201).send(book);
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal Server error");
  }
});

router.get("/", async (request, response) => {
  try {
    const userId = request.user.id;
    const books = await Book.find({ userId });

    response.status(201).send({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal Server error");
  }
});
router.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const book = await Book.findById(id);

    return response.status(201).send(book);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});
router.put("/:id", async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: "Send all the required fileds :title,author,publishYear",
      });
    }

    const { id } = request.params;
    const result = await Book.findByIdAndUpdate(id, request.body);
    if (!result) {
      response.status(403).send("Book Not Found");
    }
    response.status(200).send({
      message: "Book Updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const book = await Book.findByIdAndDelete(id);

    return response.status(201).send("Book is Succesfully Deleted");
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

module.exports = router;
