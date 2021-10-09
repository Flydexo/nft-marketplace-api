import NFTService from "../../services/nft";
import { NextFunction, Request, Response } from "express";
import { LIMIT_MAX_PAGINATION } from "../../../utils";
import NftCommentsModel from "../../../models/nftComments";
import UserViewModel from "src/models/userView";

export class Controller {
  async getAllNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {marketplaceId, page, limit, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      res.json(await NFTService.getAllNFTs(marketplaceId as string, page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async getNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.params.id) next(new Error("id parameter is needed"));
    const {incViews, viewerWalletId } = req.query
    const { ip } = req
    try {
      const nft = await NFTService.getNFT(req.params.id, incViews === "true", viewerWalletId as string, ip);
      res.json(nft);
    } catch (err) {
      next(err);
    }
  }

  async getUsersNFTS(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next(new Error("id param is needed"));
    try {
      const {marketplaceId, page, limit, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      res.json(await NFTService.getNFTsFromOwner(marketplaceId as string, req.params.id, page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async getCreatorsNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next(new Error("id param is needed"));
    try {
      const { page, limit, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      res.json(await NFTService.getNFTsFromCreator(req.params.id, page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async getStatNFTsUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next(new Error("id param is needed"));
    const { marketplaceId } = req.query;
    try {
      res.json(await NFTService.getStatNFTsUser(marketplaceId as string, req.params.id));
    } catch (err) {
      next(err);
    }
  }


  async getCategoriesNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { marketplaceId, page, limit, codes, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const categoriesCodes = codes === undefined ? null : (typeof codes==='string' ? [codes] : codes)
      res.json(await NFTService.getNFTsFromCategories(marketplaceId as string, categoriesCodes as string[] | null, page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async createNFT(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const nft = await NFTService.createNFT(JSON.parse(req.body));
      res.json(nft);
    } catch (err) {
      next(err);
    }
  }

  async getNFTsBySerie(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try {
      const { marketplaceId, page, limit } = req.query;
      if (!req.params.id) next(new Error("id parameter is needed"));
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const nft = await NFTService.getNFT(req.params.id);
      if (!nft.serieId || nft.serieId === '0' || !nft.owner) throw new Error("NFT is missing data")
      const nfts = (await NFTService.getNFTsForSerie(nft, page as string, limit as string))
      res.json(nfts);
    } catch (err) {
      next(err);
    }
  }

  async addComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const id = req.params.id;
      const walletId = req.body.walletId;
      const note = req.body.note;
      const text = req.body.text ? req.body.text : "";
      if(note < 0 || note > 5 || !isNaN(note)){
        if(text.length <= 240){
          let nft = await NftCommentsModel.findOne({nftId: id});
          if(nft){
            nft.updateOne()
          }else{
            nft = new NftCommentsModel({
              nftId: id,
              comments: [{
                author: walletId,
                note,
                text
              }]
            })
            await nft.save()
            res.send({success: "Comment added", data: nft.toObject()})
          }
        }else{
          res.send({error: "Your text is limited to 240 characters"})
        }
      }else{
        res.send({error: "Note format incorrect, -1<note<6 and note is integer"})
      }
    }catch(err){
      next(err);
    }
  }
}

export default new Controller();
