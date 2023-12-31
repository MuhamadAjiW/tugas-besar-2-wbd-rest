import { Request, Response } from "express";
import { BookPModel } from "../models/bookp-model";

export class BookPController {
    bookpModel: BookPModel;

    constructor() {
        this.bookpModel = new BookPModel();
    }

    createBookP() {
        return async (req: Request, res: Response) => {
            return await this.bookpModel.createBookP(req, res);
        }
    }

    getBooks() {
        return async (req: Request, res: Response) => {
            return await this.bookpModel.getBookPByAuthorID(req, res);
        }
    }
    
    getBookPByID() {
        return async (req: Request, res: Response) => {
            return await this.bookpModel.getBookPByID(req, res);
        }
    }

    getBookPByAuthor() {
        return async (req: Request, res: Response) => {
            return await this.bookpModel.getBookPByAuthorID(req, res);
        }
    }

    deleteOneBookP() {
        return async (req: Request, res: Response) => {
            return await this.bookpModel.deleteBookPByID(req, res);
        }
    }

    testErrorMw () {
        return async (req: Request, res: Response) => {
            throw Error();
        }
    }

    updateOneBook() {
        return async (req: Request, res: Response) => {
            return await this.bookpModel.editBookP(req, res);
        }
    }
}