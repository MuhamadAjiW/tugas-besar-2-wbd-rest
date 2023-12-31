import { Request, Response } from "express";
import { SOAPController } from "./soap-controller";
import { SOAPRequest } from "../types/SOAPRequest";
import { z } from "zod";
import { BadRequestError } from "../types/errors/BadRequestError";
import { SubscriptionUpdateRequest } from "../types/SubscriptionUpdateRequest";
import { StatusCodes } from "http-status-codes";
import { MonolithController } from "./monolith-controller";
import { MOLI_URL, SOAP_SERVICE, SOAP_URL } from "../config/server-config";
import { AuthRequest } from "../types/AuthRequest";
import { UnauthorizedError } from "../types/errors/UnauthorizedError";

export class SubscriberController {
    soapController: SOAPController;
    monolithController: MonolithController;

    constructor() {
        this.soapController = new SOAPController(SOAP_URL, SOAP_SERVICE);
        this.monolithController = new MonolithController(MOLI_URL);
    }

    updateSubscriber() {
        return async (req: Request, res: Response) => {
            const author_id = z.number().int().safeParse(parseInt(req.params.identifier, 10));
            if (!author_id.success){
                throw new BadRequestError(author_id.error.message);
            }

            const { authToken } = req as AuthRequest;
            if (authToken){
                if (authToken.author_id != author_id.data){
                    throw new UnauthorizedError("Cannot update other author's subscribers");
                }    
            }

            const user_id = z.number().int().safeParse(parseInt(req.params.user_identifier, 10));
            if(!user_id.success){
                throw new BadRequestError(user_id.error.message);
            }

            let updateRequest: SubscriptionUpdateRequest = req.body;
            try {
                updateRequest = req.body;
            } catch (error) {
                throw new BadRequestError("Bad request parameters");
            }
            
            const data = {
                handler: 'SubscriptionService',
                method: 'subscribeUpdate',
                args: new Map([
                    ['user_id', req.params.user_identifier],
                    ['author_id', req.params.identifier],
                    ['status', updateRequest.status]
                ])
            }

            const response = await this.soapController.sendRequest("/api/subscribe", data);
            res.status(StatusCodes.OK).json(response);
            return;
        }
    }

    getSubsRequest() {
        return async (req: Request, res: Response) => {
            const author_id = z.number().int().safeParse(parseInt(req.params.identifier, 10));
            if (!author_id.success){
                throw new BadRequestError(author_id.error.message);
            }

            const user_id = z.number().int().safeParse(parseInt(req.params.user_identifier, 10));
            if(!user_id.success){
                throw new BadRequestError(user_id.error.message);
            }
            
            const data = {
                handler: 'SubscriptionService',
                method: 'getSubscriptionsOne',
                args: new Map([
                    ['user_id', req.params.user_identifier],
                    ['author_id', req.params.identifier],
                ])
            }

            const response = await this.soapController.sendRequest("/api/subscribe", data);
            res.status(StatusCodes.OK).json(response);
            return;
        }
    }

    getSubscribersByAuthor() {
        return async (req: Request, res: Response) => {
            const id = z.number().int().safeParse(parseInt(req.params.identifier, 10));
            if (!id.success){
                throw new BadRequestError(id.error.message);
            }
            
            const data: SOAPRequest = {
                handler: 'SubscriptionService',
                method: 'getSubscriptionsByAuthor',
                args: new Map([
                    ['author_id', req.params.identifier],
                    ['filter', 'ACCEPT'],
                ])
            }

            const response = await this.soapController.sendRequest("/api/subscribe", data);
            
            if(Array.isArray(response['data'])){
                for (const item of response['data']) {
                    let userData = await this.monolithController.getRequest(`/api/user/get?uid=${item["user_id"]}`);
                    item["userDetails"] = userData.data;
                }
            } else{
                if(response["data"]){
                    let userData = await this.monolithController.getRequest(`/api/user/get?uid=${response["data"]["user_id"]}`);
                    response["data"]["user_details"] = userData.data;
                    response["data"] = [response["data"]];
                }
            }

            res.status(StatusCodes.OK).json(response);
            return;
        }
    }

    getSubsRequestByAuthor() {
        return async (req: Request, res: Response) => {
            const id = z.number().int().safeParse(parseInt(req.params.identifier, 10));
            if (!id.success){
                throw new BadRequestError(id.error.message);
            }
            
            const data: SOAPRequest = {
                handler: 'SubscriptionService',
                method: 'getSubscriptionsByAuthor',
                args: new Map([
                    ['author_id', req.params.identifier],
                    ['filter', 'PENDING'],
                ])
            }
            
            const response = await this.soapController.sendRequest("/api/subscribe", data);
            
            if(Array.isArray(response['data'])){
                for (const item of response['data']) {
                    let userData = await this.monolithController.getRequest(`/api/user/get?uid=${item["user_id"]}`);
                    item["userDetails"] = userData.data;
                }
            } else{
                if(response["data"]){
                    let userData = await this.monolithController.getRequest(`/api/user/get?uid=${response["data"]["user_id"]}`);
                    response["data"]["user_details"] = userData.data;
                    response["data"] = [response["data"]];
                }
            }
            
            res.status(StatusCodes.OK).json(response);
            return;
        }
    }

    deleteAuthorSubscriber() {
        return async (req: Request, res: Response) => {
            const author_id = z.number().int().safeParse(parseInt(req.params.identifier, 10));
            if (!author_id.success){
                throw new BadRequestError(author_id.error.message);
            }

            const { authToken } = req as AuthRequest;
            if (authToken){
                if (authToken.author_id != author_id.data){
                    throw new UnauthorizedError("Cannot delete other author's subscribers");
                }    
            }

            const user_id = z.number().int().safeParse(parseInt(req.params.user_identifier, 10));
            if(!user_id.success){
                throw new BadRequestError(user_id.error.message);
            }

            const data: SOAPRequest = {
                handler: "SubscriptionService",
                method: "deleteSubscriptionsOne",
                args: new Map([
                    ['user_id', req.params.user_identifier],
                    ['author_id', req.params.identifier]
                ])
            }

            const response = await this.soapController.sendRequest("/api/subscribe", data);
            res.status(StatusCodes.OK).json(response);
            return;
        }
    }


}