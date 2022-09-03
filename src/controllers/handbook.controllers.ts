import * as Router from "koa-router";
import * as Koa from "koa";
import {HandbookService } from "../service/handbook.service"
const router: Router = new Router();

router.post("/handbook/generator", (ctx: Koa.Context) => {
    const name = ctx.request.body.name;
    const id_errors_404 = ctx.request.body.id_errors_404;
    const id_errors_name = ctx.request.body.id_errors_name;
    const comment_column = ctx.request.body.comment_column;

    const handbookService = new HandbookService(
        name,
        id_errors_404,
        id_errors_name,
        comment_column
    );
    ctx.res.setHeader('Content-disposition', 'attachment; filename=' + `${name}.sql`);
    ctx.res.setHeader('Content-Type', 'application/sql');
    ctx.body = handbookService.generatorSql();
});


export const handbookRouter = router;