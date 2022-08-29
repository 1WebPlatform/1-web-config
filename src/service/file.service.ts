export class FileService {
    private readonly file: string;
    private readonly fs = require('fs');
    private readonly pathFile: string;
    private readonly catalog: string;

    constructor(file: string, catalog?: string) {
        this.file = file;
        this.catalog = catalog ? `${process.env.CATALOG_CONFIG}\\${catalog}` : `${process.env.CATALOG_CONFIG}}`;
        this.pathFile = `${this.catalog}\\${this.file}`;
    }
    deleteFile(){
        if (this.checkFile()) {
            this.fs.unlinkSync(this.pathFile);
        }
    }
    checkFile(){
        return this.fs.existsSync(this.pathFile);
    }

    getFile() {
        if (this.checkFile()) {
            return this.fs.readFileSync(this.pathFile);
        }
    }

    setFile(data: string) {
        !this.fs.existsSync(`${this.catalog}`) && this.fs.mkdirSync(`${this.catalog}`, { recursive: true })

        this.fs.open(this.pathFile, 'w', (err: Error) => {
            if (err) throw err;
        });
        this.fs.writeFileSync(this.pathFile, data);
    }
}