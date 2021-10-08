import express from "express";
import controller from "./controller";
export default express
  .Router()
  .patch("/reviewRequested/:id", controller.reviewRequested) // ternoa-api
  .get("/", controller.all) // ternoa-api
  .get("/verifyTwitter/:id", controller.verifyTwitter) // ternoa-api
  .get("/getUsers", controller.getUsersBywalletId) // ternoa-api
  .get("/getBadges", controller.getUserBadgesWithWalletId)
  .get("/:id", controller.getUser) // ternoa-api
  .get("/:id/caps", controller.getAccountBalance)
  .get("/:id/liked", controller.getLikedNfts)
  .post("/addBadgeToUser", controller.addBadgeToUser)
  .post("/create", controller.newUser) 
  .post("/like", controller.likeNft)
  .post("/removeBadgeFromUser", controller.removeBadgeFromUser)
  .post("/unlike", controller.unlikeNft) 
  .post("/:walletId", controller.updateUser);
