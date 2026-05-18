const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL
    || 'postgresql://postgres:postgres@localhost:5333/tiger',
  migrations: {
    directory: './migrations',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: './seed-data/seeds',
  },
};


export default config;
