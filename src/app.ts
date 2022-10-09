import * as Koa from 'koa';
import * as HttpStatus from 'http-status-codes';
import {fileRouter} from "./controllers/file.controllers";
import { handbookRouter } from './controllers/handbook.controllers';
import { manyToManyRouter } from './controllers/manyToMany.contollers';
import { sqlRouter } from './controllers/sql.controllers';
import {sqlAllRouter} from "./controllers/sqlAll.controllers";
import { cssRouter } from './controllers/css.controllers';
const dotenv = require('dotenv');
dotenv.config();

const multipartBodyParser = require('koa-body');

const app: Koa = new Koa();
// Generic error handling middleware.
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
        await next();
    } catch (error) {
        ctx.status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        error.status = ctx.status;
        ctx.body = {error};
        ctx.app.emit('error', error, ctx);
    }
});

app.use(multipartBodyParser({
    includeUnparsed: true,
    multipart: true,
}));


app.use(fileRouter.routes());
app.use(handbookRouter.routes());
app.use(manyToManyRouter.routes());
app.use(sqlAllRouter.routes());
app.use(sqlRouter.routes());
app.use(cssRouter.routes());
// Application error logging.
app.on('error', console.error);

export {app};