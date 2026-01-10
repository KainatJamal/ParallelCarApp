const express = require("express");
const path = require("path");

// Import simulated distributed services
const carService1 = require("./services/carService1");
const carService2 = require("./services/carService2");
const carService3 = require("./services/carService3");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------- MIDDLEWARE ----------------------

// Serve static files (CSS, images, JS, favicon)
app.use(express.static(path.join(__dirname, "public")));

// Enable URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------------------- DATA ----------------------

// List of all cars (for selection)
const allCars = [
  { id: 1, name: "Car A" }, { id: 2, name: "Car B" },
  { id: 3, name: "Car C" }, { id: 4, name: "Car D" },
  { id: 5, name: "Car E" }, { id: 6, name: "Car F" }
];

// Map car ID to service (simulated distributed nodes)
const carServiceMap = {
  1: carService1,
  2: carService1,
  3: carService2,
  4: carService2,
  5: carService3,
  6: carService3
};

// ---------------------- ROUTES ----------------------

// Home page
app.get("/", (req, res) => {
  res.render("index", { cars: allCars });
});

// Compare page
app.post("/compare", async (req, res) => {
  let selectedIds = req.body.cars;

  // Ensure selectedIds is an array
  if (!selectedIds) return res.send("Please select at least 2 cars.");
  if (!Array.isArray(selectedIds)) selectedIds = [selectedIds];
  if (selectedIds.length < 2) return res.send("Please select at least 2 cars.");

  try {
    // ------------------ Sequential Fetch ------------------
    const seqStart = Date.now();
    const seqResults = [];
    for (let id of selectedIds) {
      const service = carServiceMap[id];
      const car = await service.getCar(id);
      seqResults.push(car);
    }
    const seqTime = Date.now() - seqStart;

    // ------------------ Parallel Fetch ------------------
    const parStart = Date.now();
    const parResults = await Promise.all(
      selectedIds.map(async id => {
        const service = carServiceMap[id];
        return await service.getCar(id);
      })
    );
    const parTime = Date.now() - parStart;

    const speedup = (seqTime / parTime).toFixed(2);

    // ------------------ Aggregation / Reduction ------------------
    const aggregated = parResults.reduce((agg, car) => {
      agg.priceSum += car.price;
      agg.mileageSum += car.mileage;
      agg.engineSum += car.engine;
      agg.safetySum += car.safety;
      agg.priceMax = Math.max(agg.priceMax, car.price);
      agg.priceMin = Math.min(agg.priceMin, car.price);
      return agg;
    }, { priceSum: 0, mileageSum: 0, engineSum: 0, safetySum: 0, priceMax: -Infinity, priceMin: Infinity });

    const reduction = {
      avgPrice: (aggregated.priceSum / parResults.length).toFixed(2),
      avgMileage: (aggregated.mileageSum / parResults.length).toFixed(2),
      avgEngine: (aggregated.engineSum / parResults.length).toFixed(2),
      avgSafety: (aggregated.safetySum / parResults.length).toFixed(2),
      priceMax: aggregated.priceMax,
      priceMin: aggregated.priceMin
    };

    // Render comparison page
    res.render("compare", {
      compareResults: parResults,
      reduction,
      seqTime,
      parTime,
      speedup
    });

  } catch (err) {
    console.error("Error fetching car data:", err);
    res.status(500).send("Internal server error while fetching car data.");
  }
});

// ---------------------- START SERVER ----------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
