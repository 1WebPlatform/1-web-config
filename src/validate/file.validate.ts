import * as Koa from "koa";
import * as StatusCodes from "http-status-codes";


export class FileValidate {
    private readonly ctx: Koa.Context
    private readonly TEXT_ERRORS_DATA = "Вы не указали данные для записи в файл";
    private readonly TEXT_ERRORS_NAME = "Вы не указали имя файла";
    constructor(ctx: Koa.Context) {
        this.ctx = ctx;
    }
    checkBodyData(){
        return this.ctx.request?.body?.data === undefined
    }
    
    checkNameFile(){
        return this.ctx?.query?.name === undefined;
    }
    
    validateNameFile(){
        if (this.checkNameFile()){
            this.ctx.throw(StatusCodes.BAD_REQUEST, this.TEXT_ERRORS_NAME);
        }
    }

    validateNameFileAndBodyData(){
        const errors = [];
        /** проверка body data file */
        if(this.checkBodyData()){
            errors.push(this.TEXT_ERRORS_DATA);
        }
       /** проверка params name file */
        if (this.checkNameFile()){
            errors.push(this.TEXT_ERRORS_NAME);
        }
        /** Проверка что есть ошибки */
        if(errors.length){
            this.ctx.throw(StatusCodes.BAD_REQUEST, {message:errors});
        }
    }
}