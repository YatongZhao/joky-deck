import { useCallback, useEffect, useState } from 'react';
import { setSpeed } from '../../store/dynamicGearPosition';
import { gsap } from 'gsap';
import { useHotkeys } from 'react-hotkeys-hook';

const TRANSITION_DURATION = 0.5; // seconds

export function useTimelineController() {
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = useCallback(() => {
    // Update state immediately
    setIsPlaying(!isPlaying);
    
    // Animate speed transition
    gsap.to({}, {
      duration: TRANSITION_DURATION,
      onUpdate: function() {
        const progress = this.progress();
        // Note: we use !isPlaying here because we've already toggled the state
        const currentSpeed = !isPlaying 
          ? progress     // From 0 to 1 (when starting to play)
          : 1 - progress; // From 1 to 0 (when pausing)
        setSpeed(currentSpeed);
      }
    });
  }, [isPlaying]);

  // Register space key shortcut
  useHotkeys('space', (e) => {
    e.preventDefault();
    togglePlay();
  }, { enableOnFormTags: true });

  // Initialize speed to 1 when component mounts
  useEffect(() => {
    setSpeed(1);
  }, []);

  return {
    isPlaying,
    togglePlay,
  };
}
