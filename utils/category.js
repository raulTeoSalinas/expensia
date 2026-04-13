// IDs match the backend seed (prisma/seed.js in mobile-portfolio)
const Category = [
  { id: 'food',          nameEN: 'Food',          nameES: 'Alimentos',       type: 'e', icon: 'food-fork-drink' },
  { id: 'transport',     nameEN: 'Transport',     nameES: 'Transporte',      type: 'e', icon: 'bus' },
  { id: 'home',          nameEN: 'Home',          nameES: 'Hogar',           type: 'e', icon: 'home' },
  { id: 'entertainment', nameEN: 'Entertainment', nameES: 'Entretenimiento', type: 'e', icon: 'television-play' },
  { id: 'groceries',     nameEN: 'Groceries',     nameES: 'Supermercado',    type: 'e', icon: 'cart' },
  { id: 'bills',         nameEN: 'Bills',         nameES: 'Recibos',         type: 'e', icon: 'file-document' },
  { id: 'clothes',       nameEN: 'Clothes',       nameES: 'Ropa',            type: 'e', icon: 'tshirt-crew' },
  { id: 'debt',          nameEN: 'Debt',          nameES: 'Deudas',          type: 'e', icon: 'bank-transfer' },
  { id: 'health',        nameEN: 'Health',        nameES: 'Salud',           type: 'e', icon: 'heart-pulse' },
  { id: 'pet',           nameEN: 'Pet',           nameES: 'Mascota',         type: 'e', icon: 'paw' },
  { id: 'salary',        nameEN: 'Salary',        nameES: 'Salario',         type: 'i', icon: 'briefcase' },
  { id: 'business',      nameEN: 'Business',      nameES: 'Negocio',         type: 'i', icon: 'store' },
  { id: 'freelance',     nameEN: 'Freelance',     nameES: 'Freelance',       type: 'i', icon: 'laptop' },
  { id: 'dividends',     nameEN: 'Dividends',     nameES: 'Dividendos',      type: 'i', icon: 'chart-line' },
  { id: 'interest',      nameEN: 'Interest',      nameES: 'Intereses',       type: 'i', icon: 'percent' },
]

export default Category
