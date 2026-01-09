const cars = [
  { id: 3, name: "Car C", price: 22000, mileage: 16, engine: 1500, safety: 3 },
  { id: 4, name: "Car D", price: 35000, mileage: 14, engine: 2500, safety: 5 }
];

module.exports.getCar = async (id) => {
  await new Promise(r => setTimeout(r, Math.random() * 500 + 100));
  return cars.find(c => c.id == id);
};
