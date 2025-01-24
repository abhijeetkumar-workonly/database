const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
app.use(cors());
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database("database.db");

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to store files
  },
  filename: (req, file, cb) => {
    // Replace white spaces and '&' characters in the original file name
    const sanitizedFileName = file.originalname
      .replace(/\s+/g, "") // Remove all white spaces
      .replace(/&/g, "_"); // Replace '&' with '_'
    cb(null, `${Date.now()}-${sanitizedFileName}`); // Prepend timestamp for uniqueness
  },
});

// Set up file filter and limits if needed
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 200 }, // Limit file size to 200MB
});

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // The "catchall" handler: for any request that doesn't match an API route, send back React's index.html file.
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   });

// Function to hash password using MD5
const hashPassword = (password) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

const checkPassword = (inputPassword, storedHashedPassword) => {
  const inputHashedPassword = hashPassword(inputPassword);
  return inputHashedPassword === storedHashedPassword;
};

//open file
const openFile = (filePath) => {
  const absolutePath = path.resolve(filePath); // Get the absolute path of the file
  // console.log(filePath)
  const networkPath = `\\\\ABHI-PC\\${filePath}`;
  // console.log(networkPath)

  exec(`start ${networkPath}`, (err) => {
    if (err) {
      console.error("Error opening File:", err);
    } else {
      // console.log('File opened successfully');
    }
  });
};

//endpoint to trigger file opening
app.get("/open-file/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = `uploads/${fileName}`; // Assuming your PDF files are in 'uploads/' directory

  openFile(filePath);

  res.send("File opening...");
});

// to authenticate the user
app.post("/authenticate", (req, res) => {
  let { username, password } = req.body;
  password += "dls";
  password = hashPassword(password);

  // Query to check if the user exists
  db.get(
    "SELECT ID, userName, accessLevel, fullName FROM users WHERE userName = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        // User authenticated successfully, returning relevant user information
        res.json({
          success: true,
          message: "Authentication successful",
          user: {
            ID: row.ID,
            userName: row.userName,
            accessLevel: row.accessLevel,
            fullName: row.fullName,
          },
        });
      } else {
        // User not found or invalid credentials
        res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }
    }
  );
});

// Route to get listed names and images
app.get("/listedlru/:categ", (req, res) => {
  const categ = req.params.categ;
  db.all(
    "SELECT lruName FROM listedLRU WHERE category = ?",
    [categ],
    (err, rows) => {
      if (err) {
        console.error("Error fetching data:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json({ data: rows });
    }
  );
});

// Route to get listed names and images
app.get("/listedlru", (req, res) => {
  db.all("SELECT * FROM listedLRU", [], (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ data: rows });
  });
});

// Example route to get data from the database
app.get("/projectnames", (req, res) => {
  db.all("SELECT * FROM projectNames", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Example route to get data from the database
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Example route to get data from the database
app.get("/pendingusers", (req, res) => {
  db.all("SELECT * FROM pendingUsers", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Example route to get data from the database
app.get("/lrutable/:project?", (req, res) => {
  const projectName = req.params.project;

  if (projectName) {
    // Fetch records specific to the project name
    db.all(
      "SELECT * FROM lruTable WHERE projectName = ?",
      [projectName],
      (err, rows) => {
        if (err) {
          console.error("Database query error:", err.message);
          return res.status(500).json({ error: "Server error" });
        }
        if (rows.length === 0) {
          // No records found for this project
          return res
            .status(404)
            .json({ message: `No records found for project: ${projectName}` });
        }
        // Send back the project-specific records
        res.json({ data: rows });
      }
    );
  } else {
    // Fetch all records if no project name is provided
    db.all("SELECT * FROM lruTable", (err, rows) => {
      if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).json({ error: "Server error" });
      }
      // Send back all records
      res.json({ data: rows });
    });
  }
});

app.get("/lrus/:name", (req, res) => {
  const lruName = req.params.name;

  if (lruName) {
    // Fetch records specific to the LRU name (case-insensitive)
    db.all(
      //   "SELECT * FROM lruTable WHERE LOWER(lruName) = LOWER(?)",
      "SELECT * FROM clearanceView WHERE LOWER(lruName) = LOWER(?)",
      [lruName],
      (err, rows) => {
        if (err) {
          console.error("Database query error:", err.message);
          return res.status(500).json({ error: "Server error" });
        }
        // Send back the LRU-specific records
        res.json({ data: rows });
      }
    );
  } else {
    // Fetch all records if no LRU name is provided
    db.all("SELECT * FROM lruTable", (err, rows) => {
      if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).json({ error: "Server error" });
      }
      // Send back all records
      res.json({ data: rows });
    });
  }
});

// Example route to get data from the database
app.get("/selelrudoc", (req, res) => {
  const { lruName, lruSno } = req.body;
  console.log(req.body);
});

// Example route to get data from the database
app.get("/gatepass", (req, res) => {
  db.all("SELECT * FROM gatePass", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Endpoint to open the gate pass file
app.get("/open-gatepass/:id", (req, res) => {
  const id = req.params.id;

  // Assuming you're retrieving the file path from the database
  db.get("SELECT gatePass FROM gatePass WHERE ID = ?", [id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: "Gate pass not found" });
    }

    const filePath = path.join(__dirname, row.gatePass);

    // Send the file to the client to open it
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "Error opening gate pass" });
      }
    });
  });
});

