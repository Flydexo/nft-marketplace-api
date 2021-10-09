import { IMongoNftComment } from "../interfaces/INft";
import mongoose, {PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const NftComments = new mongoose.Schema({
  nftId: {
      required: true,
      type: String
  },
  comments: [{
      _id: mongoose.SchemaTypes.ObjectId,
      author: {
        required: true,
        type: String
      },
      note: {
          required: true,
          type: Number
      },
      text: {
          required: false,
          type: String
      }
  }]
});

NftComments.plugin(mongoosePaginate);

const NftCommentsModel = mongoose.model<IMongoNftComment & mongoose.Document>(
  "NftComments",
  NftComments,
  "nfts-comments"
) as PaginateModel<IMongoNftComment & mongoose.Document>;

export default NftCommentsModel;