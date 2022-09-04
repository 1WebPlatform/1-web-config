export class ManyToManySerivce {
    private readonly name_table: string;
    private readonly name_schema: string;
    private readonly name_column: string[]; // 2 значения 
    private readonly errors_404: string[]; // 2  значения
    private sql: string = "";

    constructor(
        name_table: string,
        name_schema: string,
        name_column: string[],
        errors_404: string[]
    ){
        this.name_table = name_table;
        this.name_schema = name_schema;
        this.name_column = name_column;
        this.errors_404 = errors_404;
    }

    public generatorSql() {
        this.generatorCreateTable();
        this.generatorSave();
        return this.sql;
    }

    private generatorCreateTable() {
        this.sql += `
CREATE TABLE ${this.name_schema}.${this.name_table} (
    id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
    id_right int4 NOT NULL,
    id_roles int4 NOT NULL,
    CONSTRAINT ${this.name_table}_pk PRIMARY KEY (id),
    CONSTRAINT ${this.name_table}_fk FOREIGN KEY (id_${this.name_column[0]}) REFERENCES ${this.name_schema}.${this.name_column[0]}(id),
    CONSTRAINT ${this.name_table}_fk_1 FOREIGN KEY (id_${this.name_column[1]}) REFERENCES ${this.name_schema}.${this.name_column[1]}(id)
);`;
    }
    private generatorSave(){
        this.sql +=`
        CREATE OR REPLACE FUNCTION ${this.name_schema}.${this.name_table}_save(
            _id_${this.name_column[0]} int,
            _id_${this.name_column[1]} int,
            OUT id_ int,
            OUT error tec.error
        )
        LANGUAGE plpgsql
        AS $function$
            BEGIN
            INSERT INTO ${this.name_schema}.${this.name_table} 
                (id_${this.name_column[0]},id_${this.name_column[1]}) 
                VALUES (_id_${this.name_column[0]},  _id_${this.name_column[1]}) 
                RETURNING id INTO id_;		
            END;
        $function$;
`;
    }
}


