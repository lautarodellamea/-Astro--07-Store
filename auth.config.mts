// import GitHub from '@auth/core/providers/github';
import { db, eq, User } from 'astro:db';
import { defineConfig } from 'auth-astro';
import Credentials from '@auth/core/providers/credentials';
import bcrypt from 'bcryptjs';
import type { AdapterUser } from '@auth/core/adapters';

export default defineConfig({
  providers: [
    // TODO
    // GitHub({
    //   clientId: import.meta.env.GITHUB_CLIENT_ID,
    //   clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    // }),


    Credentials({
      credentials: {
        // el label y type es por si quisieramos usar el formulario que nos da auth.js, pero nosotros usaremos nuestro propio sistema de login
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },

      authorize: async ({ email, password }) => {

        // usamos los "as string" para que no se queje TS ya que me marca unknown 
        const [user] = await db.select().from(User).where(eq(User.email, email as string))

        if (!user) {
          // recordar no dar mucha info al usuario
          throw new Error('User not found')
        }

        if (!bcrypt.compareSync(password as string, user.password)) {
          // recordar no dar mucha info al usuario
          throw new Error('Invalid password')
        }

        // le pongo el _ para que no choque con la variable password, la renombre
        const { password: _, ...rest } = user
        console.log(rest)

        return rest
      }


    })
  ],

  callbacks: {
    jwt: ({ token, user }) => {

      if (user) {
        token.user = user
      }


      return token
    },

    session: ({ session, token }) => {

      session.user = token.user as AdapterUser
      // console.log({ session })
      // console.log({ SessionUser: session.user })

      return session
    }


  }



});