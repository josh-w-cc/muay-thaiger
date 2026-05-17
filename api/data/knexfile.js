const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL
    || 'postgresql://postgres:postgres@localhost:5333/app',
  migrations: {
    directory: './migrations',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: './seed-data/seeds',
  },
};


export default config;
