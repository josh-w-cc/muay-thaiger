import FighterDetails from './FighterDetails.js';
import Leaderboard from './Leaderboard.js';
import Stats from './Stats.js';
import css from './Hub.module.css';

const EVENTS = [
  {
    detail: 'Unlocked Flying Knee Drill in Training.',
    outcome: 'Unlocked',
    title: 'Technique: Flying Knee Drill',
  },
  {
    detail: 'Won against Iron Cobra in the Lumpinee Bracket.',
    outcome: 'Tournament Win',
    title: 'Lumpinee Rookie Cup',
  },
  {
    detail: 'Clinched 3 rounds in sparring and gained +2 Skill.',
    outcome: 'Skill Gain',
    title: 'Camp Sparring Session',
  },
];

export default function Hub() {
  return (
    <>
      <section className={css.section}>
        <FighterDetails />
      </section>
      <section className={css.section}>
        <Stats />
      </section>
      <section className={css.section}>
        <Events />
      </section>
      <section className={css.section}>
        <Leaderboard />
      </section>
    </>
  );
}

function Events() {
  return (
    <ul className={css.events}>
      {EVENTS.map((event) => <Event event={event} key={event.title} />)}
    </ul>
  );
}

function Event({event}) {
  return (
    <li className={css.event}>
      <span className={css.outcome}>{event.outcome}</span>
      <strong>{event.title}</strong>
      <span>{event.detail}</span>
    </li>
  );
}
