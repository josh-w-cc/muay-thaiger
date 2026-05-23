import css from './Hub.module.css';

const LEADERBOARD = [
  {fighter: 'Stone Viper', race: 'Snow Leopard', score: 211, stat: 'Agility'},
  {fighter: 'Burning Lotus', race: 'Tiger', score: 176, stat: 'Constitution'},
  {fighter: 'Red Hawk', race: 'Tiger', score: 233, stat: 'Skill'},
  {fighter: 'Iron Cobra', race: 'Tiger', score: 198, stat: 'Stanima'},
  {fighter: 'Shadow Fang', race: 'Snow Leopard', score: 189, stat: 'Strength'},
];

export default function Leaderboard() {
  return (
    <>
      <h3>Leaderboard:</h3>
      <table className={css.leaderboard}>
        <LeaderboardHeader />
        <tbody>
          {LEADERBOARD.map((entry, index) => (
            <LeaderboardRow entry={entry} key={entry.stat} rank={index + 1} />
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
        <th>Stat</th>
        <th>Fighter</th>
        <th>Race</th>
        <th className={css.leaderboardWins}>Top Value</th>
      </tr>
    </thead>
  );
}

function LeaderboardRow({entry, rank}) {
  return (
    <tr className={css.leaderboardRow}>
      <td className={css.leaderboardRank}>{rank}</td>
      <td>{entry.stat}</td>
      <td>{entry.fighter}</td>
      <td>{entry.race}</td>
      <td className={css.leaderboardWins}>{entry.score}</td>
    </tr>
  );
}
