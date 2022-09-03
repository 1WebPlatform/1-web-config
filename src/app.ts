import * as Koa from 'koa';
import * as HttpStatus from 'http-status-codes';
import {fileRouter} from "./controllers/file.controllers";
import { HandbookService } from './service/handbook.service';
import { handbookRouter } from './controllers/handbook.controllers';

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

// Application error logging.
app.on('error', console.error);

export {app};