export class SqlAllService {
    private readonly files: string[];
    private readonly fs = require('fs');
    private sql = "";
    constructor(files: string[]) {
        this.files = files;
    }
    public generatorSqlAll(){
        for (const file of this.files) {
            this.sql +=this.fs.readFileSync(`${process.env.CATALOG_SQL}\\${file}`);
            this.sql += "\n";
            console.log(`${process.env.CATALOG_SQL}\\${file}`);
        }
        return this.sql;
    }
}