import type { Request, Response, NextFunction } from "express";

export function asyncHandler<T>(
  fun: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fun(req, res, next).catch(next);
  };
}
