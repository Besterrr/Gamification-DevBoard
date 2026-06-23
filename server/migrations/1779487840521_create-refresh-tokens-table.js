exports.up = (pgm) => {
    pgm.createTable('refresh_tokens', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
        token: { type: 'text', notNull: true },
        expires_at: { type: 'timestamp', notNull: true },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('refresh_tokens');
};