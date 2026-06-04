import axios from "axios";
import FormData from "form-data";

const API_URL = "http://localhost:3000/api/owner/add-car";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.NmExNmE5MDAzYzEyNDYzNTI3OWQxMDcx.5jbnk5khOHCmR-TQzamjMpdEtnlMvA_EIekhLLdGduQ";

const cars = [
  {
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    category: "Sedan",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    pricePerDay: 3500,
    location: "Delhi",
    description:
      "Comfortable and fuel-efficient sedan perfect for city drives and long highway trips. Features automatic transmission, spacious cabin, and modern safety technology.",
    image:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200",
  },
  {
    brand: "Honda",
    model: "Civic",
    year: 2022,
    category: "Sedan",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    pricePerDay: 3200,
    location: "Mumbai",
    description:
      "Reliable sedan with sporty styling, excellent fuel economy, and a premium interior. Ideal for daily commutes and family travel.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
  },
  {
    brand: "BMW",
    model: "X5",
    year: 2024,
    category: "SUV",
    seating_capacity: 7,
    fuel_type: "Diesel",
    transmission: "Automatic",
    pricePerDay: 8500,
    location: "Bangalore",
    description:
      "Luxury SUV offering powerful performance, premium comfort, advanced technology, and spacious seating for up to seven passengers.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200",
  },
  {
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    category: "Luxury",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    pricePerDay: 9000,
    location: "Hyderabad",
    description:
      "Elegant luxury sedan featuring refined comfort, smooth driving dynamics, premium materials, and cutting-edge safety systems.",
    image:
      "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200",
  },
  {
    brand: "Audi",
    model: "A6",
    year: 2024,
    category: "Luxury",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    pricePerDay: 8700,
    location: "Pune",
    description:
      "Sophisticated executive sedan with advanced infotainment, premium interiors, exceptional comfort, and responsive performance.",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
  },
  {
    brand: "Hyundai",
    model: "Verna",
    year: 2023,
    category: "Sedan",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Manual",
    pricePerDay: 2500,
    location: "Lucknow",
    description:
      "Affordable and stylish sedan with excellent mileage, comfortable seating, and practical features for everyday driving.",
    image:
      "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=1200",
  },
  {
    brand: "Kia",
    model: "Seltos",
    year: 2024,
    category: "SUV",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    pricePerDay: 3000,
    location: "Chennai",
    description:
      "Popular compact SUV with modern styling, feature-rich cabin, strong road presence, and a comfortable driving experience.",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200",
  },
  {
    brand: "Mahindra",
    model: "Scorpio N",
    year: 2024,
    category: "SUV",
    seating_capacity: 7,
    fuel_type: "Diesel",
    transmission: "Manual",
    pricePerDay: 4200,
    location: "Jaipur",
    description:
      "Rugged SUV built for adventure with strong diesel performance, spacious seating, and excellent capability on all terrains.",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200",
  },
  {
    brand: "Tata",
    model: "Harrier",
    year: 2023,
    category: "SUV",
    seating_capacity: 5,
    fuel_type: "Diesel",
    transmission: "Automatic",
    pricePerDay: 3900,
    location: "Ahmedabad",
    description:
      "Premium SUV offering bold design, advanced safety features, comfortable interiors, and powerful diesel performance.",
    image:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200",
  },
  {
    brand: "Ford",
    model: "Mustang",
    year: 2024,
    category: "Sports",
    seating_capacity: 4,
    fuel_type: "Petrol",
    transmission: "Automatic",
    pricePerDay: 12000,
    location: "Goa",
    description:
      "Iconic sports car delivering thrilling performance, aggressive styling, powerful engine, and an unforgettable driving experience.",
    image:
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1200",
  },
];
async function addCar(car) {
  try {
    // Download image
    const imageResponse = await axios.get(car.image, {
      responseType: "arraybuffer",
    });

    const form = new FormData();

    form.append(
      "carData",
      JSON.stringify({
        brand: car.brand,
        model: car.model,
        year: car.year,
        category: car.category,
        seating_capacity: car.seating_capacity,
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        pricePerDay: car.pricePerDay,
        location: car.location,
        description: car.description,
      })
    );

    form.append("image", Buffer.from(imageResponse.data), {
  filename: `${car.brand}-${car.model}.jpg`,
  contentType: "image/jpeg",
});
    const { data } = await axios.post(API_URL, form, {
      headers: {
  ...form.getHeaders(),
  authorization: TOKEN,
},
      maxBodyLength: Infinity,
    });

    console.log(`✅ ${car.brand} ${car.model}`, data);
  } catch (err) {
    console.error(
      `❌ ${car.brand} ${car.model}`,
      err.response?.data || err.message
    );
  }
}

async function seedCars() {
  for (const car of cars) {
    await addCar(car);
  }

  console.log("🎉 All cars uploaded");
}

seedCars();