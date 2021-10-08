import { IBadges } from "../interfaces/IBadges";
import mongoose, { PaginateModel } from "mongoose";

const Badges = new mongoose.Schema({
  walletId: {
      type: String,
      required: [true, "Missing walletId for badges"]
  },
  emotes: [{
      nftId: {
          type: String,
          required: true
      }
  }]
});

const BadgesModel = mongoose.model<IBadges & mongoose.Document>(
  "Badges",
  Badges,
  "nft-badges"
);

export default BadgesModel;
