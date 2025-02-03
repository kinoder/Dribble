const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const connectionString = "mongodb://localhost:27017/Dribble";
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY || "supersecretkey";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "views")));

//connecting to database(Dribble Database)
mongoose
  .connect(connectionString)
  .then((result) => {
    console.log("connected to the database");
    app.listen(2000, () => {
      console.log("server is running on 2000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

//Mongo Collection
const Users = require("./models/user");
const Designs = require("./models/design");
const Orders = require("./models/order");
const Accounts = require("./models/account");
//loading localhost:2000
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

//Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = decoded;
    next();
  });
};

//Middleware for authorization
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access Denied" });
  }
  next();
};

//Get All users
app.get("/users", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
//Create User
app.post("/users", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const existingUser = await Users.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      username,
      password: hashedPassword,
      email,
      role,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Update User
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await Users.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User Updated" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Delete User
app.delete(
  "/users/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await Users.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//Get All Designs
app.get("/designs", authenticate, async (req, res) => {
  try {
    const designs = await Designs.find();
    res.status(200).json(designs);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Create Design
app.post("/designs", async (req, res) => {
  try {
    const { title, description, price, images, category, designer, purchase } =
      req.body;
    const newDesign = new Designs({
      title,
      description,
      price,
      images,
      category,
      designer,
      purchase,
    });
    await newDesign.save();
    res.status(201).json({ message: "desing created" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Update Design
app.put("/designs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDesign = await Designs.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedDesign) {
      return res.status(404).json({ message: "design not found" });
    }
    res.status(200).json({ message: "Desgin updated" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Delete Design
app.delete("/designs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDesign = await Designs.findByIdAndDelete(id);
    if (!deletedDesign)
      return res.status(404).josn({ message: "design not found" });
    res.status(200).json({ message: "Design deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get All Orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Orders.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Create Order(for test)
app.post("/orders", async (req, res) => {
  try {
    const { buyer, designs, totalAmount } = req.body;
    const newOrder = new Orders({
      buyer,
      designs,
      totalAmount,
    });
    await newOrder.save();
    res.status(200).send("order created");
  } catch (err) {
    console.log(err);
  }
});

//Update Order
app.put("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyer, designs, totalAmount } = req.body;
    const updatedOrder = await Orders.findByIdAndUpdate(
      id,
      { buyer, designs, totalAmount },
      { new: true }
    );
    if (!updatedOrder)
      return res.status(404).json({ message: "order not found" });
    res.status(200).json({ message: "order updated" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Delete Order
app.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Orders.findByIdAndDelete(id);
    if (!deletedOrder)
      return res.status(404).json({ message: "order not found" });
    res.status(200).json({ message: "order deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Caclulate Income
app.get("/income/:designerId", async (req, res) => {
  try {
    const { designerId } = req.params;

    const designs = await Designs.find({ designer: designerId });
    if (!designs.length) {
      return res.status(404).json({
        message: "this designer do not have any design or havn't been sell yet",
      });
    }

    let totalEarnings = 0;
    let soldDesigns = [];

    for (const design of designs) {
      const orders = await Orders.find({ "designs.designId": design._id });

      let designTotal = 0;
      orders.forEach((order) => {
        order.designs.forEach((item) => {
          if (item.designId.toString() === design._id.toString()) {
            designTotal += item.price;
          }
        });
      });

      if (designTotal > 0) {
        totalEarnings += designTotal;
        soldDesigns.push({
          designId: design._id,
          title: design.title,
          earnings: designTotal,
        });
      }
    }

    res.status(200).json({
      designerId,
      totalEarnings,
      soldDesigns,
    });
  } catch (err) {
    console.error(err);
  }
});

//Create account
app.post("/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existingAccount = await Accounts.findOne({ user: id });
    if (existingAccount)
      return res.status(400).json({ message: "account already exists" });
    const newAccount = new Accounts({
      user: id,
      balance: 0,
    });
    await newAccount.save();
    res.status(200).json({ message: "account created" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Increase Balance
app.post("/accounts", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    let account = await Accounts.findOne({ user: userId });
    if (!account) return res.status(404).json({ message: "account not found" });
    account.balance += amount;
    await account.save();
    return res.status(200).json({ message: "balanced increased" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get buyer purchased items
app.get("/orders/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;
    const orders = await Orders.find({ buyer: buyerId });
    if (!orders.length) {
      return res.status(404).json({ message: "no purchased have found." });
    }
    const purchases = orders.map((order) => ({
      orderId: order._id,
      purchasedAt: order.createdAt,
      designs: order.designs.map((item) => ({
        title: item.designId.title,
        price: item.price,
        designer: item.designId.designer,
      })),
    }));
    res.status(200).json({
      buyerId,
      purchases,
    });
  } catch (err) {
    console.error(err);
  }
});

//Purchase item
app.post("/orders/purchase", async (req, res) => {
  try {
    const { buyerId, designs, totalAmount } = req.body;
    if (!buyerId || !designs.length || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid Information." });
    }
    let account = await Accounts.findOne({ user: buyerId });
    if (!account) {
      return res.status(404).json({ message: "Account does not exist" });
    }
    if (account.balance < totalAmount) {
      return res.status(400).json({ message: "insufficient money." });
    }
    account.balance -= totalAmount;
    await account.save();
    const newOrder = new Orders({
      buyer: buyerId,
      designs,
      totalAmount,
    });

    await newOrder.save();

    res.status(201).json({
      message: "success",
      remainingBalance: account.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server side error", error: err.message });
  }
});

////////////////////////////////////////////
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
      expiresIn: "2h",
    });
    res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
