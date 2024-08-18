import { db, Product, ProductImage, Role, User, } from 'astro:db';
import { v4 as UUID } from 'uuid'
import bcrypt from 'bcryptjs'
import { seedProducts } from './seed-data';


// https://astro.build/db/seed
export default async function seed() {

  const roles = [
    { id: 'admin', name: 'Administrador' },
    { id: 'user', name: 'Usuario' },
  ]

  const johnDoe = {
    // recordar que cada vez que se ejecute el seed, este id cambiara (aviso para cuando manipulemos cookies y autenticaciones)
    // id: UUID(),
    // usaremos un id fijo para no renegar en el desarrollo
    id: 'ABC-123-JOHN',
    name: 'John Doe',
    email: 'john.doe@google.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin'
  }
  const JaneDoe = {
    // id: UUID(),
    id: 'ABC-123-JANE',
    name: 'Jane Doe',
    email: 'jane.doe@google.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user'
  }

  await db.insert(Role).values(roles)
  await db.insert(User).values([johnDoe, JaneDoe])



  // https://docs.astro.build/en/guides/astro-db/#batch-transactions
  // las Batch Transactions permiten ejecutar multiples queries en una sola transacción, queries por bloques y si una sale mal se hace un ROLLBACK
  const queries: any = []

  seedProducts.forEach(p => {

    const product = {
      id: UUID(),
      description: p.description,
      images: p.images,
      stock: p.stock,
      price: p.price,
      sizes: p.sizes.join(','),
      slug: p.slug,
      tags: p.tags.join(','),
      title: p.title,
      type: p.type,
      gender: p.gender,

      user: johnDoe.id

    }

    queries.push(db.insert(Product).values(product))

    p.images.forEach(img => {
      const image = {
        id: UUID(),
        image: img,
        productId: product.id
      }

      queries.push(db.insert(ProductImage).values(image))
    })


  })


  await db.batch(queries)


  console.log('🌱 Seed executed')
}
