export interface ColumnType {
    text?: string;
    type?: string;
    name?: string;
    fk?: boolean;
    fk_name?: string;
    fk_column?: string;
    flag_save?: boolean;
    fk_error_id?: number;
}