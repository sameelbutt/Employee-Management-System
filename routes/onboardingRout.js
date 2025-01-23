const express = require("express");
const onboardingRouter = express.Router();
const onboardingController = require("../controllers/Onboarding");

onboardingRouter.post("/create", onboardingController.createOnboarding);
onboardingRouter.get(
  "/:employeeId",
  onboardingController.getOnboardingByEmployee
);
onboardingRouter.put("/:employeeId", onboardingController.updateOnboarding);
onboardingRouter.delete("/:employeeId", onboardingController.deleteOnboarding);
module.exports = onboardingRouter;
