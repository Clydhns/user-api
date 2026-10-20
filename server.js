const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "16kb" }));

const users = [
  {
    LastName: "Sadudaquil",
    FirstName: "Clyde Hans",
    Email: "clydehans6@gmail.com",
    Password: "123456"
  },
  {
    LastName: "Fuck",
    FirstName: "BBM",
    Email: "BBM@Corruption.com",
    Password: "coke"
  },
  {
    LastName: "Flood",
    FirstName: "Control",
    Email: "FloodControl@Ph.com",
    Password: "asa na?"
  }
];

app.get("/", (req, res) => {
  res.send("User and Customer API is running!");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/customers", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({
      message: "Supabase connection is not configured on Render."
    });
  }

  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      message: "Send a JSON object containing the customer fields."
    });
  }

  if (
    !Number.isInteger(body.customerid) ||
    body.customerid <= 0 ||
    body.customerid > 2147483647
  ) {
    return res.status(400).json({
      message: "customerid must be a positive integer up to 2147483647."
    });
  }

  const requiredFields = [
    "lastname",
    "firstname",
    "mobileno",
    "address"
  ];

  for (const field of requiredFields) {
    if (
      typeof body[field] !== "string" ||
      body[field].trim() === ""
    ) {
      return res.status(400).json({
        message: `${field} is required and must be a non-empty string.`
      });
    }
  }

  const customer = {
    customerid: body.customerid,
    lastname: body.lastname.trim(),
    firstname: body.firstname.trim(),
    mobileno: body.mobileno.trim(),
    address: body.address.trim()
  };

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/customer`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(customer),
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      console.error("Supabase insert failed:", {
        status: response.status,
        code: error.code
      });

      if (error.code === "23505") {
        return res.status(409).json({
          message: "customerid already exists. Use a different number."
        });
      }

      return res.status(502).json({
        message: "Could not insert customer. Check the Supabase setup."
      });
    }

    return res.status(201).json({
      message: "Customer inserted successfully.",
      customer
    });
  } catch (error) {
    console.error("Customer insert request failed:", error.name);

    return res.status(502).json({
      message: "Could not reach Supabase. Please try again."
    });
  }
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON body."
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large."
    });
  }

  console.error("Unexpected server error:", err.message);

  return res.status(500).json({
    message: "Internal server error."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
