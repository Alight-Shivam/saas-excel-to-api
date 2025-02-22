const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const cors = require("cors");
const path = require("path");
const sequelize = require("./database");
const ApiConfig = require("./models/ApiConfig");

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

const upload = multer({ storage });

// Sync database
sequelize.sync().then(() => {
  console.log("Database synced");
});

// Store parsed data in memory (for simplicity)
let parsedData = {};

// Endpoint to handle file uploads
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(req.file.path);
    parsedData = {}; // Reset parsed data

    workbook.eachSheet((worksheet, sheetId) => {
      const data = [];
      worksheet.eachRow((row, rowNumber) => {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[`col${colNumber}`] = cell.value;
        });
        data.push(rowData);
      });
      parsedData[worksheet.name] = data; // Store data by sheet name
    });

    res.json(parsedData); // Send parsed data for all sheets
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).send("Error processing file.");
  }
});

// Endpoint to generate API
app.post("/generate-api", async (req, res) => {
  const { operation, parameters } = req.body;

  if (!operation) {
    return res.status(400).send("No operation selected.");
  }

  // Generate endpoint
  const endpoint = `/api/${operation}`;

  // Save API configuration to database
  try {
    const apiConfig = await ApiConfig.create({
      operation,
      parameters,
      endpoint,
    });
    res.json({ endpoint: apiConfig.endpoint });
  } catch (error) {
    console.error("Error saving API configuration:", error);
    res.status(500).send("Error generating API.");
  }
});

// Dynamically create API endpoints
app.use("/api", async (req, res) => {
  const { method, originalUrl } = req;
  const endpoint = originalUrl.split("?")[0]; // Remove query parameters

  try {
    const apiConfig = await ApiConfig.findOne({ where: { endpoint } });
    if (!apiConfig) {
      return res.status(404).send("API endpoint not found.");
    }

    // Handle CRUD operations
    switch (apiConfig.operation) {
      case "create":
        res.json({ message: "Create operation", data: req.query });
        break;
      case "read":
        // Return the parsed data for the first sheet (for simplicity)
        const sheetName = Object.keys(parsedData)[0]; // Get the first sheet
        res.json(parsedData[sheetName]); // Return the actual data
        break;
      case "update":
        res.json({ message: "Update operation", data: req.query });
        break;
      case "delete":
        res.json({ message: "Delete operation" });
        break;
      default:
        res.status(400).send("Invalid operation.");
    }
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).send("Internal server error.");
  }
});

// Serve static files (for production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});