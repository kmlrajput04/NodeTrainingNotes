const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/user.js");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

const { default: mongoose } = require("mongoose");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "yadavmrityunjay91@gmail.com",
    pass: "wpun luwd lkiu xrbk",
  },
});

const generateOTP = () => {
  let digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const create = async (req, res) => {
  const { username, name, password, email, phone, country } = req.body;
  const users = await User.findOne({ email: email });
  if (users) {
    res.status(500).json({ message: "Email Already Exist!!!!!" });
  }
  if (!username || !name || !password || !email || !phone || !country) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    name,
    password: hashedPassword,
    email,
    phone,
    country,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginwithusername = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username " });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid  password" });
    }

    const token = jwt.sign(
      { username: user.username, userId: user._id },
      "zxcvbnmiuytfgh",
      { expiresIn: "1h" }
    );

    user.tokens = token;
    await user.save();

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (user.is_deleted) {
      return res
        .status(401)
        .json({ message: "This user is marked as deleted" });
    }

    if (!user.is_deleted) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Generate OTP
        const otp = generateOTP();
        user.otp = otp;
        await user.save();

        // Send OTP via email
        const mailOptions = {
          from: "yadavmrityunjay91@gmail.com",
          to: user.email,
          subject: "OTP Verification",
          text: `Your OTP is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: error.message });
          }
          console.log("Email sent: " + info.response);
        });

        const token = jwt.sign(
          { username: user.username, userId: user._id },
          "zxcvbnmiuytfgh",
          { expiresIn: "1h" }
        );

        user.tokens = token;
        await user.save();

        res.json({ user });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp === otp) {
      user.otp = null;
      await user.save();

      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error during OTP verificatin: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const { ObjectId } = mongoose.Types;
const getById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  const userId = req.params.id;
  const { firstname, lastname, username, name, email, phone } = req.body;
  if (!username || !name || !email || !phone || !firstname || !lastname) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstname,
        lastname,
        username,
        name,
        email,
        phone,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password update successfully" });
  } catch (error) {
    console.error("Error changing password: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const temporaryPassword = generateOTP();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: "",
      to: user.email,
      subject: "Temporary Password",
      text: `Your temporary password is: ${temporaryPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      console.log("Temporary Password Email sent: " + info.response);
    });
    res.json({ message: "Temporary password sent to your email" });
  } catch (error) {
    console.error("Error during forget password: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const filePath = path.join(__dirname, "..", "file.txt");
const readFile = async (req, res) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    res.status(200).send(fileContent);
  } catch (error) {
    console.error("Error reading file: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAll = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $match: { is_deleted: { $ne: true } },
      },
    ]);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndUpdate(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    deletedUser.is_deleted = true;
    await deletedUser.save();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const search = async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.aggregate([
      {
        $match: {
          $or: [
            { firstname: { $regex: query, $options: "i" } },
            { lastname: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { teachers: { $regex: query, $options: "i" } },
          ],
          is_deleted: { $ne: true },
          teacher: teacherId
            ? mongoose.Types.ObjectId(teacherId)
            : { $exists: true },
        },
      },
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.avatar = req.file.originalname;
    await user.save();

    res.json({ message: "Avatar image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading avatar image: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  create,
  loginwithusername,
  login,
  verifyOtp,
  getById,
  update,
  changePassword,
  forgetPassword,
  readFile,
  getAll,
  deleteUser,
  search,
  uploadAvatar,
};
