import { ColumnType } from "../type/columnType";
import { SqlIfsGenerator } from "../type/sqlIfsGenerator";
import { SqlIndexType } from "../type/sqlIndexType";

export class SqlService {
    private sql: string = "";
    private readonly schema_name: string;
    private readonly name_table: string;
    private readonly error_delete_id: number;
    private readonly columnt: ColumnType[];
    private readonly sqlIfsGenerator: SqlIfsGenerator;
    private readonly error_check_id: number;
    private readonly index: SqlIndexType[];

    constructor(schema_name: string, name_table: string, columnt: ColumnType[], sqlIfsGenerator: SqlIfsGenerator, error_delete_id: number, error_check_id: number, index:SqlIndexType[]) {
        this.schema_name = schema_name;
        this.name_table = name_table;
        this.columnt = columnt;
        this.sqlIfsGenerator = sqlIfsGenerator;
        this.error_delete_id = error_delete_id;
        this.error_check_id = error_check_id;
        this.index = index;
    }

    public generatorSql() {
        this.tableCreate();
        this.indexCreate();
        this.getTable();
        this.getTableId();
        this.getCheckId();
        /** под вопросом нужно ли? */
        this.getCheckFK();
        /** под вопросом нужно ли? */
        this.indexCheck();

        this.save();
        this.delete();
        this.update();

        return this.sql;
    }

    private indexCreate(){
        this.index.map((e:SqlIndexType)=>{
            let text = null;
            if (e.type == "UNIQUE INDEX") {
                text = "idx";
            }
            this.sql += `CREATE ${e.type} ${this.name_table}_${e.name}_${text} ON ${this.schema_name}.${this.name_table} USING btree (${e.name}); \n`;
        })
    }

    private indexCheck(){
        this.index.map((e:SqlIndexType)=>{
            if (e.save_check) {
                this.sql += `\n`;
                this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_check_${e.name}(\n`;
                this.sql += `   _${e.name} ${e.type_var}\n`;
                this.sql += `)\n`;
                this.sql += `RETURNS boolean \n`;
                this.sql += `LANGUAGE plpgsql\n`;
                this.sql += `AS $function$\n`;
                this.sql += `   BEGIN\n`;
                this.sql += `      return EXISTS (select * from ${this.schema_name}.${this.name_table} where "${e.name}" = _${e.name});\n`;
                this.sql += `   END;\n`;
                this.sql += `$function$;\n`;
            }
            if (e.update_check) {
                this.sql += `\n`;
                this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_check_update_${e.name}(\n`;
                this.sql += `   _id int,\n`;
                this.sql += `   _${e.name} ${e.type_var}\n`;
                this.sql += `)\n`;
                this.sql += `RETURNS boolean \n`;
                this.sql += `LANGUAGE plpgsql\n`;
                this.sql += `AS $function$\n`;
                this.sql += `   BEGIN\n`;
                this.sql += `      return EXISTS (select * from ${this.schema_name}.${this.name_table} where "id" != _id and "${e.name}" = _${e.name});\n`;
                this.sql += `   END;\n`;
                this.sql += `$function$;\n`;
            }
        });
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
                this.sql += `"${elem.name}" ${elem.type}`;
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
        this.sql += `);\n`;
    }

    private getTable() {
        if (!this.sqlIfsGenerator.getTable) {
            return;
        }
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_get(\n`;
        this.sql += `   _limit integer DEFAULT NULL::integer,\n`;
        this.sql += `   _offset integer DEFAULT NULL::integer,\n`;
        this.sql += `   _where text DEFAULT NULL::text,\n`;
        this.sql += `   _order_by text DEFAULT NULL::text\n`;
        this.sql += `)\n`;
        this.sql += `RETURNS SETOF ${this.schema_name}.${this.name_table}\n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        this.sql += `       return query EXECUTE (select * from  tec.table_get('select * from ${this.schema_name}.${this.name_table}', _limit, _offset, _order_by, _where));\n`;
        this.sql += `   END;\n`;
        this.sql += `$function$;\n`;
    }
    private getTableId() {
        if (!this.sqlIfsGenerator.getTableId) {
            return;
        }
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_get_id(\n`;
        this.sql += `   _id int\n`;
        this.sql += `)\n`;
        this.sql += `RETURNS SETOF ${this.schema_name}.${this.name_table}\n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        this.sql += `       return query select * from ${this.schema_name}.${this.name_table} where id = _id;  \n`;
        this.sql += `   END;\n`;
        this.sql += `$function$;\n`;
    }
    private getCheckId() {
        if (!this.sqlIfsGenerator.getCheckId) {
            return;
        }
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_check_id(\n`;
        this.sql += `   _id int\n`;
        this.sql += `)\n`;
        this.sql += `RETURNS boolean \n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        this.sql += `      return EXISTS (select * from ${this.schema_name}.${this.name_table} where "id" = _id);\n`;
        this.sql += `   END;\n`;
        this.sql += `$function$;\n`;
    }