// Example route to get data from the database
app.get("/miscdocs", (req, res) => {
  db.all("SELECT * FROM miscDocs", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Endpoint to open the Misc Doc file
app.get("/open-miscdoc/:id", (req, res) => {
  const id = req.params.id;

  // Fetch the gate pass from the database
  db.get("SELECT document FROM miscDocs WHERE ID = ?", [id], (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve Document" });
    }
    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    const filePath = path.join(__dirname, row.document);

    // Send the file to the client to open it
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "Error opening gate pass" });
      }
    });
  });
});

// Example route to get data from the database
app.get("/commondocs", (req, res) => {
  db.all(
    "SELECT * FROM lruSpecificDoc WHERE lruSno = ?",
    ["NA"],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    }
  );
});

// Example route to get data from the database
app.get("/commondocs/:lruname", (req, res) => {
  const lruName = req.params.lruname;
  db.all(
    "SELECT * FROM lruSpecificDoc WHERE lruName = ? AND lruSno = ?",
    [lruName, "NA"],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    }
  );
});

// Endpoint to open the Misc Doc file
app.get("/open-commondoc/:id", (req, res) => {
  const id = req.params.id;
  // Fetch the gate pass from the database
  db.get(
    "SELECT document FROM lruSpecificDoc WHERE ID = ?",
    [id],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to retrieve Document" });
      }
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Document not found" });
      }
      const filePath = path.join(__dirname, row.document);

      // Send the file to the client to open it
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Error opening gate pass" });
        }
      });
    }
  );
});

// Example route to get data from the database
app.get("/fullrcma", (req, res) => {
  db.all("SELECT * FROM rcmaTable ", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Example route to get data from the database
app.get("/fullrcma/:name", (req, res) => {
  const lruName = req.params.name;
  db.all(
    "SELECT * FROM rcmaTable WHERE LOWER(lruName)=LOWER(?)",
    [lruName],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    }
  );
});

// Endpoint to open the Misc Doc file
app.get("/open-rcma/:id", (req, res) => {
  const id = req.params.id;
  // Fetch the gate pass from the database
  db.get("SELECT rcmaDoc FROM rcmaTable WHERE ID = ?", [id], (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve Document" });
    }
    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    const filePath = path.join(__dirname, row.rcmaDoc);

    // Send the file to the client to open it
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "Error opening RCMA" });
      }
    });
  });
});

// Example route to get data from the database
app.get("/reporttable", (req, res) => {
  db.all("SELECT * FROM reportTable ", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Endpoint to open the Misc Doc file
app.get("/open-report/:id", (req, res) => {
  const id = req.params.id;
  // Fetch the gate pass from the database
  db.get(
    "SELECT reportFile FROM reportTable WHERE ID = ?",
    [id],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to retrieve Report" });
      }
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      }
      const filePath = path.join(__dirname, row.reportFile);

      // Send the file to the client to open it
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Error opening Report" });
        }
      });
    }
  );
});

// Example route to get data from the database View
app.get("/clearanceview", (req, res) => {
  db.all("SELECT * FROM clearanceView ", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Example route to get data from the database
app.get("/clearancetable", (req, res) => {
  db.all("SELECT * FROM clearanceTable ", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Endpoint to open the Misc Doc file
app.get("/open-clearance/:id", (req, res) => {
  const id = req.params.id;
  // Fetch the gate pass from the database
  db.get(
    "SELECT clearanceFile FROM clearanceTable WHERE ID = ?",
    [id],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to retrieve Report" });
      }
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Clearance Report not found" });
      }
      const filePath = path.join(__dirname, row.clearanceFile);

      // Send the file to the client to open it
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Error opening Report" });
        }
      });
    }
  );
});

