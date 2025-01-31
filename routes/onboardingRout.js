const express = require("express");
const onboardingRouter = express.Router();
const onboardingController = require("../controllers/Onboarding");
const authMiddleware = require("../middlewares/authMiddleware");
const roleAuthorization = require("../middlewares/roleMiddleware");
onboardingRouter.post("/create",authMiddleware,
  roleAuthorization( "Lead"), onboardingController.createOnboarding);
onboardingRouter.get(
  "/:employeeId",
  onboardingController.getOnboardingByEmployee
);
onboardingRouter.put("/:employeeId", onboardingController.updateOnboarding);
onboardingRouter.delete("/:employeeId", onboardingController.deleteOnboarding);
module.exports = onboardingRouter;
