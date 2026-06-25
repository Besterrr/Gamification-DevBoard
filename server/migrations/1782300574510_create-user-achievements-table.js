exports.up = (pgm) => {
    pgm.createTable('user_achievements', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'CASCADE'},
        achievement_id: { type: 'integer', notNull: true, references: 'achievements(id)', onDelete: 'CASCADE' },
        earned_at: { type: 'timestamp', default: pgm.func('current_timestamp')},
    });
    pgm.addConstraint('user_achievements', 'unique_user_achievement', 'UNIQUE (user_id, achievement_id)');
};

exports.down = (pgm) => {
    pgm.dropTable('user_achievements');
};