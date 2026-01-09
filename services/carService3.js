const cars = [
  { id: 5, name: "Car E", price: 28000, mileage: 17, engine: 1900, safety: 4 },
  { id: 6, name: "Car F", price: 33000, mileage: 13, engine: 2200, safety: 5 }
];

module.exports.getCar = async (id) => {
  await new Promise(r => setTimeout(r, Math.random() * 500 + 100));
  return cars.find(c => c.id == id);
};