// Endpoint to open the Clearnace file
app.get("/open-clearanceview/:id", (req, res) => {
  const id = req.params.id;
  // Fetch the gate pass from the database
  db.get(
    "SELECT clearanceFile FROM clearanceView WHERE ID = ?",
    [id],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to retrieve Report" });
      }
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Clearance Report not found" });
      }
      const filePath = path.join(__dirname, row.clearanceFile);

      // Send the file to the client to open it
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Error opening Report" });
        }
      });
    }
  );
});

// Example route to get data from the database
app.get("/locationtable", (req, res) => {
  db.all("SELECT * FROM locationTable ", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post("/newlrurecord", (req, res) => {
  const { category, projectName, lruName, lruSno, unitType } = req.body;

  if (!lruSno) {
    return res
      .status(400)
      .json({ success: false, message: "LRU Serial Number is required" });
  }

  // Check if LRU Record already exists
  db.get(
    "SELECT * FROM lruTable WHERE lruName = ? AND lruSno = ?",
    [lruName, lruSno],
    (error, row) => {
      if (error) {
        console.error("Database query error:", error.message);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }

      if (row) {
        return res
          .status(400)
          .json({ success: false, message: "LRU Record already exists" });
      }
      // If LRU Record does not exist, insert the new project
      db.run(
        "INSERT INTO lruTable (category, projectName, lruName, lruSno, unitType) VALUES (?, ?, ?, ?, ?)",
        [category, projectName, lruName, lruSno, unitType],
        function (error) {
          if (error) {
            console.error("Database insert error:", error.message);
            return res
              .status(500)
              .json({ success: false, message: "Server error" });
          }
          // Return success with the last inserted ID
          res.status(200).json({
            success: true,
            message: "LRU Record added successfully",
            id: this.lastID,
          });
        }
      );
    }
  );
});

app.post("/newproject", (req, res) => {
  const { projName } = req.body;

  if (!projName) {
    return res
      .status(400)
      .json({ success: false, message: "Project name is required" });
  }

  // Check if project name already exists
  db.get(
    "SELECT * FROM projectNames WHERE projectName = ?",
    [projName],
    (error, row) => {
      if (error) {
        console.error("Database query error:", error.message);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
      if (row) {
        return res
          .status(400)
          .json({ success: false, message: "Project name already exists" });
      }

      // If project name does not exist, insert the new project
      db.run(
        "INSERT INTO projectNames (projectName) VALUES (?)",
        [projName],
        function (error) {
          if (error) {
            console.error("Database insert error:", error.message);
            return res
              .status(500)
              .json({ success: false, message: "Server error" });
          }
          res
            .status(200)
            .json({ success: true, message: "Project added successfully" });
        }
      );
    }
  );
});

// Route to add a new LRU
app.post("/newlru", upload.single("lruImage"), (req, res) => {
  const { lruName, category } = req.body;
  const lruImage = req.file ? req.file.filename : null;

  if (!lruName) {
    return res.status(400).json({ error: "lruName is required" });
  }

  // Check if project name already exists
  db.get(
    "SELECT * FROM listedLRU WHERE lruName = ?",
    [lruName],
    (error, row) => {
      if (error) {
        console.error("Database query error:", error.message);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
      if (row) {
        return res
          .status(400)
          .json({ success: false, message: "LRU already exists" });
      }

      const sql =
        "INSERT INTO listedLRU (category, lruName, lruImage) VALUES (?, ?, ?)";

      db.run(sql, [category, lruName, lruImage], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, lruName, lruImage });
      });
    }
  );
});

// Route to Update LRU image
app.post("/updatelruimage", upload.single("lruImage"), (req, res) => {
  const { lruName } = req.body;
  const lruImage = req.file ? req.file.filename : null;
  if (!lruImage) {
    return res.status(400).json({ error: "lruImage is required" });
  }
  const sql =
    "UPDATE listedLRU SET lruImage = ? WHERE lruName = ?";
  db.run(sql, [lruImage, lruName], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, lruName, lruImage });
  });
});

