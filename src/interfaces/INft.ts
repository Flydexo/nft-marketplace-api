import { ICategory } from "./ICategory";
import mongoose from "mongoose";

export interface IMongoNft {
  _id: string;
  chainId: string;
  categories: ICategory[] | mongoose.Types.ObjectId[];
}

export interface INftDto {
  chainId: string;
  categories?: string[];
  from?: string
}

export interface IMongoNftComment {
  _id: string;
  author: string,
  note: number,
  text?: string
}
