import * as Router from "koa-router";
import * as Koa from "koa";
import { SqlService } from "../service/sql.service";
import {SqlAllService} from "../service/sqlAll.service";
const router: Router = new Router();


router.post("/sql/all", (ctx: Koa.Context) => {
    const files = ctx.request.body.files;
    ctx.res.setHeader('Content-disposition', 'attachment; filename=' + `all.sql`);
    ctx.res.setHeader('Content-Type', 'application/sql');
    ctx.body = new SqlAllService(files).generatorSqlAll();

});


export const sqlAllRouter = router;