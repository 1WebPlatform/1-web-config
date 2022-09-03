export class HandbookService {
    private readonly name: string;
    private readonly id_errors_404: number;
    private readonly id_errors_name: number;
    private readonly comment_column: string[];
    private sql: string = "";

    constructor(name: string, id_errors_404: number, id_errors_name: number, comment_column: string[],) {
        this.name = name;
        this.id_errors_404 = id_errors_404;
        this.id_errors_name = id_errors_name;
        this.comment_column = comment_column;
    }

    generatorSql(){
        this.generatorCteateTable();
        this.generatorIndex();
        this.generatorCommentColumn();
        this.generatorFunction();
        this.generatorStartFuction();
        return this.sql;
    }

    
    private generatorCteateTable(){
        this.sql+= 
        `/** Create table */
        CREATE TABLE handbook."${this.name}" (
            id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
            "name" varchar NOT NULL,
            description text NULL,
            active boolean
        );
        /** Create table */
        `
    }

    private generatorIndex(){
        this.sql += `CREATE UNIQUE INDEX ${this.name}_name_idx ON handbook.${this.name} USING btree (name);`
    }

    private generatorCommentColumn(){
        this.sql +=
        `
        /** Column comments*/
        COMMENT ON COLUMN handbook.${this.name}.id IS 'Первичный ключ';
        COMMENT ON COLUMN handbook.${this.name}."name" IS '${this.comment_column[0]}';
        COMMENT ON COLUMN handbook.${this.name}.description IS '${this.comment_column[1]}';
        COMMENT ON COLUMN handbook.${this.name}.active IS '${this.comment_column[2]}';
        /** Column comments*/
        `
    }
    private generatorFunction(){
        this.generatorFunctionGet();
        this.generatorFunctionGetId();
        this.generatorFunctionCheckId();
        this.generatorFunctionCheckName();
        this.generatorFunctionSave();
        this.generatorFunctionUpdate();
        this.generatorFunctionDelete();
    }

    private generatorFunctionGet(){
        this.sql += 
        `
        /** Fucntion GET  */
        CREATE OR REPLACE FUNCTION handbook.${this.name}_get()
        RETURNS SETOF "handbook"."${this.name}"
        LANGUAGE plpgsql
        AS $function$
            BEGIN
                return query select * from handbook.${this.name};
            END;
        $function$;
        `
    }

    private generatorFunctionGetId(){
        this.sql += 
        `
        CREATE OR REPLACE FUNCTION handbook.${this.name}_get_id(_id int)
        RETURNS SETOF "handbook"."${this.name}"
        LANGUAGE plpgsql
        AS $function$
            BEGIN
                return query select * from handbook.${this.name} where id = _id;
            END;
        $function$;
        /** Fucntion GET  */
        `
    }

    private generatorFunctionCheckId(){
        this.sql += `
        /** Fucntion CHECK  */
        CREATE OR REPLACE FUNCTION handbook.${this.name}_check_id(_id int)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $function$
            BEGIN
                return EXISTS (select * from handbook.${this.name} where "id" = _id);
            END;
        $function$;
        `;
    }

    private generatorFunctionCheckName(){
        this.sql += `
        CREATE OR REPLACE FUNCTION handbook.${this.name}_check_name(_name varchar)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $function$
            BEGIN
                return EXISTS (select * from handbook.${this.name} where "name" = _name);
            END;
        $function$;
        /** Fucntion CHECK  */
        `;
    }
    private generatorFunctionSave(){
        this.sql += `
        /** Fucntion SAVE  */
        CREATE OR REPLACE FUNCTION handbook.${this.name}_save(
            _name varchar,
            _description text DEFAULT NULL::character varying,
            _active boolean DEFAULT true,
            OUT id_ int,
            OUT error tec.error
        )
        LANGUAGE plpgsql
        AS $function$
            BEGIN
            IF (select * from handbook.${this.name}_check_name(_name)) <> true then
			INSERT INTO handbook.${this.name} 
				("name", description, active) 
				VALUES (_name, _description,_active) 
				RETURNING id INTO id_;
		ELSE 
			select * into error from tec.error_get_id(${this.id_errors_name});		
		END IF;	
            END;
        $function$;
        /** Fucntion SAVE  */
        `;
    }
    private generatorFunctionUpdate(){
        this.sql += `
        CREATE OR REPLACE FUNCTION handbook.${this.name}_update_id(
            _id int, 
            _name varchar,
            _description text DEFAULT NULL::character varying,
            _active boolean DEFAULT true,
            OUT error tec.error, 
            OUT id_ int
        )
        LANGUAGE plpgsql
    AS $function$
        BEGIN
            IF (select * from handbook.${this.name}_check_id(_id)) then
                IF (select * from handbook.${this.name}_check_name(_name)) <> true then
                    UPDATE handbook.${this.name} 
                    SET 
                        name = _name, 
                        description = _description, 
                        active = _active
                    where id = _id RETURNING id INTO id_;
                ELSE 
                    select * into error from tec.error_get_id(${this.id_errors_404});
                END IF;
            ELSE 
                select * into error from tec.error_get_id(${this.id_errors_name});
            END IF;
        END;
    $function$;
        `;
    }

    private generatorFunctionDelete(){
        this.sql += `
        CREATE OR REPLACE FUNCTION handbook.${this.name}_delete_id(_id int, OUT error tec.error, OUT id_ int)
        LANGUAGE plpgsql
    AS $function$
        BEGIN
            IF (select * from handbook.${this.name}_check_id(_id)) then
                DELETE FROM handbook.${this.name} where id = _id RETURNING id INTO id_;
            ELSE 
                select * into error from tec.error_get_id(2);
            END IF;
        END;
    $function$;
        `;
    }

    private generatorStartFuction(){
        this.sql += `
        /** Start Fucntion */
        select * from handbook.${this.name}_save(_name := 'test',_description := 'test', _active := false );
        select * from handbook.${this.name}_get();
        select * from handbook.${this.name}_get_id(_id := 1);
        select * from handbook.${this.name}_check_id(_id := 1);
        select * from handbook.${this.name}_check_name(_name := 'test');
        select * from handbook.${this.name}_delete_id(_id := 1);
        select * from handbook.${this.name}_update_id(_id := 1,_name := 'test',_description := 'test', _active := false ); 
        /** Start Fucntion */
        `
    }
}