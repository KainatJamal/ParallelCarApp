// Simulates Car API Node 1
const cars = [
  { id: 1, name: "Car A", price: 25000, mileage: 15, engine: 2000, safety: 4 },
  { id: 2, name: "Car B", price: 30000, mileage: 18, engine: 1800, safety: 5 }
];

module.exports.getCar = async (id) => {
  // Random delay to simulate network latency
  await new Promise(r => setTimeout(r, Math.random() * 500 + 100));
  return cars.find(c => c.id == id);
};
