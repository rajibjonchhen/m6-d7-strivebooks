import express, { Router } from "express";
import createError from "http-errors";
import BlogModel from "./blog-schema.js";
import q2m from "query-to-mongo";
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import multer from "multer";
import { basicAuthMW } from "../../auth/basic.js";
import { adminOnlyMiddleware } from "../../auth/adminMw.js";

const blogsRouter = Router();


const cloudinaryUploader = multer({
        storage: new CloudinaryStorage({
        cloudinary,
          params:{
            folder:'blogs'
          }
        })
      }).single("image")


/************************* post new *********************************/
blogsRouter.post("/",basicAuthMW, async (req, res, next) => {
  try {
    const newBlog = new BlogModel({...req.body,authors:[req.author._id]})
    const { _id } = await newBlog.save();
    res.status(201).send({ _id: _id });
  } catch (error) {
    next(error);
  }
});

/*************************** get all the *******************************/
blogsRouter.get("/me/stories",basicAuthMW, async (req, res, next) => {
  try {
      const defaultQuery = {
          sort:"-createdAt",
          skip:0,
          limit:20,
      }

    const query = {...defaultQuery,...req.query}
    const mongoQuery = q2m(query);
    const total = await BlogModel.countDocuments(mongoQuery.criteria);

      const blogs = await BlogModel
        .find({authors:{$in:[req.author._id]}})
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit).populate({
          path : "authors",
          select: "name email"
        });;
      res.status(200).send({
        links: mongoQuery.links("/blogs", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        blogs
      });
   
  } catch (error) {
    next(error);
  }
});
/*************************** get all the *******************************/
blogsRouter.get("/",basicAuthMW, adminOnlyMiddleware, async (req, res, next) => {
  try {
      const defaultQuery = {
          sort:"-createdAt",
          skip:0,
          limit:20,
      }

    const query = {...defaultQuery,...req.query}
    const mongoQuery = q2m(query);
    const total = await BlogModel.countDocuments(mongoQuery.criteria);

      const blogs = await BlogModel
        .find(mongoQuery.criteria)
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit).populate({
          path : "authors",
          select: "name email"
        });;
      res.status(200).send({
        links: mongoQuery.links("/blogs", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        blogs
      });
   
  } catch (error) {
    next(error);
  }
});

/****************************** get specific ****************************/

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blog = await BlogModel.findById(blogId).populate({
      path : "authors",
      select: "name email"
    });
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

blogsRouter.put("/:blogId", basicAuthMW, async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const findBlog = await BlogModel.findOne({_id:blogId,authors:{$in:[req.author._id]}}); //$in checks if value is in the array
    if (findBlog) {
       await findBlog.update(req.body)
      res.status(204).send("Blog updated");
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update the like of specific blog post *****************************/

blogsRouter.put("/:blogId/likes", async (req, res, next) => {
  try {
    const reqBlog = await BlogModel.findByIdAndUpdate(req.params.blogId);
    if (reqBlog) {
   
      const index = reqBlog.likes.findIndex(
        (id) => id.toString() === req.body._id
        );
      if (index === -1) {
        reqBlog.likes.push(req.body._id)
        await reqBlog.save();
        res.send(reqBlog);
      } else {
        reqBlog.likes = reqBlog.likes.filter(id => id.toString() !== req.body._id)
        console.log("reqBlog like removed",reqBlog)
        await reqBlog.save();
        res.send(reqBlog);

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

/***************************** update  cover image specific *****************************/

blogsRouter.put("/:blogId/cover", basicAuthMW, cloudinaryUploader, async (req, res, next) => {
    try {
      const blogId = req.params.blogId;
      const updatedBlog = await BlogModel.findByIdAndUpdate(
          blogId, 
        {cover:req.file.path}, {
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

blogsRouter.delete("/:blogId",basicAuthMW, async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const reqBlog = await BlogModel.findOne({_id:blogId, authors:{$in:{_id:req.author._id}}})
    if(req.author){
      const deletedBlog = await BlogModel.findByIdAndDelete(blogId);
      if (deletedBlog) {
        res.status(204).send();
      } else {
        next(
          createError(404, "could not find the specific blog with id", blogId)
        );
      }
    } else {
      next(
        createError(403, "Not authorised to delete blog with", blogId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** add review to specific blog ******************************/
blogsRouter.post("/:blogId/reviews", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const newReview = { ...req.body };
    const blog = await BlogModel.findById(blogId);
    if (blog) {
      const modifiedBlog = await BlogModel.findByIdAndUpdate(
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
blogsRouter.get("/:blogId/reviews", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const blog = await BlogModel.findById(blogId);
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
blogsRouter.get("/:blogId/reviews/:reviewId", async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.blogId);
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
blogsRouter.delete("/:blogId/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedBlog = await BlogModel.findByIdAndUpdate(
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
blogsRouter.put("/:blogId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reqBlog = await BlogModel.findByIdAndUpdate(req.params.blogId);

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
export default blogsRouter;
