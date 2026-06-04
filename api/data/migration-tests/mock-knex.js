export default function createMockKnex() {
  const calls = [];
  return {
    calls,
    knex: {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    },
  };
}
