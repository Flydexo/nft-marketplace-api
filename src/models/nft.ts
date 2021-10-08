import { IMongoNft } from "../interfaces/INft";
import mongoose, { PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const Nft = new mongoose.Schema({
  chainId: {
    type: String,
    required: [true, "Please enter an id"],
    unique: true,
    index: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  from: {
    type: String,
  },
  comments: [{author: {
    type: String,
    required: true
  }, content: String, rate: {
    required: true,
    type: Number
  }}],
  rate: {
    required: true,
    type: Number
  }
});

Nft.plugin(mongoosePaginate);

const NftModel = mongoose.model<IMongoNft & mongoose.Document>(
  "Nft",
  Nft,
  "nfts"
) as PaginateModel<IMongoNft & mongoose.Document>;

export default NftModel;