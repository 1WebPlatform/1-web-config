import * as Router from "koa-router";
import * as Koa from "koa";
import { ManyToManySerivce } from "../service/manyToMany.serivce";
const router: Router = new Router();

router.post("/many_to_many/generator", (ctx: Koa.Context) => {
    const name_table = ctx.request.body.name_table;
    const name_schema = ctx.request.body.name_schema;
    const name_column = ctx.request.body.name_column;
    const errors_404 = ctx.request.body.errors_404;

    const manyToManySerivce = new ManyToManySerivce(
        name_table,
        name_schema,
        name_column,
        errors_404
    );
    ctx.res.setHeader('Content-disposition', 'attachment; filename=' + `${name_table}.sql`);
    ctx.res.setHeader('Content-Type', 'application/sql');
    ctx.body = manyToManySerivce.generatorSql();
});


export const manyToManyRouter = router;