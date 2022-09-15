import { ColumnType } from "../type/columnType";
import { SqlIfsGenerator } from "../type/sqlIfsGenerator";

export class SqlService {
    private sql: string = "";
    private readonly schema_name: string;
    private readonly name_table: string;
    private readonly columnt: ColumnType[];
    private readonly sqlIfsGenerator: SqlIfsGenerator;

    constructor(schema_name: string, name_table: string, columnt: ColumnType[], sqlIfsGenerator: SqlIfsGenerator) {
        this.schema_name = schema_name;
        this.name_table = name_table;
        this.columnt = columnt;
        this.sqlIfsGenerator = sqlIfsGenerator;
    }

    public generatorSql() {
        this.tableCreate();
        this.getTable();
        return this.sql;
    }

    private tableCreate() {
        if (!this.sqlIfsGenerator.table) {
            return;
        }
        this.sql += `CREATE TABLE ${this.schema_name}."${this.name_table}"(\n`;
        let index = -1;
        /**
         * Собрать даннные
         */
        for (const elem of this.columnt) {
            index++;
            this.sql += `   `;
            /** если это колонка */
            if (elem.name && elem.type) {
                this.sql += `${elem.name} ${elem.type}`;
                if (elem.text) {
                    this.sql += " ";
                }
            } 
            if (elem.text) {
                this.sql += `${elem.text}`
            }
            /** проверка что не последняя колонка */
            if (this.columnt.length - 1 !== index) {
                this.sql += ",";
            }
            this.sql += "\n";
        }
        this.sql += `)`;
    }

    private getTable(){
        if (!this.sqlIfsGenerator.getTable) {
            return;
        }
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_get(\n`;
        this.sql += `   _limit int DEFAULT NULL::integer,\n`;
        this.sql += `   _offset int DEFAULT NULL::integer,\n`;
        this.sql += `   _where int DEFAULT NULL::integer,\n`;
        this.sql += `   _order_by int DEFAULT NULL::integer\n`;
        this.sql += `)\n`;
        this.sql += `RETURNS SETOF ${this.schema_name}.${this.name_table}\n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        this.sql += `   return query EXECUTE (select * from  tec.table_get('select * from ${this.schema_name}.${this.name_table}', _limit, _offset, _order_by, _where));\n`;
        this.sql += `   END\n`;
        this.sql += `$function$\n`;
    }
}