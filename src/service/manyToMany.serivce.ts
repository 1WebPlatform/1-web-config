export class ManyToManySerivce {
    private readonly name_table: string;
    private readonly name_schema: string;
    private readonly name_column: string[]; // 2 значения 
    private readonly errors_404: string[]; // 3  значения
    private readonly sql_get: string;
    private readonly returt_get: string;
    private readonly column_get_id: string;
    private sql: string = "";

    constructor(
        name_table: string,
        name_schema: string,
        name_column: string[],
        errors_404: string[],
        sql_get: string,
        returt_get: string,
        column_get_id: string
    ){
        this.name_table = name_table;
        this.name_schema = name_schema;
        this.name_column = name_column;
        this.errors_404 = errors_404;
        this.sql_get = sql_get
        this.returt_get = returt_get;
        this.column_get_id = column_get_id;
    }

    public generatorSql() {
        this.generatorCreateTable();
        this.generatorSave();
        this.generatorGet();
        this.generatorGetId();
        this.generatorFunctionCheckId();
        this.generatorStartFunction();
        return this.sql;
    }

    private generatorCreateTable() {
        this.sql += `
/** Create table */        
CREATE TABLE ${this.name_schema}.${this.name_table} (
    id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
    id_${this.name_column[0]} int4 NOT NULL,
    id_${this.name_column[1]} int4 NOT NULL,
    CONSTRAINT ${this.name_table}_pk PRIMARY KEY (id),
    CONSTRAINT ${this.name_table}_fk FOREIGN KEY (id_${this.name_column[0]}) REFERENCES ${this.name_schema}.${this.name_column[0]}(id),
    CONSTRAINT ${this.name_table}_fk_1 FOREIGN KEY (id_${this.name_column[1]}) REFERENCES ${this.name_schema}.${this.name_column[1]}(id)
);
/** Create table */`;
    }
    private generatorSave(){
        this.sql +=`
/** Fucntion SAVE  */
CREATE OR REPLACE FUNCTION ${this.name_schema}.${this.name_table}_save(
    _id_${this.name_column[0]} int,
    _id_${this.name_column[1]} int,
    out id_ int,
    out error tec.error
)
LANGUAGE plpgsql
AS $function$

declare
    check_${this.name_column[0]} boolean;
    check_${this.name_column[1]} boolean;
    ids int[];
    BEGIN   
        check_${this.name_column[0]} := (select * from tec.${this.name_column[0]}_check_id(_id_${this.name_column[0]}));
        check_${this.name_column[1]} := (select * from tec.${this.name_column[1]}_check_id(_id_${this.name_column[1]}));
        if check_${this.name_column[0]} <> true and check_${this.name_column[1]} <> true then
            select * into error  from tec.error_get_id(${this.errors_404[0]});
        elseif check_${this.name_column[0]} <> true then 
            select * into error  from tec.error_get_id(${this.errors_404[1]});
        elseif check_${this.name_column[1]} <> true then 
            select * into error  from tec.error_get_id(${this.errors_404[2]});
        else 
            INSERT INTO  ${this.name_schema}.${this.name_table}
            (id_${this.name_column[0]},id_${this.name_column[1]}) 
            VALUES (_id_${this.name_column[0]},  _id_${this.name_column[1]}) 
            RETURNING id INTO id_;
        end if;
    end;
$function$;
/** Fucntion SAVE  */
`;
    }

    private generatorGet(){
        this.sql +=`

/** Fucntion GET  */
CREATE OR REPLACE FUNCTION ${this.name_schema}.${this.name_table}_get(
    _limit int DEFAULT NULL::integer,
    _offset int DEFAULT NULL::integer,
    _where varchar DEFAULT NULL::integer,
    _order_by varchar DEFAULT NULL::integer
)
RETURNS ${this.returt_get}
LANGUAGE plpgsql
AS $function$
    BEGIN   
    return query EXECUTE (
        select * from tec.table_get(
           '${this.sql_get}',
            _limit, _offset, _order_by, _where
            )
        );
    end;
$function$;
        `
    }
    private generatorGetId(){
        this.sql +=`
CREATE OR REPLACE FUNCTION ${this.name_schema}.${this.name_table}_get_id(
    _id int
)
RETURNS ${this.returt_get}
LANGUAGE plpgsql
AS $function$
    BEGIN   
        return query ${this.sql_get} where ${this.column_get_id}.id = _id;
    end;
$function$;
/** Fucntion GET  */
        `
    }
    private generatorFunctionCheckId(){
        this.sql += `
/** Fucntion CHECK  */
CREATE OR REPLACE FUNCTION ${this.name_schema}.${this.name_table}_check_id(_id int)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
    BEGIN
        return EXISTS (select * from ${this.name_schema}.${this.name_table} where "id" = _id);
    END;
$function$;
/** Fucntion CHECK  */
`;
    }
    private generatorStartFunction(){
        this.sql += `
-- select * from ${this.name_schema}.${this.name_table}_save(1,1);
-- select * from ${this.name_schema}.${this.name_table}_check_id(1);
-- select * from ${this.name_schema}.${this.name_table}_get();
-- select * from ${this.name_schema}.${this.name_table}_get_id(1);
`;
    }
}


