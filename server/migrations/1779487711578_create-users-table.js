exports.up = (pgm) => {
    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        email: { type: 'varchar(255)', notNull: true, unique: true },
        password_hash: { type: 'varchar(255)', notNull: true },
        username: { type: 'varchar(100)', notNull: true },
        xp: { type: 'integer', default: 0 },
        level: { type: 'integer', default: 1 },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};