
import { Router } from "express";
import { fetchAnalytics } from "../controllers/analytics.controller";
import { requireRole } from "../middlewares/requireRole.middleware";
import noteController from "../controllers/note.controller";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
import { userController } from "../controllers/user.controller";


const analyticsRouter = Router();

analyticsRouter.get("/api/admin/matrix", autoRefreshAccessToken, authenticate, requireRole(["admin"]), fetchAnalytics);
analyticsRouter.get("/api/admin/notes", autoRefreshAccessToken, authenticate, requireRole(["admin"]), noteController.getAllNotesController);
analyticsRouter.get("/api/admin/users", autoRefreshAccessToken, authenticate, requireRole(["admin"]), userController.getAllUsers);



export default analyticsRouter;
