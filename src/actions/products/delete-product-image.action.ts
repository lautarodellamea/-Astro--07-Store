import { ImageUpload } from '@/utils/image-upload';
import { defineAction, z } from 'astro:actions';
import { db, eq, ProductImage } from 'astro:db';
import { getSession } from 'auth-astro/server';

export const deleteProductImage = defineAction({
  accept: 'json',
  input: z.string(),
  handler: async (imageId, { request }) => {

    // tomamos la sesion para que no nos borre algo cualquier usuario
    const session = await getSession(request)
    const user = session?.user

    // if (!user || user.role !== 'admin') {
    if (!user) {
      throw new Error('Unauthorized')
    }

    const [productImage] = await db.select().from(ProductImage).where(eq(ProductImage.id, imageId))

    if (!productImage) {
      throw new Error(`Product image with id ${imageId} not found`)
    }

    const deleted = await db.delete(ProductImage).where(eq(ProductImage.id, imageId))

    // preguntamos si incluye el http sino seria las imagenes de nuestra carpeta public
    if (productImage.image.includes('http')) {
      await ImageUpload.delete(productImage.image)
    }




    return { ok: true };
  }
});