exports.up = (pgm) => {
    pgm.createTable('task_attachments', {
        id: { type: 'serial', primaryKey: true },
        task_id: { type: 'integer', notNull: true, references: 'tasks(id)', onDelete: 'CASCADE' },
        filename: { type: 'varchar', notNull: true },
        original_name: { type: 'varchar', notNull: true },
        mimetype: { type: 'varchar', notNull: true },
        size: { type: 'integer', notNull: true },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('task_attachments');
};