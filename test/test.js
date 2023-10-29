const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// app.use(function (req, res, next) {
//   res.setHeader("Content-Type", "application/json");
//   next();
// });

const url = "mongodb+srv://syntax:1234@cluster0.tmc1adt.mongodb.net/Syntax"; // Replace with your MongoDB connection string
const dbName = "Syntax"; // Replace with your database name

const client = new MongoClient(url);
try {
  client.connect();
  console.log("connected to DB");
} catch (error) {
  console.log(err);
}

const db = client.db(dbName);
// } catch (err) {
// }
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  const collection = db.collection("users");
  console.log("Username:", username);
  console.log("Password:", password);
  try {
    const result = await collection.insertOne({ username, password });

    console.log(result);
    res.render("layer02");
  } catch (err) {
    // console.log();
    console.error("Error:", err);
    res.send("Error occurred during registration.");
  }
});

app.get("/layer03", (req, res) => {
  res.render("Layer03");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/poems/create", async (req, res) => {
  //   const title = req.params.title;
  //   console.log(title);

  const { message, sender, title } = req.body;
  console.log(message, sender);
  collection = db.collection("poems");
  const poem = await collection.findOne({ title: title, creator: sender });
  if (poem) {
    res.send("Title already taken");
  } else {
    try {
      await collection.insertOne(
        { title: title, messageArr: [{ message, sender }] },
        () => {
          console.log("added");
        }
      );
      const poems = await collection.findOne({});
      return res.render("frontend", {
        Poem: poems.title,
        messageArr: poems.messageArr,
      });
    } catch (err) {
      res.send("Error");
    }
  }
  //   await collection.insertOne({
  //     title,
  //     sender,
  //     message
  //   });
});

app.post("/poems/update", async (req, res) => {
  const { message, sender, title } = req.body;
  console.log(message, sender);
  collection = db.collection("poems");

  try {
    const existingPoem = await collection.findOne({ title: req.body.title });

    if (existingPoem) {
      const newMessageArr = existingPoem.messageArr;
      newMessageArr.push({ message, sender });
      //   const newMessage = existingPoem.message + "\n" + req.body.message;

      const myquery = { title: req.body.title };
      const updatedData = {
        title: title,
        creator: sender,
        messageArr: newMessageArr,
      };

      await collection.updateOne(myquery, { $set: updatedData });

      console.log("Updated");
      res.send("Updated");
    } else {
      console.log("Poem not found");
      res.send("Poem not found");
    }
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
});

app.get("/poems", async (req, res) => {
  const collection = db.collection("poems");

  const poems = await collection.findOne({});
  console.log(poems);

  res
    .status(201)
    .render("frontend", { Poem: poems.title, messageArr: poems.messageArr });
});