    private save(){
        if (!this.sqlIfsGenerator.save) {
                    return;
        }
        let params = "";
        let insert = "";
        let values = "";
        for (const elem of this.columnt) {
            if (elem.flag_save) {
                params += `   _${elem.name} ${elem.type},\n`
                insert += `"${elem.name}",`;
                values += `_${elem.name},`;
            }
        }
        insert = insert.substring(0, insert.length - 1);
        values = values.substring(0, values.length - 1);
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_save(\n`;
        this.sql += params;
        this.sql += `   out id_ int, \n`;
        this.sql += `   out error_ json \n)\n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        for (const elem of this.columnt) {
            if (elem.fk) {
                this.sql += `       if (select * from ${elem.fk_name}_check_id(_${elem.name})) <> true then \n`
                this.sql += `           select * into error_ from tec.error_get_id(${elem.fk_error_id});\n`;
                this.sql += `           return;\n`;
                this.sql += `       end if;\n`;
            }   
        }

        for (const elem of this.index) {
            if (elem.save_check) {
                this.sql += `       if (select * from ${this.schema_name}.${this.name_table}_check_${elem.name}(_${elem.name})) <> true then \n`
                this.sql += `           select * into error_ from tec.error_get_id(${elem.id_error});\n`;
                this.sql += `           return;\n`; 
                this.sql += `       end if;\n`;
            }   
        }

        this.sql += `       INSERT INTO ${this.schema_name}.${this.name_table}\n`;
        this.sql += `           (${insert})\n`;
        this.sql += `           VALUES  (${values})\n`;
        this.sql += `           RETURNING id INTO id_; \n`;
        this.sql += `   END;\n`;
        this.sql += `$function$;\n`;
    }



    private update(){
        if (!this.sqlIfsGenerator.update) {
                    return;
        }
        let params = "";
        let insert = "";
        for (const elem of this.columnt) {
            if (elem.flag_save) {
                params += `   _${elem.name} ${elem.type},\n`
                insert += `        "${elem.name}" = _${elem.name},\n`;
            }
        }
        insert = insert.substring(0, insert.length - 2);
        console.log(insert);
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_update(\n`;
        this.sql += `   _id int, \n`;
        this.sql += params;
        this.sql += `   out id_ int, \n`;
        this.sql += `   out error_ json\n)\n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        this.sql += `      if (select * from ${this.schema_name}.${this.name_table}_check_id(_id)) then \n`;
        this.sql += `           select * into error_ from tec.error_get_id(${this.error_check_id});\n`;
        this.sql += `           return;\n`;
        this.sql += `      end if;\n`;
        for (const elem of this.columnt) {
            if (elem.fk) {
                this.sql += `     if (select * from ${elem.fk_name}_check_id(_${elem.name})) <> true then \n`
                this.sql += `         select * into error_ from tec.error_get_id(${elem.fk_error_id});\n`;
                this.sql += `         return;\n`;
                this.sql += `     end if;\n`;
            }   
        }
        for (const elem of this.index) {
            if (elem.save_check) {
                this.sql += `       if (select * from ${this.schema_name}.${this.name_table}_check_update_${elem.name}(_id, _${elem.name})) <> true then \n`
                this.sql += `           select * into error_ from tec.error_get_id(${elem.id_error});\n`;
                this.sql += `           return;\n`; 
                this.sql += `       end if;\n`;
            }   
        }
        this.sql += `       UPDATE  ${this.schema_name}.${this.name_table} SET\n`;
        this.sql += `${insert}\n`;
        this.sql += `       RETURNING id INTO id_; \n`;
        this.sql += `   END;\n`;
        this.sql += `$function$;\n`;
    }


    private getCheckFK() {
        if (!this.sqlIfsGenerator.getCheckFK) {
            return;
        }
        for (const elem of this.columnt) {
            if (elem.fk) {
                this.sql += `\n`;
                this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_check_${elem.fk_column}(\n`;
                this.sql += `   _id int\n`;
                this.sql += `)\n`;
                this.sql += `RETURNS boolean \n`;
                this.sql += `LANGUAGE plpgsql\n`;
                this.sql += `AS $function$\n`;
                this.sql += `   BEGIN\n`;
                this.sql += `      return EXISTS (select * from ${elem.fk_name} where "${elem.name}" = _id);\n`;
                this.sql += `   END;\n`;
                this.sql += `$function$;\n`;
            }
        }

    }

    private delete(){
        if (!this.sqlIfsGenerator.delete) {
            return;
        }
        this.sql += `\n`;
        this.sql += `CREATE OR REPLACE FUNCTION ${this.schema_name}.${this.name_table}_delete(\n`;
        this.sql += `   _id int,\n`;
        this.sql += `   out id_ int, \n`;
        this.sql += `   out error_ json \n`;
        this.sql += `)\n`;
        this.sql += `LANGUAGE plpgsql\n`;
        this.sql += `AS $function$\n`;
        this.sql += `   BEGIN\n`;
        this.sql += `      if (select * from ${this.schema_name}.${this.name_table}_check_id(_id)) then \n`;
        this.sql += `           DELETE FROM ${this.schema_name}.${this.name_table}  where id = _id RETURNING id INTO id_;\n`;
        this.sql += `      else\n`;
        this.sql += `      select * into error_ from tec.error_get_id(${this.error_delete_id});\n`;
        this.sql += `      end if;\n`;
        this.sql += `   END;\n`;
        this.sql += `$function$;\n`;
    }
}