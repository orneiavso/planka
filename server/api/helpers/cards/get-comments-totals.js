const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
  },

  async fn(inputs) {
    const ids = _.isString(inputs.idOrIds) ? [inputs.idOrIds] : inputs.idOrIds;

    if (ids.length === 0) {
      return {};
    }

    const queryResult = await sails.sendNativeQuery(
      'SELECT card_id, COUNT(*)::integer AS total FROM action WHERE type = $1 AND card_id = ANY($2::bigint[]) GROUP BY card_id',
      [Action.Types.COMMENT_CARD, ids],
    );

    return queryResult.rows.reduce(
      (result, row) => ({
        ...result,
        [row.card_id]: row.total,
      }),
      {},
    );
  },
};
