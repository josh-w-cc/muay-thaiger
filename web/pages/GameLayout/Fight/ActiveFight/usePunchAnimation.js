import {useCallback, useEffect, useRef, useState} from 'react';

const PUNCH_DISPLAY_MS = 300;
const PUNCH_COOLDOWN_MS = 300;

function scheduleEndPunch(setIsPunching, cooldownRef, timersRef) {
  setIsPunching(false);
  timersRef.current = setTimeout(() => {
    cooldownRef.current = false;
  }, PUNCH_COOLDOWN_MS);
}

export default function usePunchAnimation() {
  const [isPunching, setIsPunching] = useState(false);
  const cooldownRef = useRef(false);
  const timersRef = useRef(null);

  useEffect(() => () => clearTimeout(timersRef.current), []);

  const triggerPunch = useCallback(() => {
    if(cooldownRef.current) {
      return;
    }
    cooldownRef.current = true;
    setIsPunching(true);
    timersRef.current = setTimeout(() => scheduleEndPunch(setIsPunching, cooldownRef, timersRef), PUNCH_DISPLAY_MS);
  }, []);

  return {isPunching, triggerPunch};
}
