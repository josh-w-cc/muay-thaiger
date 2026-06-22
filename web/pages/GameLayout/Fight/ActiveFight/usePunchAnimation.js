import React from 'react';

const PUNCH_DISPLAY_MS = 300;
const PUNCH_COOLDOWN_MS = 300;

function scheduleEndPunch(setIsPunching, cooldownRef, timersRef) {
  setIsPunching(false);
  timersRef.current = setTimeout(() => {
    cooldownRef.current = false;
  }, PUNCH_COOLDOWN_MS);
}

export default function usePunchAnimation() {
  const [isPunching, setIsPunching] = React.useState(false);
  const cooldownRef = React.useRef(false);
  const timersRef = React.useRef(null);

  React.useEffect(() => () => clearTimeout(timersRef.current), []);

  const triggerPunch = React.useCallback(() => {
    if(cooldownRef.current) {
      return;
    }
    cooldownRef.current = true;
    setIsPunching(true);
    timersRef.current = setTimeout(() => scheduleEndPunch(setIsPunching, cooldownRef, timersRef), PUNCH_DISPLAY_MS);
  }, []);

  return {isPunching, triggerPunch};
}
