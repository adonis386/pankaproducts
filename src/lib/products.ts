import { Product } from "./types";

export const products: Product[] = [
  {
    id: "tamal-pollo-verde",
    name: "Tamales de Pollo en Salsa Verde",
    description:
      "Delicious tamales filled with shredded chicken in homemade green tomatillo and serrano chile sauce. Wrapped in corn husk.",
    price: 4.99,
    image: "/hero_1.jpg",
    category: "salados",
    ingredients: ["Corn masa", "Chicken", "Tomatillo", "Serrano chile", "Cilantro"],
    isPopular: true,
    stock: 50,
  },
  {
    id: "tamal-rajas-queso",
    name: "Tamales de Rajas con Queso",
    description:
      "Creamy tamales with roasted poblano pepper strips and melted Oaxaca cheese. An irresistible vegetarian classic.",
    price: 4.50,
    image: "/hero_2.jpg",
    category: "salados",
    ingredients: ["Corn masa", "Poblano pepper", "Oaxaca cheese", "Cream", "Epazote"],
    isPopular: true,
    stock: 40,
  },
  {
    id: "tamal-mole-rojo",
    name: "Tamales de Mole Rojo",
    description:
      "Traditional tamales with red mole made from over 20 ingredients and tender chicken. A generational recipe.",
    price: 5.50,
    image: "/hero_3.jpg",
    category: "salados",
    ingredients: ["Corn masa", "Chicken", "Ancho chile", "Mulato chile", "Chocolate", "Sesame"],
    isPopular: true,
    stock: 35,
  },
  {
    id: "tamal-elote",
    name: "Tamales de Elote",
    description:
      "Sweet and soft tamales made with fresh ground corn. Perfect as dessert or to pair with coffee.",
    price: 3.99,
    image: "/hero_1.jpg",
    category: "dulces",
    ingredients: ["Fresh corn", "Sugar", "Butter", "Cinnamon", "Condensed milk"],
    stock: 30,
  },
  {
    id: "tamal-dulce-piña",
    name: "Tamales de Piña",
    description:
      "Pink masa tamales with candied pineapple bits and raisins. Color and flavor in every bite.",
    price: 3.99,
    image: "/hero_2.jpg",
    category: "dulces",
    ingredients: ["Corn masa", "Candied pineapple", "Raisins", "Sugar", "Natural color"],
    stock: 25,
  },
  {
    id: "tamal-oaxaqueno",
    name: "Tamales Oaxaqueños",
    description:
      "Wrapped in banana leaf with Oaxacan black mole and chicken. A delicacy from southern Mexico.",
    price: 6.50,
    image: "/hero_3.jpg",
    category: "especiales",
    ingredients: ["Corn masa", "Banana leaf", "Black mole", "Chicken", "Chilhuacle"],
    isPopular: true,
    stock: 20,
  },
  {
    id: "tamal-chipotle-cerdo",
    name: "Tamales de Cerdo en Chipotle",
    description:
      "Tamales with shredded pork in a smoky chipotle sauce. Bold and comforting.",
    price: 5.50,
    image: "/hero_1.jpg",
    category: "salados",
    ingredients: ["Corn masa", "Pork", "Chipotle chile", "Tomato", "Onion"],
    stock: 30,
  },
  {
    id: "tamal-chocolate",
    name: "Tamales de Chocolate",
    description:
      "Sweet tamales with artisanal chocolate masa and a touch of cinnamon. Perfect for cacao lovers.",
    price: 4.50,
    image: "/hero_2.jpg",
    category: "dulces",
    ingredients: ["Corn masa", "Oaxacan chocolate", "Cinnamon", "Sugar", "Butter"],
    stock: 25,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}

export function getPopularProducts(): Product[] {
  return products.filter((p) => p.isPopular);
}