//approve pending user
app.post("/approvependinguser/:id", (req, res) => {
  const ID = req.params.id;

  // SQL query to move data from pendingUsers to Users table
  const insertQuery = `
        INSERT INTO users (fullName, userName, password, accessLevel, mobile)
        SELECT fullName, userName, password, 'USER', mobile
        FROM pendingUsers
        WHERE ID = ?
    `;

  // SQL query to delete the user from pendingUsers table
  const deleteQuery = `DELETE FROM pendingUsers WHERE ID = ?`;

  // Begin the transaction
  db.run("BEGIN TRANSACTION", (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to start transaction" });
    }

    // Insert the user into Users table
    db.run(insertQuery, [ID], function (err) {
      if (err) {
        return db.run("ROLLBACK", () => {
          res
            .status(500)
            .json({ success: false, message: "Failed to approve user" });
        });
      }

      // Delete the user from pendingUsers table
      db.run(deleteQuery, [ID], function (err) {
        if (err) {
          return db.run("ROLLBACK", () => {
            res.status(500).json({
              success: false,
              message: "Failed to delete pending user",
            });
          });
        }

        // Commit the transaction
        db.run("COMMIT", (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Failed to commit transaction",
            });
          }

          res
            .status(200)
            .json({ success: true, message: "User approved successfully" });
        });
      });
    });
  });
});

// Create a new gate pass
app.post("/newgatepass", upload.single("gatePass"), (req, res) => {
  const { itemName, itemSno, fromAddress, toAddress, reason, date } = req.body;
  const gatePass = req.file;
  const sts = "OPEN";

  if (
    !itemName ||
    !fromAddress ||
    !toAddress ||
    !reason ||
    !date ||
    !gatePass
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including gatePass file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = gatePass.path;
  // Insert into the database
  db.run(
    "INSERT INTO gatePass (itemName, itemSno, fromAddress, toAddress, Reason, date, gatePass, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [itemName, itemSno, fromAddress, toAddress, reason, date, filePath, sts],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to create gate pass" });
      }
      res.status(201).json({
        success: true,
        message: "Gate pass created successfully",
        id: this.lastID,
      });
    }
  );
});

// update gatepass Status
app.post("/updategatepasssts", (req, res) => {
  const { sts, id } = req.body;
  db.run("UPDATE gatePass SET status=? WHERE ID=?", [sts, id], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to Update gate pass Sts" });
    }
    res.status(201).json({
      success: true,
      message: "Gate pass Updated successfully",
      id: this.lastID,
    });
  });
});

// Create a new Miscllaneous Document
app.post("/newmiscdoc", upload.single("document"), (req, res) => {
  const { docName } = req.body;
  const document = req.file;

  if (!docName || !document) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including Document file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = document.path;
  // Insert into the database
  db.run(
    "INSERT INTO miscDocs (docName, document) VALUES (?, ?)",
    [docName, filePath],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload Document" });
      }
      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        id: this.lastID,
      });
    }
  );
});

// Create a new Miscllaneous Document
app.post("/newlrudoc", upload.single("document"), (req, res) => {
  const { lruName, lruSno, docName } = req.body;
  const document = req.file;

  if (!lruName || !lruSno || !docName || !document) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including Document file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = document.path;
  // Insert into the database
  db.run(
    "INSERT INTO lruSpecificDoc (lruName, lruSno, docName, document) VALUES (?, ?, ?, ?)",
    [lruName, lruSno, docName, filePath],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload Document" });
      }
      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        id: this.lastID,
      });
    }
  );
});

// feed new RCMA Letter
app.post("/newrcma", upload.single("rcmaDoc"), (req, res) => {
  const { lruName, partNo } = req.body;
  const rcmaDoc = req.file;

  if (!lruName || !partNo || !rcmaDoc) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including RCMA file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = rcmaDoc.path;
  // Insert into the database
  db.run(
    "INSERT INTO rcmaTable (lruName, partNo, rcmaDoc) VALUES (?, ?, ?)",
    [lruName, partNo, filePath],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload Document" });
      }
      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        id: this.lastID,
      });
    }
  );
  db.run(
    "UPDATE listedLRU SET rcma = ? WHERE lruName = ?",
    ["Available", lruName],
    function (err) {
      if (err) {
        console.error(err);
      }
    }
  );
});

// feed new Project Report
app.post("/newreport", upload.single("reportFile"), (req, res) => {
  const {
    projectName,
    reportType,
    reportDate,
    reportName,
    preparedBy,
    remarks,
  } = req.body;
  const reportFile = req.file;

  if (!reportName || !reportDate || !preparedBy || !reportFile) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including Report file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = reportFile.path;
  // Insert into the database
  db.run(
    "INSERT INTO reportTable (projectName, reportType, reportDate, reportName, preparedBy, remarks, reportFile) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      projectName,
      reportType,
      reportDate,
      reportName,
      preparedBy,
      remarks,
      filePath,
    ],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload Report" });
      }
      res.status(201).json({
        success: true,
        message: "Report uploaded successfully",
        id: this.lastID,
      });
    }
  );
});

