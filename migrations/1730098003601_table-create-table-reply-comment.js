/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('reply_comment', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  /*
    memberikan constraint foreign key pada reply_comment.comment_id
    terhadap comments.id
    */
  pgm.addConstraint('reply_comment', 'fk_reply_comment.comment_id_comments.id', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
  });
  /*
        memberikan constraint foreign key pada reply_comment.owner
        terhadap users.id
        */
  pgm.addConstraint('reply_comment', 'fk_reply_comment.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('reply_comment', 'fk_reply_comment.comment_id_comments.id');
  pgm.dropConstraint('reply_comment', 'fk_reply_comment.owner_users.id');
  pgm.dropTable('reply_comment');
};
