exports.up = (pgm) => {
    pgm.addColumn('tasks', {
        completed_at: { type: 'timestamp' }
    });
}
exports.down = (pgm) => {
    pgm.dropColumn('tasks', 'completed_at')
}


