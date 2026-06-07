import css from './StatRow.module.css';


function StatRow({label, value}) {
  return (
    <div className={css.statRow}>
      <dt className={css.label}>{label}</dt>
      <dd className={css.value}>{value}</dd>
    </div>
  );
}

export default StatRow;
