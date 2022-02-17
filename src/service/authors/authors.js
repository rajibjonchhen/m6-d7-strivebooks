import express, { Router } from "express";
import createError from "http-errors";
import AuthorModel from "./author-schema.js";
import q2m from "query-to-mongo";
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import multer from "multer";

const authorsRouter = Router();


const cloudinaryUploader = multer({
        storage: new CloudinaryStorage({
        cloudinary,
          params:{
            folder:'blogs'
          }
        })
      }).single("image")

/************************* post new *********************************/
authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id: _id });
  } catch (error) {
    next(error);
  }
});

/*************************** get all the *******************************/
authorsRouter.get("/", async (req, res, next) => {
  try {
      const defaultQuery = {
          sort:"-createdAt",
          skip:0,
          limit:20,
      }

    const query = {...defaultQuery,...req.query}
    const mongoQuery = q2m(query);
    const total = await AuthorModel.countDocuments(mongoQuery.criteria);

      const authors = await AuthorModel
        .find(mongoQuery.criteria)
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit);
      res.status(200).send({
        links: mongoQuery.links("/authors", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        authors
      });
   
  } catch (error) {
    next(error);
  }
});

/****************************** get specific ****************************/

authorsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blog = await AuthorModel.findById(blogId);
    res.status(200).send(blog);

    if (true) {
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update specific *****************************/

authorsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const updatedBlog = await AuthorModel.findByIdAndUpdate(blogId, req.body, {
      new: true,
    });
    if (updatedBlog) {
      res.status(200).send(updatedBlog);
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});


/***************************** update  cover image specific *****************************/

authorsRouter.put("/:blogId/avatar",cloudinaryUploader, async (req, res, next) => {
    try {
      const blogId = req.params.blogId;
      const updatedBlog = await AuthorModel.findByIdAndUpdate(
          blogId, 
        {author:{avatar:req.file.path}}, {
        new: true,
      });
      if (updatedBlog) {
        console.log(updatedBlog)
        res.status(200).send(updatedBlog);
      } else {
        next(createError(404, "could not find the specific "));
      }
    } catch (error) {
      next(error);
    }
  });

/**************************** delete specific ******************************/

authorsRouter.delete("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const deletedBlog = await AuthorModel.findByIdAndDelete(blogId);
    if (deletedBlog) {
      res.status(204).send();
    } else {
      next(
        createError(404, "could not find the specific blog with id", blogId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** add review to specific blog ******************************/
authorsRouter.post("/:blogId/reviews", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const newReview = { ...req.body };
    const blog = await AuthorModel.findById(blogId);
    if (blog) {
      const modifiedBlog = await AuthorModel.findByIdAndUpdate(
        blogId,
        { $push: { reviews: newReview } },
        { new: true }
      );
      res.status(201).send(modifiedBlog);
    } else {
      next(
        createError(404, "could not find the specific blog with id", blogId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** get all reviews to specific blog ******************************/
authorsRouter.get("/:blogId/reviews", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blog = await AuthorModel.findById(blogId);
    if (blog) {
      res.status(200).send(blog.reviews);
    } else {
      next(
        createError(404, "could not find the specific blog with id", blogId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** get specific review from specific blog ******************************/
authorsRouter.get("/:blogId/reviews/:reviewId", async (req, res, next) => {
  try {
    const blog = await AuthorModel.findById(req.params.blogId);
    if (blog) {
      const reqReview = blog.reviews.find(
        (review) => review._id.toString() === req.params.reviewId
      );
      if (reqReview) {
        res.status(200).send(blog.reviews);
      } else {
        next(
          createError(
            404,
            "could not find the specific review with id",
            req.params.reviewId
          )
        );
      }
    } else {
      next(
        createError(
          404,
          "could not find the specific blog with id",
          req.params.blogId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** delete specific review from specific blog ******************************/
authorsRouter.delete("/:blogId/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedBlog = await AuthorModel.findByIdAndUpdate(
      req.params.blogId,
      { $pull: { reviews: { _id: req.params.reviewId } } },
      { new: true }
    );

    if (modifiedBlog) {
      res.send(modifiedBlog);
    } else {
      next(
        createError(
          404,
          "could not find the specific blog with id",
          req.params.blogId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** edit specific review from specific blog ******************************/
authorsRouter.put("/:blogId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reqBlog = await AuthorModel.findByIdAndUpdate(req.params.blogId);

    if (reqBlog) {
      const index = reqBlog.reviews.findIndex(
        (review) => review._id.toString() === req.params.reviewId
      );
      if (index !== -1) {
        reqBlog.reviews[index] = {
          ...reqBlog.reviews[index].toObject(),
          ...req.body,
        };
        await reqBlog.save();
        res.send(reqBlog);
      } else {
        next(
          createError(
            404,
            "could not find the specific blog with id",
            req.params.blogId
          )
        );
      }
    } else {
      next(
        createError(
          404,
          "could not find the specific blog with id",
          req.params.blogId
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
export default authorsRouter;
