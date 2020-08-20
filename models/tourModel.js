const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A TOUR MUST HAVE A NAME"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour must have less or equal then 40 charecter"],
      minlength: [10, "A tour must have more or equal then 10 charecter"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A TOUR MUST HAVE A GROUP SIZE"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A TOUR MUST HAVE A GROUP SIZE"],
    },
    difficulty: {
      type: String,
      required: [true, "AA TOU MUST HAVE DIFFICULTY"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be easy or medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Ratings must be above 1.0"],
      max: [5, "Ratings must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A TOUR MUST HAVE A PRICE"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount should be below than regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A TOUR MUST HAVE A SUMMERY"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A TOUR MUST HAVE A COVER IMAGE"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//define a virtual property that does not save in database
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
//virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//DOCUMENT MIDDLEWARE
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE thats run before or after a certion query was executed
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v ",
  });
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
