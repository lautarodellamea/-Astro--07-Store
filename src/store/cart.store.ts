// https://docs.astro.build/es/recipes/sharing-state-islands/

import { atom } from 'nanostores'

export const itemsInCart = atom(0)