import { db } from '../db/db';

export type RouterContext = ReturnType<typeof makeRouterContext>;

export function makeRouterContext() {
  return {
    db,
  };
}
