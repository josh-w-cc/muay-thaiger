import css from './StatRow.module.css';


function StatRow({label, value}) {
  return (
    <div className={css.row}>
      <span className={css.label}>{label}</span>
      <span className={css.value}>{value}</span>
    </div>
  );
}

export default StatRow;
