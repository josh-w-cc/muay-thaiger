import cx from 'classnames';
import css from './Leaderboard.module.css';

const LEADERBOARD = [
  {name: 'Iron Cobra', race: 'Tiger', wins: 47},
  {name: 'Shadow Fang', race: 'Snow Leopard', wins: 43},
  {name: 'Burning Lotus', race: 'Tiger', wins: 39},
  {name: 'Stone Viper', race: 'Snow Leopard', wins: 35},
  {name: 'Red Hawk', race: 'Tiger', wins: 31},
];

const LEADERBOARD_COLUMNS = [
  {label: '#', key: 'rank', className: css.leaderboardRank},
  {label: 'Fighter', key: 'name'},
  {label: 'Race', key: 'race'},
  {label: 'Wins', key: 'wins', className: css.leaderboardWins},
];

const TRAINABLE_STAT_LEADERBOARD = [
  {fighter: 'Stone Viper', race: 'Snow Leopard', score: 211, stat: 'Agility'},
  {fighter: 'Burning Lotus', race: 'Tiger', score: 176, stat: 'Constitution'},
  {fighter: 'Red Hawk', race: 'Tiger', score: 233, stat: 'Skill'},
  {fighter: 'Iron Cobra', race: 'Tiger', score: 198, stat: 'Stanima'},
  {fighter: 'Shadow Fang', race: 'Snow Leopard', score: 189, stat: 'Strength'},
];

const TRAINABLE_STAT_LEADERBOARD_COLUMNS = [
  {label: '#', key: 'rank', className: css.leaderboardRank},
  {label: 'Stat', key: 'stat'},
  {label: 'Fighter', key: 'fighter'},
  {label: 'Race', key: 'race'},
  {label: 'Top Value', key: 'score', className: css.leaderboardWins},
];

export default function Leaderboard() {
  return (
    <>
      <h3>Leaderboard:</h3>
      <LeaderboardTable columns={LEADERBOARD_COLUMNS} entries={LEADERBOARD} keyField="name" />
      <h3>Trainable Stat Leaders:</h3>
      <LeaderboardTable columns={TRAINABLE_STAT_LEADERBOARD_COLUMNS} entries={TRAINABLE_STAT_LEADERBOARD} keyField="stat" />
    </>
  );
}

function LeaderboardTable({columns, entries, keyField}) {
  return (
    <table className={css.leaderboard}>
      <LeaderboardHeader columns={columns} />
      <tbody>
        {entries.map((entry, index) => (
          <LeaderboardRow columns={columns} entry={entry} key={entry[keyField]} rank={index + 1} />
        ))}
      </tbody>
    </table>
  );
}

function LeaderboardHeader({columns}) {
  return (
    <thead>
      <tr>
        {columns.map(({className, key, label}) => <th className={cx(css.leaderboardTh, className)} key={key}>{label}</th>)}
      </tr>
    </thead>
  );
}

function LeaderboardRow({columns, entry, rank}) {
  return (
    <tr className={css.leaderboardRow}>
      {columns.map(({className, key}) => (
        <td className={className} key={key}>{key === 'rank' ? rank : entry[key]}</td>
      ))}
    </tr>
  );
}
