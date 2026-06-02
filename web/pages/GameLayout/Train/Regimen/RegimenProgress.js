import cx from 'classnames';

import css from '../Train.module.css';

export default function RegimenProgress({actionEnabled, name, progress}) {
  return (
    <>
      <div
        aria-label={`${name} completion`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className={cx(css.regimenProgressTrack, {[css.regimenProgressTrackDisabled]: !actionEnabled})}
        role="progressbar"
      >
        <div className={css.regimenProgressFill} style={{width: `${progress}%`}} />
      </div>
      <span className={cx(css.regimenProgressLabel, {[css.regimenProgressLabelDisabled]: !actionEnabled})}>{`${progress}%`}</span>
    </>
  );
}
