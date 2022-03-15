import express, { Router } from "express";
import createError from "http-errors";
import AuthorModel from "./author-schema.js";
import q2m from "query-to-mongo";
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import multer from "multer";
import { basicAuthMW } from "../../auth/basic.js";

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
authorsRouter.get("/", basicAuthMW, async (req, res, next) => {
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

authorsRouter.get("/:authorId", basicAuthMW, async (req, res, next) => {
  try {
    const authorId = req.params.authorId;
    const author = await AuthorModel.findById(authorId);
    res.status(200).send(author);

    if (true) {
    } else {
      next(createError(404, "could not find the specific author "));
    }
  } catch (error) {
    next(error);
  }
});

/***************************** update specific author *****************************/

authorsRouter.put("/:authorId", basicAuthMW, async (req, res, next) => {
  try {
    const authorId = req.params.authorId;
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(authorId, req.body, {
      new: true,
    });
    if (updatedAuthor) {
      res.status(200).send(updatedAuthor);
    } else {
      next(createError(404, "could not find the specific "));
    }
  } catch (error) {
    next(error);
  }
});


/***************************** update  avatar specific *****************************/

authorsRouter.put("/:authorId/avatar",basicAuthMW, cloudinaryUploader, async (req, res, next) => {
    try {
      const authorId = req.params.authorId;
      const updatedAuthor = await AuthorModel.findByIdAndUpdate(
          authorId, 
        {author:{avatar:req.file.path}}, {
        new: true,
      });
      if (updatedAuthor) {
        console.log(updatedAuthor)
        res.status(200).send(updatedAuthor);
      } else {
        next(createError(404, "could not find the specific "));
      }
    } catch (error) {
      next(error);
    }
  });

/**************************** delete specific author ******************************/

authorsRouter.delete("/:authorId",basicAuthMW, async (req, res, next) => {
  try {
    const authorId = req.params.authorId;
    const deletedAuthor = await AuthorModel.findByIdAndDelete(authorId);
    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createError(404, "could not find the specific Author with id", authorId)
      );
    }
  } catch (error) {
    next(error);
  }
});

/**************************** add review to specific Author ******************************/
// authorsRouter.post("/:authorId/reviews", async (req, res, next) => {
//   try {
//     const authorId = req.params.authorId;
//     const newReview = { ...req.body };
//     const author = await AuthorModel.findById(authorId);
//     if (author) {
//       const modifiedAuthor = await AuthorModel.findByIdAndUpdate(
//         authorId,
//         { $push: { reviews: newReview } },
//         { new: true }
//       );
//       res.status(201).send(modifiedAuthor);
//     } else {
//       next(
//         createError(404, "could not find the specific author with id", authorId)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

/**************************** get all reviews to specific author ******************************/
// authorsRouter.get("/:authorId/reviews", async (req, res, next) => {
//   try {
//     const authorId = req.params.authorId;
//     const author = await AuthorModel.findById(authorId);
//     if (author) {
//       res.status(200).send(author.reviews);
//     } else {
//       next(
//         createError(404, "could not find the specific author with id", authorId)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// /**************************** get specific review from specific author ******************************/
// authorsRouter.get("/:authorId/reviews/:reviewId", async (req, res, next) => {
//   try {
//     const author = await AuthorModel.findById(req.params.authorId);
//     if (author) {
//       const reqReview = author.reviews.find(
//         (review) => review._id.toString() === req.params.reviewId
//       );
//       if (reqReview) {
//         res.status(200).send(blog.reviews);
//       } else {
//         next(
//           createError(
//             404,
//             "could not find the specific review with id",
//             req.params.reviewId
//           )
//         );
//       }
//     } else {
//       next(
//         createError(
//           404,
//           "could not find the specific blog with id",
//           req.params.authorId
//         )
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// /**************************** delete specific review from specific blog ******************************/
// authorsRouter.delete("/:authorId/reviews/:reviewId", async (req, res, next) => {
//   try {
//     const modifiedAuthor = await AuthorModel.findByIdAndUpdate(
//       req.params.authorId,
//       { $pull: { reviews: { _id: req.params.reviewId } } },
//       { new: true }
//     );

//     if (modifiedAuthor) {
//       res.send(modifiedAuthor);
//     } else {
//       next(
//         createError(
//           404,
//           "could not find the specific blog with id",
//           req.params.authorId
//         )
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// /**************************** edit specific review from specific blog ******************************/
// authorsRouter.put("/:authorId/reviews/:reviewId", async (req, res, next) => {
//   try {
//     const reqBlog = await AuthorModel.findByIdAndUpdate(req.params.authorId);

//     if (reqBlog) {
//       const index = reqBlog.reviews.findIndex(
//         (review) => review._id.toString() === req.params.reviewId
//       );
//       if (index !== -1) {
//         reqBlog.reviews[index] = {
//           ...reqBlog.reviews[index].toObject(),
//           ...req.body,
//         };
//         await reqBlog.save();
//         res.send(reqBlog);
//       } else {
//         next(
//           createError(
//             404,
//             "could not find the specific blog with id",
//             req.params.authorId
//           )
//         );
//       }
//     } else {
//       next(
//         createError(
//           404,
//           "could not find the specific blog with id",
//           req.params.authorId
//         )
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });
export default authorsRouter;
