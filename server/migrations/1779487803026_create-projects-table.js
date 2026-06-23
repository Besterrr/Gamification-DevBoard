exports.up = (pgm) => {
    pgm.createTable('projects', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
        title: { type: 'varchar(255)', notNull: true },
        description: { type: 'text' },
        status: { type: 'varchar(50)', default: "'active'" },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('projects');
};