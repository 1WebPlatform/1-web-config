import * as Router from "koa-router";
import * as Koa from "koa";
import { SqlService } from "../service/sql.service";
const router: Router = new Router();


router.post("/sql/generator", (ctx: Koa.Context) => {
    const name_table = ctx.request.body.name_table;
    const schema_name = ctx.request.body.schema_name;
    const column = ctx.request.body.column;
    const sqlIfsGenerator = ctx.request.body.sqlIfsGenerator;

    const sqlService = new SqlService(
        schema_name,
        name_table,
        column,
        sqlIfsGenerator
    );

    ctx.res.setHeader('Content-disposition', 'attachment; filename=' + `${name_table}.sql`);
    ctx.res.setHeader('Content-Type', 'application/sql');
    ctx.body = sqlService.generatorSql();

});


export const sqlRouter = router;