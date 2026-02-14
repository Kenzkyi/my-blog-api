const mongoose = require("mongoose");

const Article = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    body: {
      type: String,
      required: true,
    },
    description: String,
    author: {
      type: {
        email: {
          type: String,
          ref: "User",
        },
        first_name: {
          type: String,
          ref: "User",
        },
        last_name: {
          type: String,
          ref: "User",
        },
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    },
    state: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    read_count: {
      type: Number,
      default: 0,
    },
    tags: [String],
    reading_time: String,
    reading_time_minutes: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

Article.pre("save", function () {
  let allText = "";
  if (typeof this.title === "string" && this.title) {
    allText += this.title;
  }
  if (typeof this.body === "string" && this.body) {
    allText += this.body;
  }
  if (typeof this.description === "string" && this.description) {
    allText += this.description;
  }

  const totalLength = allText.trim().length;

  const totalMins = totalLength / 200;

  let readingTime;
  if (totalMins <= 1) {
    readingTime = Math.round(totalMins * 60) + " secs";
  } else if (totalMins > 60) {
    const hours = Math.floor(totalMins / 60);
    const mins = Math.round(totalMins % 60);
    readingTime = `${hours} hrs ${mins} mins`;
  } else {
    readingTime = Math.round(totalMins) + " mins";
  }

  this.reading_time = readingTime;
  this.reading_time_minutes = Math.round(totalMins);
});

Article.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  const updateData = update.$set || update;

  if (updateData.body || updateData.title || updateData.description) {
    let allText = "";
    if (typeof updateData.title === "string" && updateData.title) {
      allText += updateData.title;
    }
    if (typeof updateData.body === "string" && updateData.body) {
      allText += updateData.body;
    }
    if (typeof updateData.description === "string" && updateData.description) {
      allText += updateData.description;
    }

    const totalLength = allText.trim().length;
    const totalMins = totalLength / 200;

    let readingTime;
    if (totalMins <= 1) {
      readingTime = Math.round(totalMins * 60) + " secs";
    } else if (totalMins > 60) {
      const hours = Math.floor(totalMins / 60);
      const mins = Math.round(totalMins % 60);
      readingTime = `${hours} hrs ${mins} mins`;
    } else {
      readingTime = Math.round(totalMins) + " mins";
    }

    const readingMinutes = Math.round(totalMins);

    if (update.$set) {
      update.$set.reading_time = readingTime;
      update.$set.reading_time_minutes = readingMinutes;
    } else {
      update.reading_time = readingTime;
      update.reading_time_minutes = readingMinutes;
    }
  }
});

module.exports = new mongoose.model("Article", Article);
