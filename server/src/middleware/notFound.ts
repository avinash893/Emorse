import type { Request, Response, NextFunction } from "express";

import { fail } from "../envolope";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json(fail(`Not Found ${req.method} ${req.url}`));
}
