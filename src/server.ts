import {app} from './app';

// Process.env will always be comprised of strings, so we typecast the port to a
// number.

export const PORT: number = +process.env.PORT || 8081;
console.log(`localhost:${PORT}`);
app.listen(PORT);