import { ImageUpload } from '@/utils/image-upload';
import { defineAction, z } from 'astro:actions';
import { db, eq, Product, ProductImage } from 'astro:db';
import { getSession } from 'auth-astro/server';

import { v4 as UUID } from 'uuid';

// podemos separar de a miles de esta forma en js
const MAX_FILE_SIZE = 5_000_000 //5 MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]


export const createUpdateProduct = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().optional(),
    description: z.string(),
    gender: z.string(),
    price: z.number(),
    sizes: z.string(),
    slug: z.string(),
    stock: z.number(),
    tags: z.string(),
    title: z.string(),
    type: z.string(),

    // si solo quisieramos evaluar un solo archivo, sacamos el z array y solo ponemos lo de adentro de este
    imageFiles: z.array(
      // debe ser una instancia de archivo
      z
        .instanceof(File)
        // el refine refinamos la condicion
        // podemos usar un solo refine con todas las condiciones o de manera granular como aca
        .refine((file) => file.size <= MAX_FILE_SIZE, 'Max image size is 5MB')
        .refine((file) => {
          // console.log(file)

          if (file.size === 0) return true

          return ACCEPTED_IMAGE_TYPES.includes(file.type)
        }, `Only supported image files are valid, ${ACCEPTED_IMAGE_TYPES.join(', ')}`)
        .optional())
  }),
  handler: async (form, { request }) => {

    const session = await getSession(request)
    const user = session?.user

    // aca podriamos verificar roles, aplicar un middleware antes de entrar a la pantalla, etc

    if (!user) {
      throw new Error('Unauthorized')
    }


    const { id = UUID(), imageFiles, ...rest } = form
    rest.slug = rest.slug.toLowerCase().replaceAll(' ', '-').trim()

    const product = {
      id: id,
      user: user.id!,
      ...rest
    }

    // console.log(product)

    const queries: any = []



    // Crear
    // Update
    if (!form.id) {
      queries.push(
        db.insert(Product).values(product)
      )

    } else {
      queries.push(
        db.update(Product).set(product).where(eq(Product.id, id))
      )
    }

    // Imagenes
    let secureUrls: string[] = []

    if (form.imageFiles && form.imageFiles.length > 0 && form.imageFiles[0].size > 0) {
      const urls = await Promise.all(
        // creo muchas promesas de carga de archivo que empiezan a subir data y hasta que todas se resuelven de manera exitosa tendre mi nuevo arreglo de urls, luego insertaremos las urls en la base de datos 
        form.imageFiles.map(file => ImageUpload.upload(file))
      )

      secureUrls.push(...urls)
    }

    secureUrls.forEach(imageUrl => {
      const imageObj = {
        id: UUID(),
        productId: product.id,
        image: imageUrl
      }

      // todas las insersiones caen en este arreglo y suceden el el batch,
      // de esta forma subimos todas las imagenes en paralelo en un mismo proceso
      queries.push(db.insert(ProductImage).values(imageObj))
    })

    // console.log(imageFiles)
    // imageFiles?.forEach(async imageFile => {
    //   if (imageFile.size <= 0) return
    //   const url = await ImageUpload.upload(imageFile)
    // })


    await db.batch(queries)

    return product;
  }
});