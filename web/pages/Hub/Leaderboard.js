import css from './Hub.module.css';

const LEADERBOARD = [
  {name: 'Iron Cobra', race: 'Tiger', wins: 47},
  {name: 'Shadow Fang', race: 'Snow Leopard', wins: 43},
  {name: 'Burning Lotus', race: 'Tiger', wins: 39},
  {name: 'Stone Viper', race: 'Snow Leopard', wins: 35},
  {name: 'Red Hawk', race: 'Tiger', wins: 31},
];

export default function Leaderboard() {
  return (
    <>
      <h3>Leaderboard:</h3>
      <table className={css.leaderboard}>
        <LeaderboardHeader />
        <tbody>
          {LEADERBOARD.map((entry, index) => (
            <LeaderboardRow entry={entry} key={entry.name} rank={index + 1} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function LeaderboardHeader() {
  return (
    <thead>
      <tr>
        <th className={css.leaderboardRank}>#</th>
        <th>Fighter</th>
        <th>Race</th>
        <th className={css.leaderboardWins}>Wins</th>
      </tr>
    </thead>
  );
}

function LeaderboardRow({entry, rank}) {
  return (
    <tr className={css.leaderboardRow}>
      <td className={css.leaderboardRank}>{rank}</td>
      <td>{entry.name}</td>
      <td>{entry.race}</td>
      <td className={css.leaderboardWins}>{entry.wins}</td>
    </tr>
  );
}
