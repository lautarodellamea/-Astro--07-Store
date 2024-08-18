import { column, defineDb, defineTable } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    password: column.text(),
    createdAt: column.date({ default: new Date() }),

    // Relacion
    role: column.text({ references: () => Role.columns.id }) // admin, user, super-user
  }
})

const Product = defineTable({
  columns: {
    description: column.text(),
    gender: column.text(),
    id: column.text({ primaryKey: true }),
    price: column.number(),
    sizes: column.text(),
    slug: column.text({ unique: true }),
    stock: column.number(),
    tags: column.text(),
    title: column.text(),
    type: column.text(),
    // images: column.text(),
    // createdAt: column.date({ default: new Date() }),

    // relacion - un usuario tiene muchos productos
    user: column.text({ references: () => User.columns.id })
  }
})

const ProductImage = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    productId: column.text({ references: () => Product.columns.id }),
    image: column.text() //url o nombre de la imagen
  }
})


const Role = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text()
  }
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    User,
    Role,
    Product,
    ProductImage
  }
});
