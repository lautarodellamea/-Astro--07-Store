import { defineAction, z } from 'astro:actions';
import { db, eq, Product, ProductImage } from 'astro:db';

// esto lo usaremos para siempre regresar un producto cunado el slug sea "new" caso en el que crearemos un nuevo producto
// le pongo valores para ahorrarme escribirlos en desarrollo
const newProduct = {
  id: "",
  description: "Nueva descripción",
  stock: 10,
  price: 100,
  sizes: "XS,S,M",
  slug: "nuevo-producto",
  tags: "shirt,men,nuevo",
  title: "Nuevo producto",
  type: "shirts",
  gender: "men",
}


export const getProductBySlug = defineAction({
  accept: 'json',
  input: z.string(),
  handler: async (slug) => {


    if (slug === "new") {
      return {
        product: newProduct,
        images: []
      }
    }



    const [product] = await db.select().from(Product).where(eq(Product.slug, slug))

    if (!product) {
      throw new Error(`Product with slug ${slug} not found`)
    }

    const images = await db.select().from(ProductImage).where(eq(ProductImage.productId, product.id))


    return {
      product: product,
      images: images,
      // images: images.map(i => i.image)
    };
  }
});