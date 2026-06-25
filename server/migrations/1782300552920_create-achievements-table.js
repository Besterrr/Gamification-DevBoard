exports.up = (pgm) => {
    pgm.createTable('achievements', {
        id: { type: 'serial', primaryKey: true },
        key: { type: 'varchar', notNull: true, unique: true },
        title: { type: 'varchar', notNull: true },
        description: { type: 'text'},
        icon: { type: 'varchar'},
        xp_bonus: { type: 'integer', default: 0 }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('achievements');
};