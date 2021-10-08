import UserService from "../../services/user";
import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { LIMIT_MAX_PAGINATION } from "../../../utils";
import BadgesModel from "../../../models/badges";
import NFTService from "../../../api/services/nft";
import { ParsedUrlQuery } from "querystring";

export class Controller {
  async all(req: Request, res: Response): Promise<void> {
    const {page, limit} = req.query
    const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/?page=${page}&limit=${limit}`)
    const response = await data.json()
    res.json(response)
  }

  async newUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { body } = req;
      const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/create`,{
        method: 'POST',
        body: JSON.stringify(body)
      });
      const response = await data.json()
      res.json(response)
    } catch (err) {
      next(err);
    }
  }

  async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const { incViews, walletIdViewer } = req.query
      const { ip } = req
      const user = await UserService.findUser(id, incViews === "true", walletIdViewer as string, ip, true);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUsersBywalletId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const walletIds = typeof req.query.walletIds === "string" ? [req.query.walletIds] : req.query.walletIds as string[]
      const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/getUsers?walletIds=${walletIds.join("&walletIds=")}`)
      const users = await data.json()
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async reviewRequested(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/reviewRequested/${req.params.id}`,{
        method: 'PATCH'
      });
      const user = await data.json()
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getAccountBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const balance = await UserService.getAccountBalance(req.params.id);
      res.json(balance);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/${req.params.walletId}`,{
        method: 'POST',
        body: JSON.stringify(req.body)
      });
      const user = await data.json();
      res.json(user);
    } catch (err) {
      next(err)
    }
  }

  async likeNft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletId, nftId, serieId } = req.query
      const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/like?walletId=${walletId}&nftId=${nftId}&serieId=${serieId}`, {
        method: 'POST',
      })
      const user = await data.json()
      res.json(user);
    } catch (err) {
      next(err)
    }
  }

  async unlikeNft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletId, nftId, serieId } = req.query
      const data = await fetch(`${process.env.TERNOA_API_URL}/api/users/unlike?walletId=${walletId}&nftId=${nftId}&serieId=${serieId}`, {
        method: 'POST',
      })
      const user = await data.json()
      res.json(user);
    } catch (err) {
      next(err)
    }
  }

  async getLikedNfts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const {page, limit} = req.query
      if (!id) throw new Error("wallet id not given")
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const nfts = await UserService.getLikedNfts(id as string, page as string, limit as string);
      res.json(nfts);
    } catch (err) {
      next(err)
    }
  }

  
  async verifyTwitter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      if (!req.params.id) throw new Error("User wallet id not given")
      res.redirect(`${process.env.TERNOA_API_URL}/api/users/verifyTwitter/${req.params.id}`)
    }catch(err){
      next(err)
    }
  }

  async addBadgeToUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const walletId = req.body.walletId;
      const emoteId: string = req.body.emoteId;
      const user = await BadgesModel.findOne({walletId});
      const result = await NFTService.getNFT(emoteId);
      if(user){
        if(user.emotes.length >= 1){
          if(user.emotes.map(e => e.nftId).includes(emoteId)){
            res.send({error: "You already have this badge"})
          }
        }
        if(user.emotes.length >= 3){
          if(result.owner === walletId){
            const newEmotes = {emotes:[user.emotes[0], user.emotes[1], {nftId: emoteId}]};
            await user.updateOne(newEmotes);
            res.json({success: "User updated", data: newEmotes});
          }else{
            res.json({error: "You don't have this NFT"});
          }
        }else{
          if(result.owner === walletId){
            const newEmotes = {emotes:[...user.emotes, {nftId: emoteId}]};
            await user.updateOne(newEmotes);
            res.json({success: "User updated", data: newEmotes});
          }else{
            res.json({error: "You don't have this NFT"});
          }
        }
      }else{
        if(result.owner === walletId){
          const newUser = new BadgesModel({walletId, emotes:[{nftId: emoteId}]});
          await newUser.save();
          res.json({success: "User updated", data: newUser.emotes});
        }else{
          res.json({error: "You don't have this NFT"});
        }
      }
    }catch(err){
      next(err);
    }
  }

  async removeBadgeFromUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const walletId: string = req.body.walletId;
      const emoteId: string = req.body.emoteId;
      const user = await BadgesModel.findOne({walletId});
      if(user){
        const result = await NFTService.getNFT(emoteId);
        if(result.owner === walletId){
          user.emotes.forEach((b, i) => {
            if(b.nftId === emoteId){
              user.emotes.splice(i, 1);
              return
            }
          })
          await user.updateOne({emotes: user.emotes})
          res.json({success: "Badge deleted", data: user.emotes})
        }else{
          res.json({error: "You don't have this NFT"})
        }
      }else{
        res.json({error: "You don't have badges"})
      }
    }catch(err){
      next(err);
    }
  }

  async getUserBadgesWithWalletId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const walletId = req.query.walletId.toString();
      const badges = await BadgesModel.findOne({walletId})
      if(badges){
        res.json({data: badges.emotes})
      }else{
        res.json({error: "Incorrect wallet id"})
      }
    }catch(err){
      next(err);
    }
  }
}
export default new Controller();
