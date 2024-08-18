import type { CartItem } from '@/interfaces';
import { defineAction, z } from 'astro:actions';
import { db, eq, inArray, Product, ProductImage } from 'astro:db';

export const loadProductsFromCart = defineAction({
  accept: 'json',
  // input: z.string(),
  handler: async (_, { cookies }) => {

    const cart = JSON.parse(cookies.get('cart')?.value ?? '[]') as CartItem[];

    // si el carrito esta vacio no necesito conectarme a base de datos
    if (cart.length === 0) return []



    // load products
    const productIds = cart.map(item => item.productId)

    const dbProducts = await db
      .select()
      .from(Product)
      .innerJoin(ProductImage, eq(Product.id, ProductImage.productId)) // para seleccionar la imagen
      .where(inArray(Product.id, productIds))

    console.log(dbProducts)

    // simplifiquemos el objeto que devuelve
    return cart.map(item => {
      const dbProduct = dbProducts.find(p => p.Product.id === item.productId)

      // esto se ejecutaria cuando la persona quiere llevar un producto que no esta en la base de datos
      if (!dbProduct) {
        throw new Error(`Product with id ${item.productId} not found`)
      }


      const { title, price, slug } = dbProduct.Product
      const image = dbProduct.ProductImage.image


      return {
        productId: item.productId,
        title: title,
        size: item.size,
        quantity: item.quantity,
        image: image.startsWith('http')
          ? image
          : `${import.meta.env.PUBLIC_URL}/images/products/${image}`,
        price: price,
        slug: slug
      }
    })
  }
});