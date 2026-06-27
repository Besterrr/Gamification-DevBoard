exports.up = (pgm) => {
    pgm.addColumn('users', {
        avatar_url: { type: 'varchar'}
    });
}
exports.down = (pgm) => {
    pgm.dropColumn('users', 'avatar_url')
}


