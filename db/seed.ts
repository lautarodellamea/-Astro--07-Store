import { db, Role, User, } from 'astro:db';
import { v4 as UUID } from 'uuid'
import bcrypt from 'bcryptjs'


// https://astro.build/db/seed
export default async function seed() {

  const roles = [
    { id: 'admin', name: 'Administrador' },
    { id: 'user', name: 'Usuario' },
  ]

  const johnDoe = {
    // recordar que cada vez que se ejecute el seed, este id cambiara (aviso para cuando manipulemos cookies y autenticaciones)
    id: UUID(),
    name: 'John Doe',
    email: 'john.doe@google.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin'
  }
  const JaneDoe = {
    id: UUID(),
    name: 'Jane Doe',
    email: 'jane.doe@google.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user'
  }

  await db.insert(Role).values(roles)
  await db.insert(User).values([johnDoe, JaneDoe])




  console.log('🌱 Seed executed')
}
