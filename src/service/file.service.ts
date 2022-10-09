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
    deleteFile() {
        if (this.checkFile()) {
            this.fs.unlinkSync(this.pathFile);
        }
    }
    checkFile() {
        return this.fs.existsSync(this.pathFile);
    }

    getFile() {
        if (this.checkFile()) {
            return this.fs.readFileSync(this.pathFile);
        }
    }

    setFile(
        data: string,
        checkJson: boolean,
        catalog = this.catalog,
        pathFile = this.pathFile
    ) {
        !this.fs.existsSync(`${catalog}`) && this.fs.mkdirSync(`${catalog}`, { recursive: true })

        this.fs.open(pathFile, 'w', (err: Error) => {
            if (err) throw err;
        });
        if (checkJson) {
            this.fs.writeFileSync(pathFile, JSON.stringify(data));
            return;
        }
        console.log(data);
        this.fs.writeFileSync(pathFile, data);
    }

    /**Возможно нужно проверка что каталог существует */
    getCatalog() {
        return this.fs.readdirSync(this.catalog);
    }

    getImages() {
        const files = this.getCatalog();
        let html = `<style>img{width: 30px;height: 30px;border:1px solid; padding:5px}
        .flex{display:flex;flex-wrap: wrap;}
        .container-image{display: flex;margin-right:30px;justify-content: center;align-items: center;flex-direction: column; margin-bottom:10px}
        </style>`;
        html += "<div class='flex'>"
        files.forEach((file: string) => {
            const url = `${this.catalog}/${file}`;
            html += `<div class='container-image'>
                <img src='${url}'/>
                <p>${file}</p>
            </div>`;
        });
        html += "</div>"
        this.setFile(
            html,
            false,
            process.env.CATALOG_CONFIG_SAVE,
            `${process.env.CATALOG_CONFIG_SAVE}/${this.file}`
        );
        return html;
    }
}