// feed new Clearance Report
app.post("/newclearance", upload.single("clearanceFile"), (req, res) => {
  const { lruName, lruSno } = req.body;
  const clearanceFile = req.file;

  if (!lruName || !lruSno || !clearanceFile) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including Clearance file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = clearanceFile.path;
  // Insert into the database
  db.run(
    "INSERT INTO clearanceTable (lruName, lruSno, clearanceFile) VALUES (?, ?, ?)",
    [lruName, lruSno, filePath],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload Clearance" });
      }
      res.status(201).json({
        success: true,
        message: "Clearance uploaded successfully",
        id: this.lastID,
      });
    }
  );
  db.run(
    "UPDATE lruTable SET clearance = ? WHERE lruName= ? AND lruSno = ?",
    ["Available", lruName, lruSno],
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
});

// feed new Misc Report
app.post("/newmiscreport", upload.single("reportFile"), (req, res) => {
  const { reportName, reportDate, preparedBy, remarks } = req.body;
  const reportFile = req.file;

  if (!reportName || !reportDate || !preparedBy || !reportFile) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including Report file",
    });
  }

  // Insert into the database (store file path, not file data)
  const filePath = reportFile.path;
  // Insert into the database
  db.run(
    "INSERT INTO miscReports (reportName, reportDate, preparedBy, remarks, reportFile) VALUES (?, ?, ?, ?, ?)",
    [reportName, reportDate, preparedBy, remarks, filePath],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload Report" });
      }
      res.status(201).json({
        success: true,
        message: "Report uploaded successfully",
        id: this.lastID,
      });
    }
  );
});

app.post("/newlocation", (req, res) => {
  const { lruName, lruSno, currLocation, date } = req.body;
  db.run(
    "INSERT INTO locationTable (lruName, lruSno, currLocation, date) VALUES (?, ?, ?, ?)",
    [lruName, lruSno, currLocation, date],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
    }
  );

  db.run(
    "UPDATE lruTable SET location=? WHERE lruName=? AND lruSno=?",
    [currLocation, lruName, lruSno],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// delete Any pending User registration
app.delete("/deletependinguser/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM pendingUsers WHERE ID = ?`;

  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  });
});

// delete Any Registered User registration
app.delete("/deleteregistereduser/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM users WHERE ID = ?`;

  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  });
});

// delete Any Project Name
app.delete("/deleteprojectname/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM projectNames WHERE ID = ?`;

  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  });
});

// delete Any LRU Name
app.delete("/deletelruname/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM listedLru WHERE ID = ?`;

  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  });
});

// delete Any LRU Record
app.delete("/deletelrurecord/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM lruTable WHERE ID = ?`;

  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
    res
      .status(200)
      .json({ success: true, message: "Record deleted successfully" });
  });
});

// delete Any Gate Pass
app.delete("/deletegatepass/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM gatePass WHERE ID = ?`;
  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete GatePass" });
    }
    res
      .status(200)
      .json({ success: true, message: "GatePass deleted successfully" });
  });
});

// delete Any Misc Docs
app.delete("/deletemiscdocs/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM miscDocs WHERE ID = ?`;
  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete Document" });
    }
    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  });
});

// delete Any Common Docs
app.delete("/deletecommondocs/:id", (req, res) => {
  const ID = req.params.id;
  const query = `DELETE FROM lruSpecificDoc WHERE ID = ?`;
  db.run(query, [ID], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete Document" });
    }
    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  });
});

// accept signUp data to approve by admin
app.post("/pendingUsers", (req, res) => {
  let { fullName, userName, idCardNumber, mobileNumber } = req.body;
  idCardNumber += "dls";
  idCardNumber = hashPassword(idCardNumber);
  db.run(
    "INSERT INTO pendingUsers (fullName, userName, password, mobile) VALUES (?, ?, ?, ?)",
    [fullName, userName, idCardNumber, mobileNumber],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// approved users after signup
app.post("/users", (req, res) => {
  const { username, password, accesslevel, fullname, mobile } = req.body;
  db.run(
    "INSERT INTO users (userName, password, accessLevel, fullName, mobile) VALUES (?, ?, ?, ?, ?)",
    [userName, password, accesslevel, fullname, mobile],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
