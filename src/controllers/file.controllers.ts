import * as Router from "koa-router";
import * as Koa from "koa";
import {FileService} from "../service/file.service"
import {FileValidate} from "../validate/file.validate";

const router: Router = new Router();

/**
 * query: name , catalog?
 */
router.get("/file", (ctx: Koa.Context) => {
    const fileValidate = new FileValidate(ctx);
    fileValidate.validateNameFile();
    
    const name: string = ctx?.query?.name as string;
    const catalog: string = ctx?.query?.catalog as string;
    ctx.res.setHeader('Content-disposition', 'attachment; filename=' + name);

    const fileService = new FileService(name, catalog);
    ctx.body = fileService.getFile();
})

/**
 * query: name 
 */
router.delete("/file", (ctx: Koa.Context) => {
    const fileValidate = new FileValidate(ctx);
    fileValidate.validateNameFile();
    
    const name: string = ctx?.query?.name as string;
    const catalog: string = ctx?.query?.catalog as string;

    const fileService = new FileService(name, catalog);
    ctx.body = fileService.deleteFile();
})

/**
 * query: name , catalog?
 * body: data
 */

router.post("/file", (ctx: Koa.Context) => {
    const fileValidate = new FileValidate(ctx);
    fileValidate.validateNameFileAndBodyData();

    const data: string = ctx.request.body.data;

    const name: string = ctx?.query?.name as string;
    const catalog: string = ctx?.query?.catalog as string;
    const checkJson: boolean = !!ctx?.query?.json as boolean;
    const fileService = new FileService(name, catalog);
    fileService.setFile(data, checkJson);
    ctx.body = 'Файл успешно сохранен';
})

export const fileRouter = router;