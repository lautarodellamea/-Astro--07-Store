import type { ProductWithImages } from '@/interfaces';
import { defineAction, z } from 'astro:actions';
import { count, db, eq, Product, ProductImage, sql } from 'astro:db';

export const getProductsByPage = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(12),
  }),
  handler: async ({ page, limit }) => {

    page = page <= 0 ? 1 : page;

    const [totalRecords] = await db.select({ count: count() }).from(Product) //total de productos
    const totalPages = Math.ceil(totalRecords.count / limit); //total de paginas

    // pagina donde ya no hay productos
    if (page > totalPages) {
      return {
        products: [],
        totalPages: totalPages
      }
    }


    // consulta a la base de datos (raw querie)
    const productQuery = sql`
    select a.*,
    ( select GROUP_CONCAT(image,',') from 
      ( select * from ${ProductImage} where productId = a.id limit 2 )
    ) as images
    from ${Product} a
    LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `


    const { rows } = await db.run(productQuery)
    // console.log({ rows })

    const products = rows.map(product => {
      return {
        ...product,
        images: product.images ? product.images : 'no-image.png'
      }
    }) as unknown as ProductWithImages[]

    // const products = await db
    //   .select() // tomo todos los registros
    //   .from(Product) // de la tabla products
    //   .innerJoin(ProductImage, eq(Product.id, ProductImage.productId))
    //   .limit(limit) // limita la cantidad de registros (de 12 en 12 ene ste caso)
    //   .offset((page - 1) * limit) // si estoy en la pagina 1, quiero de 0 hasta 12, y luego cuando este en la pagina 2 seria: 2-1=1 -> 1*12 = 12 (se salta los siguientes 12 registros)


    return {
      products: products,
      totalPages: totalPages
    };
  }
});