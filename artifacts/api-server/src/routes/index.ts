import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import offersRouter from "./offers";
import usersRouter from "./users";
import messagesRouter from "./messages";
import feedRouter from "./feed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);
router.use(offersRouter);
router.use(usersRouter);
router.use(messagesRouter);
router.use(feedRouter);

export default router;
