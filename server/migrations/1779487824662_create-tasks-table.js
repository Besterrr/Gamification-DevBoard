exports.up = (pgm) => {
    pgm.createTable('tasks', {
        id: { type: 'serial', primaryKey: true },
        project_id: { type: 'integer', notNull: true, references: 'projects(id)', onDelete: 'CASCADE' },
        title: { type: 'varchar(255)', notNull: true },
        description: { type: 'text' },
        status: { type: 'varchar(50)', default: "'todo'" },
        priority: { type: 'varchar(50)', default: "'medium'" },
        deadline: { type: 'timestamp' },
        xp_reward: { type: 'integer', default: 10 },
        created_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('tasks');
};