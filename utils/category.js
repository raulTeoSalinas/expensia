import { Asset } from "expo-asset";

const Category = [
    {
        id: 1,
        nameEN: "Food",
        nameES: "Alimentos",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-food.png'))
    },
    {
        id: 2,
        nameEN: "Transport",
        nameES: "Transporte",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-transport.png'))
    },
    {
        id: 3,
        nameEN: "Home",
        nameES: "Hogar",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-home.png'))
    },
    {
        id: 4,
        nameEN: "Entertainment",
        nameES: "Entretenimiento",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-entertainment.png'))
    },
    {
        id: 5,
        nameEN: "Groceries",
        nameES: "Supermercado",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-groceries.png'))
    },
    {
        id: 6,
        nameEN: "Bills",
        nameES: "Recibos",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-bills.png'))
    },
    {
        id: 7,
        nameEN: "Clothes",
        nameES: "Ropa",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-clothes.png'))
    },
    {
        id: 8,
        nameEN: "Debt",
        nameES: "Deudas",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-debt.png'))
    },
    {
        id: 9,
        nameEN: "Health",
        nameES: "Salud",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-health.png'))
    },
    {
        id: 10,
        nameEN: "Pet",
        nameES: "Mascota",
        type: "e",
        src: Asset.fromModule(require('../assets/images/icon-e-pet.png'))
    },
    {
        id: 11,
        nameEN: "Salary",
        nameES: "Salario",
        type: "i",
        src: Asset.fromModule(require('../assets/images/icon-i-salary.png'))
    },
    {
        id: 12,
        nameEN: "Business",
        nameES: "Negocio",
        type: "i",
        src: Asset.fromModule(require('../assets/images/icon-i-business.png'))
    },
    {
        id: 13,
        nameEN: "Freelance",
        nameES: "Freelance",
        type: "i",
        src: Asset.fromModule(require('../assets/images/icon-i-freelance.png'))
    },
    {
        id: 14,
        nameEN: "Dividends",
        nameES: "Dividendos",
        type: "i",
        src: Asset.fromModule(require('../assets/images/icon-i-dividends.png'))
    },
    {
        id: 15,
        nameEN: "Interest",
        nameES: "Intereses",
        type: "i",
        src: Asset.fromModule(require('../assets/images/icon-i-interest.png'))
    },
    {
        id: 16,
        nameEN: "Business",
        nameES: "Negocio",
        type: "l",
        src: Asset.fromModule(require('../assets/images/icon-l-business.png'))
    },
    {
        id: 17,
        nameEN: "Person",
        nameES: "Persona",
        type: "l",
        src: Asset.fromModule(require('../assets/images/icon-l-person.png'))
    },
    {
        id: 18,
        nameEN: "Other",
        nameES: "Otro",
        type: "o",
        src: ""
    }
];

export default Category;

