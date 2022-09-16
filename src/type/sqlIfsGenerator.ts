export interface SqlIfsGenerator{
    table: boolean;
    getTable: boolean;
    getTableId: boolean;
    getCheckId: boolean;
    getCheckFK: boolean;
    save: boolean;
    delete: boolean;
    update: boolean;
}