import * as Router from "koa-router";
import * as Koa from "koa";
import { SqlService } from "../service/sql.service";
import { CssService } from "../service/css.service";
const router: Router = new Router();


router.post("/css/convert_css_to_json", (ctx: Koa.Context) => {
    const css = ctx.request.body.css;
    const cssService = new CssService();
    ctx.body = cssService.convertCssToJson(css);

});


export const cssRouter = router;
